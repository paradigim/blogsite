import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DbService } from '../core/services/db.service';
import { ToastService } from '../core/services/toast.service';
import { Coupon } from '../core/models';
import { Icon } from '../shared/icon';
import { InrPipe } from '../shared/inr.pipe';

@Component({
  selector: 'app-admin-coupons',
  imports: [FormsModule, DatePipe, Icon, InrPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
    .cp { background: #fff; border: 1px solid #ebe6d8; border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; }
    .cp .top { padding: 18px; background: var(--yellow); position: relative; border-bottom: 2px dashed #141414; }
    .cp.off .top { background: #ece8dc; }
    .code { font-size: 1.4rem; font-weight: 900; letter-spacing: .08em; }
    .val { font-size: .9rem; font-weight: 800; }
    .body { padding: 14px 18px; display: flex; flex-direction: column; gap: 6px; font-size: .84rem; flex: 1; }
    .body .r { display: flex; justify-content: space-between; color: var(--muted); font-weight: 700; b { color: var(--ink); } }
    .use { height: 6px; border-radius: 6px; background: #f3efe3; overflow: hidden; i { display: block; height: 100%; background: var(--ink); } }
    .foot { display: flex; gap: 6px; padding: 12px 18px; border-top: 1px solid var(--line-2); align-items: center; }
  `,
  template: `
    <div class="a-head">
      <div><h1>Coupons & offers</h1><p>Percentage or flat discounts with limits, dates and product/category targeting.</p></div>
      <div class="acts"><button class="btn btn-sm" (click)="create()"><app-icon name="plus" [size]="16" /> New coupon</button></div>
    </div>
    <div class="grid">
      @for (c of db.coupons(); track c.id) {
        <div class="cp" [class.off]="!live(c)">
          <div class="top">
            <div class="row between"><span class="code">{{ c.code }}</span>@if (live(c)) { <span class="badge badge-ink">Live</span> } @else { <span class="badge badge-grey">{{ c.active ? 'Scheduled / expired' : 'Inactive' }}</span> }</div>
            <span class="val">{{ c.type === 'percent' ? c.value + '% off' : '₹' + c.value + ' off' }}@if (c.maxDiscount) { · up to {{ c.maxDiscount | inr }} }</span>
          </div>
          <div class="body">
            <span>{{ c.description }}</span>
            <div class="r"><span>Min. order</span><b>{{ c.minOrder | inr }}</b></div>
            <div class="r"><span>Applies to</span><b>{{ scopeLabel(c) }}</b></div>
            <div class="r"><span>Valid</span><b>{{ c.startsAt | date: 'd MMM' }} – {{ c.endsAt | date: 'd MMM y' }}</b></div>
            <div class="r"><span>Used</span><b>{{ c.used }}{{ c.usageLimit ? ' / ' + c.usageLimit : '' }}</b></div>
            @if (c.usageLimit) { <div class="use"><i [style.width.%]="(c.used / c.usageLimit) * 100"></i></div> }
          </div>
          <div class="foot">
            <label class="switch"><input type="checkbox" [checked]="c.active" (change)="toggle(c)" [attr.aria-label]="'Activate ' + c.code" /> Active</label>
            <span class="grow"></span>
            <button class="btn btn-light btn-xs" (click)="editing.set(clone(c))">Edit</button>
            <button class="icon-btn" (click)="remove(c)" aria-label="Delete"><app-icon name="trash" [size]="16" /></button>
          </div>
        </div>
      }
    </div>

    @if (editing(); as e) {
      <div class="a-modal">
        <div class="bg" (click)="editing.set(null)"></div>
        <form class="box a-form" (ngSubmit)="save()">
          <h2>{{ isNew(e) ? 'New coupon' : 'Edit ' + e.code }}</h2>
          <div class="grid-2">
            <div class="field"><label for="cc">Code</label><input id="cc" class="input" name="code" [(ngModel)]="e.code" style="text-transform:uppercase" required /></div>
            <div class="field"><label for="ctp">Type</label><select id="ctp" class="select" name="type" [(ngModel)]="e.type"><option value="percent">Percentage %</option><option value="flat">Flat ₹</option></select></div>
            <div class="field span-2"><label for="cd">Description (shown to customers)</label><input id="cd" class="input" name="d" [(ngModel)]="e.description" /></div>
            <div class="field"><label for="cv">{{ e.type === 'percent' ? 'Discount %' : 'Discount ₹' }}</label><input id="cv" class="input" type="number" name="v" [(ngModel)]="e.value" /></div>
            <div class="field"><label for="cm">Max discount ₹ (0 = no cap)</label><input id="cm" class="input" type="number" name="m" [(ngModel)]="e.maxDiscount" /></div>
            <div class="field"><label for="cmo">Minimum order ₹</label><input id="cmo" class="input" type="number" name="mo" [(ngModel)]="e.minOrder" /></div>
            <div class="field"><label for="cu">Usage limit (0 = unlimited)</label><input id="cu" class="input" type="number" name="u" [(ngModel)]="e.usageLimit" /></div>
            <div class="field"><label for="cs">Starts</label><input id="cs" class="input" type="date" name="s" [(ngModel)]="e.startsAt" /></div>
            <div class="field"><label for="ce">Ends</label><input id="ce" class="input" type="date" name="e" [(ngModel)]="e.endsAt" /></div>
            <div class="field span-2"><label for="csc">Applies to</label><select id="csc" class="select" name="sc" [(ngModel)]="e.scope" (ngModelChange)="e.scopeIds = []"><option value="all">Entire order</option><option value="category">Specific categories</option><option value="product">Specific products</option></select></div>
            @if (e.scope !== 'all') {
              <div class="span-2 row wrap">
                @for (o of e.scope === 'category' ? cats() : db.products(); track o.id) { <button type="button" class="chip" [class.active]="e.scopeIds.includes(o.id)" (click)="toggleScope(e, o.id)">{{ o.name }}</button> }
              </div>
            }
          </div>
          <div class="row"><button class="btn" type="submit">Save coupon</button><button class="btn btn-ghost" type="button" (click)="editing.set(null)">Cancel</button></div>
        </form>
      </div>
    }
  `,
})
export class AdminCoupons {
  protected db = inject(DbService);
  private toast = inject(ToastService);
  protected editing = signal<Coupon | null>(null);
  protected cats = computed(() => this.db.categories().filter((c) => !c.smart));
  private today = new Date().toISOString().slice(0, 10);

  live(c: Coupon) {
    return c.active && c.startsAt <= this.today && c.endsAt >= this.today && (!c.usageLimit || c.used < c.usageLimit);
  }
  scopeLabel(c: Coupon) {
    if (c.scope === 'all') return 'Entire order';
    const names = c.scopeIds.map((id) => (c.scope === 'category' ? this.db.categories() : this.db.products()).find((x) => x.id === id)?.name ?? id);
    return names.join(', ');
  }
  isNew(c: Coupon) {
    return !this.db.coupons().some((x) => x.id === c.id);
  }
  clone(c: Coupon) {
    return structuredClone(c);
  }
  create() {
    this.editing.set({ id: this.db.uid('c'), code: '', description: '', type: 'percent', value: 10, minOrder: 0, maxDiscount: 0, startsAt: this.today, endsAt: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10), usageLimit: 0, used: 0, scope: 'all', scopeIds: [], active: true });
  }
  toggleScope(c: Coupon, id: string) {
    c.scopeIds = c.scopeIds.includes(id) ? c.scopeIds.filter((x) => x !== id) : [...c.scopeIds, id];
  }
  toggle(c: Coupon) {
    this.db.coupons.update((l) => l.map((x) => (x.id === c.id ? { ...x, active: !x.active } : x)));
  }
  save() {
    const c = this.editing()!;
    c.code = c.code.trim().toUpperCase().replace(/\s+/g, '');
    if (!/^[A-Z0-9]{3,20}$/.test(c.code)) return this.toast.error('Use 3–20 letters/numbers for the code');
    if (this.db.coupons().some((x) => x.code === c.code && x.id !== c.id)) return this.toast.error('That code already exists');
    if (c.value <= 0 || (c.type === 'percent' && c.value > 90)) return this.toast.error('Enter a sensible discount value');
    if (c.scope !== 'all' && !c.scopeIds.length) return this.toast.error('Pick at least one category or product');
    this.db.coupons.update((l) => (this.isNew(c) ? [c, ...l] : l.map((x) => (x.id === c.id ? c : x))));
    this.editing.set(null);
    this.toast.show('Coupon saved', { body: c.code });
  }
  remove(c: Coupon) {
    if (confirm(`Delete coupon ${c.code}?`)) this.db.coupons.update((l) => l.filter((x) => x.id !== c.id));
  }
}
