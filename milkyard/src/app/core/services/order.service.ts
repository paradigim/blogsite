import { Injectable, computed, inject } from '@angular/core';
import { DbService } from './db.service';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';
import { DeliveryService } from './delivery.service';
import { NotificationService } from './notification.service';
import { PaymentService } from './payment.service';
import { Address, Order, OrderStatus, PaymentMethod } from '../models';

export const ORDER_FLOW: OrderStatus[] = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];
export const ALL_STATUSES: OrderStatus[] = [...ORDER_FLOW, 'Cancelled', 'Failed', 'Refunded'];

@Injectable({ providedIn: 'root' })
export class OrderService {
  private db = inject(DbService);
  private auth = inject(AuthService);
  private cart = inject(CartService);
  private delivery = inject(DeliveryService);
  private notify = inject(NotificationService);
  private payments = inject(PaymentService);

  readonly mine = computed(() => {
    const id = this.auth.user()?.id;
    return this.db.orders().filter((o) => o.userId === id);
  });

  byId(id: string) {
    return this.db.orders().find((o) => o.id === id);
  }

  nextId() {
    const max = this.db.orders().reduce((m, o) => Math.max(m, +o.id.replace(/\D/g, '') || 0), 10000);
    return `MY${max + 1}`;
  }

  /** Creates the order, takes payment and decrements stock. Server-side in production. */
  async place(address: Address, method: PaymentMethod): Promise<{ ok: boolean; order?: Order; error?: string }> {
    const user = this.auth.user();
    if (!user) return { ok: false, error: 'Please log in to place your order.' };
    const t = this.cart.computeTotals(address.pincode);
    if (!t.serviceable) return { ok: false, error: 'We do not deliver to this pincode yet.' };
    if (t.belowMinimum) return { ok: false, error: `Minimum order for this area is ₹${t.minOrder}.` };
    const lines = this.cart.lines();
    if (!lines.length) return { ok: false, error: 'Your cart is empty.' };
    const zone = this.delivery.quote(address.pincode, t.subtotal - t.discount)!.zone!;

    const now = new Date().toISOString();
    const order: Order = {
      id: this.nextId(),
      userId: user.id,
      customerName: user.name,
      phone: user.phone,
      email: user.email,
      createdAt: now,
      items: lines.map((l) => ({
        productId: l.product.id,
        variantId: l.variant.id,
        name: l.product.name,
        variantLabel: l.variant.label,
        image: l.product.images[0],
        price: l.variant.price,
        mrp: l.variant.mrp,
        qty: l.item.qty,
        costPrice: l.variant.costPrice,
        packagingCost: l.variant.packagingCost,
      })),
      address,
      subtotal: t.subtotal,
      discount: t.discount,
      couponCode: t.coupon?.code,
      deliveryCharge: t.delivery ?? 0,
      deliveryCost: zone.riderCost,
      total: t.total,
      paymentStatus: 'Pending',
      paymentMethod: method,
      status: 'Pending',
      zoneName: zone.name,
      timeline: [{ status: 'Pending', at: now }],
    };

    const res = await this.payments.pay({ orderId: order.id, amount: order.total, method, customer: { name: user.name, email: user.email, phone: user.phone } });
    if (!res.ok) {
      order.paymentStatus = 'Failed';
      order.status = 'Failed';
      this.db.orders.update((l) => [order, ...l]);
      this.notify.push({ audience: 'admin', channel: 'in-app', type: 'payment', title: `Payment failed · ${order.id}`, body: `${order.customerName} · ₹${order.total}`, link: `/admin/orders/${order.id}` });
      return { ok: false, error: res.error ?? 'Payment failed. No money was deducted.' };
    }

    order.paymentStatus = method === 'COD' ? 'COD' : 'Paid';
    order.paymentRef = res.ref;
    order.status = 'Confirmed';
    order.timeline.push({ status: 'Confirmed', at: new Date().toISOString() });
    this.db.orders.update((l) => [order, ...l]);

    // stock + sold counters
    this.db.products.update((list) =>
      list.map((p) => {
        const mine = order.items.filter((i) => i.productId === p.id);
        if (!mine.length) return p;
        return {
          ...p,
          sold: p.sold + mine.reduce((s, i) => s + i.qty, 0),
          variants: p.variants.map((v) => {
            const it = mine.find((i) => i.variantId === v.id);
            return it ? { ...v, stock: Math.max(0, v.stock - it.qty) } : v;
          }),
        };
      }),
    );
    if (t.coupon) this.db.coupons.update((l) => l.map((c) => (c.id === t.coupon!.id ? { ...c, used: c.used + 1 } : c)));

    this.notify.push({ audience: 'admin', channel: 'in-app', type: 'order', title: `New order ${order.id}`, body: `${order.customerName} · ₹${order.total} · ${order.zoneName}`, link: `/admin/orders/${order.id}` });
    this.notify.push({ audience: 'admin', channel: 'in-app', type: 'payment', title: `Payment received · ₹${order.total}`, body: `${order.paymentMethod} · ${order.paymentRef ?? ''}`, link: `/admin/orders/${order.id}` });
    this.notify.customer('order', `Order ${order.id} confirmed`, `Thank you ${user.name}! Your MILKYARD order of ₹${order.total} is confirmed.`);
    this.checkLowStock();
    this.cart.clear();
    return { ok: true, order };
  }

  setStatus(id: string, status: OrderStatus, note?: string) {
    this.db.orders.update((l) =>
      l.map((o) => {
        if (o.id !== id) return o;
        const paymentStatus = status === 'Refunded' ? 'Refunded' : o.paymentStatus;
        return { ...o, status, paymentStatus, timeline: [...o.timeline, { status, at: new Date().toISOString(), note }] };
      }),
    );
    const o = this.byId(id);
    if (o) this.notify.customer('status', `Order ${id}: ${status}`, `Hi ${o.customerName}, your order is now “${status}”.`);
    if (status === 'Cancelled') this.notify.push({ audience: 'admin', channel: 'in-app', type: 'order', title: `Order cancelled · ${id}`, body: o?.customerName ?? '', link: `/admin/orders/${id}` });
  }

  cancelByCustomer(id: string) {
    const o = this.byId(id);
    if (!o || !['Pending', 'Confirmed'].includes(o.status)) return false;
    this.setStatus(id, 'Cancelled', 'Cancelled by customer');
    return true;
  }

  private checkLowStock() {
    if (!this.db.settings().lowStockAlerts) return;
    for (const p of this.db.products())
      for (const v of p.variants)
        if (v.stock <= p.lowStockThreshold && v.stock >= 0)
          if (!this.db.notifications().some((n) => n.type === 'stock' && n.title.includes(`${p.name} ${v.label}`) && !n.read))
            this.notify.push({ audience: 'admin', channel: 'in-app', type: 'stock', title: `Low stock: ${p.name} ${v.label}`, body: `Only ${v.stock} left.`, link: '/admin/inventory' });
  }
}
