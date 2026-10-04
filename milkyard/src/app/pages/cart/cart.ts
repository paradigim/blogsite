import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { CatalogService } from '../../core/services/catalog.service';
import { DbService } from '../../core/services/db.service';
import { SeoService } from '../../core/services/seo.service';
import { DeliveryService } from '../../core/services/delivery.service';
import { Icon } from '../../shared/icon';
import { InrPipe } from '../../shared/inr.pipe';
import { QtyStepper } from '../../shared/qty-stepper';
import { PincodeChecker } from '../../shared/pincode-checker';
import { ProductCard } from '../../shared/product-card';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, FormsModule, Icon, InrPipe, QtyStepper, PincodeChecker, ProductCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './cart.scss',
  template: `
    <div class="container page">
      <nav class="breadcrumb"><a routerLink="/">Home</a><span class="sep">/</span><span>Cart</span></nav>
      <h1>Your cart</h1>
      @if (cart.lines().length) {
        @let t = cart.totals();
        <div class="layout">
          <div>
            @if (t.serviceable) {
              <div class="free">
                <app-icon name="truck" [size]="22" />
                <div class="grow">
                  @if (t.remainingForFree > 0) { You’re <b>{{ t.remainingForFree | inr }}</b> away from <b>free delivery</b> } @else { You’ve unlocked <b>free delivery</b> 🎉 }
                  <div class="bar"><i [style.width.%]="progress()"></i></div>
                </div>
              </div>
            }
            <div class="lines">
              @for (l of cart.lines(); track l.variant.id) {
                <article class="line">
                  <a [routerLink]="['/product', l.product.slug]" class="thumb"><img [src]="l.product.images[0]" [alt]="l.product.name" /></a>
                  <div class="info">
                    <a [routerLink]="['/product', l.product.slug]"><h3>{{ l.product.name }}</h3></a>
                    <div class="row wrap">
                      @if (l.product.variants.length > 1) {
                        <select class="select vsel" (change)="cart.changeVariant(l.variant.id, $any($event.target).value)" aria-label="Size">
                          @for (v of l.product.variants; track v.id) { <option [value]="v.id" [selected]="v.id === l.variant.id" [disabled]="v.stock <= 0">{{ v.label }} — {{ v.price | inr }}</option> }
                        </select>
                      } @else { <span class="badge">{{ l.variant.label }}</span> }
                      @if (l.variant.stock <= l.product.lowStockThreshold) { <span class="badge badge-amber">Only {{ l.variant.stock }} left</span> }
                    </div>
                    <div class="row wrap mt-1">
                      <app-qty [value]="l.item.qty" [max]="l.variant.stock" (change)="cart.setQty(l.variant.id, $event)" />
                      <button class="link small" (click)="cart.remove(l.variant.id)">Remove</button>
                    </div>
                  </div>
                  <div class="amt">
                    <b>{{ l.lineTotal | inr }}</b>
                    @if (l.variant.mrp > l.variant.price) { <span class="mrp">{{ l.variant.mrp * l.item.qty | inr }}</span> }
                    <span class="tiny muted">{{ l.variant.price | inr }} each</span>
                  </div>
                </article>
              }
            </div>
            <a routerLink="/shop" class="link mt-2" style="display:inline-block">← Continue shopping</a>
          </div>

          <aside class="summary">
            <div class="card">
              <h3>Delivery</h3>
              <app-pincode [small]="true" />
            </div>
            <div class="card">
              <h3>Coupon</h3>
              @if (t.coupon) {
                <div class="applied"><app-icon name="tag" [size]="18" /><div class="grow"><b>{{ t.coupon.code }}</b><small>{{ t.coupon.description }}</small></div><button class="link small" (click)="cart.couponCode.set('')">Remove</button></div>
              } @else {
                <form class="input-group" (ngSubmit)="apply()">
                  <input name="code" [(ngModel)]="code" placeholder="Enter coupon code" aria-label="Coupon code" style="text-transform:uppercase" />
                  <button class="btn" type="submit">Apply</button>
                </form>
                @if (couponError()) { <p class="err">{{ couponError() }}</p> }
                <div class="offers">
                  @for (c of offers(); track c.id) { <button class="offer" (click)="code = c.code; apply()"><b>{{ c.code }}</b><span>{{ c.description }}</span></button> }
                </div>
              }
            </div>
            <div class="card totals">
              <h3>Order summary</h3>
              <div class="tr"><span>Items ({{ t.count }})</span><span>{{ t.mrpTotal | inr }}</span></div>
              @if (t.savings) { <div class="tr save"><span>Discount on MRP</span><span>−{{ t.savings | inr }}</span></div> }
              @if (t.discount) { <div class="tr save"><span>Coupon ({{ t.coupon?.code }})</span><span>−{{ t.discount | inr }}</span></div> }
              <div class="tr"><span>Delivery</span><span>@if (t.delivery === null) { <em class="muted">Enter pincode</em> } @else if (t.delivery === 0) { <b class="free-txt">FREE</b> } @else { {{ t.delivery | inr }} }</span></div>
              <div class="tr total"><span>Total payable</span><span>{{ t.total | inr }}</span></div>
              @if (t.savings + t.discount > 0) { <div class="saved">You save {{ t.savings + t.discount | inr }} on this order</div> }
              @if (t.belowMinimum) { <p class="err">Minimum order for your area is {{ t.minOrder | inr }}.</p> }
              <button class="btn btn-block btn-lg mt-2" (click)="checkout()" [disabled]="t.belowMinimum">Proceed to checkout <app-icon name="arrow-right" /></button>
              <p class="tiny muted center mt-1"><app-icon name="lock" [size]="12" style="display:inline-flex;vertical-align:-2px" /> Secure checkout · UPI · Cards · Net banking · Wallets</p>
            </div>
          </aside>
        </div>
      } @else {
        <div class="empty card">
          <img class="art" src="images/categories/sweets.svg" alt="" style="border-radius:50%" />
          <h3>Your cart is empty</h3>
          <p>Looks like you haven’t added anything yet.</p>
          <a class="btn" routerLink="/shop">Start shopping</a>
        </div>
        <section class="mt-4">
          <h2>Bestsellers</h2>
          <div class="pgrid">@for (p of catalog.bestSellers().slice(0, 4); track p.id) { <app-product-card [product]="p" [compact]="true" /> }</div>
        </section>
      }
    </div>
  `,
})
export class CartPage {
  protected cart = inject(CartService);
  protected catalog = inject(CatalogService);
  private db = inject(DbService);
  private router = inject(Router);
  private delivery = inject(DeliveryService);
  protected code = '';
  protected couponError = signal('');
  protected offers = computed(() => {
    const today = new Date().toISOString().slice(0, 10);
    return this.db.coupons().filter((c) => c.active && c.startsAt <= today && c.endsAt >= today).slice(0, 3);
  });

  constructor() {
    inject(SeoService).set({ title: 'Your cart', path: '/cart' });
  }
  progress() {
    const t = this.cart.totals();
    return Math.min(100, ((t.subtotal - t.discount) / t.freeAbove) * 100);
  }
  apply() {
    this.couponError.set(this.cart.applyCoupon(this.code));
    if (!this.couponError()) this.code = '';
  }
  checkout() {
    this.router.navigateByUrl('/checkout');
  }
}
