import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SeoService } from '../../core/services/seo.service';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-account-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .page { padding-top: 28px; padding-bottom: 64px; }
    .layout { display: grid; gap: 24px; @media (min-width: 960px) { grid-template-columns: 260px 1fr; align-items: start; } }
    .side { background: #fff; border: 1px solid var(--line); border-radius: 24px; padding: 14px; @media (min-width: 960px) { position: sticky; top: calc(var(--header-h) + 16px); } }
    .me { display: flex; gap: 12px; align-items: center; padding: 10px 8px 16px; border-bottom: 1px solid var(--line-2); margin-bottom: 8px; }
    .av { width: 48px; height: 48px; border-radius: 50%; background: var(--yellow); border: 2px solid var(--ink); display: grid; place-items: center; font-weight: 900; font-size: 1.2rem; text-transform: uppercase; flex: none; }
    .me small { display: block; color: var(--muted); font-weight: 700; }
    nav { display: flex; flex-direction: column; gap: 2px; }
    nav a, nav button { display: flex; gap: 12px; align-items: center; padding: 11px 12px; border-radius: 14px; font-weight: 800; font-size: .93rem; color: var(--ink-2); background: none; border: 0; text-align: left; }
    nav a:hover, nav button:hover { background: var(--line-2); }
    nav a.on { background: var(--ink); color: #fff; }
    nav a.on app-icon { color: var(--yellow); }
    @media (max-width: 959px) {
      .side { padding: 8px; }
      .me { display: none; }
      nav { flex-direction: row; overflow-x: auto; scrollbar-width: none; }
      nav a, nav button { flex: none; padding: 9px 14px; font-size: .85rem; }
    }
  `,
  template: `
    <div class="container page">
      <div class="layout">
        <aside class="side">
          @if (auth.user(); as u) {
            <div class="me"><span class="av">{{ (u.name || 'U')[0] }}</span><div><b>{{ u.name || 'Welcome' }}</b><small>+91 {{ u.phone }}</small></div></div>
          }
          <nav aria-label="Account">
            <a routerLink="/account" routerLinkActive="on" [routerLinkActiveOptions]="{ exact: true }"><app-icon name="layout" [size]="18" /> Overview</a>
            <a routerLink="/account/orders" routerLinkActive="on"><app-icon name="package" [size]="18" /> My orders</a>
            <a routerLink="/account/addresses" routerLinkActive="on"><app-icon name="pin" [size]="18" /> Addresses</a>
            <a routerLink="/account/wishlist" routerLinkActive="on"><app-icon name="heart" [size]="18" /> Wishlist</a>
            <a routerLink="/account/profile" routerLinkActive="on"><app-icon name="user" [size]="18" /> Profile</a>
            @if (auth.isAdmin()) { <a routerLink="/admin"><app-icon name="shield" [size]="18" /> Admin dashboard</a> }
            <button (click)="logout()"><app-icon name="logout" [size]="18" /> Logout</button>
          </nav>
        </aside>
        <div><router-outlet /></div>
      </div>
    </div>
  `,
})
export class AccountLayout {
  protected auth = inject(AuthService);
  private router = inject(Router);
  constructor() {
    const seo = inject(SeoService);
    seo.set({ title: 'My account' });
    seo.noindex();
  }
  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
