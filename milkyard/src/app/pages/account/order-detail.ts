import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { CatalogService } from '../../core/services/catalog.service';
import { ToastService } from '../../core/services/toast.service';
import { InrPipe } from '../../shared/inr.pipe';
import { StatusBadge } from '../../shared/status-badge';
import { OrderTimeline } from '../../shared/order-timeline';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-account-order-detail',
  imports: [RouterLink, DatePipe, InrPipe, StatusBadge, OrderTimeline, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; margin-bottom: 18px; h1 { font-size: 1.9rem; margin: 6px 0 2px; } }
    .grid { display: grid; gap: 16px; @media (min-width: 900px) { grid-template-columns: 1.4fr 1fr; } }
    .card { padding: 20px; } h3 { font-size: 1.1rem; margin-bottom: 12px; }
    .it { display: flex; gap: 12px; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--line-2); &:last-child { border: 0; } img { width: 60px; height: 60px; border-radius: 14px; } small { display: block; color: var(--muted); font-weight: 600; } }
    .tr { display: flex; justify-content: space-between; padding: 5px 0; font-size: .92rem; }
    .total { font-weight: 900; font-size: 1.15rem; border-top: 1.5px dashed var(--line); margin-top: 6px; padding-top: 10px; }
    .actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .stack-sm { display: flex; flex-direction: column; gap: 16px; }
  `,
  template: `
    @if (order(); as o) {
      <a routerLink="/account/orders" class="link small">← All orders</a>
      <div class="head">
        <div><h1>Order {{ o.id }}</h1><span class="small muted bold">Placed on {{ o.createdAt | date: 'd MMM y, h:mm a' }}</span></div>
        <div class="actions">
          <button class="btn btn-light btn-sm" (click)="reorder()"><app-icon name="refresh" [size]="16" /> Reorder</button>
          <button class="btn btn-light btn-sm" (click)="print()"><app-icon name="download" [size]="16" /> Invoice</button>
          @if (o.status === 'Pending' || o.status === 'Confirmed') { <button class="btn btn-sm btn-danger" (click)="cancel()">Cancel order</button> }
        </div>
      </div>
      <div class="card mb-2"><app-order-timeline [order]="o" /></div>
      <div class="grid">
        <div class="card">
          <h3>Items</h3>
          @for (i of o.items; track i.variantId) {
            <div class="it">
              <img [src]="i.image" alt="" />
              <span class="grow"><b>{{ i.name }}</b><small>{{ i.variantLabel }} · {{ i.price | inr }} × {{ i.qty }}</small></span>
              <b>{{ i.price * i.qty | inr }}</b>
            </div>
          }
          @if (o.status === 'Delivered') { <p class="small muted mt-2"><app-icon name="star" [size]="14" style="display:inline-flex;vertical-align:-2px" /> Enjoyed it? Review your products from their product pages.</p> }
        </div>
        <div class="stack-sm">
          <div class="card">
            <h3>Payment</h3>
            <div class="tr"><span>Status</span><app-status [value]="o.paymentStatus" /></div>
            <div class="tr"><span>Method</span><b>{{ o.paymentMethod }}</b></div>
            @if (o.paymentRef) { <div class="tr"><span>Reference</span><span class="tiny">{{ o.paymentRef }}</span></div> }
            <div class="divider"></div>
            <div class="tr"><span>Subtotal</span><span>{{ o.subtotal | inr }}</span></div>
            @if (o.discount) { <div class="tr"><span>Discount</span><span>−{{ o.discount | inr }}</span></div> }
            <div class="tr"><span>Delivery</span><span>{{ o.deliveryCharge ? (o.deliveryCharge | inr) : 'FREE' }}</span></div>
            <div class="tr total"><span>Total</span><span>{{ o.total | inr }}</span></div>
          </div>
          <div class="card">
            <h3>Delivery address</h3>
            <b>{{ o.address.name }}</b>
            <p class="small muted mb-0">{{ o.address.line1 }}@if (o.address.line2) {, {{ o.address.line2 }}}@if (o.address.landmark) {, {{ o.address.landmark }}}, {{ o.address.city }}, {{ o.address.state }} – {{ o.address.pincode }}<br />+91 {{ o.address.phone }}</p>
          </div>
          <div class="card-flat small">Need help with this order? Call <b>+91 70590 80710</b> or <a class="link" href="https://wa.me/917059080710" target="_blank" rel="noopener">WhatsApp us</a>.</div>
        </div>
      </div>
    } @else {
      <div class="card empty"><h3>Order not found</h3><a routerLink="/account/orders" class="btn">Back to orders</a></div>
    }
  `,
})
export class AccountOrderDetail {
  private orders = inject(OrderService);
  private auth = inject(AuthService);
  private cart = inject(CartService);
  private catalog = inject(CatalogService);
  private toast = inject(ToastService);
  readonly id = input.required<string>();
  protected order = computed(() => {
    const o = this.orders.byId(this.id());
    return o && o.userId === this.auth.user()?.id ? o : undefined;
  });
  cancel() {
    if (!confirm('Cancel this order? If you paid online, the refund will be initiated to the original payment method.')) return;
    if (this.orders.cancelByCustomer(this.id())) this.toast.show('Order cancelled', { body: 'Refunds reach your account in 5–7 working days.' });
  }
  reorder() {
    for (const i of this.order()!.items) {
      const p = this.catalog.byId(i.productId);
      if (p) this.cart.add(p, this.catalog.variant(p, i.variantId), i.qty, false);
    }
  }
  print() {
    window.print();
  }
}
