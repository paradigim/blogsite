import { Injectable, computed, inject } from '@angular/core';
import { DbService } from '../core/services/db.service';
import { Order } from '../core/models';

export interface Point {
  key: string;
  label: string;
  value: number;
  orders?: number;
}

const DAY = 864e5;
const dkey = (d: Date) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 6e4);
  return z.toISOString().slice(0, 10);
};
export const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** All admin analytics are derived from orders + traffic so they react to new orders live. */
@Injectable({ providedIn: 'root' })
export class StatsService {
  private db = inject(DbService);

  /** Orders that count as sales (paid or COD, not cancelled/failed/refunded). */
  readonly sales = computed(() =>
    this.db.orders().filter((o) => !['Cancelled', 'Failed', 'Refunded'].includes(o.status) && ['Paid', 'COD'].includes(o.paymentStatus)),
  );

  inRange(list: Order[], from: Date, to: Date = new Date(Date.now() + DAY)) {
    const a = from.getTime();
    const b = to.getTime();
    return list.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= a && t < b;
    });
  }
  revenue(list: Order[]) {
    return list.reduce((s, o) => s + o.total, 0);
  }

  readonly today = computed(() => this.inRange(this.sales(), startOfDay()));
  readonly yesterday = computed(() => this.inRange(this.sales(), new Date(startOfDay().getTime() - DAY), startOfDay()));
  readonly week = computed(() => this.inRange(this.sales(), new Date(startOfDay().getTime() - 6 * DAY)));
  readonly prevWeek = computed(() => this.inRange(this.sales(), new Date(startOfDay().getTime() - 13 * DAY), new Date(startOfDay().getTime() - 6 * DAY)));
  readonly month = computed(() => this.inRange(this.sales(), new Date(startOfDay().getTime() - 29 * DAY)));
  readonly prevMonth = computed(() => this.inRange(this.sales(), new Date(startOfDay().getTime() - 59 * DAY), new Date(startOfDay().getTime() - 29 * DAY)));
  readonly customers = computed(() => this.db.users().filter((u) => u.role === 'customer'));

  daily(days: number, list = this.sales()): Point[] {
    const out: Point[] = [];
    const map = new Map<string, { v: number; n: number }>();
    for (const o of list) {
      const k = dkey(new Date(o.createdAt));
      const m = map.get(k) ?? { v: 0, n: 0 };
      m.v += o.total;
      m.n++;
      map.set(k, m);
    }
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(startOfDay().getTime() - i * DAY);
      const k = dkey(d);
      out.push({ key: k, label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), value: map.get(k)?.v ?? 0, orders: map.get(k)?.n ?? 0 });
    }
    return out;
  }

  weekly(weeks: number): Point[] {
    const d = this.daily(weeks * 7);
    const out: Point[] = [];
    for (let i = 0; i < weeks; i++) {
      const chunk = d.slice(i * 7, i * 7 + 7);
      out.push({ key: chunk[0].key, label: `W/c ${chunk[0].label}`, value: chunk.reduce((s, p) => s + p.value, 0), orders: chunk.reduce((s, p) => s + (p.orders ?? 0), 0) });
    }
    return out;
  }

  monthly(months: number): Point[] {
    const now = new Date();
    const out: Point[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const from = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const to = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const l = this.inRange(this.sales(), from, to);
      out.push({ key: dkey(from), label: from.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }), value: this.revenue(l), orders: l.length });
    }
    return out;
  }

  yearly(): Point[] {
    const years = [...new Set(this.sales().map((o) => new Date(o.createdAt).getFullYear()))].sort();
    return years.map((y) => {
      const l = this.inRange(this.sales(), new Date(y, 0, 1), new Date(y + 1, 0, 1));
      return { key: String(y), label: String(y), value: this.revenue(l), orders: l.length };
    });
  }

  products(list: Order[] = this.sales()) {
    const map = new Map<string, { id: string; name: string; image: string; qty: number; revenue: number; cost: number; packaging: number; orders: number }>();
    for (const o of list)
      for (const i of o.items) {
        const m = map.get(i.productId) ?? { id: i.productId, name: i.name, image: i.image, qty: 0, revenue: 0, cost: 0, packaging: 0, orders: 0 };
        m.qty += i.qty;
        m.revenue += i.price * i.qty;
        m.cost += i.costPrice * i.qty;
        m.packaging += i.packagingCost * i.qty;
        m.orders++;
        map.set(i.productId, m);
      }
    return [...map.values()].sort((a, b) => b.revenue - a.revenue);
  }

  customerStats(list: Order[] = this.sales()) {
    const by = new Map<string, { id: string; name: string; phone: string; orders: number; spent: number; last: string; first: string }>();
    for (const o of this.sales()) {
      const m = by.get(o.userId) ?? { id: o.userId, name: o.customerName, phone: o.phone, orders: 0, spent: 0, last: o.createdAt, first: o.createdAt };
      m.orders++;
      m.spent += o.total;
      if (o.createdAt > m.last) m.last = o.createdAt;
      if (o.createdAt < m.first) m.first = o.createdAt;
      by.set(o.userId, m);
    }
    const ids = new Set(list.map((o) => o.userId));
    const inPeriod = [...by.values()].filter((c) => ids.has(c.id));
    const periodStart = list.length ? list.reduce((m, o) => (o.createdAt < m ? o.createdAt : m), list[0].createdAt) : '';
    return {
      all: [...by.values()].sort((a, b) => b.spent - a.spent),
      active: inPeriod.length,
      newCustomers: inPeriod.filter((c) => c.first >= periodStart).length,
      returning: inPeriod.filter((c) => c.orders > 1).length,
      avgPerCustomer: inPeriod.length ? this.revenue(list) / inPeriod.length : 0,
    };
  }

  /** Profit uses configured cost prices — revenue is never treated as profit. */
  profit(list: Order[], gatewayPct = 2) {
    let itemRevenue = 0, productCost = 0, packaging = 0, discounts = 0, deliveryCharged = 0, deliveryCost = 0, gross = 0;
    for (const o of list) {
      for (const i of o.items) {
        itemRevenue += i.price * i.qty;
        productCost += i.costPrice * i.qty;
        packaging += i.packagingCost * i.qty;
      }
      discounts += o.discount;
      deliveryCharged += o.deliveryCharge;
      deliveryCost += o.deliveryCost;
    }
    const revenue = itemRevenue - discounts + deliveryCharged;
    gross = itemRevenue - discounts - productCost;
    const gateway = list.filter((o) => o.paymentStatus === 'Paid').reduce((s, o) => s + o.total, 0) * (gatewayPct / 100);
    const net = gross - packaging - (deliveryCost - deliveryCharged) - gateway;
    return { revenue, itemRevenue, productCost, packaging, discounts, deliveryCharged, deliveryCost, gateway, gross, net, margin: revenue ? (net / revenue) * 100 : 0 };
  }

  traffic(days: number) {
    const t = this.db.traffic().slice(-days);
    const sum = (k: 'sessions' | 'visitors' | 'pageViews' | 'productViews' | 'addToCart' | 'checkouts') => t.reduce((s, d) => s + d[k], 0);
    const orders = this.inRange(this.sales(), new Date(startOfDay().getTime() - (days - 1) * DAY)).length;
    const sessions = sum('sessions');
    return {
      days: t,
      sessions,
      visitors: sum('visitors'),
      pageViews: sum('pageViews'),
      productViews: sum('productViews'),
      addToCart: sum('addToCart'),
      checkouts: sum('checkouts'),
      orders,
      conversion: sessions ? (orders / sessions) * 100 : 0,
      cartRate: sessions ? (sum('addToCart') / sessions) * 100 : 0,
    };
  }

  delta(cur: number, prev: number) {
    if (!prev) return cur ? 100 : 0;
    return ((cur - prev) / prev) * 100;
  }
}
