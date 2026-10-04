import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { DbService } from '../../core/services/db.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductCard } from '../../shared/product-card';
import { PincodeChecker } from '../../shared/pincode-checker';
import { Icon } from '../../shared/icon';
import { Stars } from '../../shared/stars';

type Tab = 'best' | 'new' | 'featured';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductCard, PincodeChecker, Icon, Stars],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class HomePage {
  protected catalog = inject(CatalogService);
  protected db = inject(DbService);
  protected home = computed(() => this.db.home());
  protected tab = signal<Tab>('best');

  protected tabs = computed(() => {
    const h = this.home();
    const t: { id: Tab; label: string }[] = [];
    if (h.showBestSellers) t.push({ id: 'best', label: 'Best sellers' });
    if (h.showNewArrivals) t.push({ id: 'new', label: 'New arrivals' });
    t.push({ id: 'featured', label: 'Featured' });
    return t;
  });
  protected tabProducts = computed(() => {
    const t = this.tab();
    const list = t === 'best' ? this.catalog.bestSellers() : t === 'new' ? this.catalog.newArrivals() : this.catalog.featured();
    return list.slice(0, Math.min(8, Math.max(4, Math.floor(list.length / 4) * 4)));
  });
  protected banners = computed(() => this.home().promoBanners.filter((b) => b.active));
  protected testimonials = computed(() =>
    this.db
      .reviews()
      .filter((r) => r.status === 'approved' && r.rating === 5)
      .filter((r, i, a) => a.findIndex((x) => x.title === r.title) === i)
      .slice(0, 6)
      .map((r) => ({ ...r, product: this.catalog.byId(r.productId) })),
  );
  protected marquee = computed(() => this.home().offerStrip.split('✦').map((s) => s.trim()).filter(Boolean));
  protected ghee = computed(() => this.catalog.byId('p1'));

  constructor() {
    inject(SeoService).set({
      title: 'MILKYARD — Pure Ghee, Kheer Malai & Traditional Sweets in Kolkata',
      description:
        'Shop small-batch pure cow ghee, kheer malai, makkhan bhog, ghee laddus, mishti doi and dry fruits online. Fresh delivery across Kolkata.',
      path: '/',
    });
  }
}
