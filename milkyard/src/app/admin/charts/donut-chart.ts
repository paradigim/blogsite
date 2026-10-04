import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { fmt } from './chart-base';

export interface Slice {
  label: string;
  value: number;
  color: string;
}

/** Max 3 slices (validated palette); everything else should be folded into "Other". */
@Component({
  selector: 'app-donut',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { display: flex; align-items: center; gap: 22px; flex-wrap: wrap; }
    svg { flex: none; }
    .c { font-size: 20px; font-weight: 900; fill: #141414; }
    .s { font-size: 11px; fill: #8a826d; font-weight: 700; }
    ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; flex: 1; min-width: 150px; }
    li { display: flex; align-items: center; gap: 10px; font-size: .88rem; font-weight: 700; padding: 4px 6px; border-radius: 8px; }
    li.on { background: #f4efe0; }
    i { width: 12px; height: 12px; border-radius: 4px; flex: none; }
    li b { margin-left: auto; font-variant-numeric: tabular-nums; }
    li span.p { color: #8a826d; font-weight: 700; width: 46px; text-align: right; }
  `,
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 120 120" role="img" [attr.aria-label]="label()">
      @for (a of arcs(); track a.label; let i = $index) {
        <path [attr.d]="a.d" [attr.fill]="a.color" [attr.opacity]="hover() < 0 || hover() === i ? 1 : 0.4" stroke="#fff" stroke-width="2" (mouseenter)="hover.set(i)" (mouseleave)="hover.set(-1)" />
      }
      <text x="60" y="60" text-anchor="middle" class="c">{{ hover() >= 0 ? pct(slices()[hover()].value) : centerValue() }}</text>
      <text x="60" y="76" text-anchor="middle" class="s">{{ hover() >= 0 ? slices()[hover()].label : centerLabel() }}</text>
    </svg>
    <ul>
      @for (s of slices(); track s.label; let i = $index) {
        <li [class.on]="hover() === i" (mouseenter)="hover.set(i)" (mouseleave)="hover.set(-1)"><i [style.background]="s.color"></i>{{ s.label }}<b>{{ fmtV(s.value) }}</b><span class="p">{{ pct(s.value) }}</span></li>
      }
    </ul>
  `,
})
export class DonutChart {
  readonly slices = input.required<Slice[]>();
  readonly size = input(150);
  readonly mode = input<'inr' | 'num'>('num');
  readonly centerLabel = input('Total');
  readonly label = input('Donut chart');
  protected hover = signal(-1);
  protected total = computed(() => this.slices().reduce((s, x) => s + x.value, 0));
  protected centerValue = computed(() => fmt(this.total(), this.mode(), true));
  protected arcs = computed(() => {
    let a = -Math.PI / 2;
    const T = this.total() || 1;
    return this.slices().map((s) => {
      const sweep = (s.value / T) * Math.PI * 2;
      const a2 = a + sweep;
      const R = 56, r = 38, large = sweep > Math.PI ? 1 : 0;
      const p = (ang: number, rad: number) => `${60 + rad * Math.cos(ang)},${60 + rad * Math.sin(ang)}`;
      const d = sweep >= Math.PI * 2 - 1e-6
        ? `M60,4A56,56 0 1 1 59.99,4ZM60,22A38,38 0 1 0 60.01,22Z`
        : `M${p(a, R)}A${R},${R} 0 ${large} 1 ${p(a2, R)}L${p(a2, r)}A${r},${r} 0 ${large} 0 ${p(a, r)}Z`;
      a = a2;
      return { ...s, d };
    });
  });
  pct(v: number) {
    return `${((v / (this.total() || 1)) * 100).toFixed(0)}%`;
  }
  fmtV(v: number) {
    return fmt(v, this.mode());
  }
}
