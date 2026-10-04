import { Injectable, computed, inject } from '@angular/core';
import { DbService } from './db.service';
import { Category, Product, Variant } from '../models';

export type SortKey = 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'new';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private db = inject(DbService);

  readonly products = computed(() => this.db.products().filter((p) => p.published));
  readonly categories = computed(() =>
    [...this.db.categories()].filter((c) => c.visible).sort((a, b) => a.order - b.order),
  );
  readonly bestSellers = computed(() => this.products().filter((p) => p.bestSeller));
  readonly newArrivals = computed(() => this.products().filter((p) => p.newArrival));
  readonly featured = computed(() => {
    const ids = this.db.home().featuredIds;
    return ids.map((id) => this.byId(id)).filter((p): p is Product => !!p && p.published);
  });

  byId(id: string) {
    return this.db.products().find((p) => p.id === id);
  }
  bySlug(slug: string) {
    return this.products().find((p) => p.slug === slug);
  }
  category(slugOrId: string) {
    return this.db.categories().find((c) => c.slug === slugOrId || c.id === slugOrId);
  }
  primaryCategory(p: Product) {
    return this.category(p.categoryIds[0]);
  }

  inCategory(c: Category) {
    if (c.smart === 'bestSeller') return this.bestSellers();
    if (c.smart === 'newArrival') return this.newArrivals();
    return this.products().filter((p) => p.categoryIds.includes(c.id));
  }

  variant(p: Product, variantId: string) {
    return p.variants.find((v) => v.id === variantId) ?? p.variants[0];
  }
  defaultVariant(p: Product): Variant {
    return p.variants.find((v) => v.stock > 0) ?? p.variants[0];
  }
  minPrice(p: Product) {
    return Math.min(...p.variants.map((v) => v.price));
  }
  inStock(p: Product) {
    return p.variants.some((v) => v.stock > 0);
  }
  discount(v: Variant) {
    return v.mrp > v.price ? Math.round(((v.mrp - v.price) / v.mrp) * 100) : 0;
  }

  /** Simple weighted search over name, tags, category and description. */
  search(q: string): Product[] {
    const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return this.products()
      .map((p) => {
        const cats = p.categoryIds.map((id) => this.category(id)?.name ?? '').join(' ');
        let score = 0;
        for (const t of terms) {
          if (p.name.toLowerCase().includes(t)) score += 10;
          if (p.tags.some((tag) => tag.includes(t))) score += 6;
          if (cats.toLowerCase().includes(t)) score += 4;
          if (p.shortDescription.toLowerCase().includes(t)) score += 2;
          if (p.description.toLowerCase().includes(t) || p.ingredients.toLowerCase().includes(t)) score += 1;
        }
        return { p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || b.p.sold - a.p.sold)
      .map((x) => x.p);
  }

  sort(list: Product[], key: SortKey) {
    const l = [...list];
    switch (key) {
      case 'price-asc':
        return l.sort((a, b) => this.minPrice(a) - this.minPrice(b));
      case 'price-desc':
        return l.sort((a, b) => this.minPrice(b) - this.minPrice(a));
      case 'rating':
        return l.sort((a, b) => b.rating - a.rating);
      case 'new':
        return l.sort((a, b) => Number(b.newArrival) - Number(a.newArrival));
      default:
        return l.sort((a, b) => b.sold - a.sold);
    }
  }

  related(p: Product, n = 4) {
    return this.products()
      .filter((x) => x.id !== p.id && x.categoryIds.some((c) => p.categoryIds.includes(c)))
      .concat(this.bestSellers().filter((x) => x.id !== p.id))
      .filter((x, i, arr) => arr.findIndex((y) => y.id === x.id) === i)
      .slice(0, n);
  }

  boughtTogether(p: Product) {
    return p.boughtTogether.map((id) => this.byId(id)).filter((x): x is Product => !!x && x.published);
  }

  recordView(id: string) {
    this.db.products.update((list) => list.map((p) => (p.id === id ? { ...p, views: p.views + 1 } : p)));
  }
}
