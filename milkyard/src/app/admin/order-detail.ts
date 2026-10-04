import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ALL_STATUSES, OrderService } from '../core/services/order.service';
import { ToastService } from '../core/services/toast.service';
import { OrderStatus } from '../core/models';
import { OrderTimeline } from '../shared/order-timeline';
import { StatusBadge } from '../shared/status-badge';
import { InrPipe } from '../shared/inr.pipe';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-admin-order-detail',
  imports: [RouterLink, DatePipe, OrderTimeline, StatusBadge, InrPipe, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .it { display: flex; gap: 12px; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--line-2); img { width: 52px; height: 52px; border-radius: 12px; } small { display: block; color: var(--muted); font-weight: 600; } }
    .tr { display: flex; justify-content: space-between; padding: 5px 0; font-size: .9rem; }
    .total { font-weight: 900; font-size: 1.1rem; border-top: 1.5px dashed var(--line); margin-top: 6px; padding-top: 10px; }
    .flow { display: flex; gap: 8px; flex-wrap: wrap; }
    .log { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; font-size: .86rem; li { display: flex; gap: 10px; } i { width: 10px; height: 10px; border-radius: 50%; background: var(--ink); margin-top: 6px; flex: none; } small { display: block; color: var(--muted); font-weight: 600; } }
    .kv { display: grid; grid-template-columns: 120px 1fr; gap: 6px 10px; font-size: .88rem; span:nth-child(odd) { color: var(--muted); font-weight: 700; } }
  `,
  template: `
    @if (order(); as o) {
      <a routerLink="/admin/orders" class="link small">← Orders</a>
      <div class="a-head mt-1">
        <div><h1>Order {{ o.id }}</h1><p>{{ o.createdAt | date: 'EEEE, d MMM y · h:mm a' }} · {{ o.zoneName }}</p></div>
        <div class="acts"><app-status [value]="o.paymentStatus" /><app-status [value]="o.status" /><button class="btn btn-light btn-sm" (click)="print()"><app-icon name="download" [size]="16" /> Print / invoice</button></div>
      </div>
      <div class="a-card mb-2"><app-order-timeline [order]="o" /></div>
      <div class="a-grid c-2-1">
        <div class="stack" style="gap:16px">
          <div class="a-card">
            <div class="a-card-h"><h3>Update status</h3><span class="tiny muted">Customer is notified on every change</span></div>
            <div class="flow">
              @for (s of statuses; track s) { <button class="chip" [class.active]="o.status === s" (click)="set(s)">{{ s }}</button> }
            </div>
          </div>
          <div class="a-card">
            <h3 class="mb-1">Items</h3>
            @for (i of o.items; track i.variantId) {
              <div class="it"><img [src]="i.image" alt="" /><span class="grow"><b>{{ i.name }}</b><small>{{ i.variantLabel }} · {{ i.price | inr }} × {{ i.qty }} · cost {{ i.costPrice | inr }}</small></span><b>{{ i.price * i.qty | inr }}</b></div>
            }
            <div class="mt-2">
              <div class="tr"><span>Subtotal</span><span>{{ o.subtotal | inr }}</span></div>
              @if (o.discount) { <div class="tr"><span>Discount {{ o.couponCode ? '(' + o.couponCode + ')' : '' }}</span><span>−{{ o.discount | inr }}</span></div> }
              <div class="tr"><span>Delivery charge</span><span>{{ o.deliveryCharge | inr }}</span></div>
              <div class="tr total"><span>Total</span><span>{{ o.total | inr }}</span></div>
              <div class="tr small muted"><span>Est. gross profit on items</span><span>{{ grossProfit() | inr }}</span></div>
            </div>
          </div>
        </div>
        <div class="stack" style="gap:16px">
          <div class="a-card">
            <h3 class="mb-1">Customer</h3>
            <div class="kv"><span>Name</span><b>{{ o.customerName }}</b><span>Mobile</span><a [href]="'tel:+91' + o.phone" class="link">+91 {{ o.phone }}</a><span>Email</span><span>{{ o.email }}</span></div>
            <div class="row mt-2"><a class="btn btn-sm" [href]="'https://wa.me/91' + o.phone" target="_blank" rel="noopener"><app-icon name="whatsapp" [size]="16" /> WhatsApp</a><a class="btn btn-light btn-sm" [href]="'tel:+91' + o.phone"><app-icon name="phone" [size]="16" /> Call</a></div>
          </div>
          <div class="a-card">
            <h3 class="mb-1">Delivery address</h3>
            <p class="small mb-1"><b>{{ o.address.name }}</b> · +91 {{ o.address.phone }}<br />{{ o.address.line1 }}@if (o.address.line2) {, {{ o.address.line2 }}}@if (o.address.landmark) {, {{ o.address.landmark }}}<br />{{ o.address.city }}, {{ o.address.state }} – {{ o.address.pincode }}</p>
            <a class="link small" [href]="'https://maps.google.com/?q=' + mapQ()" target="_blank" rel="noopener">Open in Google Maps ↗</a>
          </div>
          <div class="a-card">
            <h3 class="mb-1">Payment</h3>
            <div class="kv"><span>Method</span><b>{{ o.paymentMethod }}</b><span>Status</span><app-status [value]="o.paymentStatus" /><span>Reference</span><span class="tiny">{{ o.paymentRef ?? '—' }}</span></div>
            @if (o.paymentStatus === 'Paid' && o.status !== 'Refunded') { <button class="btn btn-light btn-sm mt-2" (click)="set('Refunded')">Mark refunded</button> }
          </div>
          <div class="a-card">
            <h3 class="mb-1">Activity</h3>
            <ul class="log">@for (t of o.timeline.slice().reverse(); track $index) { <li><i></i><span><b>{{ t.status }}</b><small>{{ t.at | date: 'd MMM y, h:mm a' }}@if (t.note) { · {{ t.note }} }</small></span></li> }</ul>
          </div>
        </div>
      </div>
    } @else {
      <div class="a-card a-empty">Order not found. <a routerLink="/admin/orders" class="link">Back to orders</a></div>
    }
  `,
})
export class AdminOrderDetail {
  private orders = inject(OrderService);
  private toast = inject(ToastService);
  readonly id = input.required<string>();
  protected statuses = ALL_STATUSES;
  protected order = computed(() => this.orders.byId(this.id()));
  protected grossProfit = computed(() => (this.order()?.items ?? []).reduce((s, i) => s + (i.price - i.costPrice) * i.qty, 0) - (this.order()?.discount ?? 0));
  protected mapQ = computed(() => encodeURIComponent(`${this.order()?.address.line1}, ${this.order()?.address.city} ${this.order()?.address.pincode}`));
  set(s: OrderStatus) {
    this.orders.setStatus(this.id(), s);
    this.toast.show(`Status updated to ${s}`, { body: 'Customer notified by SMS/email.' }, 2500);
  }
  print() {
    window.print();
  }
}
