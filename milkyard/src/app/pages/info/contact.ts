import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { DbService } from '../../core/services/db.service';
import { ToastService } from '../../core/services/toast.service';
import { SeoService } from '../../core/services/seo.service';
import { NotificationService } from '../../core/services/notification.service';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-contact',
  imports: [RouterLink, FormsModule, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .grid { display: grid; gap: 24px; @media (min-width: 960px) { grid-template-columns: 1fr 1.2fr; } }
    .ways { display: grid; gap: 12px; }
    .way { display: flex; gap: 14px; align-items: center; padding: 18px; border-radius: 22px; background: #fff; border: 1px solid var(--line); transition: border-color .2s; }
    a.way:hover { border-color: var(--ink); }
    .ic { width: 48px; height: 48px; border-radius: 16px; display: grid; place-items: center; background: var(--yellow); flex: none; }
    .wa .ic { background: #25d366; color: #fff; }
    .way small { display: block; color: var(--muted); font-weight: 700; }
    .way b { font-size: 1.02rem; }
    iframe { width: 100%; height: 260px; border: 0; border-radius: 22px; margin-top: 4px; background: var(--line-2); }
    form h2 { font-size: 1.6rem; }
  `,
  template: `
    <section class="page-hero"><div class="container"><nav class="breadcrumb"><a routerLink="/">Home</a><span class="sep">/</span><span>Contact</span></nav><h1>We’d love to hear from you</h1><p>Questions, bulk orders, feedback — call, WhatsApp or drop us a message.</p></div></section>
    <section class="section container" style="padding-top:32px">
      <div class="grid">
        <div class="ways">
          @for (p of s().phones; track p) { <a class="way" [href]="'tel:' + p.replaceAll(' ', '')"><span class="ic"><app-icon name="phone" /></span><span><small>Call us</small><b>{{ p }}</b></span></a> }
          <a class="way wa" [href]="'https://wa.me/' + s().whatsapp" target="_blank" rel="noopener"><span class="ic"><app-icon name="whatsapp" /></span><span><small>WhatsApp</small><b>Chat with us</b></span></a>
          <a class="way" [href]="'mailto:' + s().email"><span class="ic"><app-icon name="mail" /></span><span><small>Email</small><b>{{ s().email }}</b></span></a>
          <div class="way"><span class="ic"><app-icon name="pin" /></span><span><small>Address</small><b>{{ s().address }}</b></span></div>
          <div class="way"><span class="ic"><app-icon name="clock" /></span><span><small>Hours</small><b>{{ s().hours }}</b></span></div>
          <iframe [src]="map" title="MILKYARD location map" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
        <form class="card stack" (ngSubmit)="send()">
          <h2>Send us a message</h2>
          <div class="grid-2">
            <div class="field"><label for="cn">Name *</label><input id="cn" class="input" name="name" [(ngModel)]="f.name" required /></div>
            <div class="field"><label for="cp">Phone *</label><input id="cp" class="input" name="phone" [(ngModel)]="f.phone" inputmode="tel" maxlength="10" required /></div>
            <div class="field span-2"><label for="ce">Email</label><input id="ce" class="input" type="email" name="email" [(ngModel)]="f.email" /></div>
            <div class="field span-2"><label for="ct">Topic</label>
              <select id="ct" class="select" name="topic" [(ngModel)]="f.topic"><option>Order enquiry</option><option>Bulk / corporate order</option><option>Product question</option><option>Feedback</option><option>Other</option></select>
            </div>
            <div class="field span-2"><label for="cm">Message *</label><textarea id="cm" class="textarea" name="msg" [(ngModel)]="f.msg" required></textarea></div>
          </div>
          <div><button class="btn" type="submit">Send message <app-icon name="arrow-right" /></button></div>
        </form>
      </div>
    </section>
  `,
})
export class ContactPage {
  private db = inject(DbService);
  private toast = inject(ToastService);
  private notify = inject(NotificationService);
  protected s = this.db.settings;
  protected map = inject(DomSanitizer).bypassSecurityTrustResourceUrl(`https://maps.google.com/maps?q=${encodeURIComponent(this.db.settings().mapQuery)}&z=12&output=embed`);
  protected f = { name: '', phone: '', email: '', topic: 'Order enquiry', msg: '' };
  constructor() {
    inject(SeoService).set({ title: 'Contact MILKYARD — Kolkata', description: 'Call, WhatsApp or email MILKYARD for orders, bulk gifting and questions. Delivering across Kolkata.', path: '/contact' });
  }
  send() {
    if (!this.f.name || !/^\d{10}$/.test(this.f.phone) || !this.f.msg) return this.toast.error('Please fill in your name, a 10-digit phone and a message');
    this.notify.push({ audience: 'admin', channel: 'in-app', type: 'contact', title: `Message: ${this.f.topic}`, body: `${this.f.name} (+91 ${this.f.phone}): ${this.f.msg.slice(0, 120)}` });
    this.toast.show('Message sent!', { body: 'We’ll get back to you within a few hours.' });
    this.f = { name: '', phone: '', email: '', topic: 'Order enquiry', msg: '' };
  }
}
