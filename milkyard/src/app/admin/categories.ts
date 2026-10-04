import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DbService } from '../core/services/db.service';
import { CatalogService } from '../core/services/catalog.service';
import { ToastService } from '../core/services/toast.service';
import { Category } from '../core/models';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-admin-categories',
  imports: [FormsModule, RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .list { display: flex; flex-direction: column; gap: 10px; }
    .c { display: flex; align-items: center; gap: 14px; background: #fff; border: 1px solid #ebe6d8; border-radius: 18px; padding: 12px 14px; }
    .c img { width: 56px; height: 56px; border-radius: 14px; }
    .c.hidden { opacity: .55; }
    .ord { display: flex; flex-direction: column; gap: 2px; button { border: 0; background: #f3efe3; width: 28px; height: 22px; border-radius: 6px; font-size: .7rem; &:disabled { opacity: .3; } } }
    .meta { flex: 1; min-width: 0; b { display: block; } small { color: var(--muted); font-weight: 600; } }
    .acts { display: flex; gap: 6px; align-items: center; }
  `,
  template: `
    <div class="a-head">
      <div><h1>Categories</h1><p>Create, rename, hide and reorder the categories shown on the store.</p></div>
      <div class="acts"><button class="btn btn-sm" (click)="edit({ id: '', slug: '', name: '', tagline: '', image: 'images/categories/dairy.svg', order: 99, visible: true })"><app-icon name="plus" [size]="16" /> New category</button></div>
    </div>
    <div class="list">
      @for (c of sorted(); track c.id; let i = $index; let last = $last) {
        <div class="c" [class.hidden]="!c.visible">
          <div class="ord"><button (click)="move(i, -1)" [disabled]="i === 0" aria-label="Move up">▲</button><button (click)="move(i, 1)" [disabled]="last" aria-label="Move down">▼</button></div>
          <img [src]="c.image" alt="" />
          <div class="meta"><b>{{ c.name }} @if (c.smart) { <span class="badge badge-blue">Smart</span> }</b><small>/category/{{ c.slug }} · {{ count(c) }} products · {{ c.tagline }}</small></div>
          <div class="acts">
            <label class="switch" [title]="c.visible ? 'Visible' : 'Hidden'"><input type="checkbox" [checked]="c.visible" (change)="toggle(c)" [attr.aria-label]="'Show ' + c.name" /></label>
            <button class="btn btn-light btn-xs" (click)="edit(c)">Edit</button>
            @if (!c.smart) { <button class="icon-btn" (click)="remove(c)" aria-label="Delete"><app-icon name="trash" [size]="16" /></button> }
          </div>
        </div>
      }
    </div>
    <p class="a-note mt-2">Smart categories (Best Sellers, New Arrivals) fill automatically from the product flags in <a routerLink="/admin/products" class="link">Products</a>.</p>

    @if (editing(); as e) {
      <div class="a-modal">
        <div class="bg" (click)="editing.set(null)"></div>
        <form class="box a-form" (ngSubmit)="save()">
          <h2>{{ e.id ? 'Edit category' : 'New category' }}</h2>
          <div class="field"><label for="cn">Name</label><input id="cn" class="input" name="n" [(ngModel)]="e.name" required /></div>
          <div class="field"><label for="ct">Tagline</label><input id="ct" class="input" name="t" [(ngModel)]="e.tagline" /></div>
          <div class="field"><label for="cs">URL slug</label><input id="cs" class="input" name="s" [(ngModel)]="e.slug" placeholder="auto from name" /></div>
          <div class="field"><span class="label">Image</span><div class="row"><img [src]="e.image" alt="" style="width:64px;height:64px;border-radius:14px" /><input type="file" accept="image/*" (change)="upload($event, e)" /></div></div>
          <div class="row"><button class="btn" type="submit">Save</button><button class="btn btn-ghost" type="button" (click)="editing.set(null)">Cancel</button></div>
        </form>
      </div>
    }
  `,
})
export class AdminCategories {
  private db = inject(DbService);
  private catalog = inject(CatalogService);
  private toast = inject(ToastService);
  protected editing = signal<Category | null>(null);
  protected sorted = computed(() => [...this.db.categories()].sort((a, b) => a.order - b.order));

  count(c: Category) {
    return c.smart ? this.catalog.inCategory(c).length : this.db.products().filter((p) => p.categoryIds.includes(c.id)).length;
  }
  move(i: number, d: number) {
    const l = this.sorted().map((c) => ({ ...c }));
    [l[i], l[i + d]] = [l[i + d], l[i]];
    l.forEach((c, k) => (c.order = k + 1));
    this.db.categories.set(l);
  }
  toggle(c: Category) {
    this.db.categories.update((l) => l.map((x) => (x.id === c.id ? { ...x, visible: !x.visible } : x)));
  }
  edit(c: Category) {
    this.editing.set({ ...c });
  }
  upload(e: Event, c: Category) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => this.editing.set({ ...c, image: String(r.result) });
    r.readAsDataURL(f);
  }
  save() {
    const c = this.editing()!;
    if (!c.name.trim()) return this.toast.error('Name is required');
    c.slug = (c.slug || c.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (c.id) this.db.categories.update((l) => l.map((x) => (x.id === c.id ? c : x)));
    else this.db.categories.update((l) => [...l, { ...c, id: this.db.uid('c'), order: l.length + 1 }]);
    this.editing.set(null);
    this.toast.show('Category saved');
  }
  remove(c: Category) {
    if (this.count(c) > 0) return this.toast.error('Category has products', 'Move or hide its products first, or hide the category instead.');
    if (confirm(`Delete “${c.name}”?`)) this.db.categories.update((l) => l.filter((x) => x.id !== c.id));
  }
}
