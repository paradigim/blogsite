import { Pipe, PipeTransform } from '@angular/core';

const fmt = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const trim = (n: number, d: number) => n.toFixed(d).replace(/\.0+$/, '');

/** ₹1,24,999 (Indian grouping) or compact ₹1.2L / ₹48.1K / ₹2.3Cr */
@Pipe({ name: 'inr' })
export class InrPipe implements PipeTransform {
  transform(v: number | null | undefined, mode: 'full' | 'compact' = 'full'): string {
    if (v == null || isNaN(v)) return '—';
    const sign = v < 0 ? '−' : '';
    const n = Math.abs(v);
    if (mode === 'compact') {
      if (n >= 1e7) return `${sign}₹${trim(n / 1e7, 2)}Cr`;
      if (n >= 1e5) return `${sign}₹${trim(n / 1e5, 2)}L`;
      if (n >= 1e4) return `${sign}₹${trim(n / 1e3, 1)}K`;
    }
    return `${sign}₹${fmt.format(Math.round(n))}`;
  }
}
