import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DatePipe } from '@angular/common';
import { filter } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { NotificationService } from '../core/services/notification.service';
import { SeoService } from '../core/services/seo.service';
import { DbService } from '../core/services/db.service';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './admin.scss',
  template: `
    <div class="adm">
      <aside class="side" [class.open]="menu()">
        <a routerLink="/admin" class="brand"><img src="brand/milkyard-logo-light.png" alt="MILKYARD" /><span>ADMIN</span></a>
        <nav (click)="menu.set(false)">
          @for (g of groups; track g.title) {
            <h6>{{ g.title }}</h6>
            @for (l of g.links; track l.path) {
              <a [routerLink]="l.path" routerLinkActive="on" [routerLinkActiveOptions]="{ exact: l.path === '/admin' }"><app-icon [name]="l.icon" [size]="18" />{{ l.label }}
                @if (l.path === '/admin/orders' && pending()) { <em>{{ pending() }}</em> }
                @if (l.path === '/admin/reviews' && pendingReviews()) { <em>{{ pendingReviews() }}</em> }
              </a>
            }
          }
        </nav>
        <div class="side-foot">
          <a routerLink="/" class="store"><app-icon name="store" [size]="18" /> View storefront <app-icon name="external" [size]="14" /></a>
        </div>
      </aside>
      @if (menu()) { <div class="backdrop" (click)="menu.set(false)" style="z-index:89"></div> }

      <div class="main">
        <header class="top">
          <button class="icon-btn burger" (click)="menu.set(true)" aria-label="Open admin menu"><app-icon name="menu" /></button>
          <div class="search">
            <app-icon name="search" [size]="18" />
            <input placeholder="Search orders by ID, customer or phone…" (keydown.enter)="search($any($event.target).value)" aria-label="Search orders" />
          </div>
          <div class="top-actions">
            <div class="bell-wrap">
              <button class="icon-btn" (click)="bell.set(!bell())" aria-label="Notifications"><app-icon name="bell" />@if (notify.unread()) { <span class="dot">{{ notify.unread() }}</span> }</button>
              @if (bell()) {
                <div class="bell-pop">
                  <div class="row between"><b>Notifications</b><button class="link tiny" (click)="notify.markAllRead()">Mark all read</button></div>
                  @for (n of notify.admin().slice(0, 6); track n.id) {
                    <a [routerLink]="n.link ?? '/admin/notifications'" (click)="bell.set(false)" class="np" [class.unread]="!n.read">
                      <app-icon [name]="n.type === 'stock' ? 'alert' : n.type === 'payment' ? 'rupee' : n.type === 'order' ? 'package' : 'bell'" [size]="16" />
                      <span><b>{{ n.title }}</b><small>{{ n.body }}</small><small>{{ n.at | date: 'd MMM, h:mm a' }}</small></span>
                    </a>
                  } @empty { <p class="small muted">You’re all caught up.</p> }
                  <a routerLink="/admin/notifications" class="link small" (click)="bell.set(false)">View all</a>
                </div>
              }
            </div>
            <div class="me"><span class="av">A</span><span class="hide-sm"><b>{{ auth.user()?.name }}</b><small>+91 {{ auth.user()?.phone }}</small></span></div>
            <button class="icon-btn" (click)="logout()" aria-label="Logout" title="Logout"><app-icon name="logout" /></button>
          </div>
        </header>
        <div class="content"><router-outlet /></div>
      </div>
    </div>
  `,
})
export class AdminLayout {
  protected auth = inject(AuthService);
  protected notify = inject(NotificationService);
  private db = inject(DbService);
  private router = inject(Router);
  protected menu = signal(false);
  protected bell = signal(false);
  protected pending = () => this.db.orders().filter((o) => ['Pending', 'Confirmed'].includes(o.status)).length;
  protected pendingReviews = () => this.db.reviews().filter((r) => r.status === 'pending').length;

  protected groups = [
    { title: 'Overview', links: [{ path: '/admin', label: 'Dashboard', icon: 'layout' }] },
    {
      title: 'Sales',
      links: [
        { path: '/admin/orders', label: 'Orders', icon: 'package' },
        { path: '/admin/customers', label: 'Customers', icon: 'users' },
        { path: '/admin/coupons', label: 'Coupons & offers', icon: 'percent' },
      ],
    },
    {
      title: 'Catalogue',
      links: [
        { path: '/admin/products', label: 'Products', icon: 'box' },
        { path: '/admin/categories', label: 'Categories', icon: 'grid' },
        { path: '/admin/inventory', label: 'Inventory', icon: 'receipt' },
        { path: '/admin/reviews', label: 'Reviews', icon: 'star' },
      ],
    },
    {
      title: 'Insights',
      links: [
        { path: '/admin/analytics', label: 'Sales analytics', icon: 'chart' },
        { path: '/admin/profit', label: 'Profit', icon: 'rupee' },
        { path: '/admin/traffic', label: 'Website traffic', icon: 'globe' },
      ],
    },
    {
      title: 'Store',
      links: [
        { path: '/admin/homepage', label: 'Homepage', icon: 'image' },
        { path: '/admin/delivery', label: 'Delivery zones', icon: 'truck' },
        { path: '/admin/notifications', label: 'Notifications', icon: 'bell' },
        { path: '/admin/settings', label: 'Settings', icon: 'settings' },
      ],
    },
  ];

  constructor() {
    const seo = inject(SeoService);
    seo.set({ title: 'Admin' });
    seo.noindex();
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      seo.noindex();
      this.bell.set(false);
    });
  }
  search(q: string) {
    this.router.navigate(['/admin/orders'], { queryParams: { q } });
  }
  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
