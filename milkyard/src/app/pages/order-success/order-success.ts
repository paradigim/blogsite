import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { DbService } from '../../core/services/db.service';
import { SeoService } from '../../core/services/seo.service';
import { Icon } from '../../shared/icon';
import { InrPipe } from '../../shared/inr.pipe';
import { StatusBadge } from '../../shared/status-badge';

@Component({
  selector: 'app-order-success',
  imports: [RouterLink, DatePipe, Icon, InrPipe, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .page { padding: 40px 16px 72px; max-width: 820px; margin: 0 auto; }
    .hero { text-align: center; padding: 36px 24px 28px; border-radius: 32px; background: var(--yellow); position: relative; overflow: hidden; }
    .tick { width: 84px; height: 84px; border-radius: 50%; background: var(--ink); color: var(--yellow); display: grid; place-items: center; margin: 0 auto 16px; animation: pop .6s var(--ease); }
    @keyframes pop { 0% { transform: scale(0); } 70% { transform: scale(1.15); } }
    .hero h1 { font-size: clamp(1.9rem, 4.5vw, 2.8rem); margin-bottom: 6px; }
    .hero p { margin: 0; color: #3a3410; }
    .confetti i { position: absolute; width: 10px; height: 14px; border-radius: 3px; top: -20px; animation: fall 2.8s ease-in forwards; }
    @keyframes fall { to { transform: translateY(420px) rotate(540deg); opacity: 0; } }
    .meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin: 20px 0; }
    .meta div { background: #fff; border: 1px solid var(--line); border-radius: 18px; padding: 14px 16px; }
    .meta small { display: block; color: var(--muted); font-weight: 700; font-size: .74rem; }
    .meta b { font-size: 1.02rem; }
    .it { display: flex; gap: 12px; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--line-2); }
    .it img { width: 56px; height: 56px; border-radius: 12px; }
    .it small { display: block; color: var(--muted); font-weight: 600; }
    .tr { display: flex; justify-content: space-between; padding: 5px 0; }
    .total { font-weight: 900; font-size: 1.2rem; border-top: 1.5px dashed var(--line); margin-top: 6px; padding-top: 12px; }
    .notice { display: flex; gap: 12px; align-items: center; padding: 14px 16px; border-radius: 18px; background: var(--leaf-soft); color: #2f5d1e; font-weight: 700; font-size: .9rem; margin-top: 16px; }
    .actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 24px; }
    h3 { margin-bottom: 12px; }
    .two { display: grid; gap: 16px; @media (min-width: 700px) { grid-template-columns: 1.3fr 1fr; } }
  `,
  template: `
    @if (order(); as o) {
      <div class="page">
        <div class="hero">
          <div class="confetti" aria-hidden="true">@for (c of confetti; track $index) { <i [style.left.%]="c.x" [style.background]="c.c" [style.animation-delay.ms]="c.d"></i> }</div>
          <div class="tick"><app-icon name="check" [size]="44" [stroke]="3" /></div>
          <h1>Order Placed Successfully!</h1>
          <p>Thank you, {{ o.customerName.split(' ')[0] }}. We’ve started preparing your order with love.</p>
        </div>
        <div class="meta">
          <div><small>Order ID</small><b>{{ o.id }}</b></div>
          <div><small>Order date</small><b>{{ o.createdAt | date: 'd MMM y, h:mm a' }}</b></div>
          <div><small>Payment</small><b><app-status [value]="o.paymentStatus" /></b> <span class="tiny muted">{{ o.paymentMethod }}</span></div>
          <div><small>Expected delivery</small><b>{{ zoneEta() }}</b></div>
        </div>
        <div class="two">
          <div class="card">
            <h3>Items</h3>
            @for (i of o.items; track i.variantId) {
              <div class="it"><img [src]="i.image" alt="" /><span class="grow"><b>{{ i.name }}</b><small>{{ i.variantLabel }} × {{ i.qty }}</small></span><b>{{ i.price * i.qty | inr }}</b></div>
            }
            <div class="mt-2">
              <div class="tr"><span>Subtotal</span><span>{{ o.subtotal | inr }}</span></div>
              @if (o.discount) { <div class="tr"><span>Discount ({{ o.couponCode }})</span><span>−{{ o.discount | inr }}</span></div> }
              <div class="tr"><span>Delivery charge</span><span>{{ o.deliveryCharge ? (o.deliveryCharge | inr) : 'FREE' }}</span></div>
              <div class="tr total"><span>Total amount</span><span>{{ o.total | inr }}</span></div>
            </div>
          </div>
          <div class="card">
            <h3>Delivering to</h3>
            <b>{{ o.address.name }}</b>
            <p class="muted small mb-1">{{ o.address.line1 }}@if (o.address.line2) {, {{ o.address.line2 }}}, {{ o.address.city }} – {{ o.address.pincode }}<br />+91 {{ o.address.phone }}</p>
            <span class="badge badge-yellow">{{ o.zoneName }}</span>
          </div>
        </div>
        <div class="notice"><app-icon name="mail" /> Confirmation sent by SMS@if (db.settings().notify.email) {, email} @if (db.settings().notify.whatsapp) { and WhatsApp} to +91 {{ o.phone }}.</div>
        <div class="actions">
          <a [routerLink]="['/account/orders', o.id]" class="btn">Track order</a>
          <a routerLink="/shop" class="btn btn-outline">Continue shopping</a>
        </div>
      </div>
    } @else {
      <div class="container section empty"><h3>Order not found</h3><a routerLink="/account/orders" class="btn">My orders</a></div>
    }
  `,
})
export class OrderSuccessPage {
  private orders = inject(OrderService);
  private auth = inject(AuthService);
  protected db = inject(DbService);
  readonly id = input.required<string>();
  protected order = computed(() => {
    const o = this.orders.byId(this.id());
    return o && o.userId === this.auth.user()?.id ? o : undefined;
  });
  protected zoneEta = computed(() => this.db.zones().find((z) => z.name === this.order()?.zoneName)?.eta ?? 'Within 24 hours');
  protected confetti = Array.from({ length: 28 }, (_, i) => ({ x: (i * 37) % 100, c: ['#141414', '#fff', '#e09a12', '#4f7a3a'][i % 4], d: (i * 83) % 900 }));
  constructor() {
    const seo = inject(SeoService);
    seo.set({ title: 'Order placed' });
    seo.noindex();
  }
}
