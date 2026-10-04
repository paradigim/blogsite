import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { CatalogService, SortKey } from '../../core/services/catalog.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductCard } from '../../shared/product-card';
import { Icon } from '../../shared/icon';

const PRICE_BANDS = [
  { id: 'all', label: 'Any price', min: 0, max: Infinity },
  { id: 'u300', label: 'Under ₹300', min: 0, max: 299 },
  { id: '300-700', label: '₹300 – ₹700', min: 300, max: 700 },
  { id: 'o700', label: 'Above ₹700', min: 701, max: Infinity },
];

@Component({
  selector: 'app-shop',
  imports: [RouterLink, ProductCard, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './shop.scss',
  template: `
    <section class="page-hero">
      <div class="container">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a routerLink="/">Home</a><span class="sep">/</span>
          @if (category(); as c) { <a routerLink="/shop">Shop</a><span class="sep">/</span><span>{{ c.name }}</span> }
          @else if (isSearch()) { <span>Search</span> }
          @else { <span>Shop</span> }
        </nav>
        <div class="hero-row">
          <div>
            @if (isSearch()) {
              <h1>Results for “{{ q() }}”</h1>
              <p>{{ results().length }} product{{ results().length === 1 ? '' : 's' }} found</p>
            } @else if (category(); as c) {
              <h1>{{ c.name }}</h1>
              <p>{{ c.tagline }} — made in small batches and delivered fresh across Kolkata.</p>
            } @else {
              <h1>Shop all</h1>
              <p>Ghee, dairy delicacies, sweets, dry fruits and gift boxes — everything MILKYARD makes, in one place.</p>
            }
          </div>
          @if (category(); as c) { <img class="hero-img" [src]="c.image" alt="" /> }
        </div>
      </div>
    </section>

    <section class="container shop">
      <div class="cat-strip" role="navigation" aria-label="Categories">
        <a routerLink="/shop" class="chip" [class.active]="!category() && !isSearch()">All</a>
        @for (c of catalog.categories(); track c.id) {
          <a [routerLink]="['/category', c.slug]" class="chip" [class.active]="category()?.id === c.id">{{ c.name }}</a>
        }
      </div>

      <div class="layout">
        <aside class="filters" [class.open]="filtersOpen()">
          <div class="fh"><h3>Filters</h3><button class="icon-btn mobile-only" (click)="filtersOpen.set(false)" aria-label="Close filters"><app-icon name="close" /></button></div>
          <fieldset>
            <legend>Price</legend>
            @for (b of bands; track b.id) {
              <label class="check"><input type="radio" name="price" [checked]="band() === b.id" (change)="band.set(b.id)" /> {{ b.label }}</label>
            }
          </fieldset>
          <fieldset>
            <legend>Show</legend>
            <label class="check"><input type="checkbox" [checked]="onlyInStock()" (change)="onlyInStock.set(!onlyInStock())" /> In stock only</label>
            <label class="check"><input type="checkbox" [checked]="onlyBest()" (change)="onlyBest.set(!onlyBest())" /> Bestsellers</label>
            <label class="check"><input type="checkbox" [checked]="onlyNew()" (change)="onlyNew.set(!onlyNew())" /> New arrivals</label>
            <label class="check"><input type="checkbox" [checked]="onlyOffer()" (change)="onlyOffer.set(!onlyOffer())" /> On offer</label>
          </fieldset>
          <button class="btn btn-light btn-sm btn-block" (click)="reset()">Clear filters</button>
          <button class="btn btn-block mobile-only mt-1" (click)="filtersOpen.set(false)">Show {{ results().length }} products</button>
        </aside>
        @if (filtersOpen()) { <div class="backdrop mobile-only" (click)="filtersOpen.set(false)"></div> }

        <div class="main">
          <div class="toolbar">
            <button class="btn btn-light btn-sm mobile-only" (click)="filtersOpen.set(true)"><app-icon name="sliders" [size]="16" /> Filters @if (activeFilters()) { ({{ activeFilters() }}) }</button>
            <span class="muted small hide-mobile">Showing {{ results().length }} of {{ base().length }} products</span>
            <label class="sort">
              <span class="sr-only">Sort by</span>
              <select class="select" [value]="sort()" (change)="sort.set($any($event.target).value)">
                <option value="popular">Most popular</option>
                <option value="rating">Top rated</option>
                <option value="new">Newest</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </label>
          </div>
          @if (results().length) {
            <div class="grid">
              @for (p of results(); track p.id) { <app-product-card [product]="p" /> }
            </div>
          } @else {
            <div class="empty card">
              <img class="art" src="images/categories/dryfruits.svg" alt="" style="border-radius:50%" />
              <h3>Nothing matches — yet</h3>
              <p>Try a different search or clear the filters. Looking for something special? WhatsApp us.</p>
              <button class="btn" (click)="reset()">Clear filters</button>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class ShopPage {
  protected catalog = inject(CatalogService);
  private seo = inject(SeoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly slug = input<string>();
  readonly q = input<string>('');
  protected isSearch = toSignal(this.route.data.pipe(map((d) => !!d['search'])), { initialValue: false });

  protected bands = PRICE_BANDS;
  protected band = signal('all');
  protected sort = signal<SortKey>('popular');
  protected onlyInStock = signal(false);
  protected onlyBest = signal(false);
  protected onlyNew = signal(false);
  protected onlyOffer = signal(false);
  protected filtersOpen = signal(false);

  protected category = computed(() => (this.slug() ? this.catalog.category(this.slug()!) : undefined));
  protected base = computed(() => {
    if (this.isSearch()) return this.catalog.search(this.q() ?? '');
    const c = this.category();
    return c ? this.catalog.inCategory(c) : this.catalog.products();
  });
  protected activeFilters = computed(
    () => [this.band() !== 'all', this.onlyInStock(), this.onlyBest(), this.onlyNew(), this.onlyOffer()].filter(Boolean).length,
  );
  protected results = computed(() => {
    const b = PRICE_BANDS.find((x) => x.id === this.band())!;
    let list = this.base().filter((p) => {
      const price = this.catalog.minPrice(p);
      if (price < b.min || price > b.max) return false;
      if (this.onlyInStock() && !this.catalog.inStock(p)) return false;
      if (this.onlyBest() && !p.bestSeller) return false;
      if (this.onlyNew() && !p.newArrival) return false;
      if (this.onlyOffer() && !p.variants.some((v) => v.mrp > v.price)) return false;
      return true;
    });
    // search keeps relevance order unless the shopper picks a sort
    if (!(this.isSearch() && this.sort() === 'popular')) list = this.catalog.sort(list, this.sort());
    return list;
  });

  constructor() {
    effect(() => {
      if (this.slug() && !this.category()) {
        this.router.navigateByUrl('/404', { skipLocationChange: true });
        return;
      }
      const c = this.category();
      if (this.isSearch()) {
        this.seo.set({ title: `Search: ${this.q()}`, path: '/search' });
        this.seo.noindex();
      } else if (c) {
        this.seo.set({
          title: `${c.name} in Kolkata — Buy Online`,
          description: `Buy MILKYARD ${c.name.toLowerCase()} online — ${c.tagline.toLowerCase()}. Fresh delivery across Kolkata.`,
          path: `/category/${c.slug}`,
          image: c.image,
        });
      } else {
        this.seo.set({ title: 'Shop Ghee, Sweets, Dairy & Dry Fruits Online in Kolkata', path: '/shop' });
      }
    });
  }

  reset() {
    this.band.set('all');
    this.onlyInStock.set(false);
    this.onlyBest.set(false);
    this.onlyNew.set(false);
    this.onlyOffer.set(false);
  }
}
