import { DestroyRef, ElementRef, inject, signal } from '@angular/core';

/** Tracks the host element's width so charts render crisp at real pixel size. */
export function hostWidth(initial = 600) {
  const el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  const w = signal(initial);
  const ro = new ResizeObserver((e) => w.set(Math.max(200, Math.floor(e[0].contentRect.width))));
  ro.observe(el);
  inject(DestroyRef).onDestroy(() => ro.disconnect());
  return w;
}

export function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  const s = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return s * p;
}

const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
export function fmt(v: number, mode: 'inr' | 'num' | 'pct' = 'num', compact = false) {
  if (mode === 'pct') return `${v.toFixed(1)}%`;
  const pre = mode === 'inr' ? '₹' : '';
  if (compact) {
    if (v >= 1e5) return `${pre}${(v / 1e5).toFixed(v >= 1e6 ? 0 : 1).replace(/\.0$/, '')}L`;
    if (v >= 1e3) return `${pre}${(v / 1e3).toFixed(v >= 1e4 ? 0 : 1).replace(/\.0$/, '')}K`;
  }
  return pre + inr.format(Math.round(v));
}
