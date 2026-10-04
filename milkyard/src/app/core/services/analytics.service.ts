import { Injectable, inject } from '@angular/core';
import { DbService } from './db.service';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Lightweight event tracking. Locally it bumps today's traffic counters so the
 * admin dashboard reacts; in production, add the GA4 tag (gtag.js) in index.html
 * behind a cookie-consent banner and these events forward automatically.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private db = inject(DbService);
  private seen = false;

  private bump(field: 'sessions' | 'visitors' | 'pageViews' | 'productViews' | 'addToCart' | 'checkouts') {
    const today = new Date().toISOString().slice(0, 10);
    this.db.traffic.update((l) => {
      const last = l.at(-1);
      if (last?.date === today) return [...l.slice(0, -1), { ...last, [field]: last[field] + 1 }];
      return [...l, { date: today, sessions: 0, visitors: 0, pageViews: 0, productViews: 0, addToCart: 0, checkouts: 0, [field]: 1 }];
    });
  }

  pageView(path: string) {
    if (path.startsWith('/admin')) return;
    if (!this.seen) {
      this.seen = true;
      this.bump('sessions');
      this.bump('visitors');
    }
    this.bump('pageViews');
    window.gtag?.('event', 'page_view', { page_path: path });
  }
  productView(id: string, name: string, price: number) {
    this.bump('productViews');
    window.gtag?.('event', 'view_item', { currency: 'INR', value: price, items: [{ item_id: id, item_name: name }] });
  }
  addToCart(id: string, name: string, price: number) {
    this.bump('addToCart');
    window.gtag?.('event', 'add_to_cart', { currency: 'INR', value: price, items: [{ item_id: id, item_name: name }] });
  }
  beginCheckout(value: number) {
    this.bump('checkouts');
    window.gtag?.('event', 'begin_checkout', { currency: 'INR', value });
  }
  purchase(id: string, value: number) {
    window.gtag?.('event', 'purchase', { transaction_id: id, currency: 'INR', value });
  }
}
