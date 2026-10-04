import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const MAP: Record<string, string> = {
  Pending: 'badge-amber',
  Confirmed: 'badge-blue',
  Preparing: 'badge-yellow',
  'Out for Delivery': 'badge-ink',
  Delivered: 'badge-green',
  Cancelled: 'badge-red',
  Failed: 'badge-red',
  Refunded: 'badge-grey',
  Paid: 'badge-green',
  COD: 'badge-amber',
};

@Component({
  selector: 'app-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge" [class]="cls()"><i class="d"></i>{{ value() }}</span>`,
  styles: `.d { width: 6px; height: 6px; border-radius: 50%; background: currentColor; display: inline-block; }`,
})
export class StatusBadge {
  readonly value = input.required<string>();
  protected cls = computed(() => 'badge ' + (MAP[this.value()] ?? 'badge-grey'));
}
