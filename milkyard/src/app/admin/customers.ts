import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DbService } from '../core/services/db.service';
import { StatsService } from './stats.service';
import { Icon } from '../shared/icon';
import { InrPipe } from '../shared/inr.pipe';

@Component({
  selector: 'app-admin-customers',
  imports: [DatePipe, Icon, InrPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `.av { width: 34px; height: 34px; border-radius: 50%; background: var(--yellow); display: grid; place-items: center; font-weight: 900; flex: none; } .who { display: flex; gap: 10px; align-items: center; }`,
  template: `
    <div class="a-head"><div><h1>Customers</h1><p>Everyone who has signed up with their mobile number.</p></div></div>
    <div class="kpis">
      <div class="kpi"><span class="k-l"><span class="k-i"><app-icon name="users" [size]="16" /></span>Total customers</span><span class="k-v">{{ rows().length }}</span></div>
      <div class="kpi"><span class="k-l"><span class="k-i"><app-icon name="sparkles" [size]="16" /></span>New (30 days)</span><span class="k-v">{{ newCount() }}</span></div>
      <div class="kpi"><span class="k-l"><span class="k-i"><app-icon name="refresh" [size]="16" /></span>Returning</span><span class="k-v">{{ returning() }}</span><span class="k-d">ordered more than once</span></div>
      <div class="kpi"><span class="k-l"><span class="k-i"><app-icon name="rupee" [size]="16" /></span>Avg. lifetime value</span><span class="k-v">{{ ltv() | inr }}</span></div>
    </div>
    <div class="a-filters">
      <input class="input grow" placeholder="Search name, phone, email or pincode" [value]="q()" (input)="q.set($any($event.target).value)" />
      <select class="select" [value]="sort()" (change)="sort.set($any($event.target).value)" aria-label="Sort"><option value="spent">Top spenders</option><option value="orders">Most orders</option><option value="recent">Recently joined</option></select>
    </div>
    <div class="a-table table-wrap">
      <table class="table">
        <thead><tr><th>Customer</th><th>Mobile</th><th>Area</th><th>Joined</th><th class="num">Orders</th><th class="num">Spent</th><th>Last order</th></tr></thead>
        <tbody>
          @for (c of shown(); track c.id) {
            <tr>
              <td><div class="who"><span class="av">{{ c.name[0] || '?' }}</span><span><b>{{ c.name || '(profile incomplete)' }}</b><div class="tiny muted">{{ c.email }}</div></span></div></td>
              <td><a class="link" [href]="'tel:+91' + c.phone">+91 {{ c.phone }}</a></td>
              <td class="small">{{ c.pin }}</td>
              <td class="small">{{ c.createdAt | date: 'd MMM y' }}</td>
              <td class="num">{{ c.orders }} @if (c.orders > 1) { <span class="badge badge-green">Repeat</span> }</td>
              <td class="num"><b>{{ c.spent | inr }}</b></td>
              <td class="small">{{ c.last ? (c.last | date: 'd MMM y') : '—' }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class AdminCustomers {
  private db = inject(DbService);
  private stats = inject(StatsService);
  protected q = signal('');
  protected sort = signal('spent');
  protected rows = computed(() => {
    const by = new Map(this.stats.customerStats().all.map((c) => [c.id, c]));
    return this.stats.customers().map((u) => ({
      id: u.id, name: u.name, email: u.email, phone: u.phone, createdAt: u.createdAt,
      pin: u.addresses.find((a) => a.isDefault)?.pincode ?? '—',
      orders: by.get(u.id)?.orders ?? 0, spent: by.get(u.id)?.spent ?? 0, last: by.get(u.id)?.last ?? '',
    }));
  });
  protected shown = computed(() => {
    const q = this.q().toLowerCase();
    const l = this.rows().filter((r) => !q || `${r.name} ${r.phone} ${r.email} ${r.pin}`.toLowerCase().includes(q));
    const s = this.sort();
    return l.sort((a, b) => (s === 'orders' ? b.orders - a.orders : s === 'recent' ? b.createdAt.localeCompare(a.createdAt) : b.spent - a.spent));
  });
  protected newCount = computed(() => this.rows().filter((r) => Date.now() - new Date(r.createdAt).getTime() < 30 * 864e5).length);
  protected returning = computed(() => this.rows().filter((r) => r.orders > 1).length);
  protected ltv = computed(() => {
    const buyers = this.rows().filter((r) => r.orders);
    return buyers.reduce((s, r) => s + r.spent, 0) / (buyers.length || 1);
  });
}
