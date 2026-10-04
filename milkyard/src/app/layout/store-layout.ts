import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Header } from './header';
import { Footer } from './footer';
import { CartDrawer } from '../shared/cart-drawer';
import { QuickView } from '../shared/quick-view';
import { SearchOverlay } from '../shared/search-overlay';
import { Icon } from '../shared/icon';
import { DbService } from '../core/services/db.service';
import { UiService } from '../core/services/ui.service';
import { CartService } from '../core/services/cart.service';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-store-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Header, Footer, CartDrawer, QuickView, SearchOverlay, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    main { min-height: 60vh; }
    .wa {
      position: fixed; z-index: 70; right: 18px; bottom: 22px;
      width: 56px; height: 56px; border-radius: 50%; display: grid; place-items: center;
      background: #25d366; color: #fff; box-shadow: 0 12px 24px -8px rgba(37,211,102,.6);
      transition: transform .25s var(--ease);
    }
    .wa:hover { transform: scale(1.08) rotate(-6deg); }
    .wa .tip { position: absolute; right: 66px; white-space: nowrap; background: var(--ink); color: #fff; font-size: .78rem; font-weight: 800; padding: 6px 10px; border-radius: 10px; opacity: 0; transform: translateX(6px); transition: all .25s; pointer-events: none; }
    .wa:hover .tip { opacity: 1; transform: none; }
    .tabbar { display: none; }
    @media (max-width: 767px) {
      .tabbar {
        display: grid; grid-template-columns: repeat(5, 1fr);
        position: fixed; z-index: 75; left: 0; right: 0; bottom: 0;
        background: rgba(255,252,242,.96); backdrop-filter: blur(12px);
        border-top: 1px solid var(--line);
        padding: 6px 4px calc(6px + env(safe-area-inset-bottom));
      }
      .tabbar a, .tabbar button { background: none; border: 0; display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: .66rem; font-weight: 800; color: var(--muted); padding: 4px 0; position: relative; }
      .tabbar .on { color: var(--ink); }
      .tabbar .on app-icon { background: var(--yellow); border-radius: 999px; }
      .tabbar app-icon { padding: 2px 12px; box-sizing: content-box; }
      .tabbar .n { position: absolute; top: 0; left: 55%; min-width: 17px; height: 17px; padding: 0 4px; border-radius: 99px; background: var(--ink); color: var(--yellow); font-size: .62rem; display: grid; place-items: center; }
      .wa { bottom: calc(78px + env(safe-area-inset-bottom)); width: 50px; height: 50px; }
      :host { padding-bottom: 64px; display: block; }
    }
  `,
  template: `
    <a class="sr-only" href="#main">Skip to content</a>
    <app-header />
    <main id="main"><router-outlet /></main>
    <app-footer />
    <a class="wa" [href]="'https://wa.me/' + db.settings().whatsapp + '?text=' + waText" target="_blank" rel="noopener" aria-label="Chat with MILKYARD on WhatsApp">
      <app-icon name="whatsapp" [size]="28" [stroke]="1.7" /><span class="tip">Order on WhatsApp</span>
    </a>
    <nav class="tabbar" aria-label="Quick navigation">
      <a routerLink="/" routerLinkActive="on" [routerLinkActiveOptions]="{ exact: true }"><app-icon name="home" [size]="22" />Home</a>
      <a routerLink="/shop" routerLinkActive="on"><app-icon name="grid" [size]="22" />Shop</a>
      <button (click)="ui.searchOpen.set(true)"><app-icon name="search" [size]="22" />Search</button>
      <a routerLink="/cart" routerLinkActive="on"><app-icon name="bag" [size]="22" />Cart@if (cart.count()) {<span class="n">{{ cart.count() }}</span>}</a>
      <a [routerLink]="auth.isLoggedIn() ? '/account' : '/login'" routerLinkActive="on"><app-icon name="user" [size]="22" />{{ auth.isLoggedIn() ? 'Account' : 'Login' }}</a>
    </nav>
    <app-cart-drawer />
    <app-quick-view />
    <app-search-overlay />
  `,
})
export class StoreLayout {
  protected db = inject(DbService);
  protected ui = inject(UiService);
  protected cart = inject(CartService);
  protected auth = inject(AuthService);
  protected waText = encodeURIComponent('Hi MILKYARD! I would like to place an order.');
}
