import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist.service';
import { CatalogService } from '../../core/services/catalog.service';
import { ProductCard } from '../../shared/product-card';
import { Product } from '../../core/models';

@Component({
  selector: 'app-account-wishlist',
  imports: [RouterLink, ProductCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `h1 { font-size: 2rem; } .grid { display: grid; gap: 14px; grid-template-columns: repeat(2, minmax(0,1fr)); @media (min-width: 900px) { grid-template-columns: repeat(3, minmax(0,1fr)); } }`,
  template: `
    <h1>Wishlist</h1>
    @if (items().length) {
      <div class="grid">@for (p of items(); track p.id) { <app-product-card [product]="p" /> }</div>
    } @else {
      <div class="card empty"><h3>Nothing saved yet</h3><p>Tap the ♡ on any product to save it for later.</p><a routerLink="/shop" class="btn">Browse products</a></div>
    }
  `,
})
export class AccountWishlist {
  private wish = inject(WishlistService);
  private catalog = inject(CatalogService);
  protected items = computed(() => this.wish.ids().map((id) => this.catalog.byId(id)).filter((p): p is Product => !!p && p.published));
}
