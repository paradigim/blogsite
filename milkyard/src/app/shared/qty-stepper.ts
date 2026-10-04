import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Icon } from './icon';

@Component({
  selector: 'app-qty',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { display: inline-flex; align-items: center; border: 1.5px solid var(--line); border-radius: 999px; background: #fff; height: var(--h, 44px); }
    button { width: var(--h, 44px); height: 100%; display: grid; place-items: center; border: 0; background: none; border-radius: 999px; }
    button:hover:not(:disabled) { background: var(--line-2); }
    button:disabled { opacity: .3; cursor: not-allowed; }
    span { min-width: 28px; text-align: center; font-weight: 900; font-variant-numeric: tabular-nums; }
  `,
  template: `
    <button type="button" (click)="change.emit(value() - 1)" [disabled]="value() <= min()" aria-label="Decrease quantity"><app-icon name="minus" [size]="16" /></button>
    <span aria-live="polite">{{ value() }}</span>
    <button type="button" (click)="change.emit(value() + 1)" [disabled]="value() >= max()" aria-label="Increase quantity"><app-icon name="plus" [size]="16" /></button>
  `,
})
export class QtyStepper {
  readonly value = input(1);
  readonly min = input(1);
  readonly max = input(99);
  readonly change = output<number>();
}
