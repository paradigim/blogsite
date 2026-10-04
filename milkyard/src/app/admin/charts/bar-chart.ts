import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { Point } from '../stats.service';
import { fmt, hostWidth, niceMax } from './chart-base';

@Component({
  selector: 'app-bar-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display:block;position:relative' },
  styles: `
    svg { display: block; overflow: visible; }
    .grid line { stroke: #ece8dc; }
    .ax { font-size: 11px; fill: #8a826d; font-weight: 600; }
    .val { font-size: 11px; fill: #141414; font-weight: 800; }
    rect.hit { fill: transparent; cursor: default; }
    .tip { position: absolute; pointer-events: none; background: #141414; color: #fff; padding: 8px 10px; border-radius: 10px; font-size: 12px; white-space: nowrap; transform: translate(-50%, -112%); }
    .tip b { display: block; font-size: 14px; } .tip span { opacity: .7; }
  `,
  template: `
    @let g = geo();
    <svg [attr.width]="w()" [attr.height]="height()" role="img" [attr.aria-label]="label()" (mouseleave)="hover.set(-1)">
      <g class="grid">
        @for (t of g.ticks; track t.y) {
          <line [attr.x1]="pad.l" [attr.x2]="w() - pad.r" [attr.y1]="t.y" [attr.y2]="t.y" />
          <text class="ax" [attr.x]="pad.l - 8" [attr.y]="t.y + 4" text-anchor="end">{{ t.label }}</text>
        }
      </g>
      @for (b of g.bars; track b.i) {
        <path [attr.d]="b.d" [attr.fill]="color()" [attr.fill-opacity]="hover() === -1 || hover() === b.i ? 1 : 0.45" />
        @if (b.showLabel) { <text class="ax" [attr.x]="b.cx" [attr.y]="height() - 8" text-anchor="middle">{{ data()[b.i].label }}</text> }
        @if (b.i === g.maxI) { <text class="val" [attr.x]="b.cx" [attr.y]="b.y - 6" text-anchor="middle">{{ short(data()[b.i].value) }}</text> }
        <rect class="hit" [attr.x]="b.cx - g.slot / 2" [attr.y]="pad.t" [attr.width]="g.slot" [attr.height]="height() - pad.t - pad.b" (mouseenter)="hover.set(b.i)" (touchstart)="hover.set(b.i)" />
      }
    </svg>
    @if (hover() >= 0) {
      @let b = g.bars[hover()];
      <div class="tip" [style.left.px]="b.cx" [style.top.px]="b.y"><span>{{ data()[hover()].label }}</span><b>{{ full(data()[hover()].value) }}</b>@if (data()[hover()].orders !== undefined) {<span>{{ data()[hover()].orders }} orders</span>}</div>
    }
  `,
})
export class BarChart {
  readonly data = input.required<Point[]>();
  readonly height = input(240);
  readonly mode = input<'inr' | 'num' | 'pct'>('inr');
  readonly color = input('#a86b00');
  readonly label = input('Bar chart');
  protected w = hostWidth();
  protected hover = signal(-1);
  protected pad = { l: 52, r: 8, t: 20, b: 28 };

  protected geo = computed(() => {
    const d = this.data();
    const W = this.w(), H = this.height(), p = this.pad;
    const max = niceMax(Math.max(...d.map((x) => x.value), 0));
    const iw = W - p.l - p.r, ih = H - p.t - p.b;
    const slot = iw / Math.max(1, d.length);
    const bw = Math.min(24, slot * 0.62);
    const every = Math.max(1, Math.ceil(d.length / Math.max(2, Math.floor(iw / 64))));
    let maxI = 0;
    d.forEach((x, i) => { if (x.value > d[maxI].value) maxI = i; });
    const bars = d.map((x, i) => {
      const h = Math.max(x.value > 0 ? 2 : 0, (x.value / max) * ih);
      const cx = p.l + slot * i + slot / 2;
      const x0 = cx - bw / 2, y = p.t + ih - h, base = p.t + ih, r = Math.min(4, h, bw / 2);
      const dpath = h ? `M${x0},${base}V${y + r}Q${x0},${y} ${x0 + r},${y}H${x0 + bw - r}Q${x0 + bw},${y} ${x0 + bw},${y + r}V${base}Z` : '';
      return { i, d: dpath, cx, y, showLabel: i % every === 0 };
    });
    const ticks = [0, 0.5, 1].map((f) => ({ y: p.t + ih - f * ih, label: fmt(max * f, this.mode(), true) }));
    return { bars, ticks, slot, maxI };
  });
  short(v: number) {
    return fmt(v, this.mode(), true);
  }
  full(v: number) {
    return fmt(v, this.mode());
  }
}
