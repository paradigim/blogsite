import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsService } from './stats.service';
import { Icon } from '../shared/icon';
import { InrPipe } from '../shared/inr.pipe';
import { BarChart } from './charts/bar-chart';

@Component({
  selector: 'app-admin-profit',
  imports: [RouterLink, DecimalPipe, FormsModule, Icon, InrPipe, BarChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .wf { display: flex; flex-direction: column; gap: 2px; }
    .wf .r { display: grid; grid-template-columns: 1fr auto; gap: 12px; padding: 10px 4px; border-bottom: 1px solid var(--line-2); font-size: .92rem; }
    .wf .r.sub { font-weight: 900; background: #f8f6ef; border-radius: 10px; padding: 12px; border: 0; }
    .wf .r.net { background: var(--ink); color: var(--yellow); border-radius: 12px; padding: 14px; font-weight: 900; font-size: 1.05rem; }
    .neg { color: var(--danger); }
    .inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; .input { min-height: 40px; } }
  `,
  template: `
    <div class="a-head">
      <div><h1>Profit analytics</h1><p>Estimated from the cost prices configured on each product — revenue is not profit.</p></div>
      <div class="seg">@for (r of ranges; track r.d) { <button [class.on]="days() === r.d" (click)="days.set(r.d)">{{ r.l }}</button> }</div>
    </div>
    <div class="kpis">
      <div class="kpi"><span class="k-l"><span class="k-i"><app-icon name="rupee" [size]="16" /></span>Revenue</span><span class="k-v">{{ p().revenue | inr }}</span></div>
      <div class="kpi"><span class="k-l"><span class="k-i"><app-icon name="box" [size]="16" /></span>Product cost</span><span class="k-v">{{ p().productCost | inr }}</span></div>
      <div class="kpi"><span class="k-l"><span class="k-i"><app-icon name="trend" [size]="16" /></span>Est. gross profit</span><span class="k-v">{{ p().gross | inr }}</span><span class="k-d">{{ (p().gross / (p().itemRevenue || 1)) * 100 | number: '1.0-1' }}% of item sales</span></div>
      <div class="kpi hero"><span class="k-l"><span class="k-i"><app-icon name="sparkles" [size]="16" /></span>Est. net profit</span><span class="k-v">{{ net() | inr }}</span><span class="k-d">{{ (net() / (p().revenue || 1)) * 100 | number: '1.0-1' }}% net margin</span></div>
    </div>
    <div class="a-grid c-1-1">
      <div class="a-card">
        <div class="a-card-h"><h3>Profit breakdown</h3><span class="tiny muted">{{ orders().length }} orders</span></div>
        <div class="wf">
          <div class="r"><span>Item sales (at selling price)</span><b>{{ p().itemRevenue | inr }}</b></div>
          <div class="r"><span>− Coupon discounts</span><b class="neg">−{{ p().discounts | inr }}</b></div>
          <div class="r"><span>− Product cost</span><b class="neg">−{{ p().productCost | inr }}</b></div>
          <div class="r sub"><span>Estimated gross profit</span><b>{{ p().gross | inr }}</b></div>
          <div class="r"><span>− Packaging cost</span><b class="neg">−{{ p().packaging | inr }}</b></div>
          <div class="r"><span>+ Delivery charges collected</span><b>{{ p().deliveryCharged | inr }}</b></div>
          <div class="r"><span>− Delivery cost (rider payouts)</span><b class="neg">−{{ p().deliveryCost | inr }}</b></div>
          <div class="r"><span>− Payment gateway fees ({{ gateway }}%)</span><b class="neg">−{{ p().gateway | inr }}</b></div>
          <div class="r"><span>− Other costs (rent, staff, utilities…)</span><b class="neg">−{{ otherCosts() | inr }}</b></div>
          <div class="r net"><span>Estimated net profit</span><span>{{ net() | inr }}</span></div>
        </div>
      </div>
      <div class="stack" style="gap:16px">
        <div class="a-card">
          <h3 class="mb-1">Cost assumptions</h3>
          <div class="inputs">
            <div class="field"><label for="gw">Gateway fee %</label><input id="gw" class="input" type="number" step="0.1" [(ngModel)]="gateway" (ngModelChange)="bump()" /></div>
            <div class="field"><label for="oc">Other costs / month (₹)</label><input id="oc" class="input" type="number" [ngModel]="monthly()" (ngModelChange)="monthly.set(+$event || 0)" /></div>
          </div>
          <p class="a-note mt-1">Product and packaging costs come from each variant in <a routerLink="/admin/products" class="link">Products</a>. Delivery cost per order comes from <a routerLink="/admin/delivery" class="link">Delivery zones</a>.</p>
        </div>
        <div class="a-card">
          <div class="a-card-h"><h3>Monthly gross profit</h3><span class="tiny muted">last 6 months</span></div>
          <app-bar-chart [data]="monthlyProfit()" [height]="220" color="#2a78d6" label="Monthly gross profit" />
        </div>
      </div>
    </div>
    <div class="a-card a-table">
      <div class="a-card-h"><h3>Profit by product</h3></div>
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>Product</th><th class="num">Qty</th><th class="num">Revenue</th><th class="num">Product cost</th><th class="num">Packaging</th><th class="num">Est. profit</th><th class="num">Margin</th></tr></thead>
          <tbody>
            @for (r of byProduct(); track r.id) {
              <tr><td><div class="prod"><img [src]="r.image" alt="" /><b>{{ r.name }}</b></div></td><td class="num">{{ r.qty }}</td><td class="num">{{ r.revenue | inr }}</td><td class="num">{{ r.cost | inr }}</td><td class="num">{{ r.packaging | inr }}</td><td class="num"><b>{{ r.revenue - r.cost - r.packaging | inr }}</b></td><td class="num">{{ ((r.revenue - r.cost - r.packaging) / r.revenue) * 100 | number: '1.0-1' }}%</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class AdminProfit {
  private stats = inject(StatsService);
  protected ranges = [{ d: 7, l: '7D' }, { d: 30, l: '30D' }, { d: 90, l: '90D' }, { d: 365, l: '1Y' }];
  protected days = signal(30);
  protected gateway = 2;
  private tick = signal(0);
  protected monthly = signal(25000);
  protected orders = computed(() => this.stats.inRange(this.stats.sales(), new Date(Date.now() - this.days() * 864e5)));
  protected p = computed(() => (this.tick(), this.stats.profit(this.orders(), this.gateway)));
  protected otherCosts = computed(() => Math.round((this.monthly() * this.days()) / 30));
  protected net = computed(() => this.p().net - this.otherCosts());
  protected byProduct = computed(() => this.stats.products(this.orders()));
  protected monthlyProfit = computed(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, k) => {
      const i = 5 - k;
      const from = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const to = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const pr = this.stats.profit(this.stats.inRange(this.stats.sales(), from, to), this.gateway);
      return { key: from.toISOString(), label: from.toLocaleDateString('en-IN', { month: 'short' }), value: Math.max(0, pr.gross) };
    });
  });
  bump() {
    this.tick.update((x) => x + 1);
  }
}
