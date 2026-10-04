import { Injectable, computed, inject } from '@angular/core';
import { DbService } from './db.service';
import { AppNotification } from '../models';

/**
 * Notification fan-out. In production each channel is a server-side job:
 *  - SMS: MSG91 / Twilio (DLT-registered templates for India)
 *  - Email: SES / SendGrid / Resend
 *  - WhatsApp: WhatsApp Cloud API / Gupshup / Interakt
 * The UI only records what would be sent so the flow is visible end-to-end.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private db = inject(DbService);

  readonly admin = computed(() => this.db.notifications().filter((n) => n.audience === 'admin').sort((a, b) => b.at.localeCompare(a.at)));
  readonly unread = computed(() => this.admin().filter((n) => !n.read).length);

  push(n: Omit<AppNotification, 'id' | 'at' | 'read'>) {
    this.db.notifications.update((l) => [{ ...n, id: this.db.uid('n'), at: new Date().toISOString(), read: false }, ...l].slice(0, 200));
  }

  /** Queue a customer message on every enabled channel. */
  customer(type: string, title: string, body: string) {
    const s = this.db.settings().notify;
    (['sms', 'email', 'whatsapp'] as const).filter((c) => s[c]).forEach((channel) => this.push({ audience: 'customer', channel, type, title, body }));
  }

  markAllRead() {
    this.db.notifications.update((l) => l.map((n) => (n.audience === 'admin' ? { ...n, read: true } : n)));
  }
}
