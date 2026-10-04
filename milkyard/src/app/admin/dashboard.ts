import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { DbService } from '../core/services/db.service';
import { AuthService } from '../core/services/auth.service';
import { StatsService } from './stats.service';
import { AreaChart } from './charts/area-chart';
import { DonutChart } from './charts/donut-chart';
import { Sparkline } from './charts/sparkline';
import { Icon } from '../shared/icon';
import { InrPipe } from '../shared/inr.pipe';
import { StatusBadge } from '../shared/status-badge';
import { ALL_STATUSES } from '../core/services/order.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, DatePipe, DecimalPipe, AreaChart, DonutChart, Sparkline, Icon, InrPipe, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .best { display: flex; gap: 14px; align-items: center; img { width: 72px; height: 72px; border-radius: 16px; } b { display: block; font-size: 1.05rem; } }
    .best-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; div { background: #f8f6ef; border-radius: 12px; padding: 10px 12px; } small { display: block; color: var(--muted); font-weight: 700; font-size: .72rem; } b { font-size: 1.05rem; } }
    .low { display: flex; flex-direction: column; gap: 8px; }
    .low a { display: flex; gap: 10px; align-items: center; padding: 8px; border-radius: 12px; font-size: .86rem; &:hover { background: #f8f6ef; } img { width: 36px; height: 36px; border-radius: 10px; } small { display: block; color: var(--muted); font-weight: 600; } .badge { margin-left: auto; } }
    .total-line { font-size: 1.6rem; font-weight: 900; letter-spacing: -.02em; }
    .greet { font-size: .9rem; color: var(--muted); }
  `,
  template: `
    <div class="a-head">
      <div><h1>{{ greeting() }}, {{ (auth.user()?.name ?? 'Admin').split(' ')[0] }} 👋</h1><p>Here’s how MILKYARD is doing today, {{ now | date: 'EEEE, d MMMM' }}.</p></div>
      <div class="acts"><a routerLink="/admin/products/new" class="btn btn-sm"><app-icon name="plus" [size]="16" /> Add product</a><a routerLink="/admin/orders" class="btn btn-light btn-sm">View orders</a></div>
    </div>

    <div class="kpis">
      <div class="kpi hero">
        <span class="k-l"><span class="k-i"><app-icon name="rupee" [size]="16" /></span>Today’s sales</span>
        <span class="k-v">{{ stats.revenue(stats.today()) | inr }}</span>
        <span class="k-d"><span [class.up]="dToday() >= 0" [class.down]="dToday() < 0">{{ dToday() >= 0 ? '▲' : '▼' }} {{ abs(dToday()) | number: '1.0-0' }}%</span> vs yesterday</span>
      </div>
      <div class="kpi">
        <span class="k-l"><span class="k-i"><app-icon name="package" [size]="16" /></span>Today’s orders</span>
        <span class="k-v">{{ stats.today().length }}</span>
        <span class="k-d">{{ stats.yesterday().length }} yesterday</span>
      </div>
      <div class="kpi">
        <span class="k-l"><span class="k-i"><app-icon name="calendar" [size]="16" /></span>Weekly sales</span>
        <span class="k-v">{{ stats.revenue(stats.week()) | inr: 'compact' }}</span>
        <span class="k-d"><span [class.up]="dWeek() >= 0" [class.down]="dWeek() < 0">{{ dWeek() >= 0 ? '▲' : '▼' }} {{ abs(dWeek()) | number: '1.0-0' }}%</span> vs last week</span>
        <app-sparkline [values]="spark7()" [w]="80" [h]="28" />
      </div>
      <div class="kpi">
        <span class="k-l"><span class="k-i"><app-icon name="trend" [size]="16" /></span>Monthly sales <small>(30d)</small></span>
        <span class="k-v">{{ stats.revenue(stats.month()) | inr: 'compact' }}</span>
        <span class="k-d"><span [class.up]="dMonth() >= 0" [class.down]="dMonth() < 0">{{ dMonth() >= 0 ? '▲' : '▼' }} {{ abs(dMonth()) | number: '1.0-0' }}%</span> vs prior 30d</span>
        <app-sparkline [values]="spark30()" [w]="80" [h]="28" />
      </div>
      <div class="kpi">
        <span class="k-l"><span class="k-i"><app-icon name="receipt" [size]="16" /></span>Total orders</span>
        <span class="k-v">{{ db.orders().length | number }}</span>
        <span class="k-d">Avg. order {{ aov() | inr }}</span>
      </div>
      <div class="kpi">
        <span class="k-l"><span class="k-i"><app-icon name="users" [size]="16" /></span>Total customers</span>
        <span class="k-v">{{ stats.customers().length | number }}</span>
        <span class="k-d">{{ newCustomers() }} joined in 30 days</span>
      </div>
      <div class="kpi">
        <span class="k-l"><span class="k-i"><app-icon name="rupee" [size]="16" /></span>Est. net profit <small>(30d)</small></span>
        <span class="k-v">{{ profit().net | inr: 'compact' }}</span>
        <span class="k-d">{{ profit().margin | number: '1.0-1' }}% margin · <a routerLink="/admin/profit" class="link">details</a></span>
      </div>
      <div class="kpi">
        <span class="k-l"><span class="k-i"><app-icon name="globe" [size]="16" /></span>Visitors <small>(30d)</small></span>
        <span class="k-v">{{ traffic().visitors | number }}</span>
        <span class="k-d">{{ traffic().sessions | number }} sessions · {{ traffic().conversion | number: '1.1-1' }}% conversion</span>
      </div>
    </div>

    <div class="a-grid c-2-1">
      <div class="a-card">
        <div class="a-card-h">
          <div><h3>Sales</h3><p>Revenue from paid orders</p></div>
          <div class="seg">@for (r of [7, 30, 90]; track r) { <button [class.on]="range() === r" (click)="range.set(r)">{{ r }}D</button> }</div>
        </div>
        <div class="total-line">{{ seriesTotal() | inr }} <span class="greet">· {{ seriesOrders() }} orders in {{ range() }} days</span></div>
        <app-area-chart [data]="series()" [height]="260" label="Daily sales" />
      </div>
      <div class="a-card">
        <div class="a-card-h"><h3>Best-selling product</h3><span class="badge badge-ink">30 days</span></div>
        @if (best(); as b) {
          <div class="best"><img [src]="b.image" alt="" /><div><b>{{ b.name }}</b><span class="small muted">{{ b.qty }} units sold</span></div></div>
          <div class="best-stats">
            <div><small>Revenue</small><b>{{ b.revenue | inr }}</b></div>
            <div><small>Est. gross profit</small><b>{{ b.revenue - b.cost | inr }}</b></div>
          </div>
        }
        <div class="divider"></div>
        <div class="a-card-h"><h3>Devices</h3><span class="tiny muted">sessions, 30d</span></div>
        <app-donut [slices]="devices()" [size]="130" centerLabel="Sessions" label="Sessions by device" />
      </div>
    </div>

    <div class="a-grid c-2-1">
      <div class="a-card a-table">
        <div class="a-card-h"><h3>Recent orders</h3><a routerLink="/admin/orders" class="link small">View all</a></div>
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Payment</th><th class="num">Amount</th></tr></thead>
            <tbody>
              @for (o of recent(); track o.id) {
                <tr class="click" [routerLink]="['/admin/orders', o.id]">
                  <td><b>{{ o.id }}</b><div class="tiny muted">{{ o.createdAt | date: 'd MMM, h:mm a' }}</div></td>
                  <td>{{ o.customerName }}<div class="tiny muted">{{ o.address.pincode }} · {{ o.zoneName }}</div></td>
                  <td><app-status [value]="o.status" /></td>
                  <td><app-status [value]="o.paymentStatus" /></td>
                  <td class="num"><b>{{ o.total | inr }}</b></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
      <div class="stack" style="gap:16px">
        <div class="a-card">
          <div class="a-card-h"><h3>Orders by status</h3></div>
          <div class="hbars">
            @for (s of byStatus(); track s.status) {
              <div class="hbar" style="grid-template-columns: 1fr auto">
                <div><div class="t">{{ s.status }}</div><div class="b"><i [style.width.%]="s.pct"></i></div></div><b>{{ s.n }}</b>
              </div>
            }
          </div>
        </div>
        <div class="a-card">
          <div class="a-card-h"><h3>Low-stock alerts</h3><a routerLink="/admin/inventory" class="link small">Inventory</a></div>
          <div class="low">
            @for (l of lowStock(); track l.sku) {
              <a [routerLink]="['/admin/products', l.id]"><img [src]="l.image" alt="" /><span><b>{{ l.name }}</b><small>{{ l.label }} · {{ l.sku }}</small></span><span class="badge" [class.badge-red]="l.stock === 0" [class.badge-amber]="l.stock > 0">{{ l.stock === 0 ? 'Out of stock' : l.stock + ' left' }}</span></a>
            } @empty { <p class="small muted">All products are well stocked.</p> }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminDashboard {
  protected db = inject(DbService);
  protected auth = inject(AuthService);
  protected stats = inject(StatsService);
  protected now = new Date();
  protected range = signal(30);
  protected abs = Math.abs;

  protected greeting = () => (this.now.getHours() < 12 ? 'Good morning' : this.now.getHours() < 17 ? 'Good afternoon' : 'Good evening');
  protected dToday = computed(() => this.stats.delta(this.stats.revenue(this.stats.today()), this.stats.revenue(this.stats.yesterday())));
  protected dWeek = computed(() => this.stats.delta(this.stats.revenue(this.stats.week()), this.stats.revenue(this.stats.prevWeek())));
  protected dMonth = computed(() => this.stats.delta(this.stats.revenue(this.stats.month()), this.stats.revenue(this.stats.prevMonth())));
  protected spark7 = computed(() => this.stats.daily(7).map((p) => p.value));
  protected spark30 = computed(() => this.stats.weekly(8).map((p) => p.value));
  protected series = computed(() => this.stats.daily(this.range()));
  protected seriesTotal = computed(() => this.series().reduce((s, p) => s + p.value, 0));
  protected seriesOrders = computed(() => this.series().reduce((s, p) => s + (p.orders ?? 0), 0));
  protected aov = computed(() => this.stats.revenue(this.stats.sales()) / (this.stats.sales().length || 1));
  protected newCustomers = computed(() => this.stats.customers().filter((u) => Date.now() - new Date(u.createdAt).getTime() < 30 * 864e5).length);
  protected profit = computed(() => this.stats.profit(this.stats.month()));
  protected traffic = computed(() => this.stats.traffic(30));
  protected best = computed(() => this.stats.products(this.stats.month())[0]);
  protected devices = computed(() => {
    const s = this.traffic().sessions;
    return [
      { label: 'Mobile', value: Math.round(s * 0.71), color: '#2a78d6' },
      { label: 'Desktop', value: Math.round(s * 0.23), color: '#eb6834' },
      { label: 'Tablet', value: Math.round(s * 0.06), color: '#1baf7a' },
    ];
  });
  protected recent = computed(() => [...this.db.orders()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 7));
  protected byStatus = computed(() => {
    const recent = this.stats.inRange(this.db.orders(), new Date(Date.now() - 30 * 864e5));
    const max = Math.max(1, ...ALL_STATUSES.map((s) => recent.filter((o) => o.status === s).length));
    return ALL_STATUSES.map((status) => {
      const n = recent.filter((o) => o.status === status).length;
      return { status, n, pct: (n / max) * 100 };
    }).filter((x) => x.n > 0);
  });
  protected lowStock = computed(() =>
    this.db
      .products()
      .flatMap((p) => p.variants.filter((v) => v.stock <= p.lowStockThreshold).map((v) => ({ id: p.id, name: p.name, image: p.images[0], label: v.label, sku: v.sku, stock: v.stock })))
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 6),
  );
}
