import { Injectable, computed, inject, signal } from '@angular/core';
import { DbService } from './db.service';
import { DeliveryZone } from '../models';
import { zoneFor } from '../data/demo';

export interface Serviceability {
  pincode: string;
  ok: boolean;
  comingSoon?: boolean;
  zone?: DeliveryZone;
  message: string;
}

export interface DeliveryQuote {
  charge: number;
  freeAbove: number;
  remainingForFree: number;
  minOrder: number;
  belowMinimum: boolean;
  zone?: DeliveryZone;
}

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private db = inject(DbService);

  /** The pincode the visitor last checked — remembered for the session. */
  readonly pincode = signal<string>(this.read());
  readonly status = computed(() => (this.pincode() ? this.check(this.pincode()) : null));

  private read() {
    try {
      return localStorage.getItem('milkyard.pin') ?? '';
    } catch {
      return '';
    }
  }

  setPincode(pin: string) {
    this.pincode.set(pin);
    try {
      localStorage.setItem('milkyard.pin', pin);
    } catch {
      /* ignore */
    }
    return this.check(pin);
  }

  check(pin: string): Serviceability {
    if (!/^\d{6}$/.test(pin)) return { pincode: pin, ok: false, message: 'Please enter a valid 6-digit pincode.' };
    const zone = zoneFor(pin, this.db.zones());
    if (zone?.active) return { pincode: pin, ok: true, zone, message: `Delivery available to your location · ${zone.eta}` };
    if (zone && !zone.active)
      return { pincode: pin, ok: false, comingSoon: true, zone, message: `We’re coming to ${zone.name} soon! We currently deliver within Kolkata only.` };
    return { pincode: pin, ok: false, message: 'Sorry, we don’t deliver to this pincode yet. We currently deliver within Kolkata.' };
  }

  quote(pin: string, subtotal: number): DeliveryQuote | null {
    const s = this.check(pin);
    if (!s.ok || !s.zone) return null;
    const z = s.zone;
    const free = subtotal >= z.freeAbove;
    return {
      charge: free ? 0 : z.charge,
      freeAbove: z.freeAbove,
      remainingForFree: Math.max(0, z.freeAbove - subtotal),
      minOrder: z.minOrder,
      belowMinimum: subtotal < z.minOrder,
      zone: z,
    };
  }
}
