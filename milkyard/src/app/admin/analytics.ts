import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { StatsService } from './stats.service';
import { AreaChart } from './charts/area-chart';
import { BarChart } from './charts/bar-chart';
import { Icon } from '../shared/icon';
import { InrPipe } from '../shared/inr.pipe';

type Gran = 'daily' | 'weekly' | 'monthly' | 'yearly';

@Component({
  selector: 'app-admin-analytics',
  imports: [DecimalPipe, AreaChart, BarChart, Icon, InrPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="a-head">
      <div><h1>Sales analytics</h1><p>Revenue, products and customers over time.</p></div>
      <div class="seg">@for (g of grans; track g) { <button [class.on]="gran() === g" (click)="gran.set(g)">{{ g[0].toUpperCase() + g.slice(1) }}</button> }</div>
    </div>
    <div class="kpis">
      <div class="kpi hero"><span class="k-l"><span class="k-i"><app-icon name="rupee" [size]="16" /></span>Revenue · {{ periodLabel() }}</span><span class="k-v">{{ total() | inr }}</span></div>
      <div class="kpi"><span class="k-l"><span class="k-i"><app-icon name="package" [size]="16" /></span>Orders</span><span class="k-v">{{ orders() }}</span></div>
      <div class="kpi"><span class="k-l"><span class="k-i"><app-icon name="receipt" [size]="16" /></span>Average order value</span><span class="k-v">{{ total() / (orders() || 1) | inr }}</span></div>
      <div class="kpi"><span class="k-l"><span class="k-i"><app-icon name="users" [size]="16" /></span>Avg. per customer</span><span class="k-v">{{ cust().avgPerCustomer | inr }}</span></div>
    </div>
    <div class="a-card mb-2">
      <div class="a-card-h"><div><h3>{{ gran() === 'daily' ? 'Daily sales · last 30 days' : gran() === 'weekly' ? 'Weekly sales · last 12 weeks' : gran() === 'monthly' ? 'Monthly sales · last 12 months' : 'Yearly sales' }}</h3><p>Paid & COD orders, excluding cancelled and refunded</p></div></div>
      @if (gran() === 'daily') { <app-area-chart [data]="series()" [height]="280" label="Sales" /> } @else { <app-bar-chart [data]="series()" [height]="280" label="Sales" /> }
    </div>
    <div class="a-grid c-1-1">
      <div class="a-card">
        <div class="a-card-h"><div><h3>Product performance</h3><p>Revenue per product · {{ periodLabel() }}</p></div></div>
        <div class="hbars">
          @for (p of products().slice(0, 8); track p.id) {
            <div class="hbar"><img [src]="p.image" alt="" /><div><div class="t">{{ p.name }}<span>{{ p.qty }} sold</span></div><div class="b"><i [style.width.%]="(p.revenue / products()[0].revenue) * 100"></i></div></div><b>{{ p.revenue | inr: 'compact' }}</b></div>
          }
        </div>
      </div>
      <div class="a-card">
        <div class="a-card-h"><h3>Highlights</h3></div>
        <div class="stack">
          @if (products()[0]; as top) { <div class="a-note"><b>Sold most:</b> {{ top.name }} — {{ top.qty }} units, {{ top.revenue | inr }}</div> }
          @if (leastSold(); as low) { <div class="a-note"><b>Sold least:</b> {{ low.name }} — {{ low.qty }} units, {{ low.revenue | inr }}</div> }
          <div class="a-note"><b>Customers:</b> {{ cust().active }} active · {{ cust().newCustomers }} new · {{ cust().returning }} returning ({{ (cust().returning / (cust().active || 1)) * 100 | number: '1.0-0' }}%)</div>
        </div>
        <h3 class="mt-3 mb-1">Most frequent customers</h3>
        <div class="table-wrap a-table">
          <table class="table"><thead><tr><th>Customer</th><th class="num">Orders</th><th class="num">Spent</th></tr></thead>
            <tbody>@for (c of cust().all.slice(0, 6); track c.id) { <tr><td><b>{{ c.name }}</b><div class="tiny muted">+91 {{ c.phone }}</div></td><td class="num">{{ c.orders }}</td><td class="num">{{ c.spent | inr }}</td></tr> }</tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="a-card a-table">
      <div class="a-card-h"><h3>All products · {{ periodLabel() }}</h3></div>
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>Product</th><th class="num">Qty sold</th><th class="num">Orders</th><th class="num">Revenue</th><th class="num">Share</th></tr></thead>
          <tbody>@for (p of products(); track p.id) { <tr><td><div class="prod"><img [src]="p.image" alt="" /><b>{{ p.name }}</b></div></td><td class="num">{{ p.qty }}</td><td class="num">{{ p.orders }}</td><td class="num">{{ p.revenue | inr }}</td><td class="num">{{ (p.revenue / itemsTotal()) * 100 | number: '1.1-1' }}%</td></tr> }</tbody>
        </table>
      </div>
    </div>
  `,
})
export class AdminAnalytics {
  private stats = inject(StatsService);
  protected grans: Gran[] = ['daily', 'weekly', 'monthly', 'yearly'];
  protected gran = signal<Gran>('daily');
  protected series = computed(() => {
    switch (this.gran()) {
      case 'weekly': return this.stats.weekly(12);
      case 'monthly': return this.stats.monthly(12);
      case 'yearly': return this.stats.yearly();
      default: return this.stats.daily(30);
    }
  });
  protected periodOrders = computed(() => {
    const days = { daily: 30, weekly: 84, monthly: 365, yearly: 3650 }[this.gran()];
    return this.stats.inRange(this.stats.sales(), new Date(Date.now() - days * 864e5));
  });
  protected periodLabel = computed(() => ({ daily: 'last 30 days', weekly: 'last 12 weeks', monthly: 'last 12 months', yearly: 'all time' })[this.gran()]);
  protected total = computed(() => this.stats.revenue(this.periodOrders()));
  protected orders = computed(() => this.periodOrders().length);
  protected products = computed(() => this.stats.products(this.periodOrders()));
  protected itemsTotal = computed(() => this.products().reduce((s, p) => s + p.revenue, 0) || 1);
  protected leastSold = computed(() => [...this.products()].sort((a, b) => a.qty - b.qty)[0]);
  protected cust = computed(() => this.stats.customerStats(this.periodOrders()));
}
