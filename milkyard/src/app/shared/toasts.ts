import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../core/services/toast.service';
import { Icon } from './icon';

@Component({
  selector: 'app-toasts',
  imports: [Icon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { position: fixed; z-index: 200; left: 50%; transform: translateX(-50%); bottom: 20px; display: flex; flex-direction: column; gap: 8px; width: min(420px, calc(100vw - 24px)); pointer-events: none; }
    .t { pointer-events: auto; display: flex; gap: 12px; align-items: flex-start; padding: 14px 16px; border-radius: 18px; background: var(--ink); color: #fff; box-shadow: var(--shadow-lg); animation: rise .4s var(--ease); }
    .ic { width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; background: var(--yellow); color: var(--ink); flex: none; }
    .error .ic { background: #ff6b6b; color: #fff; }
    .info .ic { background: #fff; }
    b { display: block; font-size: .92rem; }
    p { margin: 2px 0 0; font-size: .82rem; opacity: .8; }
    .grow { flex: 1; min-width: 0; }
    a { color: var(--yellow); font-weight: 800; font-size: .82rem; white-space: nowrap; align-self: center; }
    button { background: none; border: 0; color: #fff; opacity: .6; padding: 2px; }
  `,
  template: `
    @for (t of toast.toasts(); track t.id) {
      <div class="t" [class]="t.tone" role="status" aria-live="polite">
        <span class="ic"><app-icon [name]="t.tone === 'error' ? 'alert' : t.tone === 'info' ? 'info' : 'check'" [size]="16" [stroke]="2.6" /></span>
        <div class="grow"><b>{{ t.title }}</b>@if (t.body) {<p>{{ t.body }}</p>}</div>
        @if (t.action) { <a [routerLink]="t.action.link" (click)="toast.dismiss(t.id)">{{ t.action.label }}</a> }
        <button (click)="toast.dismiss(t.id)" aria-label="Dismiss"><app-icon name="close" [size]="16" /></button>
      </div>
    }
  `,
})
export class Toasts {
  protected toast = inject(ToastService);
}
