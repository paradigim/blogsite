import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DbService } from '../core/services/db.service';
import { StatsService } from './stats.service';
import { AreaChart } from './charts/area-chart';
import { DonutChart } from './charts/donut-chart';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-admin-traffic',
  imports: [DecimalPipe, AreaChart, DonutChart, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .funnel { display: flex; flex-direction: column; gap: 10px; }
    .fs { display: grid; grid-template-columns: 130px 1fr 90px; gap: 12px; align-items: center; font-size: .86rem; font-weight: 800; }
    .fb { height: 30px; border-radius: 8px; background: #f3efe3; overflow: hidden; i { display: block; height: 100%; background: #2a78d6; border-radius: 8px; } }
    .fs span:last-child { text-align: right; font-variant-numeric: tabular-nums; } .fs small { display: block; color: var(--muted); font-weight: 700; }
  `,
  template: `
    <div class="a-head">
      <div><h1>Website traffic</h1><p>Visitors, engagement and conversion. Connect Google Analytics 4 for full source & location data.</p></div>
      <div class="seg">@for (r of [7, 30, 90]; track r) { <button [class.on]="days() === r" (click)="days.set(r)">{{ r }}D</button> }</div>
    </div>
    <div class="kpis">
      <div class="kpi"><span class="k-l"><span class="k-i"><app-icon name="users" [size]="16" /></span>Unique visitors</span><span class="k-v">{{ t().visitors | number }}</span></div>
      <div class="kpi"><span class="k-l"><span class="k-i"><app-icon name="globe" [size]="16" /></span>Sessions</span><span class="k-v">{{ t().sessions | number }}</span></div>
      <div class="kpi"><span class="k-l"><span class="k-i"><app-icon name="eye" [size]="16" /></span>Page views</span><span class="k-v">{{ t().pageViews | number }}</span><span class="k-d">{{ t().pageViews / (t().sessions || 1) | number: '1.1-1' }} per session</span></div>
      <div class="kpi"><span class="k-l"><span class="k-i"><app-icon name="box" [size]="16" /></span>Product views</span><span class="k-v">{{ t().productViews | number }}</span></div>
      <div class="kpi"><span class="k-l"><span class="k-i"><app-icon name="cart" [size]="16" /></span>Add-to-cart rate</span><span class="k-v">{{ t().cartRate | number: '1.1-1' }}%</span></div>
      <div class="kpi hero"><span class="k-l"><span class="k-i"><app-icon name="trend" [size]="16" /></span>Conversion rate</span><span class="k-v">{{ t().conversion | number: '1.2-2' }}%</span><span class="k-d">{{ t().orders }} purchases</span></div>
    </div>
    <div class="a-grid c-2-1">
      <div class="a-card"><div class="a-card-h"><h3>Daily sessions</h3></div><app-area-chart [data]="sessions()" mode="num" color="#2a78d6" [height]="260" label="Daily sessions" /></div>
      <div class="a-card">
        <div class="a-card-h"><h3>Conversion funnel</h3></div>
        <div class="funnel">
          @for (f of funnel(); track f.label) {
            <div class="fs"><span>{{ f.label }}<small>{{ f.rate }}</small></span><div class="fb"><i [style.width.%]="f.pct"></i></div><span>{{ f.value | number }}</span></div>
          }
        </div>
      </div>
    </div>
    <div class="a-grid c-1-1">
      <div class="a-card"><div class="a-card-h"><h3>Device type</h3></div><app-donut [slices]="devices()" label="Sessions by device" centerLabel="Sessions" /></div>
      <div class="a-card">
        <div class="a-card-h"><h3>Traffic sources</h3><span class="tiny muted">estimate · via GA4</span></div>
        <div class="hbars">@for (s of sources(); track s.label) { <div class="hbar" style="grid-template-columns: 1fr auto"><div><div class="t">{{ s.label }}<span>{{ s.pct | number: '1.0-0' }}%</span></div><div class="b"><i [style.width.%]="s.pct / sources()[0].pct * 100" style="background:#2a78d6"></i></div></div><b>{{ s.value | number }}</b></div> }</div>
      </div>
    </div>
    <div class="a-grid c-1-1">
      <div class="a-card">
        <div class="a-card-h"><h3>Most viewed products</h3></div>
        <div class="hbars">@for (p of topViewed(); track p.id) { <div class="hbar"><img [src]="p.images[0]" alt="" /><div><div class="t">{{ p.name }}</div><div class="b"><i [style.width.%]="p.views / topViewed()[0].views * 100" style="background:#2a78d6"></i></div></div><b>{{ p.views | number }}</b></div> }</div>
      </div>
      <div class="a-card">
        <div class="a-card-h"><h3>Top locations</h3><span class="tiny muted">estimate · via GA4</span></div>
        <div class="hbars">@for (s of locations(); track s.label) { <div class="hbar" style="grid-template-columns: 1fr auto"><div><div class="t">{{ s.label }}</div><div class="b"><i [style.width.%]="s.value / locations()[0].value * 100" style="background:#2a78d6"></i></div></div><b>{{ s.value | number }}</b></div> }</div>
        <p class="a-note mt-2">Location, source and device data need a GA4 property (or a privacy-friendly tool such as Plausible). Tracking runs only after cookie consent where required.</p>
      </div>
    </div>
  `,
})
export class AdminTraffic {
  private db = inject(DbService);
  private stats = inject(StatsService);
  protected days = signal(30);
  protected t = computed(() => this.stats.traffic(this.days()));
  protected sessions = computed(() => this.t().days.map((d) => ({ key: d.date, label: new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), value: d.sessions })));
  protected funnel = computed(() => {
    const t = this.t();
    const steps = [
      { label: 'Sessions', value: t.sessions },
      { label: 'Viewed a product', value: t.productViews },
      { label: 'Added to cart', value: t.addToCart },
      { label: 'Began checkout', value: t.checkouts },
      { label: 'Purchased', value: t.orders },
    ];
    return steps.map((s, i) => ({ ...s, pct: (s.value / (steps[0].value || 1)) * 100, rate: i ? `${((s.value / (steps[i - 1].value || 1)) * 100).toFixed(1)}% of previous` : '100%' }));
  });
  protected devices = computed(() => {
    const s = this.t().sessions;
    return [
      { label: 'Mobile', value: Math.round(s * 0.71), color: '#2a78d6' },
      { label: 'Desktop', value: Math.round(s * 0.23), color: '#eb6834' },
      { label: 'Tablet', value: Math.round(s * 0.06), color: '#1baf7a' },
    ];
  });
  protected sources = computed(() => {
    const s = this.t().sessions;
    return [['Instagram', 34], ['Google search', 27], ['Direct', 18], ['WhatsApp', 13], ['Facebook', 5], ['Other', 3]].map(([l, p]) => ({ label: l as string, pct: p as number, value: Math.round((s * (p as number)) / 100) }));
  });
  protected locations = computed(() => {
    const s = this.t().visitors;
    return [['Kolkata', 0.78], ['Howrah', 0.06], ['North 24 Parganas', 0.07], ['South 24 Parganas', 0.04], ['Other', 0.05]].map(([l, p]) => ({ label: l as string, value: Math.round(s * (p as number)) }));
  });
  protected topViewed = computed(() => [...this.db.products()].sort((a, b) => b.views - a.views).slice(0, 6));
}
