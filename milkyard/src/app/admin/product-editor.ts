import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DbService } from '../core/services/db.service';
import { ToastService } from '../core/services/toast.service';
import { Product, Variant } from '../core/models';
import { Icon } from '../shared/icon';
import { InrPipe } from '../shared/inr.pipe';

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

@Component({
  selector: 'app-admin-product-editor',
  imports: [RouterLink, FormsModule, Icon, InrPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .layout { display: grid; gap: 16px; @media (min-width: 1100px) { grid-template-columns: 1fr 340px; align-items: start; } }
    .col { display: flex; flex-direction: column; gap: 16px; }
    .ed-side { @media (min-width: 1100px) { position: sticky; top: 84px; } }
    .imgs { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px; }
    .im { position: relative; border-radius: 14px; overflow: hidden; border: 1px solid var(--line); aspect-ratio: 1; img { width: 100%; height: 100%; object-fit: cover; } .x { position: absolute; top: 6px; right: 6px; width: 26px; height: 26px; border-radius: 50%; border: 0; background: rgba(0,0,0,.7); color: #fff; display: grid; place-items: center; } .main { position: absolute; left: 6px; bottom: 6px; } .mv { position: absolute; left: 6px; top: 6px; display: flex; gap: 2px; button { width: 22px; height: 22px; border: 0; border-radius: 6px; background: rgba(255,255,255,.9); font-size: .7rem; } } }
    .up { border: 2px dashed var(--line); border-radius: 14px; aspect-ratio: 1; display: grid; place-items: center; text-align: center; color: var(--muted); font-size: .78rem; font-weight: 800; cursor: pointer; &:hover { border-color: var(--ink); color: var(--ink); } input { display: none; } }
    .vt { width: 100%; border-collapse: collapse; font-size: .84rem; th { text-align: left; font-size: .68rem; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); padding: 6px 4px; } td { padding: 4px; } .input { min-height: 38px; padding: 6px 10px; font-size: .86rem; border-radius: 10px; } }
    .vt-wrap { overflow-x: auto; }
    .margin { font-weight: 800; font-size: .8rem; white-space: nowrap; } .margin.neg { color: var(--danger); } .margin.pos { color: #2f7d32; }
    .rows { display: flex; flex-direction: column; gap: 8px; .row .input { min-height: 40px; } }
    .cats { display: flex; flex-wrap: wrap; gap: 8px; }
    .toggles { display: flex; flex-direction: column; gap: 12px; }
    h3 { margin-bottom: 14px !important; }
  `,
  template: `
    @if (p) {
      <a routerLink="/admin/products" class="link small">← Products</a>
      <div class="a-head mt-1">
        <div><h1>{{ isNew() ? 'Add product' : p.name }}</h1><p>{{ isNew() ? 'Create a new product for your store.' : 'Edit details, pricing, stock and visibility.' }}</p></div>
        <div class="acts">
          @if (!isNew()) { <a [routerLink]="['/product', p.slug]" target="_blank" class="btn btn-light btn-sm"><app-icon name="eye" [size]="16" /> View on store</a> }
          <button class="btn btn-sm" (click)="save()"><app-icon name="check" [size]="16" /> Save product</button>
        </div>
      </div>
      <div class="layout">
        <div class="col">
          <section class="a-card a-form">
            <h3>Basic information</h3>
            <div class="field"><label for="pn">Product name *</label><input id="pn" class="input" [(ngModel)]="p.name" (ngModelChange)="autoSlug()" name="name" /></div>
            <div class="field"><label for="ps">Short description</label><input id="ps" class="input" [(ngModel)]="p.shortDescription" name="short" maxlength="140" /><span class="hint">{{ p.shortDescription.length }}/140 · shown on product cards</span></div>
            <div class="field"><label for="pd">Full description</label><textarea id="pd" class="textarea" rows="5" [(ngModel)]="p.description" name="desc"></textarea></div>
          </section>

          <section class="a-card">
            <h3>Images</h3>
            <div class="imgs">
              @for (src of p.images; track $index; let i = $index) {
                <div class="im"><img [src]="src" alt="" />
                  <button class="x" (click)="p.images.splice(i, 1)" aria-label="Remove image"><app-icon name="close" [size]="14" /></button>
                  <div class="mv">@if (i > 0) { <button (click)="move(i, -1)" aria-label="Move left">◀</button> }@if (i < p.images.length - 1) { <button (click)="move(i, 1)" aria-label="Move right">▶</button> }</div>
                  @if (i === 0) { <span class="badge badge-yellow main">Main</span> }
                </div>
              }
              <label class="up"><input type="file" accept="image/*" multiple (change)="upload($event)" /><span><app-icon name="upload" [size]="22" style="margin:0 auto 6px" />Upload images</span></label>
            </div>
            <p class="a-note mt-2">Use square photos, at least 1200 × 1200 px, on a clean background. In production these upload to cloud storage (S3 / Cloudinary) with automatic WebP/AVIF resizing.</p>
          </section>

          <section class="a-card">
            <div class="a-card-h"><h3 style="margin:0!important">Variants, pricing & stock</h3><button class="btn btn-light btn-xs" (click)="addVariant()"><app-icon name="plus" [size]="14" /> Add variant</button></div>
            <div class="vt-wrap">
              <table class="vt">
                <thead><tr><th>Size</th><th>SKU</th><th>Price ₹</th><th>MRP ₹</th><th>Cost ₹</th><th>Pack ₹</th><th>Stock</th><th>Margin</th><th></th></tr></thead>
                <tbody>
                  @for (v of p.variants; track v.id; let i = $index) {
                    <tr>
                      <td><input class="input" style="width:90px" [(ngModel)]="v.label" [name]="'l' + i" /></td>
                      <td><input class="input" style="width:130px" [(ngModel)]="v.sku" [name]="'s' + i" /></td>
                      <td><input class="input" style="width:84px" type="number" min="0" [(ngModel)]="v.price" [name]="'p' + i" /></td>
                      <td><input class="input" style="width:84px" type="number" min="0" [(ngModel)]="v.mrp" [name]="'m' + i" /></td>
                      <td><input class="input" style="width:84px" type="number" min="0" [(ngModel)]="v.costPrice" [name]="'c' + i" /></td>
                      <td><input class="input" style="width:70px" type="number" min="0" [(ngModel)]="v.packagingCost" [name]="'k' + i" /></td>
                      <td><input class="input" style="width:76px" type="number" min="0" [(ngModel)]="v.stock" [name]="'st' + i" /></td>
                      <td><span class="margin" [class.neg]="margin(v) < 0" [class.pos]="margin(v) >= 0">{{ margin(v) | inr }} · {{ marginPct(v) }}%</span></td>
                      <td>@if (p.variants.length > 1) { <button class="icon-btn" (click)="p.variants.splice(i, 1)" aria-label="Remove variant"><app-icon name="trash" [size]="16" /></button> }</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <p class="a-note mt-1">Discount % on the store is calculated from MRP vs price. Cost + packaging feed the profit analytics. Set stock to 0 to mark a size out of stock.</p>
            <div class="field mt-2" style="max-width:220px"><label for="lt">Low-stock alert at (units)</label><input id="lt" class="input" type="number" [(ngModel)]="p.lowStockThreshold" name="low" /></div>
          </section>

          <section class="a-card a-form">
            <h3>Food information</h3>
            <div class="field"><label for="ing">Ingredients</label><textarea id="ing" class="textarea" rows="2" [(ngModel)]="p.ingredients" name="ing"></textarea></div>
            <div class="grid-2">
              <div class="field"><label for="sto">Storage instructions</label><textarea id="sto" class="textarea" rows="2" [(ngModel)]="p.storage" name="sto"></textarea></div>
              <div class="field"><label for="shl">Shelf life</label><input id="shl" class="input" [(ngModel)]="p.shelfLife" name="shl" /></div>
            </div>
            <div class="field"><span class="label">Highlights</span>
              <div class="rows">
                @for (h of p.highlights; track $index; let i = $index) { <div class="row"><input class="input" [(ngModel)]="p.highlights[i]" [name]="'h' + i" /><button class="icon-btn" (click)="p.highlights.splice(i, 1)" aria-label="Remove"><app-icon name="trash" [size]="16" /></button></div> }
                <button class="btn btn-light btn-xs" style="align-self:flex-start" (click)="p.highlights.push('')"><app-icon name="plus" [size]="14" /> Add highlight</button>
              </div>
            </div>
            <div class="field"><span class="label">Nutritional information (per 100 g)</span>
              <div class="rows">
                @for (n of p.nutrition; track $index; let i = $index) { <div class="row"><input class="input" placeholder="Nutrient" [(ngModel)]="n.label" [name]="'nl' + i" /><input class="input" placeholder="Value" [(ngModel)]="n.value" [name]="'nv' + i" /><button class="icon-btn" (click)="p.nutrition.splice(i, 1)" aria-label="Remove"><app-icon name="trash" [size]="16" /></button></div> }
                <button class="btn btn-light btn-xs" style="align-self:flex-start" (click)="p.nutrition.push({ label: '', value: '' })"><app-icon name="plus" [size]="14" /> Add row</button>
              </div>
            </div>
            <h3 class="mt-2">Legal declarations</h3>
            <div class="grid-2">
              <div class="field"><label for="fs">FSSAI licence no.</label><input id="fs" class="input" [(ngModel)]="p.legal.fssaiLicense" name="fs" /></div>
              <div class="field"><label for="mf">Manufacturer</label><input id="mf" class="input" [(ngModel)]="p.legal.manufacturer" name="mf" /></div>
              <div class="field"><label for="co">Country of origin</label><input id="co" class="input" [(ngModel)]="p.legal.countryOfOrigin" name="co" /></div>
              <label class="check" style="align-self:end"><input type="checkbox" [(ngModel)]="p.legal.veg" name="veg" /> Vegetarian</label>
            </div>
          </section>

          <section class="a-card a-form">
            <h3>SEO</h3>
            <div class="field"><label for="sl">URL slug</label><div class="input-group"><span class="prefix tiny">/product/</span><input id="sl" [(ngModel)]="p.slug" name="slug" /></div></div>
            <div class="field"><label for="st">Meta title</label><input id="st" class="input" [(ngModel)]="p.seo.title" name="st" [placeholder]="p.name + ' — Buy Online in Kolkata'" /><span class="hint">{{ (p.seo.title || '').length }}/60</span></div>
            <div class="field"><label for="sd">Meta description</label><textarea id="sd" class="textarea" rows="2" [(ngModel)]="p.seo.description" name="sd"></textarea><span class="hint">{{ (p.seo.description || '').length }}/160</span></div>
            <div class="field"><label for="tg">Search keywords (comma separated)</label><input id="tg" class="input" [ngModel]="p.tags.join(', ')" (ngModelChange)="p.tags = splitTags($event)" name="tags" /></div>
          </section>
        </div>

        <div class="col ed-side">
          <section class="a-card">
            <h3>Visibility</h3>
            <div class="toggles">
              <label class="switch"><input type="checkbox" [(ngModel)]="p.published" name="pub" /> Published on store</label>
              <label class="switch"><input type="checkbox" [(ngModel)]="p.bestSeller" name="bs" /> Best seller</label>
              <label class="switch"><input type="checkbox" [(ngModel)]="p.newArrival" name="na" /> New arrival</label>
              <label class="switch"><input type="checkbox" [(ngModel)]="p.featured" name="ft" /> Featured on homepage</label>
            </div>
          </section>
          <section class="a-card">
            <h3>Categories</h3>
            <div class="cats">
              @for (c of categories(); track c.id) { <button class="chip" [class.active]="p.categoryIds.includes(c.id)" (click)="toggleCat(c.id)">{{ c.name }}</button> }
            </div>
            <p class="a-note mt-1">The first selected category is the primary one (shown in breadcrumbs).</p>
          </section>
          <section class="a-card">
            <h3>Frequently bought together</h3>
            <select class="select" (change)="addFbt($any($event.target).value); $any($event.target).value = ''" aria-label="Add product">
              <option value="">Add a product…</option>
              @for (o of others(); track o.id) { <option [value]="o.id">{{ o.name }}</option> }
            </select>
            <div class="cats mt-1">@for (id of p.boughtTogether; track id) { <span class="chip">{{ nameOf(id) }} <button class="link tiny" (click)="removeFbt(id)">✕</button></span> }</div>
          </section>
          <button class="btn btn-block" (click)="save()">Save product</button>
          @if (!isNew()) { <button class="btn btn-ghost btn-block" style="color:var(--danger)" (click)="remove()"><app-icon name="trash" [size]="16" /> Delete product</button> }
        </div>
      </div>
    }
  `,
})
export class AdminProductEditor {
  private db = inject(DbService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  readonly id = input.required<string>();
  protected isNew = computed(() => this.id() === 'new');
  protected categories = computed(() => this.db.categories().filter((c) => !c.smart));
  protected p!: Product;
  private slugTouched = false;

  ngOnInit() {
    const existing = this.db.products().find((x) => x.id === this.id());
    if (existing) {
      this.p = structuredClone(existing);
      this.slugTouched = true;
    } else {
      this.p = {
        id: this.db.uid('p'),
        slug: '',
        name: '',
        shortDescription: '',
        description: '',
        categoryIds: [],
        images: [],
        variants: [{ id: this.db.uid('v'), label: '500 g', sku: '', price: 0, mrp: 0, stock: 0, costPrice: 0, packagingCost: 0 }],
        ingredients: '',
        storage: 'Store in a cool, dry place away from direct sunlight.',
        shelfLife: '',
        nutrition: [],
        highlights: [],
        tags: [],
        bestSeller: false,
        newArrival: true,
        featured: false,
        published: false,
        rating: 0,
        reviewCount: 0,
        sold: 0,
        views: 0,
        lowStockThreshold: 10,
        boughtTogether: [],
        legal: { fssaiLicense: this.db.settings().fssai, manufacturer: 'MILKYARD Dairy Products, Kolkata, West Bengal', countryOfOrigin: 'India', veg: true },
        seo: { title: '', description: '' },
      };
    }
  }
  protected others = computed(() => this.db.products().filter((x) => x.id !== this.id()));

  autoSlug() {
    if (!this.slugTouched || this.isNew()) this.p.slug = slugify(this.p.name);
  }
  margin(v: Variant) {
    return (v.price || 0) - (v.costPrice || 0) - (v.packagingCost || 0);
  }
  marginPct(v: Variant) {
    return v.price ? Math.round((this.margin(v) / v.price) * 100) : 0;
  }
  addVariant() {
    this.p.variants.push({ id: this.db.uid('v'), label: '', sku: '', price: 0, mrp: 0, stock: 0, costPrice: 0, packagingCost: 0 });
  }
  move(i: number, d: number) {
    const a = this.p.images;
    [a[i], a[i + d]] = [a[i + d], a[i]];
  }
  upload(e: Event) {
    const files = Array.from((e.target as HTMLInputElement).files ?? []);
    for (const f of files) {
      if (f.size > 2.5e6) {
        this.toast.error('Image too large', `${f.name} is over 2.5 MB. Please compress it first.`);
        continue;
      }
      const r = new FileReader();
      r.onload = () => {
        this.p.images.push(String(r.result));
        this.cdr.markForCheck();
      };
      r.readAsDataURL(f);
    }
  }
  toggleCat(id: string) {
    const i = this.p.categoryIds.indexOf(id);
    i >= 0 ? this.p.categoryIds.splice(i, 1) : this.p.categoryIds.push(id);
  }
  splitTags(s: string) {
    return s.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
  }
  addFbt(id: string) {
    if (id && !this.p.boughtTogether.includes(id)) this.p.boughtTogether.push(id);
  }
  removeFbt(id: string) {
    this.p.boughtTogether = this.p.boughtTogether.filter((x) => x !== id);
  }
  nameOf(id: string) {
    return this.db.products().find((x) => x.id === id)?.name ?? id;
  }

  save() {
    const p = this.p;
    if (!p.name.trim()) return this.toast.error('Product name is required');
    if (!p.slug) p.slug = slugify(p.name);
    if (this.db.products().some((x) => x.slug === p.slug && x.id !== p.id)) return this.toast.error('Slug already in use', 'Choose a different URL slug.');
    if (!p.categoryIds.length) return this.toast.error('Pick at least one category');
    if (p.variants.some((v) => !v.label || v.price <= 0)) return this.toast.error('Every variant needs a size and a price');
    if (p.variants.some((v) => v.mrp && v.mrp < v.price)) return this.toast.error('MRP cannot be lower than the selling price');
    p.variants.forEach((v) => {
      if (!v.sku) v.sku = `${p.slug}-${slugify(v.label)}`.toUpperCase();
      if (!v.mrp) v.mrp = v.price;
    });
    if (!p.images.length) p.images = ['images/categories/dairy.svg'];
    const exists = this.db.products().some((x) => x.id === p.id);
    this.db.products.update((l) => (exists ? l.map((x) => (x.id === p.id ? structuredClone(p) : x)) : [...l, structuredClone(p)]));
    this.toast.show(exists ? 'Product saved' : 'Product created', { body: p.name });
    if (!exists) this.router.navigate(['/admin/products', p.id]);
  }
  remove() {
    if (!confirm(`Delete “${this.p.name}”? This can’t be undone. Tip: hide it instead to keep its sales history tidy.`)) return;
    this.db.products.update((l) => l.filter((x) => x.id !== this.p.id));
    this.toast.show('Product deleted');
    this.router.navigateByUrl('/admin/products');
  }
}
