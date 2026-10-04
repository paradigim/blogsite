import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../core/models';
import { CatalogService } from '../core/services/catalog.service';
import { CartService } from '../core/services/cart.service';
import { WishlistService } from '../core/services/wishlist.service';
import { UiService } from '../core/services/ui.service';
import { AnalyticsService } from '../core/services/analytics.service';
import { Icon } from './icon';
import { InrPipe } from './inr.pipe';
import { Stars } from './stars';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, Icon, InrPipe, Stars],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './product-card.scss',
  template: `
    @let p = product();
    @let v = variant();
    <article class="pc" [class.oos]="!catalog.inStock(p)">
      <div class="media">
        <a [routerLink]="['/product', p.slug]" [attr.aria-label]="p.name" class="img-link">
          <img [src]="p.images[0]" [alt]="'MILKYARD ' + p.name" loading="lazy" width="400" height="400" />
          <img class="alt" [src]="p.images.at(2) ?? p.images[0]" alt="" loading="lazy" width="400" height="400" />
        </a>
        <div class="badges">
          @if (!catalog.inStock(p)) {
            <span class="badge badge-grey">Out of stock</span>
          } @else {
            @if (p.bestSeller) { <span class="badge badge-ink">Bestseller</span> }
            @if (p.newArrival && !p.bestSeller) { <span class="badge badge-yellow">New</span> }
            @if (catalog.discount(v)) { <span class="badge badge-green">{{ catalog.discount(v) }}% off</span> }
          }
        </div>
        <button class="wish" [class.on]="wish.has(p.id)" (click)="wish.toggle(p.id, p.name)" [attr.aria-label]="wish.has(p.id) ? 'Remove from wishlist' : 'Add to wishlist'" [attr.aria-pressed]="wish.has(p.id)">
          <app-icon name="heart" [size]="18" [fill]="wish.has(p.id)" />
        </button>
        <button class="qv" (click)="ui.quickViewId.set(p.id)"><app-icon name="eye" [size]="16" /> Quick view</button>
      </div>
      <div class="body">
        <div class="meta">
          <span class="cat">{{ catalog.primaryCategory(p)?.name }}</span>
          @if (p.reviewCount) { <app-stars [rating]="p.rating" [count]="p.reviewCount" [size]="12" /> }
        </div>
        <h3><a [routerLink]="['/product', p.slug]">{{ p.name }}</a></h3>
        @if (!compact()) { <p class="desc">{{ p.shortDescription }}</p> }
        @if (p.variants.length > 1) {
          <div class="variants" role="radiogroup" [attr.aria-label]="'Size for ' + p.name">
            @for (x of p.variants; track x.id) {
              <button role="radio" [attr.aria-checked]="x.id === v.id" [class.active]="x.id === v.id" [class.na]="x.stock <= 0" (click)="variant.set(x)">{{ x.label }}</button>
            }
          </div>
        } @else {
          <div class="variants"><span class="single">{{ v.label }}</span></div>
        }
        <div class="foot">
          <div class="prices">
            <span class="price">{{ v.price | inr }}</span>
            @if (v.mrp > v.price) { <span class="mrp">{{ v.mrp | inr }}</span> }
          </div>
          @if (qty(); as q) {
            <div class="stepper" aria-label="Quantity in cart">
              <button (click)="cart.setQty(v.id, q - 1)" aria-label="Decrease"><app-icon name="minus" [size]="16" /></button>
              <span>{{ q }}</span>
              <button (click)="cart.setQty(v.id, q + 1)" aria-label="Increase" [disabled]="q >= v.stock"><app-icon name="plus" [size]="16" /></button>
            </div>
          } @else {
            <button class="add" (click)="add()" [disabled]="v.stock <= 0">
              @if (v.stock > 0) { <app-icon name="plus" [size]="16" [stroke]="2.6" /> Add } @else { Notify me }
            </button>
          }
        </div>
      </div>
    </article>
  `,
})
export class ProductCard {
  protected catalog = inject(CatalogService);
  protected cart = inject(CartService);
  protected wish = inject(WishlistService);
  protected ui = inject(UiService);
  private analytics = inject(AnalyticsService);

  readonly product = input.required<Product>();
  readonly compact = input(false);
  protected variant = linkedSignal(() => this.catalog.defaultVariant(this.product()));
  protected qty = computed(() => this.cart.qtyOf(this.variant().id));

  add() {
    const p = this.product();
    this.cart.add(p, this.variant(), 1, false);
    this.analytics.addToCart(p.id, p.name, this.variant().price);
  }
}
