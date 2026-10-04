import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { DbService } from '../../core/services/db.service';

interface Policy { title: string; sections: { h: string; p: string[] }[] }

const POLICIES: Record<string, Policy> = {
  privacy: {
    title: 'Privacy Policy',
    sections: [
      { h: 'What we collect', p: ['Your name, mobile number, email, delivery addresses and order history — only what we need to deliver your orders and support you.', 'We do not store card details. Payments are processed by our PCI-DSS compliant payment partner.'] },
      { h: 'How we use it', p: ['To process and deliver orders, send order updates by SMS/email/WhatsApp, respond to queries and, with your consent, share offers.'] },
      { h: 'Analytics & cookies', p: ['We use privacy-respecting analytics to understand site usage (pages viewed, device type). You can opt out of non-essential cookies.'] },
      { h: 'Your rights', p: ['You can view and update your profile anytime, and request deletion of your account by contacting us, in line with the Digital Personal Data Protection Act, 2023.'] },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    sections: [
      { h: 'Using this website', p: ['By using milkyard.in you agree to these terms. Product images are representative; actual packaging may vary slightly.'] },
      { h: 'Orders & pricing', p: ['All prices are in Indian Rupees and inclusive of applicable taxes. We may cancel orders affected by pricing errors or stock unavailability and refund in full.'] },
      { h: 'Service area', p: ['We currently deliver only within our listed Kolkata service areas.'] },
    ],
  },
  shipping: {
    title: 'Shipping & Delivery Policy',
    sections: [
      { h: 'Where we deliver', p: ['Within Kolkata service zones. Check your pincode on any product page.'] },
      { h: 'Delivery charges', p: ['Charges vary by zone and are shown before payment. Free delivery applies above each zone’s threshold.'] },
      { h: 'Delivery timelines', p: ['Zone A: same day for orders before 2 PM. Other zones: next day. Fresh items are delivered chilled.'] },
    ],
  },
  cancellation: {
    title: 'Cancellation Policy',
    sections: [{ h: 'Cancelling an order', p: ['Orders can be cancelled from My Orders while Pending or Confirmed. Once preparation begins, fresh and perishable items cannot be cancelled.', 'Refunds for cancelled prepaid orders are initiated to the original payment method within 24 hours.'] }],
  },
  refund: {
    title: 'Refund & Return Policy',
    sections: [
      { h: 'Food safety first', p: ['Because our products are food items, we cannot accept returns of opened products.'] },
      { h: 'Damaged or incorrect items', p: ['If an item arrives damaged, leaking or incorrect, share a photo with us within 24 hours of delivery and we’ll replace it or refund you in full.'] },
      { h: 'Refund timelines', p: ['Approved refunds are credited to the original payment method within 5–7 working days.'] },
    ],
  },
  returns: {
    title: 'Return Policy',
    sections: [{ h: 'Returns', p: ['Returns are accepted only for damaged, spoiled or incorrect items reported within 24 hours. See our Refund Policy for details.'] }],
  },
};

@Component({
  selector: 'app-policy',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `.nav { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 28px; }`,
  template: `
    @if (policy(); as p) {
      <section class="page-hero"><div class="container"><nav class="breadcrumb"><a routerLink="/">Home</a><span class="sep">/</span><span>{{ p.title }}</span></nav><h1>{{ p.title }}</h1><p>Last updated: {{ updated }}</p></div></section>
      <section class="section container" style="padding-top:28px">
        <div class="nav">@for (k of keys; track k) { <a class="chip" [class.active]="k === slug()" [routerLink]="['/policies', k]">{{ titles[k] }}</a> }</div>
        <article class="prose">
          @for (s of p.sections; track s.h) { <h2>{{ s.h }}</h2>@for (para of s.p; track para) { <p>{{ para }}</p> } }
          <h2>Contact</h2>
          <p>{{ db.settings().storeName }} · {{ db.settings().phones[0] }} · {{ db.settings().email }} · FSSAI Lic. {{ db.settings().fssai }}</p>
          <div class="placeholder-note mt-2">Template policy text — have it reviewed and finalised by MILKYARD’s legal advisor before launch.</div>
        </article>
      </section>
    }
  `,
})
export class PolicyPage {
  protected db = inject(DbService);
  private router = inject(Router);
  readonly slug = input.required<string>();
  protected policy = computed(() => POLICIES[this.slug()]);
  protected keys = Object.keys(POLICIES);
  protected titles = Object.fromEntries(Object.entries(POLICIES).map(([k, v]) => [k, v.title.replace(' Policy', '')]));
  protected updated = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  private seo = inject(SeoService);
  constructor() {
    effect(() => {
      const p = this.policy();
      if (!p) this.router.navigateByUrl('/404', { skipLocationChange: true });
      else this.seo.set({ title: p.title, path: `/policies/${this.slug()}` });
    });
  }
}
