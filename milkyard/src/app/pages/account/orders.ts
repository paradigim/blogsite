import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { InrPipe } from '../../shared/inr.pipe';
import { StatusBadge } from '../../shared/status-badge';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-account-orders',
  imports: [RouterLink, DatePipe, InrPipe, StatusBadge, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    h1 { font-size: 2rem; }
    .list { display: flex; flex-direction: column; gap: 14px; }
    .o { display: block; background: #fff; border: 1px solid var(--line); border-radius: 22px; padding: 18px; transition: border-color .2s, transform .2s; }
    .o:hover { border-color: var(--ink); transform: translateY(-2px); }
    .top { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
    .top b { font-size: 1.05rem; }
    .imgs { display: flex; gap: 6px; }
    .imgs img { width: 52px; height: 52px; border-radius: 12px; }
    .bottom { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
    .names { font-size: .85rem; color: var(--muted); font-weight: 600; flex: 1; min-width: 180px; }
    .badges { display: flex; gap: 6px; }
  `,
  template: `
    <h1>My orders</h1>
    <div class="list">
      @for (o of orders.mine(); track o.id) {
        <a class="o" [routerLink]="['/account/orders', o.id]">
          <div class="top">
            <div><b>{{ o.id }}</b><div class="tiny muted bold">{{ o.createdAt | date: 'EEE, d MMM y · h:mm a' }}</div></div>
            <div class="badges"><app-status [value]="o.paymentStatus" /><app-status [value]="o.status" /></div>
          </div>
          <div class="bottom">
            <div class="imgs">@for (i of o.items.slice(0, 4); track i.variantId) { <img [src]="i.image" [alt]="i.name" /> }</div>
            <span class="names">@for (i of o.items; track i.variantId; let last = $last) { {{ i.name }} ×{{ i.qty }}@if (!last) {, } }</span>
            <b>{{ o.total | inr }}</b>
            <app-icon name="chevron-right" />
          </div>
        </a>
      } @empty {
        <div class="card empty"><h3>No orders yet</h3><p>When you place an order, it’ll show up here.</p><a routerLink="/shop" class="btn">Shop now</a></div>
      }
    </div>
  `,
})
export class AccountOrders {
  protected orders = inject(OrderService);
}
