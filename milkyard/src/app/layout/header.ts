import { ChangeDetectionStrategy, Component, HostListener, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../core/services/cart.service';
import { UiService } from '../core/services/ui.service';
import { AuthService } from '../core/services/auth.service';
import { CatalogService } from '../core/services/catalog.service';
import { WishlistService } from '../core/services/wishlist.service';
import { DbService } from '../core/services/db.service';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './header.scss',
  template: `
    <div class="announce" role="region" aria-label="Announcements">
      <div class="container">
        @for (a of db.home().announcements; track a; let i = $index) {
          <span [class.show]="i === annIdx()">{{ a }}</span>
        }
      </div>
    </div>
    <header class="hdr" [class.scrolled]="scrolled()">
      <div class="container bar">
        <button class="icon-btn burger" (click)="ui.menuOpen.set(true)" aria-label="Open menu"><app-icon name="menu" [size]="24" /></button>
        <a routerLink="/" class="logo" aria-label="MILKYARD home"><img src="brand/milkyard-logo.png" alt="MILKYARD Dairy Products" width="190" height="48" /></a>
        <nav class="nav" aria-label="Main">
          <a routerLink="/" routerLinkActive="on" [routerLinkActiveOptions]="{ exact: true }">Home</a>
          <a routerLink="/shop" routerLinkActive="on">Shop</a>
          <div class="has-mega" (mouseenter)="mega.set(true)" (mouseleave)="mega.set(false)">
            <button (click)="mega.set(!mega())" [attr.aria-expanded]="mega()">Categories <app-icon name="chevron-down" [size]="16" /></button>
            @if (mega()) {
              <div class="mega" (click)="mega.set(false)">
                <div class="mega-grid">
                  @for (c of catalog.categories(); track c.id) {
                    <a [routerLink]="['/category', c.slug]" class="mc">
                      <img [src]="c.image" alt="" />
                      <span><b>{{ c.name }}</b><small>{{ c.tagline }}</small></span>
                    </a>
                  }
                </div>
              </div>
            }
          </div>
          <a routerLink="/about" routerLinkActive="on">About Us</a>
          <a routerLink="/contact" routerLinkActive="on">Contact</a>
        </nav>
        <div class="actions">
          @if (auth.isAdmin()) { <a routerLink="/admin" class="admin-pill"><app-icon name="shield" [size]="15" /> ADMIN</a> }
          <button class="icon-btn" (click)="ui.searchOpen.set(true)" aria-label="Search"><app-icon name="search" /></button>
          <a class="icon-btn hide-sm" routerLink="/account/wishlist" aria-label="Wishlist">
            <app-icon name="heart" />@if (wish.count()) { <span class="count soft">{{ wish.count() }}</span> }
          </a>
          @if (auth.user(); as u) {
            <a class="acct hide-sm" routerLink="/account"><span class="av">{{ (u.name || 'U')[0] }}</span><span class="nm">{{ u.name.split(' ')[0] || 'Account' }}</span></a>
          } @else {
            <a class="icon-btn hide-sm" routerLink="/login" aria-label="Login"><app-icon name="user" /></a>
          }
          <button class="icon-btn cart" (click)="ui.cartOpen.set(true)" [attr.aria-label]="'Cart, ' + cart.count() + ' items'">
            <app-icon name="bag" />@if (cart.count()) { <span class="count" [class.bump]="bump()">{{ cart.count() }}</span> }
          </button>
        </div>
      </div>
    </header>

    @if (ui.menuOpen()) {
      <div class="backdrop" (click)="ui.menuOpen.set(false)"></div>
      <aside class="drawer" role="dialog" aria-modal="true" aria-label="Menu">
        <div class="dh">
          <img src="brand/milkyard-logo.png" alt="MILKYARD" width="150" />
          <button class="icon-btn" (click)="ui.menuOpen.set(false)" aria-label="Close menu"><app-icon name="close" /></button>
        </div>
        <div class="dbody" (click)="closeOnLink($event)">
          @if (auth.user(); as u) {
            <a routerLink="/account" class="hello"><span class="av">{{ (u.name || 'U')[0] }}</span><span><small>Hello,</small><b>{{ u.name || 'there' }}</b></span><app-icon name="chevron-right" /></a>
          } @else {
            <a routerLink="/login" class="btn btn-block">Login / Register</a>
          }
          @if (auth.isAdmin()) { <a routerLink="/admin" class="btn btn-yellow btn-block mt-1"><app-icon name="shield" /> Admin dashboard</a> }
          <nav class="dnav">
            <a routerLink="/">Home</a>
            <a routerLink="/shop">Shop all</a>
            <a routerLink="/account/orders">My orders</a>
            <a routerLink="/account/wishlist">Wishlist</a>
            <a routerLink="/about">About us</a>
            <a routerLink="/contact">Contact</a>
            <a routerLink="/faq">FAQ</a>
          </nav>
          <h6>Categories</h6>
          <div class="dcats">
            @for (c of catalog.categories(); track c.id) {
              <a [routerLink]="['/category', c.slug]"><img [src]="c.image" alt="" />{{ c.name }}</a>
            }
          </div>
          <div class="dcontact">
            <a [href]="'tel:' + db.settings().phones[0].replace(' ', '')"><app-icon name="phone" [size]="18" /> {{ db.settings().phones[0] }}</a>
            <a [href]="'https://wa.me/' + db.settings().whatsapp" target="_blank" rel="noopener"><app-icon name="whatsapp" [size]="18" /> Order on WhatsApp</a>
          </div>
        </div>
      </aside>
    }
  `,
})
export class Header {
  protected cart = inject(CartService);
  protected ui = inject(UiService);
  protected auth = inject(AuthService);
  protected catalog = inject(CatalogService);
  protected wish = inject(WishlistService);
  protected db = inject(DbService);
  protected scrolled = signal(false);
  protected mega = signal(false);
  protected annIdx = signal(0);
  protected bump = signal(false);
  private lastCount = this.cart.count();

  constructor() {
    setInterval(() => this.annIdx.update((i) => (i + 1) % Math.max(1, this.db.home().announcements.length)), 4500);
    // tiny bounce on the cart badge whenever the count changes
    effect(() => {
      const c = this.cart.count();
      if (c !== this.lastCount) {
        this.lastCount = c;
        this.bump.set(true);
        setTimeout(() => this.bump.set(false), 450);
      }
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 8);
  }

  closeOnLink(e: Event) {
    if ((e.target as HTMLElement).closest('a')) this.ui.menuOpen.set(false);
  }
}
