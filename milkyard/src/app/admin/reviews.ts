import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DbService } from '../core/services/db.service';
import { ToastService } from '../core/services/toast.service';
import { Review } from '../core/models';
import { Stars } from '../shared/stars';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-admin-reviews',
  imports: [DatePipe, RouterLink, Stars, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .list { display: flex; flex-direction: column; gap: 12px; }
    .rv { background: #fff; border: 1px solid #ebe6d8; border-radius: 18px; padding: 16px; display: grid; gap: 12px; grid-template-columns: 56px 1fr; }
    .rv img { width: 56px; height: 56px; border-radius: 12px; }
    .rv h4 { font-family: var(--font-body); font-weight: 900; margin: 6px 0 2px; font-size: 1rem; }
    .rv p { margin: 0; font-size: .9rem; color: #4a4434; }
    .meta { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; font-size: .8rem; color: var(--muted); font-weight: 700; }
    .acts { display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap; }
  `,
  template: `
    <div class="a-head"><div><h1>Reviews</h1><p>Approve, hide or delete customer reviews. Only verified purchasers can submit.</p></div></div>
    <div class="a-filters">
      <div class="seg">@for (f of filters; track f.id) { <button [class.on]="filter() === f.id" (click)="filter.set(f.id)">{{ f.label }} ({{ count(f.id) }})</button> }</div>
    </div>
    <div class="list">
      @for (r of shown(); track r.id) {
        <div class="rv">
          <img [src]="productImg(r)" alt="" />
          <div>
            <div class="meta"><a [routerLink]="['/admin/products', r.productId]" class="link">{{ productName(r) }}</a> · {{ r.userName }} · {{ r.createdAt | date: 'd MMM y' }} @if (r.verified) { <span class="badge badge-green">Verified</span> } <span class="badge" [class.badge-amber]="r.status === 'pending'" [class.badge-green]="r.status === 'approved'" [class.badge-grey]="r.status === 'hidden'">{{ r.status }}</span></div>
            <app-stars [rating]="r.rating" [showValue]="false" />
            <h4>{{ r.title }}</h4>
            <p>{{ r.body }}</p>
            <div class="acts">
              @if (r.status !== 'approved') { <button class="btn btn-xs" (click)="set(r, 'approved')"><app-icon name="check" [size]="14" /> Approve</button> }
              @if (r.status !== 'hidden') { <button class="btn btn-light btn-xs" (click)="set(r, 'hidden')"><app-icon name="eye-off" [size]="14" /> Hide</button> }
              <button class="btn btn-ghost btn-xs" style="color:var(--danger)" (click)="remove(r)"><app-icon name="trash" [size]="14" /> Delete</button>
            </div>
          </div>
        </div>
      } @empty { <div class="a-card a-empty">No reviews here.</div> }
    </div>
  `,
})
export class AdminReviews {
  private db = inject(DbService);
  private toast = inject(ToastService);
  protected filters = [{ id: 'pending', label: 'Pending' }, { id: 'approved', label: 'Approved' }, { id: 'hidden', label: 'Hidden' }, { id: 'all', label: 'All' }];
  protected filter = signal('pending');
  protected shown = computed(() => {
    const f = this.filter();
    return this.db.reviews().filter((r) => f === 'all' || r.status === f).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });
  count(f: string) {
    return this.db.reviews().filter((r) => f === 'all' || r.status === f).length;
  }
  productName(r: Review) {
    return this.db.products().find((p) => p.id === r.productId)?.name ?? 'Deleted product';
  }
  productImg(r: Review) {
    return this.db.products().find((p) => p.id === r.productId)?.images[0] ?? '';
  }
  set(r: Review, status: Review['status']) {
    this.db.reviews.update((l) => l.map((x) => (x.id === r.id ? { ...x, status } : x)));
    this.toast.show(`Review ${status}`, {}, 1800);
  }
  remove(r: Review) {
    if (confirm('Delete this review permanently?')) this.db.reviews.update((l) => l.filter((x) => x.id !== r.id));
  }
}
