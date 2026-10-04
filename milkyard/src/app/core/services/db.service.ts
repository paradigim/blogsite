import { Injectable, effect, signal, WritableSignal } from '@angular/core';
import {
  AppNotification,
  Category,
  Coupon,
  DeliveryZone,
  HomeContent,
  Order,
  Product,
  Review,
  StoreSettings,
  TrafficDay,
  User,
} from '../models';
import { SEED_CATEGORIES, SEED_COUPONS, SEED_HOME, SEED_PRODUCTS, SEED_SETTINGS, SEED_ZONES } from '../data/catalog';
import { buildDemo } from '../data/demo';

/**
 * The one admin mobile number. In production this lives ONLY on the server
 * (env var / admin_users table) and the API decides the role after OTP
 * verification — the browser is never trusted with it.
 */
export const ADMIN_PHONE = '7059080710';

const KEY = 'milkyard.db.v1';

interface Snapshot {
  products: Product[];
  categories: Category[];
  zones: DeliveryZone[];
  coupons: Coupon[];
  home: HomeContent;
  settings: StoreSettings;
  users: User[];
  orders: Order[];
  reviews: Review[];
  traffic: TrafficDay[];
  notifications: AppNotification[];
}

function load(): Partial<Snapshot> | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Partial<Snapshot>) : null;
  } catch {
    return null;
  }
}

/**
 * In-browser mock database. Every collection is a signal so the storefront and
 * admin update live. Swap each collection for an HttpClient-backed service when
 * the API is ready — the component code only depends on these signals.
 */
@Injectable({ providedIn: 'root' })
export class DbService {
  readonly products: WritableSignal<Product[]>;
  readonly categories: WritableSignal<Category[]>;
  readonly zones: WritableSignal<DeliveryZone[]>;
  readonly coupons: WritableSignal<Coupon[]>;
  readonly home: WritableSignal<HomeContent>;
  readonly settings: WritableSignal<StoreSettings>;
  readonly users: WritableSignal<User[]>;
  readonly orders: WritableSignal<Order[]>;
  readonly reviews: WritableSignal<Review[]>;
  readonly traffic: WritableSignal<TrafficDay[]>;
  readonly notifications: WritableSignal<AppNotification[]>;

  constructor() {
    const saved = load();
    const products = saved?.products ?? structuredClone(SEED_PRODUCTS);
    const zones = saved?.zones ?? structuredClone(SEED_ZONES);
    const demo = saved?.orders ? null : buildDemo(products, zones);

    const admin: User = {
      id: 'admin',
      phone: ADMIN_PHONE,
      name: 'MILKYARD Admin',
      email: 'admin@milkyard.in',
      altPhone: '6294134480',
      role: 'admin',
      createdAt: new Date().toISOString(),
      addresses: [],
      wishlist: [],
    };

    this.products = signal(products);
    this.categories = signal(saved?.categories ?? structuredClone(SEED_CATEGORIES));
    this.zones = signal(zones);
    this.coupons = signal(saved?.coupons ?? structuredClone(SEED_COUPONS));
    this.home = signal(saved?.home ?? structuredClone(SEED_HOME));
    this.settings = signal(saved?.settings ?? structuredClone(SEED_SETTINGS));
    this.users = signal(saved?.users ?? [admin, ...(demo?.users ?? [])]);
    this.orders = signal(saved?.orders ?? demo?.orders ?? []);
    this.reviews = signal(saved?.reviews ?? demo?.reviews ?? []);
    this.traffic = signal(saved?.traffic ?? demo?.traffic ?? []);
    this.notifications = signal(saved?.notifications ?? demo?.notifications ?? []);

    effect(() => {
      const snap: Snapshot = {
        products: this.products(),
        categories: this.categories(),
        zones: this.zones(),
        coupons: this.coupons(),
        home: this.home(),
        settings: this.settings(),
        users: this.users(),
        orders: this.orders(),
        reviews: this.reviews(),
        traffic: this.traffic(),
        notifications: this.notifications(),
      };
      try {
        localStorage.setItem(KEY, JSON.stringify(snap));
      } catch {
        /* storage full / private mode — app still works in memory */
      }
    });
  }

  /** Clears local edits and re-seeds demo data (Admin → Settings). */
  reset() {
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem('milkyard.cart');
      localStorage.removeItem('milkyard.session');
    } catch {
      /* ignore */
    }
    location.href = '/';
  }

  uid(prefix: string) {
    return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }
}
