import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../core/services/catalog.service';
import { CartService } from '../core/services/cart.service';
import { UiService } from '../core/services/ui.service';
import { WishlistService } from '../core/services/wishlist.service';
import { Icon } from './icon';
import { InrPipe } from './inr.pipe';
import { Stars } from './stars';
import { QtyStepper } from './qty-stepper';

@Component({
  selector: 'app-quick-view',
  imports: [RouterLink, Icon, InrPipe, Stars, QtyStepper],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .wrap { display: grid; grid-template-columns: 1fr; }
    @media (min-width: 760px) { .wrap { grid-template-columns: 1.05fr 1fr; } }
    .gal { background: var(--butter); position: relative; }
    .gal img { width: 100%; aspect-ratio: 1; object-fit: cover; }
    .thumbs { position: absolute; bottom: 12px; left: 12px; display: flex; gap: 8px; }
    .thumbs button { width: 52px; height: 52px; border-radius: 12px; overflow: hidden; border: 2px solid transparent; padding: 0; background: #fff; }
    .thumbs button.on { border-color: var(--ink); }
    .info { padding: 28px; display: flex; flex-direction: column; gap: 14px; }
    h2 { margin: 0; font-size: 1.9rem; }
    .close { position: absolute; top: 12px; right: 12px; z-index: 2; background: #fff; box-shadow: var(--shadow-sm); }
    .opts { display: flex; flex-wrap: wrap; gap: 8px; }
    .opt { padding: 10px 14px; border-radius: 14px; border: 1.5px solid var(--line); background: #fff; text-align: left; line-height: 1.2; }
    .opt b { display: block; } .opt small { color: var(--muted); font-weight: 700; }
    .opt.on { border-color: var(--ink); background: var(--yellow-soft); box-shadow: inset 0 0 0 1px var(--ink); }
    .opt:disabled { opacity: .45; }
    .buy { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .hl { display: flex; flex-wrap: wrap; gap: 6px; }
  `,
  template: `
    @if (product(); as p) {
      <div class="backdrop" (click)="close()"></div>
      <div class="modal" role="dialog" aria-modal="true" [attr.aria-label]="p.name">
        <button class="icon-btn close" (click)="close()" aria-label="Close"><app-icon name="close" /></button>
        <div class="wrap">
          <div class="gal">
            <img [src]="p.images[img()]" [alt]="p.name" />
            <div class="thumbs">
              @for (src of p.images; track src; let i = $index) {
                <button [class.on]="i === img()" (click)="img.set(i)" [attr.aria-label]="'Image ' + (i + 1)"><img [src]="src" alt="" /></button>
              }
            </div>
          </div>
          <div class="info">
            <span class="eyebrow">{{ catalog.primaryCategory(p)?.name }}</span>
            <h2>{{ p.name }}</h2>
            <app-stars [rating]="p.rating" [count]="p.reviewCount" />
            <p class="muted mb-0">{{ p.shortDescription }}</p>
            <div class="hl">@for (h of p.highlights.slice(0, 3); track h) { <span class="badge"><app-icon name="check" [size]="12" /> {{ h }}</span> }</div>
            <div class="opts">
              @for (x of p.variants; track x.id) {
                <button class="opt" [class.on]="x.id === variant().id" (click)="variant.set(x)" [disabled]="x.stock <= 0"><b>{{ x.label }}</b><small>{{ x.price | inr }}</small></button>
              }
            </div>
            <div class="row">
              <span class="price" style="font-size:1.6rem">{{ variant().price | inr }}</span>
              @if (variant().mrp > variant().price) { <span class="mrp">MRP {{ variant().mrp | inr }}</span><span class="off">{{ catalog.discount(variant()) }}% off</span> }
            </div>
            <div class="buy">
              <app-qty [value]="qty()" [max]="variant().stock" (change)="qty.set($event)" />
              <button class="btn grow" (click)="add()" [disabled]="variant().stock <= 0">Add to cart</button>
              <button class="icon-btn" (click)="wish.toggle(p.id, p.name)" [style.color]="wish.has(p.id) ? '#d9302c' : null" aria-label="Wishlist"><app-icon name="heart" [fill]="wish.has(p.id)" /></button>
            </div>
            <a class="link" [routerLink]="['/product', p.slug]" (click)="close()">View full details →</a>
          </div>
        </div>
      </div>
    }
  `,
})
export class QuickView {
  protected ui = inject(UiService);
  protected catalog = inject(CatalogService);
  protected cart = inject(CartService);
  protected wish = inject(WishlistService);
  protected product = computed(() => (this.ui.quickViewId() ? this.catalog.byId(this.ui.quickViewId()!) : undefined));
  protected variant = linkedSignal(() => (this.product() ? this.catalog.defaultVariant(this.product()!) : this.product()?.variants[0]!));
  protected img = linkedSignal({ source: this.product, computation: () => 0 });
  protected qty = signal(1);

  add() {
    this.cart.add(this.product()!, this.variant(), this.qty());
    this.close();
  }
  close() {
    this.ui.quickViewId.set(null);
    this.qty.set(1);
  }
}
