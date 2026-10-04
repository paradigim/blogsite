import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

export const FAQS = [
  { q: 'Where do you deliver?', a: 'We currently deliver within Kolkata — Central, North and South Kolkata, Salt Lake, New Town and nearby areas. Enter your pincode on any product page or at checkout to check. Madhyamgram and Barasat are coming soon.' },
  { q: 'How much is delivery?', a: 'Delivery charges depend on your area (zone) and order value. Most areas get free delivery above a minimum order value. You’ll see the exact charge before you pay.' },
  { q: 'When will my order arrive?', a: 'Orders in Central Kolkata placed before 2 PM are usually delivered the same day. Other areas are typically delivered the next day.' },
  { q: 'Do I need an account to shop?', a: 'You can browse and add to cart without an account. We only ask you to verify your mobile number with an OTP when you check out — no passwords.' },
  { q: 'Which payment methods do you accept?', a: 'UPI (Google Pay, PhonePe, Paytm, BHIM), credit and debit cards, net banking and popular wallets, through a secure payment gateway.' },
  { q: 'How should I store ghee?', a: 'Store in a cool, dry place away from direct sunlight, and always use a dry spoon. Refrigeration is not required. Fresh items like kheer, rabri, mishti doi and paneer must be refrigerated.' },
  { q: 'Can I cancel my order?', a: 'You can cancel from My Orders while the order is Pending or Confirmed. Once we start preparing fresh items, cancellation may not be possible. See our Cancellation Policy.' },
  { q: 'Do you take bulk or gifting orders?', a: 'Yes! We make custom gift boxes for pujas, weddings and corporate gifting. WhatsApp or call us with your requirement.' },
];

@Component({
  selector: 'app-faq',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .list { max-width: 820px; display: flex; flex-direction: column; gap: 10px; }
    details { background: #fff; border: 1px solid var(--line); border-radius: 20px; padding: 0 20px; transition: border-color .2s; }
    details[open] { border-color: var(--ink); }
    summary { cursor: pointer; list-style: none; padding: 18px 0; font-weight: 800; font-size: 1.02rem; display: flex; justify-content: space-between; gap: 12px; }
    summary::-webkit-details-marker { display: none; }
    summary::after { content: '+'; font-size: 1.5rem; line-height: 1; transition: transform .3s; }
    details[open] summary::after { transform: rotate(45deg); }
    p { color: var(--muted); padding-bottom: 18px; margin: 0; }
  `,
  template: `
    <section class="page-hero"><div class="container"><nav class="breadcrumb"><a routerLink="/">Home</a><span class="sep">/</span><span>FAQ</span></nav><h1>Frequently asked questions</h1><p>Can’t find an answer? <a routerLink="/contact" class="link">Contact us</a>.</p></div></section>
    <section class="section container" style="padding-top:32px">
      <div class="list">@for (f of faqs; track f.q; let i = $index) { <details [open]="i === 0"><summary>{{ f.q }}</summary><p>{{ f.a }}</p></details> }</div>
    </section>
  `,
})
export class FaqPage {
  protected faqs = FAQS;
  constructor() {
    const seo = inject(SeoService);
    seo.set({ title: 'FAQ — Delivery, Payments & Storage', path: '/faq' });
    seo.jsonLd('page', { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
  }
}
