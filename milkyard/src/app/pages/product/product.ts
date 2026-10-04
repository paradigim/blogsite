import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../core/services/catalog.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { DbService } from '../../core/services/db.service';
import { SeoService } from '../../core/services/seo.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { ToastService } from '../../core/services/toast.service';
import { Product, Review } from '../../core/models';
import { ProductCard } from '../../shared/product-card';
import { PincodeChecker } from '../../shared/pincode-checker';
import { QtyStepper } from '../../shared/qty-stepper';
import { Icon } from '../../shared/icon';
import { InrPipe } from '../../shared/inr.pipe';
import { Stars } from '../../shared/stars';
import { DatePipe } from '@angular/common';

type InfoTab = 'desc' | 'ingredients' | 'nutrition' | 'storage' | 'legal';

@Component({
  selector: 'app-product',
  imports: [RouterLink, FormsModule, ProductCard, PincodeChecker, QtyStepper, Icon, InrPipe, Stars, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './product.scss',
  templateUrl: './product.html',
})
export class ProductPage {
  protected catalog = inject(CatalogService);
  protected cart = inject(CartService);
  protected wish = inject(WishlistService);
  protected auth = inject(AuthService);
  private orders = inject(OrderService);
  private db = inject(DbService);
  private seo = inject(SeoService);
  private analytics = inject(AnalyticsService);
  private toast = inject(ToastService);
  private router = inject(Router);

  readonly slug = input.required<string>();
  protected product = computed(() => this.catalog.bySlug(this.slug()));
  protected variant = linkedSignal(() => (this.product() ? this.catalog.defaultVariant(this.product()!) : null));
  protected img = linkedSignal({ source: this.product, computation: () => 0 });
  protected qty = linkedSignal({ source: this.variant, computation: () => 1 });
  protected tab = signal<InfoTab>('desc');
  protected zoom = signal(false);

  protected category = computed(() => (this.product() ? this.catalog.primaryCategory(this.product()!) : undefined));
  protected related = computed(() => (this.product() ? this.catalog.related(this.product()!) : []));
  protected fbt = computed(() => (this.product() ? this.catalog.boughtTogether(this.product()!).slice(0, 2) : []));
  protected fbtPicked = linkedSignal(() => new Set(this.fbt().map((p) => p.id)));
  protected fbtTotal = computed(() => {
    const v = this.variant();
    const extra = this.fbt().filter((p) => this.fbtPicked().has(p.id)).reduce((s, p) => s + this.catalog.defaultVariant(p).price, 0);
    return (v?.price ?? 0) + extra;
  });

  // reviews
  protected reviews = computed(() =>
    this.db.reviews().filter((r) => r.productId === this.product()?.id && r.status === 'approved').sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
  protected dist = computed(() => {
    const r = this.reviews();
    return [5, 4, 3, 2, 1].map((s) => ({ s, n: r.filter((x) => x.rating === s).length, pct: r.length ? (r.filter((x) => x.rating === s).length / r.length) * 100 : 0 }));
  });
  protected avg = computed(() => {
    const r = this.reviews();
    return r.length ? r.reduce((s, x) => s + x.rating, 0) / r.length : this.product()?.rating ?? 0;
  });
  protected purchased = computed(() => {
    const id = this.product()?.id;
    return this.orders.mine().some((o) => o.status === 'Delivered' && o.items.some((i) => i.productId === id));
  });
  protected alreadyReviewed = computed(() => this.db.reviews().some((r) => r.productId === this.product()?.id && r.userId === this.auth.user()?.id));
  protected writing = signal(false);
  protected draft = { rating: 5, title: '', body: '' };

  constructor() {
    // keyed on the slug only: recordView() updates products, which must not re-trigger this
    effect(() => {
      this.slug();
      const p = untracked(() => this.product());
      if (!p) {
        untracked(() => this.router.navigateByUrl('/404', { skipLocationChange: true }));
        return;
      }
      untracked(() => {
        this.seo.set({
          title: p.seo.title || `${p.name} — Buy Online in Kolkata`,
          description: p.seo.description || `${p.shortDescription} Order MILKYARD ${p.name} online with fresh delivery across Kolkata.`,
          path: `/product/${p.slug}`,
          image: p.images[0],
          type: 'product',
        });
        this.seo.product(p);
        this.catalog.recordView(p.id);
        this.analytics.productView(p.id, p.name, this.catalog.minPrice(p));
      });
    });
  }

  addToCart() {
    const p = this.product()!;
    this.cart.add(p, this.variant()!, this.qty());
    this.analytics.addToCart(p.id, p.name, this.variant()!.price);
  }
  buyNow() {
    const p = this.product()!;
    const v = this.variant()!;
    const inCart = this.cart.qtyOf(v.id);
    if (inCart < this.qty()) this.cart.add(p, v, this.qty() - inCart, false);
    this.router.navigateByUrl('/checkout');
  }
  /** "₹69.80 / 100 g" style unit pricing for comparison */
  unitPrice(label: string, price: number) {
    const m = label.match(/([\d.]+)\s*(kg|g|ml|l|pcs)/i);
    if (!m) return '';
    const n = +m[1];
    const u = m[2].toLowerCase();
    if (u === 'pcs') return `₹${(price / n).toFixed(0)} / piece`;
    const base = u === 'kg' || u === 'l' ? n * 1000 : n;
    return `₹${((price / base) * 100).toFixed(2)} / 100 ${u === 'ml' || u === 'l' ? 'ml' : 'g'}`;
  }
  toggleFbt(id: string) {
    const s = new Set(this.fbtPicked());
    s.has(id) ? s.delete(id) : s.add(id);
    this.fbtPicked.set(s);
  }
  addFbt() {
    this.cart.add(this.product()!, this.variant()!, 1, false);
    for (const p of this.fbt().filter((x) => this.fbtPicked().has(x.id))) this.cart.add(p, this.catalog.defaultVariant(p), 1, false);
    this.toast.show('Added to cart', { body: 'Bundle added — enjoy!', action: { label: 'View cart', link: '/cart' } });
  }
  submitReview() {
    const u = this.auth.user();
    if (!u || !this.draft.body.trim()) return;
    const r: Review = {
      id: this.db.uid('r'),
      productId: this.product()!.id,
      userId: u.id,
      userName: `${u.name.split(' ')[0]} ${u.name.split(' ')[1]?.[0] ?? ''}.`.trim(),
      rating: this.draft.rating,
      title: this.draft.title.trim() || 'Review',
      body: this.draft.body.trim(),
      createdAt: new Date().toISOString(),
      verified: true,
      status: 'pending',
    };
    this.db.reviews.update((l) => [r, ...l]);
    this.writing.set(false);
    this.draft = { rating: 5, title: '', body: '' };
    this.toast.show('Thank you for your review!', { body: 'It will appear once our team approves it.' });
  }
  share(p: Product) {
    const url = location.href;
    if (navigator.share) navigator.share({ title: `MILKYARD ${p.name}`, url }).catch(() => {});
    else navigator.clipboard?.writeText(url).then(() => this.toast.info('Link copied'));
  }
}
