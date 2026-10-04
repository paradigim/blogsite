import { Injectable, computed, inject, signal } from '@angular/core';
import { DbService } from './db.service';
import { Address, User } from '../models';

const SESSION = 'milkyard.session';

/**
 * Mobile + OTP authentication (UI mock).
 *
 * Production flow:
 *  1. POST /auth/otp      { phone }            → server sends OTP via SMS provider (MSG91 / Twilio / Firebase)
 *  2. POST /auth/verify   { phone, otp }       → server verifies, issues an httpOnly session cookie / JWT
 *  3. GET  /me                                  → returns profile + role (role is decided server-side only)
 * The admin role is granted on the server for the configured admin number; every
 * /admin API checks the role again — the Angular guard is only a convenience.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private db = inject(DbService);
  private userId = signal<string | null>(this.readSession());

  readonly user = computed(() => this.db.users().find((u) => u.id === this.userId()) ?? null);
  readonly isLoggedIn = computed(() => !!this.user());
  readonly isAdmin = computed(() => this.user()?.role === 'admin');
  readonly needsProfile = computed(() => !!this.user() && !this.user()!.name);

  /** OTP that the mock "SMS provider" sent — shown on screen in demo mode only. */
  readonly demoOtp = signal<string | null>(null);
  private pendingPhone = '';

  private readSession() {
    try {
      return localStorage.getItem(SESSION);
    } catch {
      return null;
    }
  }
  private writeSession(id: string | null) {
    try {
      if (id) localStorage.setItem(SESSION, id);
      else localStorage.removeItem(SESSION);
    } catch {
      /* ignore */
    }
  }

  normalise(phone: string) {
    return phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '').slice(-10);
  }

  async sendOtp(phone: string): Promise<void> {
    this.pendingPhone = this.normalise(phone);
    await new Promise((r) => setTimeout(r, 700));
    this.demoOtp.set('123456');
  }

  async verifyOtp(otp: string): Promise<{ ok: boolean; isNew: boolean; isAdmin: boolean }> {
    await new Promise((r) => setTimeout(r, 600));
    if (otp !== this.demoOtp()) return { ok: false, isNew: false, isAdmin: false };
    const phone = this.pendingPhone;
    let user = this.db.users().find((u) => u.phone === phone);
    let isNew = false;
    if (!user) {
      isNew = true;
      user = {
        id: this.db.uid('u'),
        phone,
        name: '',
        email: '',
        altPhone: '',
        role: 'customer',
        createdAt: new Date().toISOString(),
        addresses: [],
        wishlist: [],
      };
      this.db.users.update((l) => [...l, user!]);
    }
    this.userId.set(user.id);
    this.writeSession(user.id);
    this.demoOtp.set(null);
    return { ok: true, isNew: isNew || !user.name, isAdmin: user.role === 'admin' };
  }

  logout() {
    this.userId.set(null);
    this.writeSession(null);
  }

  updateProfile(patch: Partial<Pick<User, 'name' | 'email' | 'altPhone'>>) {
    const id = this.userId();
    this.db.users.update((l) => l.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }

  // ---- addresses
  saveAddress(a: Address) {
    const id = this.userId();
    this.db.users.update((list) =>
      list.map((u) => {
        if (u.id !== id) return u;
        let addresses = u.addresses.some((x) => x.id === a.id)
          ? u.addresses.map((x) => (x.id === a.id ? a : x))
          : [...u.addresses, { ...a, id: a.id || this.db.uid('a') }];
        if (a.isDefault || addresses.length === 1) {
          const target = a.id || addresses[addresses.length - 1].id;
          addresses = addresses.map((x) => ({ ...x, isDefault: x.id === target }));
        }
        return { ...u, addresses };
      }),
    );
    return this.user()!.addresses.find((x) => x.id === a.id) ?? this.user()!.addresses.at(-1)!;
  }
  deleteAddress(addrId: string) {
    const id = this.userId();
    this.db.users.update((list) =>
      list.map((u) => {
        if (u.id !== id) return u;
        let addresses = u.addresses.filter((x) => x.id !== addrId);
        if (addresses.length && !addresses.some((x) => x.isDefault)) addresses = addresses.map((x, i) => ({ ...x, isDefault: i === 0 }));
        return { ...u, addresses };
      }),
    );
  }
  setDefaultAddress(addrId: string) {
    const id = this.userId();
    this.db.users.update((list) =>
      list.map((u) => (u.id !== id ? u : { ...u, addresses: u.addresses.map((x) => ({ ...x, isDefault: x.id === addrId })) })),
    );
  }

  // ---- wishlist persisted on the user
  setWishlist(ids: string[]) {
    const id = this.userId();
    this.db.users.update((l) => l.map((u) => (u.id === id ? { ...u, wishlist: ids } : u)));
  }

  blankAddress(): Address {
    const u = this.user();
    return {
      id: '',
      label: 'Home',
      name: u?.name ?? '',
      phone: u?.phone ?? '',
      line1: '',
      line2: '',
      landmark: '',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '',
      isDefault: !u?.addresses.length,
    };
  }
}
