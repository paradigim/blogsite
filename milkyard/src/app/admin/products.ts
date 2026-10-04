import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DbService } from '../core/services/db.service';
import { CatalogService } from '../core/services/catalog.service';
import { ToastService } from '../core/services/toast.service';
import { Product } from '../core/models';
import { Icon } from '../shared/icon';
import { InrPipe } from '../shared/inr.pipe';

@Component({
  selector: 'app-admin-products',
  imports: [RouterLink, Icon, InrPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .flags { display: flex; gap: 4px; flex-wrap: wrap; }
    .flag { border: 1.5px solid var(--line); background: #fff; border-radius: 999px; padding: 2px 8px; font-size: .68rem; font-weight: 800; color: var(--muted); }
    .flag.on { background: var(--ink); color: var(--yellow); border-color: var(--ink); }
    .stock-ok { color: #2f7d32; font-weight: 800; } .stock-low { color: var(--warn); font-weight: 800; } .stock-out { color: var(--danger); font-weight: 800; }
  `,
  template: `
    <div class="a-head">
      <div><h1>Products</h1><p>{{ db.products().length }} products · {{ published() }} live on the store</p></div>
      <div class="acts"><a routerLink="/admin/products/new" class="btn btn-sm"><app-icon name="plus" [size]="16" /> Add product</a></div>
    </div>
    <div class="a-filters">
      <input class="input grow" style="min-width:220px" placeholder="Search products or SKU" [value]="q()" (input)="q.set($any($event.target).value)" />
      <select class="select" [value]="cat()" (change)="cat.set($any($event.target).value)" aria-label="Category">
        <option value="">All categories</option>
        @for (c of db.categories(); track c.id) { @if (!c.smart) { <option [value]="c.id">{{ c.name }}</option> } }
      </select>
      <select class="select" [value]="vis()" (change)="vis.set($any($event.target).value)" aria-label="Visibility"><option value="">Any visibility</option><option value="live">Live</option><option value="hidden">Hidden</option></select>
    </div>
    <div class="a-table table-wrap">
      <table class="table">
        <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Flags</th><th>Visible</th><th class="num">Sold</th><th></th></tr></thead>
        <tbody>
          @for (p of list(); track p.id) {
            @let stock = totalStock(p);
            <tr>
              <td><a class="prod" [routerLink]="['/admin/products', p.id]"><img [src]="p.images[0]" alt="" /><span><b>{{ p.name }}</b><small>{{ p.variants.length }} variant{{ p.variants.length > 1 ? 's' : '' }} · {{ p.variants[0]?.sku }}</small></span></a></td>
              <td class="small">{{ catalog.primaryCategory(p)?.name }}</td>
              <td class="small"><b>{{ minPrice(p) | inr }}</b>@if (p.variants.length > 1) { – {{ maxPrice(p) | inr }} }</td>
              <td class="small"><span [class.stock-out]="stock === 0" [class.stock-low]="stock > 0 && lowAny(p)" [class.stock-ok]="stock > 0 && !lowAny(p)">{{ stock === 0 ? 'Out of stock' : stock + ' units' }}</span></td>
              <td><div class="flags">
                <button class="flag" [class.on]="p.bestSeller" (click)="toggle(p, 'bestSeller')">Best</button>
                <button class="flag" [class.on]="p.newArrival" (click)="toggle(p, 'newArrival')">New</button>
                <button class="flag" [class.on]="p.featured" (click)="toggle(p, 'featured')">Featured</button>
              </div></td>
              <td><label class="switch"><input type="checkbox" [checked]="p.published" (change)="toggle(p, 'published')" [attr.aria-label]="'Publish ' + p.name" /></label></td>
              <td class="num">{{ p.sold }}</td>
              <td class="num"><a [routerLink]="['/admin/products', p.id]" class="btn btn-light btn-xs">Edit</a></td>
            </tr>
          } @empty { <tr><td colspan="8" class="a-empty">No products found.</td></tr> }
        </tbody>
      </table>
    </div>
  `,
})
export class AdminProducts {
  protected db = inject(DbService);
  protected catalog = inject(CatalogService);
  private toast = inject(ToastService);
  protected q = signal('');
  protected cat = signal('');
  protected vis = signal('');
  protected published = computed(() => this.db.products().filter((p) => p.published).length);
  protected list = computed(() => {
    const q = this.q().toLowerCase();
    return this.db.products().filter(
      (p) =>
        (!q || p.name.toLowerCase().includes(q) || p.variants.some((v) => v.sku.toLowerCase().includes(q))) &&
        (!this.cat() || p.categoryIds.includes(this.cat())) &&
        (!this.vis() || (this.vis() === 'live' ? p.published : !p.published)),
    );
  });
  totalStock(p: Product) {
    return p.variants.reduce((s, v) => s + v.stock, 0);
  }
  lowAny(p: Product) {
    return p.variants.some((v) => v.stock <= p.lowStockThreshold);
  }
  minPrice(p: Product) {
    return Math.min(...p.variants.map((v) => v.price));
  }
  maxPrice(p: Product) {
    return Math.max(...p.variants.map((v) => v.price));
  }
  toggle(p: Product, k: 'bestSeller' | 'newArrival' | 'featured' | 'published') {
    this.db.products.update((l) => l.map((x) => (x.id === p.id ? { ...x, [k]: !x[k] } : x)));
    this.toast.show('Product updated', { body: p.name }, 1800);
  }
}
