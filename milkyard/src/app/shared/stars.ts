import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-stars',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { display: inline-flex; align-items: center; gap: 6px; }
    .s { position: relative; display: inline-block; line-height: 1; letter-spacing: 1px; color: #e3dcc6; }
    .f { position: absolute; inset: 0; overflow: hidden; color: #f2a900; white-space: nowrap; }
    .n { font-weight: 800; font-size: .82em; color: var(--muted); }
  `,
  template: `
    <span class="s" [style.font-size.px]="size()" [attr.aria-label]="rating() + ' out of 5 stars'" role="img">★★★★★<span class="f" [style.width.%]="pct()">★★★★★</span></span>
    @if (showValue()) {
      <span class="n">{{ rating().toFixed(1) }}@if (count()) { · {{ count() }} }</span>
    }
  `,
})
export class Stars {
  readonly rating = input(0);
  readonly count = input(0);
  readonly size = input(14);
  readonly showValue = input(true);
  protected pct = computed(() => (this.rating() / 5) * 100);
}
