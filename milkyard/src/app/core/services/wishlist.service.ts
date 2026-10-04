import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private guest = signal<string[]>(this.read());

  readonly ids = computed(() => this.auth.user()?.wishlist ?? this.guest());
  readonly count = computed(() => this.ids().length);

  constructor() {
    // merge guest wishlist into the account after login
    effect(() => {
      const u = this.auth.user();
      const g = this.guest();
      if (u && g.length) {
        this.auth.setWishlist([...new Set([...u.wishlist, ...g])]);
        this.guest.set([]);
        this.write([]);
      }
    });
  }

  private read(): string[] {
    try {
      return JSON.parse(localStorage.getItem('milkyard.wishlist') ?? '[]');
    } catch {
      return [];
    }
  }
  private write(ids: string[]) {
    try {
      localStorage.setItem('milkyard.wishlist', JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }

  has(id: string) {
    return this.ids().includes(id);
  }

  toggle(id: string, name?: string) {
    const next = this.has(id) ? this.ids().filter((x) => x !== id) : [...this.ids(), id];
    if (this.auth.user()) this.auth.setWishlist(next);
    else {
      this.guest.set(next);
      this.write(next);
    }
    if (name) this.toast.show(next.includes(id) ? 'Saved to wishlist' : 'Removed from wishlist', { body: name, tone: 'info' }, 2200);
  }
}
