import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DbService } from './db.service';
import { Product } from '../models';

export const SITE_URL = 'https://www.milkyard.in';

/** Title/meta/OG/canonical + JSON-LD. Pair with SSR/prerendering in production for best indexing. */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);
  private db = inject(DbService);

  set(opts: { title: string; description?: string; path?: string; image?: string; type?: string }) {
    const t = opts.title.includes('MILKYARD') ? opts.title : `${opts.title} | MILKYARD`;
    const d = opts.description ?? 'Pure ghee, kheer malai, makkhan bhog, laddus and dry fruits — made in small batches and delivered across Kolkata.';
    const url = SITE_URL + (opts.path ?? this.doc.location.pathname);
    this.title.setTitle(t);
    this.meta.updateTag({ name: 'description', content: d });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: t });
    this.meta.updateTag({ property: 'og:description', content: d });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: opts.type ?? 'website' });
    this.meta.updateTag({ property: 'og:image', content: SITE_URL + '/' + (opts.image ?? 'images/hero-spread.svg') });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    let link = this.doc.head.querySelector<HTMLLinkElement>('link[rel=canonical]');
    if (!link) {
      link = this.doc.createElement('link');
      link.rel = 'canonical';
      this.doc.head.appendChild(link);
    }
    link.href = url;
    this.jsonLd('page', null);
  }

  noindex() {
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
  }

  jsonLd(id: string, data: object | null) {
    const sid = `ld-${id}`;
    this.doc.getElementById(sid)?.remove();
    if (!data) return;
    const s = this.doc.createElement('script');
    s.type = 'application/ld+json';
    s.id = sid;
    s.text = JSON.stringify(data);
    this.doc.head.appendChild(s);
  }

  organisation() {
    const s = this.db.settings();
    this.jsonLd('org', {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Organization', name: 'MILKYARD', url: SITE_URL, logo: `${SITE_URL}/brand/milkyard-logo.png`, telephone: s.phones[0], email: s.email },
        {
          '@type': 'LocalBusiness',
          '@id': `${SITE_URL}#store`,
          name: 'MILKYARD Dairy Products',
          image: `${SITE_URL}/brand/milkyard-logo.png`,
          telephone: s.phones[0],
          address: { '@type': 'PostalAddress', addressLocality: 'Kolkata', addressRegion: 'West Bengal', addressCountry: 'IN' },
          areaServed: 'Kolkata',
          priceRange: '₹₹',
          openingHours: 'Mo-Su 08:00-21:00',
        },
      ],
    });
  }

  product(p: Product) {
    const prices = p.variants.map((v) => v.price);
    this.jsonLd('page', {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `MILKYARD ${p.name}`,
      image: p.images.map((i) => `${SITE_URL}/${i}`),
      description: p.shortDescription,
      brand: { '@type': 'Brand', name: 'MILKYARD' },
      sku: p.variants[0]?.sku,
      aggregateRating: p.reviewCount ? { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviewCount } : undefined,
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'INR',
        lowPrice: Math.min(...prices),
        highPrice: Math.max(...prices),
        offerCount: p.variants.length,
        availability: p.variants.some((v) => v.stock > 0) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        areaServed: 'Kolkata',
      },
    });
  }
}
