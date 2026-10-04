import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DbService } from '../core/services/db.service';
import { NotificationService } from '../core/services/notification.service';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-admin-notifications',
  imports: [DatePipe, RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .n { display: flex; gap: 12px; padding: 14px; border-bottom: 1px solid var(--line-2); align-items: flex-start; &.unread { background: #fffbe0; } }
    .ic { width: 36px; height: 36px; border-radius: 10px; background: #f3efe3; display: grid; place-items: center; flex: none; }
    .n b { display: block; } .n small { color: var(--muted); font-weight: 600; }
    .ch { margin-left: auto; }
  `,
  template: `
    <div class="a-head">
      <div><h1>Notifications</h1><p>Admin alerts and the customer messages queued on SMS / email / WhatsApp.</p></div>
      <div class="acts"><div class="seg"><button [class.on]="tab() === 'admin'" (click)="tab.set('admin')">Admin alerts</button><button [class.on]="tab() === 'customer'" (click)="tab.set('customer')">Customer messages</button></div><button class="btn btn-light btn-sm" (click)="notify.markAllRead()">Mark all read</button></div>
    </div>
    <div class="a-card" style="padding:0;overflow:hidden">
      @for (n of list(); track n.id) {
        <div class="n" [class.unread]="!n.read">
          <span class="ic"><app-icon [name]="n.type === 'stock' ? 'alert' : n.type === 'payment' ? 'rupee' : n.type === 'order' || n.type === 'status' ? 'package' : n.type === 'customer' || n.type === 'registration' ? 'user' : 'bell'" [size]="18" /></span>
          <div class="grow"><b>{{ n.title }}</b><small>{{ n.body }}</small><div class="tiny muted">{{ n.at | date: 'd MMM y, h:mm a' }}</div></div>
          <span class="badge ch">{{ n.channel }}</span>
          @if (n.link) { <a [routerLink]="n.link" class="btn btn-light btn-xs">Open</a> }
        </div>
      } @empty { <div class="a-empty">Nothing yet.</div> }
    </div>
  `,
})
export class AdminNotifications {
  private db = inject(DbService);
  protected notify = inject(NotificationService);
  protected tab = signal<'admin' | 'customer'>('admin');
  protected list = computed(() => this.db.notifications().filter((n) => n.audience === this.tab()).sort((a, b) => b.at.localeCompare(a.at)));
}
