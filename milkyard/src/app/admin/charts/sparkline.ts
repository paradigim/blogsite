import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-sparkline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="w()" [attr.height]="h()" [attr.viewBox]="'0 0 ' + w() + ' ' + h()" aria-hidden="true">
      <path [attr.d]="path().area" [attr.fill]="color()" fill-opacity=".1" />
      <path [attr.d]="path().line" fill="none" [attr.stroke]="color()" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <circle [attr.cx]="path().lx" [attr.cy]="path().ly" r="3" [attr.fill]="color()" />
    </svg>
  `,
})
export class Sparkline {
  readonly values = input.required<number[]>();
  readonly w = input(110);
  readonly h = input(34);
  readonly color = input('#a86b00');
  protected path = computed(() => {
    const v = this.values();
    const max = Math.max(...v, 1), min = Math.min(...v, 0);
    const W = this.w(), H = this.h() - 4;
    const step = v.length > 1 ? W / (v.length - 1) : 0;
    const pts = v.map((x, i) => [i * step, 2 + H - ((x - min) / (max - min || 1)) * H]);
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
    const last = pts[pts.length - 1] ?? [0, 0];
    return { line, area: `${line}L${W},${this.h()}L0,${this.h()}Z`, lx: last[0], ly: last[1] };
  });
}
