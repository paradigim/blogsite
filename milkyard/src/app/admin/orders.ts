import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DbService } from '../core/services/db.service';
import { ALL_STATUSES, OrderService } from '../core/services/order.service';
import { ToastService } from '../core/services/toast.service';
import { OrderStatus } from '../core/models';
import { startOfDay } from './stats.service';
import { Icon } from '../shared/icon';
import { InrPipe } from '../shared/inr.pipe';
import { StatusBadge } from '../shared/status-badge';

type Period = 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom';

@Component({
  selector: 'app-admin-orders',
  imports: [RouterLink, DatePipe, Icon, InrPipe, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .tabs { display: flex; gap: 6px; overflow-x: auto; margin-bottom: 14px; scrollbar-width: none; .chip { flex: none; padding: 6px 12px; font-size: .8rem; } .n { opacity: .6; font-weight: 700; } }
    .sum { display: flex; gap: 18px; flex-wrap: wrap; font-size: .85rem; color: var(--muted); font-weight: 700; margin-bottom: 10px; b { color: var(--ink); } }
    .sel { min-height: 32px !important; padding: 2px 30px 2px 10px !important; font-size: .78rem !important; border-radius: 999px !important; font-weight: 800; }
    .pager { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; font-size: .85rem; color: var(--muted); font-weight: 700; }
  `,
  template: `
    <div class="a-head">
      <div><h1>Orders</h1><p>Manage, filter and update every MILKYARD order.</p></div>
      <div class="acts"><button class="btn btn-light btn-sm" (click)="exportCsv()"><app-icon name="download" [size]="16" /> Export CSV</button></div>
    </div>
    <div class="tabs">
      <button class="chip" [class.active]="status() === 'all'" (click)="status.set('all'); page.set(0)">All <span class="n">{{ periodOrders().length }}</span></button>
      @for (s of statuses; track s) {
        <button class="chip" [class.active]="status() === s" (click)="status.set(s); page.set(0)">{{ s }} <span class="n">{{ count(s) }}</span></button>
      }
    </div>
    <div class="a-filters">
      <div class="seg">
        @for (p of periods; track p.id) { <button [class.on]="period() === p.id" (click)="period.set(p.id); page.set(0)">{{ p.label }}</button> }
      </div>
      @if (period() === 'custom') {
        <input type="date" class="input" [value]="from()" (change)="from.set($any($event.target).value)" aria-label="From date" />
        <input type="date" class="input" [value]="to()" (change)="to.set($any($event.target).value)" aria-label="To date" />
      }
      <input class="input grow" style="min-width:200px" placeholder="Search ID, name, phone, pincode" [value]="query()" (input)="query.set($any($event.target).value); page.set(0)" />
    </div>
    <div class="sum"><span>Orders <b>{{ filtered().length }}</b></span><span>Revenue <b>{{ revenue() | inr }}</b></span><span>Delivery collected <b>{{ deliveryTotal() | inr }}</b></span></div>
    <div class="a-table">
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th class="num">Amount</th><th class="num">Delivery</th><th>Payment</th><th>Status</th><th>Address</th></tr></thead>
          <tbody>
            @for (o of pageItems(); track o.id) {
              <tr>
                <td><a [routerLink]="['/admin/orders', o.id]" class="link">{{ o.id }}</a><div class="tiny muted">{{ o.createdAt | date: 'd MMM y, h:mm a' }}</div></td>
                <td><b>{{ o.customerName }}</b><div class="tiny muted">+91 {{ o.phone }}</div></td>
                <td class="small">@for (i of o.items; track i.variantId) { <div>{{ i.name }} <span class="muted">{{ i.variantLabel }} ×{{ i.qty }}</span></div> }</td>
                <td class="num"><b>{{ o.total | inr }}</b></td>
                <td class="num">{{ o.deliveryCharge ? (o.deliveryCharge | inr) : 'Free' }}</td>
                <td><app-status [value]="o.paymentStatus" /><div class="tiny muted">{{ o.paymentMethod }}</div></td>
                <td>
                  <select class="select sel" (change)="setStatus(o.id, $any($event.target).value)" aria-label="Order status">
                    @for (s of statuses; track s) { <option [value]="s" [selected]="s === o.status">{{ s }}</option> }
                  </select>
                </td>
                <td class="tiny" style="max-width:220px">{{ o.address.line1 }}, {{ o.address.pincode }}<div class="muted">{{ o.zoneName }}</div></td>
              </tr>
            } @empty { <tr><td colspan="8" class="a-empty">No orders match these filters.</td></tr> }
          </tbody>
        </table>
      </div>
      <div class="pager">
        <span>Showing {{ page() * size + 1 }}–{{ min((page() + 1) * size, filtered().length) }} of {{ filtered().length }}</span>
        <div class="row"><button class="btn btn-light btn-xs" [disabled]="page() === 0" (click)="page.set(page() - 1)">Previous</button><button class="btn btn-light btn-xs" [disabled]="(page() + 1) * size >= filtered().length" (click)="page.set(page() + 1)">Next</button></div>
      </div>
    </div>
  `,
})
export class AdminOrders {
  private db = inject(DbService);
  private orders = inject(OrderService);
  private toast = inject(ToastService);
  readonly q = input<string>('');
  protected statuses = ALL_STATUSES;
  protected periods: { id: Period; label: string }[] = [
    { id: 'all', label: 'All time' },
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'week', label: 'This week' },
    { id: 'month', label: 'This month' },
    { id: 'custom', label: 'Custom' },
  ];
  protected status = signal<OrderStatus | 'all'>('all');
  protected period = signal<Period>('all');
  protected query = linkedSignal(() => this.q() ?? '');
  protected from = signal(new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10));
  protected to = signal(new Date().toISOString().slice(0, 10));
  protected page = signal(0);
  protected size = 20;
  protected min = Math.min;

  protected periodOrders = computed(() => {
    const all = this.db.orders();
    const t0 = startOfDay().getTime();
    const d = 864e5;
    const now = new Date();
    const range: [number, number] | null = (() => {
      switch (this.period()) {
        case 'today': return [t0, t0 + d];
        case 'yesterday': return [t0 - d, t0];
        case 'week': { const dow = (now.getDay() + 6) % 7; return [t0 - dow * d, t0 + d]; }
        case 'month': return [new Date(now.getFullYear(), now.getMonth(), 1).getTime(), t0 + d];
        case 'custom': return [new Date(this.from()).getTime(), new Date(this.to()).getTime() + d];
        default: return null;
      }
    })();
    const q = this.query().toLowerCase().trim();
    return all.filter((o) => {
      if (range) {
        const t = new Date(o.createdAt).getTime();
        if (t < range[0] || t >= range[1]) return false;
      }
      if (q && !(`${o.id} ${o.customerName} ${o.phone} ${o.address.pincode}`.toLowerCase().includes(q))) return false;
      return true;
    });
  });
  protected filtered = computed(() => (this.status() === 'all' ? this.periodOrders() : this.periodOrders().filter((o) => o.status === this.status())));
  protected pageItems = computed(() => this.filtered().slice(this.page() * this.size, (this.page() + 1) * this.size));
  protected revenue = computed(() => this.filtered().filter((o) => ['Paid', 'COD'].includes(o.paymentStatus)).reduce((s, o) => s + o.total, 0));
  protected deliveryTotal = computed(() => this.filtered().reduce((s, o) => s + o.deliveryCharge, 0));

  count(s: OrderStatus) {
    return this.periodOrders().filter((o) => o.status === s).length;
  }
  setStatus(id: string, s: OrderStatus) {
    this.orders.setStatus(id, s);
    this.toast.show(`Order ${id} → ${s}`, { body: 'Customer notified.' }, 2500);
  }
  exportCsv() {
    const rows = [['Order ID', 'Date', 'Customer', 'Phone', 'Items', 'Subtotal', 'Discount', 'Delivery', 'Total', 'Payment', 'Status', 'Pincode', 'Zone']];
    for (const o of this.filtered())
      rows.push([o.id, o.createdAt, o.customerName, o.phone, o.items.map((i) => `${i.name} ${i.variantLabel} x${i.qty}`).join('; '), `${o.subtotal}`, `${o.discount}`, `${o.deliveryCharge}`, `${o.total}`, o.paymentStatus, o.status, o.address.pincode, o.zoneName]);
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `milkyard-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }
}
