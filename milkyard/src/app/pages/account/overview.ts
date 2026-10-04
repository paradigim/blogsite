import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { Icon } from '../../shared/icon';
import { InrPipe } from '../../shared/inr.pipe';
import { StatusBadge } from '../../shared/status-badge';
import { OrderTimeline } from '../../shared/order-timeline';

@Component({
  selector: 'app-account-overview',
  imports: [RouterLink, DatePipe, Icon, InrPipe, StatusBadge, OrderTimeline],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .hi { padding: 28px; border-radius: 28px; background: var(--yellow); margin-bottom: 18px; h1 { font-size: clamp(1.8rem, 3.5vw, 2.4rem); margin: 0 0 4px; } p { margin: 0; color: #3a3410; } }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 18px; }
    .stat { display: flex; gap: 12px; align-items: center; background: #fff; border: 1px solid var(--line); border-radius: 20px; padding: 16px; }
    .stat .i { width: 44px; height: 44px; border-radius: 14px; background: var(--butter); display: grid; place-items: center; }
    .stat b { display: block; font-size: 1.3rem; } .stat small { color: var(--muted); font-weight: 700; }
    .card h3 { margin: 0; }
    .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; gap: 10px; flex-wrap: wrap; }
  `,
  template: `
    @if (auth.user(); as u) {
      <div class="hi"><h1>Namaskar, {{ u.name.split(' ')[0] || 'there' }}!</h1><p>Here’s everything from your MILKYARD kitchen.</p></div>
      <div class="stats">
        <a class="stat" routerLink="/account/orders"><span class="i"><app-icon name="package" /></span><span><b>{{ orders.mine().length }}</b><small>Orders</small></span></a>
        <a class="stat" routerLink="/account/addresses"><span class="i"><app-icon name="pin" /></span><span><b>{{ u.addresses.length }}</b><small>Saved addresses</small></span></a>
        <a class="stat" routerLink="/account/wishlist"><span class="i"><app-icon name="heart" /></span><span><b>{{ wish.count() }}</b><small>Wishlist</small></span></a>
        <div class="stat"><span class="i"><app-icon name="rupee" /></span><span><b>{{ spent() | inr }}</b><small>Total spent</small></span></div>
      </div>
      @if (latest(); as o) {
        <div class="card">
          <div class="head"><div><h3>Latest order · {{ o.id }}</h3><span class="small muted">{{ o.createdAt | date: 'd MMM y' }} · {{ o.total | inr }}</span></div><app-status [value]="o.status" /></div>
          <app-order-timeline [order]="o" />
          <a [routerLink]="['/account/orders', o.id]" class="link small mt-2" style="display:inline-block">View order details →</a>
        </div>
      } @else {
        <div class="card empty"><h3>No orders yet</h3><p>Your first jar of ghee is waiting.</p><a routerLink="/shop" class="btn">Start shopping</a></div>
      }
    }
  `,
})
export class AccountOverview {
  protected auth = inject(AuthService);
  protected orders = inject(OrderService);
  protected wish = inject(WishlistService);
  protected latest = computed(() => this.orders.mine()[0]);
  protected spent = computed(() => this.orders.mine().filter((o) => o.paymentStatus === 'Paid').reduce((s, o) => s + o.total, 0));
}
