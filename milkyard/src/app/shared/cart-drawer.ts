import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../core/services/cart.service';
import { UiService } from '../core/services/ui.service';
import { CatalogService } from '../core/services/catalog.service';
import { Icon } from './icon';
import { InrPipe } from './inr.pipe';
import { QtyStepper } from './qty-stepper';

@Component({
  selector: 'app-cart-drawer',
  imports: [RouterLink, Icon, InrPipe, QtyStepper],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    aside { position: fixed; z-index: 95; top: 0; right: 0; bottom: 0; width: min(440px, 100vw); background: var(--cream); display: flex; flex-direction: column; box-shadow: var(--shadow-lg); animation: slide .45s var(--ease); }
    @keyframes slide { from { transform: translateX(100%); } }
    header { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid var(--line); }
    header h2 { font-size: 1.4rem; margin: 0; }
    .free { margin: 14px 20px 0; padding: 12px 14px; border-radius: 14px; background: var(--yellow-soft); font-size: .84rem; font-weight: 700; }
    .bar { height: 6px; border-radius: 6px; background: rgba(0,0,0,.08); margin-top: 8px; overflow: hidden; }
    .bar i { display: block; height: 100%; background: var(--ink); border-radius: 6px; transition: width .5s var(--ease); }
    .list { flex: 1; overflow: auto; padding: 8px 20px; }
    .line { display: grid; grid-template-columns: 76px 1fr auto; gap: 12px; padding: 14px 0; border-bottom: 1px solid var(--line); align-items: start; }
    .line img { width: 76px; height: 76px; border-radius: 14px; object-fit: cover; background: var(--butter); }
    .line h4 { font-family: var(--font-body); font-weight: 800; font-size: .95rem; margin: 0 0 2px; }
    .line .v { font-size: .78rem; color: var(--muted); font-weight: 700; }
    .line app-qty { --h: 34px; margin-top: 8px; }
    .rm { background: none; border: 0; color: var(--muted); padding: 4px; }
    .rm:hover { color: var(--danger); }
    .right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
    footer { padding: 16px 20px calc(16px + env(safe-area-inset-bottom)); border-top: 1px solid var(--line); background: #fff; }
    .sum { display: flex; justify-content: space-between; font-weight: 800; margin-bottom: 4px; }
    .sum b { font-size: 1.25rem; }
    .note { font-size: .78rem; color: var(--muted); margin-bottom: 12px; }
    .actions { display: grid; grid-template-columns: 1fr 1.4fr; gap: 10px; }
    .empty img { width: 160px; margin: 0 auto 8px; border-radius: 50%; }
    .sugg { padding: 0 20px 16px; }
    .sugg h5 { margin: 12px 0 8px; font-size: .75rem; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }
    .chips { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
    .mini { flex: none; display: flex; gap: 8px; align-items: center; padding: 6px 10px 6px 6px; border: 1px solid var(--line); border-radius: 14px; background: #fff; font-size: .78rem; font-weight: 800; }
    .mini img { width: 36px; height: 36px; border-radius: 10px; }
  `,
  template: `
    @if (ui.cartOpen()) {
      <div class="backdrop" (click)="ui.cartOpen.set(false)"></div>
      <aside role="dialog" aria-modal="true" aria-label="Your cart">
        <header>
          <h2>Your cart <span class="muted small">({{ cart.count() }})</span></h2>
          <button class="icon-btn" (click)="ui.cartOpen.set(false)" aria-label="Close cart"><app-icon name="close" /></button>
        </header>
        @if (cart.lines().length) {
          @let t = cart.totals();
          @if (t.serviceable) {
            <div class="free">
              @if (t.remainingForFree > 0) { Add <b>{{ t.remainingForFree | inr }}</b> more for <b>free delivery</b> } @else { 🎉 You’ve unlocked <b>free delivery</b>! }
              <div class="bar"><i [style.width.%]="progress()"></i></div>
            </div>
          }
          <div class="list">
            @for (l of cart.lines(); track l.variant.id) {
              <div class="line">
                <a [routerLink]="['/product', l.product.slug]" (click)="ui.cartOpen.set(false)"><img [src]="l.product.images[0]" [alt]="l.product.name" /></a>
                <div>
                  <h4>{{ l.product.name }}</h4>
                  <span class="v">{{ l.variant.label }} · {{ l.variant.price | inr }}</span>
                  <div><app-qty [value]="l.item.qty" [max]="l.variant.stock" (change)="cart.setQty(l.variant.id, $event)" /></div>
                </div>
                <div class="right">
                  <b>{{ l.lineTotal | inr }}</b>
                  <button class="rm" (click)="cart.remove(l.variant.id)" aria-label="Remove item"><app-icon name="trash" [size]="18" /></button>
                </div>
              </div>
            }
          </div>
          @if (suggestions().length) {
            <div class="sugg">
              <h5>Goes well with</h5>
              <div class="chips">
                @for (p of suggestions(); track p.id) {
                  <button class="mini" (click)="cart.add(p, catalog.defaultVariant(p), 1, false)"><img [src]="p.images[0]" alt="" /> {{ p.name }} <app-icon name="plus" [size]="14" /></button>
                }
              </div>
            </div>
          }
          <footer>
            <div class="sum"><span>Subtotal</span><b>{{ t.subtotal | inr }}</b></div>
            <div class="note">Delivery & coupons calculated at checkout.@if (t.savings > 0) { You save {{ t.savings | inr }} on MRP. }</div>
            <div class="actions">
              <a class="btn btn-light" routerLink="/cart" (click)="ui.cartOpen.set(false)">View cart</a>
              <button class="btn" (click)="checkout()">Checkout <app-icon name="arrow-right" [size]="18" /></button>
            </div>
          </footer>
        } @else {
          <div class="empty grow">
            <img src="images/categories/dairy.svg" alt="" />
            <h3>Your cart is empty</h3>
            <p>Fresh ghee and kheer are just a tap away.</p>
            <a class="btn" routerLink="/shop" (click)="ui.cartOpen.set(false)">Start shopping</a>
          </div>
        }
      </aside>
    }
  `,
})
export class CartDrawer {
  protected cart = inject(CartService);
  protected ui = inject(UiService);
  protected catalog = inject(CatalogService);
  private router = inject(Router);

  protected progress() {
    const t = this.cart.totals();
    return Math.min(100, ((t.subtotal - t.discount) / t.freeAbove) * 100);
  }
  protected suggestions() {
    const inCart = new Set(this.cart.lines().map((l) => l.product.id));
    const ids = this.cart.lines().flatMap((l) => l.product.boughtTogether);
    return [...new Set(ids)].filter((id) => !inCart.has(id)).map((id) => this.catalog.byId(id)!).filter(Boolean).slice(0, 4);
  }
  checkout() {
    this.ui.cartOpen.set(false);
    this.router.navigateByUrl('/checkout');
  }
}
