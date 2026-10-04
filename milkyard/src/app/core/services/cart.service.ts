import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { CartItem, Coupon, Product, Variant } from '../models';
import { CatalogService } from './catalog.service';
import { DbService } from './db.service';
import { AuthService } from './auth.service';
import { DeliveryService } from './delivery.service';
import { ToastService } from './toast.service';
import { UiService } from './ui.service';

export interface CartLine {
  item: CartItem;
  product: Product;
  variant: Variant;
  lineTotal: number;
}

export interface Totals {
  subtotal: number;
  mrpTotal: number;
  savings: number;
  discount: number;
  coupon: Coupon | null;
  couponError: string;
  delivery: number | null; // null = pincode not known / not serviceable
  freeAbove: number;
  remainingForFree: number;
  minOrder: number;
  belowMinimum: boolean;
  serviceable: boolean;
  total: number;
  count: number;
}

const GUEST = 'milkyard.cart';
const userKey = (id: string) => `milkyard.cart.${id}`;

function read(key: string): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]');
  } catch {
    return [];
  }
}
function write(key: string, items: CartItem[]) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private catalog = inject(CatalogService);
  private db = inject(DbService);
  private auth = inject(AuthService);
  private delivery = inject(DeliveryService);
  private toast = inject(ToastService);
  private ui = inject(UiService);

  readonly items = signal<CartItem[]>(read(GUEST));
  readonly couponCode = signal<string>(this.readCoupon());
  private lastUser: string | null = null;

  readonly lines = computed<CartLine[]>(() =>
    this.items()
      .map((item) => {
        const product = this.catalog.byId(item.productId);
        if (!product) return null;
        const variant = this.catalog.variant(product, item.variantId);
        return { item, product, variant, lineTotal: variant.price * item.qty };
      })
      .filter((l): l is CartLine => !!l),
  );
  readonly count = computed(() => this.items().reduce((s, i) => s + i.qty, 0));
  readonly totals = computed(() => this.computeTotals(this.delivery.pincode()));

  constructor() {
    // Persist: guests in a guest key, signed-in customers under their own key so
    // the cart follows the account (server-side cart table in production).
    effect(() => {
      const items = this.items();
      const u = untracked(() => this.auth.user());
      write(u ? userKey(u.id) : GUEST, items);
    });
    effect(() => {
      const c = this.couponCode();
      try {
        sessionStorage.setItem('milkyard.coupon', c);
      } catch {
        /* ignore */
      }
    });
    effect(() => {
      const u = this.auth.user();
      const id = u?.id ?? null;
      if (id === this.lastUser) return;
      untracked(() => {
        if (id) {
          const merged = [...read(userKey(id))];
          for (const g of this.items()) {
            const ex = merged.find((m) => m.variantId === g.variantId);
            if (ex) ex.qty = Math.max(ex.qty, g.qty);
            else merged.push(g);
          }
          write(GUEST, []);
          this.items.set(merged);
        } else if (this.lastUser) {
          this.items.set([]);
          this.couponCode.set('');
        }
      });
      this.lastUser = id;
    });
  }

  private readCoupon() {
    try {
      return sessionStorage.getItem('milkyard.coupon') ?? '';
    } catch {
      return '';
    }
  }

  qtyOf(variantId: string) {
    return this.items().find((i) => i.variantId === variantId)?.qty ?? 0;
  }

  add(product: Product, variant: Variant, qty = 1, openDrawer = true) {
    if (variant.stock <= 0) {
      this.toast.error('Out of stock', `${product.name} (${variant.label}) is currently unavailable.`);
      return;
    }
    const current = this.qtyOf(variant.id);
    const nextQty = Math.min(variant.stock, current + qty);
    if (current) this.items.update((l) => l.map((i) => (i.variantId === variant.id ? { ...i, qty: nextQty } : i)));
    else this.items.update((l) => [...l, { productId: product.id, variantId: variant.id, qty: nextQty }]);
    if (nextQty === current) this.toast.info('Maximum available quantity reached');
    else if (openDrawer) this.ui.cartOpen.set(true);
    else this.toast.show('Added to cart', { body: `${product.name} · ${variant.label}`, action: { label: 'View cart', link: '/cart' } });
  }

  setQty(variantId: string, qty: number) {
    if (qty <= 0) return this.remove(variantId);
    const line = this.lines().find((l) => l.variant.id === variantId);
    const max = line?.variant.stock ?? 99;
    this.items.update((l) => l.map((i) => (i.variantId === variantId ? { ...i, qty: Math.min(qty, max) } : i)));
  }

  changeVariant(oldVariantId: string, newVariantId: string) {
    this.items.update((l) => {
      const existing = l.find((i) => i.variantId === newVariantId);
      const moving = l.find((i) => i.variantId === oldVariantId);
      if (!moving) return l;
      if (existing) return l.filter((i) => i.variantId !== oldVariantId).map((i) => (i.variantId === newVariantId ? { ...i, qty: i.qty + moving.qty } : i));
      return l.map((i) => (i.variantId === oldVariantId ? { ...i, variantId: newVariantId } : i));
    });
  }

  remove(variantId: string) {
    this.items.update((l) => l.filter((i) => i.variantId !== variantId));
  }

  clear() {
    this.items.set([]);
    this.couponCode.set('');
  }

  applyCoupon(code: string): string {
    const c = code.trim().toUpperCase();
    this.couponCode.set(c);
    const t = this.totals();
    if (t.couponError) {
      this.couponCode.set('');
      return t.couponError;
    }
    return '';
  }

  /** Validates a coupon against the current cart. Mirrors the server rule set. */
  evaluateCoupon(code: string, lines: CartLine[]): { coupon: Coupon | null; discount: number; error: string } {
    if (!code) return { coupon: null, discount: 0, error: '' };
    const c = this.db.coupons().find((x) => x.code.toUpperCase() === code.toUpperCase());
    const today = new Date().toISOString().slice(0, 10);
    if (!c || !c.active) return { coupon: null, discount: 0, error: 'This coupon code is not valid.' };
    if (today < c.startsAt || today > c.endsAt) return { coupon: null, discount: 0, error: 'This coupon has expired.' };
    if (c.usageLimit && c.used >= c.usageLimit) return { coupon: null, discount: 0, error: 'This coupon has reached its usage limit.' };
    const eligible = lines
      .filter((l) =>
        c.scope === 'all' ? true : c.scope === 'category' ? l.product.categoryIds.some((id) => c.scopeIds.includes(id)) : c.scopeIds.includes(l.product.id),
      )
      .reduce((s, l) => s + l.lineTotal, 0);
    if (!eligible) return { coupon: null, discount: 0, error: 'No items in your cart are eligible for this coupon.' };
    if (eligible < c.minOrder) return { coupon: null, discount: 0, error: `Add items worth ₹${c.minOrder - eligible} more to use ${c.code}.` };
    let d = c.type === 'percent' ? Math.round((eligible * c.value) / 100) : c.value;
    if (c.maxDiscount) d = Math.min(d, c.maxDiscount);
    return { coupon: c, discount: Math.min(d, eligible), error: '' };
  }

  computeTotals(pin: string): Totals {
    const lines = this.lines();
    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    const mrpTotal = lines.reduce((s, l) => s + l.variant.mrp * l.item.qty, 0);
    const { coupon, discount, error } = this.evaluateCoupon(this.couponCode(), lines);
    const afterDiscount = subtotal - discount;
    const q = pin ? this.delivery.quote(pin, afterDiscount) : null;
    return {
      subtotal,
      mrpTotal,
      savings: mrpTotal - subtotal,
      discount,
      coupon,
      couponError: error,
      delivery: q ? q.charge : null,
      freeAbove: q?.freeAbove ?? 999,
      remainingForFree: q?.remainingForFree ?? 0,
      minOrder: q?.minOrder ?? 0,
      belowMinimum: q?.belowMinimum ?? false,
      serviceable: !!q,
      total: afterDiscount + (q?.charge ?? 0),
      count: this.count(),
    };
  }
}
