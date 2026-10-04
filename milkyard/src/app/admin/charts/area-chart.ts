import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { Point } from '../stats.service';
import { fmt, hostWidth, niceMax } from './chart-base';

@Component({
  selector: 'app-area-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display:block;position:relative' },
  styles: `
    svg { display: block; overflow: visible; }
    .grid line { stroke: #ece8dc; stroke-width: 1; }
    .ax { font-size: 11px; fill: #8a826d; font-weight: 600; }
    .tip { position: absolute; pointer-events: none; background: #141414; color: #fff; padding: 8px 10px; border-radius: 10px; font-size: 12px; white-space: nowrap; transform: translate(-50%, -110%); box-shadow: 0 8px 20px -8px rgba(0,0,0,.5); }
    .tip b { display: block; font-size: 14px; }
    .tip span { opacity: .7; }
  `,
  template: `
    @let g = geo();
    <svg [attr.width]="w()" [attr.height]="height()" (mousemove)="move($event)" (mouseleave)="hover.set(-1)" (touchstart)="touch($event)" role="img" [attr.aria-label]="label()">
      <g class="grid">
        @for (t of g.ticks; track t.y) {
          <line [attr.x1]="pad.l" [attr.x2]="w() - pad.r" [attr.y1]="t.y" [attr.y2]="t.y" />
          <text class="ax" [attr.x]="pad.l - 8" [attr.y]="t.y + 4" text-anchor="end">{{ t.label }}</text>
        }
      </g>
      @for (x of g.xl; track x.i) { <text class="ax" [attr.x]="x.x" [attr.y]="height() - 6" text-anchor="middle">{{ x.label }}</text> }
      <path [attr.d]="g.area" [attr.fill]="color()" fill-opacity="0.1" />
      <path [attr.d]="g.line" fill="none" [attr.stroke]="color()" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
      @if (hover() >= 0) {
        @let p = g.pts[hover()];
        <line [attr.x1]="p.x" [attr.x2]="p.x" [attr.y1]="pad.t" [attr.y2]="height() - pad.b" stroke="#141414" stroke-opacity=".25" />
        <circle [attr.cx]="p.x" [attr.cy]="p.y" r="5" [attr.fill]="color()" stroke="#fff" stroke-width="2" />
      } @else if (g.pts.length) {
        @let last = g.pts[g.pts.length - 1];
        <circle [attr.cx]="last.x" [attr.cy]="last.y" r="4" [attr.fill]="color()" stroke="#fff" stroke-width="2" />
      }
    </svg>
    @if (hover() >= 0) {
      @let p = g.pts[hover()];
      <div class="tip" [style.left.px]="p.x" [style.top.px]="p.y"><span>{{ data()[hover()].label }}</span><b>{{ fmtV(data()[hover()].value) }}</b>@if (data()[hover()].orders !== undefined) {<span>{{ data()[hover()].orders }} orders</span>}</div>
    }
  `,
})
export class AreaChart {
  readonly data = input.required<Point[]>();
  readonly height = input(260);
  readonly mode = input<'inr' | 'num' | 'pct'>('inr');
  readonly color = input('#a86b00');
  readonly label = input('Chart');
  protected w = hostWidth();
  protected hover = signal(-1);
  protected pad = { l: 52, r: 12, t: 12, b: 28 };

  protected geo = computed(() => {
    const d = this.data();
    const W = this.w(), H = this.height(), p = this.pad;
    const max = niceMax(Math.max(...d.map((x) => x.value), 0));
    const iw = W - p.l - p.r, ih = H - p.t - p.b;
    const step = d.length > 1 ? iw / (d.length - 1) : 0;
    const pts = d.map((x, i) => ({ x: p.l + i * step, y: p.t + ih - (x.value / max) * ih }));
    const line = pts.map((q, i) => `${i ? 'L' : 'M'}${q.x.toFixed(1)},${q.y.toFixed(1)}`).join('');
    const area = pts.length ? `${line}L${pts[pts.length - 1].x},${p.t + ih}L${pts[0].x},${p.t + ih}Z` : '';
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ y: p.t + ih - f * ih, label: fmt(max * f, this.mode(), true) }));
    const every = Math.max(1, Math.ceil(d.length / Math.max(2, Math.floor(iw / 70))));
    const xl = d.map((x, i) => ({ i, x: pts[i].x, label: x.label })).filter((_, i) => i % every === 0 || i === d.length - 1).filter((x, i, a) => i === a.length - 1 || a[a.length - 1].i - x.i >= every * 0.6);
    return { pts, line, area, ticks, xl };
  });

  fmtV(v: number) {
    return fmt(v, this.mode());
  }
  move(e: MouseEvent) {
    const r = (e.currentTarget as SVGElement).getBoundingClientRect();
    this.pick(e.clientX - r.left);
  }
  touch(e: TouchEvent) {
    const r = (e.currentTarget as SVGElement).getBoundingClientRect();
    this.pick(e.touches[0].clientX - r.left);
  }
  private pick(x: number) {
    const pts = this.geo().pts;
    if (!pts.length) return;
    let best = 0;
    for (let i = 1; i < pts.length; i++) if (Math.abs(pts[i].x - x) < Math.abs(pts[best].x - x)) best = i;
    this.hover.set(best);
  }
}
