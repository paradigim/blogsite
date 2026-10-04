import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DbService } from '../core/services/db.service';
import { ToastService } from '../core/services/toast.service';
import { StatsService } from './stats.service';
import { Icon } from '../shared/icon';
import { InrPipe } from '../shared/inr.pipe';

@Component({
  selector: 'app-admin-inventory',
  imports: [RouterLink, Icon, InrPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .qty { width: 80px; min-height: 34px !important; padding: 4px 8px !important; border-radius: 10px !important; font-size: .86rem !important; }
    .bar { height: 6px; width: 90px; border-radius: 6px; background: #f3efe3; overflow: hidden; i { display: block; height: 100%; } }
  `,
  template: `
    <div class="a-head"><div><h1>Inventory</h1><p>Stock levels for every size (SKU). Edit stock inline.</p></div></div>
    <div class="kpis">
      <div class="kpi"><span class="k-l"><span class="k-i"><app-icon name="box" [size]="16" /></span>SKUs</span><span class="k-v">{{ rows().length }}</span></div>
      <div class="kpi"><span class="k-l"><span class="k-i"><app-icon name="package" [size]="16" /></span>Units in stock</span><span class="k-v">{{ units() }}</span><span class="k-d">Stock value at cost {{ value() | inr }}</span></div>
      <div class="kpi"><span class="k-l"><span class="k-i"><app-icon name="alert" [size]="16" /></span>Low stock</span><span class="k-v" style="color:var(--warn)">{{ low() }}</span></div>
      <div class="kpi"><span class="k-l"><span class="k-i"><app-icon name="close" [size]="16" /></span>Out of stock</span><span class="k-v" style="color:var(--danger)">{{ out() }}</span></div>
    </div>
    <div class="a-filters">
      <div class="seg">@for (f of ['all', 'low', 'out']; track f) { <button [class.on]="filter() === f" (click)="filter.set(f)">{{ f === 'all' ? 'All' : f === 'low' ? 'Low stock' : 'Out of stock' }}</button> }</div>
    </div>
    <div class="a-table table-wrap">
      <table class="table">
        <thead><tr><th>Product</th><th>SKU</th><th class="num">Sold (all time)</th><th class="num">Sold (30d)</th><th>Available</th><th>Level</th><th>Status</th></tr></thead>
        <tbody>
          @for (r of shown(); track r.sku) {
            <tr>
              <td><a class="prod" [routerLink]="['/admin/products', r.pid]"><img [src]="r.image" alt="" /><span><b>{{ r.name }}</b><small>{{ r.label }}</small></span></a></td>
              <td class="tiny">{{ r.sku }}</td>
              <td class="num">{{ r.soldAll }}</td>
              <td class="num">{{ r.sold30 }}</td>
              <td><input class="input qty" type="number" min="0" [value]="r.stock" (change)="setStock(r.pid, r.vid, $any($event.target).value)" [attr.aria-label]="'Stock for ' + r.name + ' ' + r.label" /></td>
              <td><div class="bar"><i [style.width.%]="min(100, (r.stock / (r.threshold * 4)) * 100)" [style.background]="r.stock === 0 ? '#c62828' : r.stock <= r.threshold ? '#a86b00' : '#2f7d32'"></i></div></td>
              <td>@if (r.stock === 0) { <span class="badge badge-red">Out of stock</span> } @else if (r.stock <= r.threshold) { <span class="badge badge-amber">Low · alert at {{ r.threshold }}</span> } @else { <span class="badge badge-green">In stock</span> }</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class AdminInventory {
  private db = inject(DbService);
  private stats = inject(StatsService);
  private toast = inject(ToastService);
  protected filter = signal('all');
  protected min = Math.min;
  protected rows = computed(() => {
    const sold30 = new Map<string, number>();
    const soldAll = new Map<string, number>();
    for (const o of this.stats.sales()) for (const i of o.items) soldAll.set(i.variantId, (soldAll.get(i.variantId) ?? 0) + i.qty);
    for (const o of this.stats.month()) for (const i of o.items) sold30.set(i.variantId, (sold30.get(i.variantId) ?? 0) + i.qty);
    return this.db.products().flatMap((p) =>
      p.variants.map((v) => ({ pid: p.id, vid: v.id, name: p.name, image: p.images[0], label: v.label, sku: v.sku, stock: v.stock, cost: v.costPrice, threshold: p.lowStockThreshold, soldAll: soldAll.get(v.id) ?? 0, sold30: sold30.get(v.id) ?? 0 })),
    );
  });
  protected shown = computed(() => {
    const f = this.filter();
    const r = this.rows();
    return (f === 'low' ? r.filter((x) => x.stock > 0 && x.stock <= x.threshold) : f === 'out' ? r.filter((x) => x.stock === 0) : r).sort((a, b) => a.stock - b.stock);
  });
  protected units = computed(() => this.rows().reduce((s, r) => s + r.stock, 0));
  protected value = computed(() => this.rows().reduce((s, r) => s + r.stock * r.cost, 0));
  protected low = computed(() => this.rows().filter((r) => r.stock > 0 && r.stock <= r.threshold).length);
  protected out = computed(() => this.rows().filter((r) => r.stock === 0).length);

  setStock(pid: string, vid: string, val: string) {
    const n = Math.max(0, Math.floor(+val || 0));
    this.db.products.update((l) => l.map((p) => (p.id !== pid ? p : { ...p, variants: p.variants.map((v) => (v.id === vid ? { ...v, stock: n } : v)) })));
    this.toast.show('Stock updated', { body: `${n} units` }, 1800);
  }
}
