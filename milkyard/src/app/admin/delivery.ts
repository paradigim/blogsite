import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DbService } from '../core/services/db.service';
import { DeliveryService, Serviceability } from '../core/services/delivery.service';
import { ToastService } from '../core/services/toast.service';
import { DeliveryZone } from '../core/models';
import { Icon } from '../shared/icon';
import { InrPipe } from '../shared/inr.pipe';

@Component({
  selector: 'app-admin-delivery',
  imports: [FormsModule, Icon, InrPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .zones { display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
    .z { background: #fff; border: 1px solid #ebe6d8; border-radius: 20px; padding: 18px; display: flex; flex-direction: column; gap: 10px; }
    .z.off { opacity: .65; }
    .z h3 { font-family: var(--font-body); font-weight: 900; font-size: 1.1rem; margin: 0; }
    .nums { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; div { background: #f8f6ef; border-radius: 12px; padding: 8px 10px; } small { display: block; color: var(--muted); font-weight: 700; font-size: .7rem; } b { font-size: 1rem; } }
    .pins { display: flex; flex-wrap: wrap; gap: 4px; span { font-size: .72rem; font-weight: 800; background: #f3efe3; padding: 3px 8px; border-radius: 6px; } }
    .tester { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
  `,
  template: `
    <div class="a-head">
      <div><h1>Delivery zones</h1><p>Serviceable pincodes, delivery charges and free-delivery rules — no code changes needed.</p></div>
      <div class="acts"><button class="btn btn-sm" (click)="create()"><app-icon name="plus" [size]="16" /> Add zone</button></div>
    </div>
    <div class="a-card mb-2">
      <div class="a-card-h"><h3>Test a pincode</h3></div>
      <form class="tester" (ngSubmit)="test()">
        <input class="input" style="max-width:200px" name="pin" [(ngModel)]="pin" placeholder="e.g. 700019" maxlength="6" />
        <input class="input" style="max-width:160px" name="amt" type="number" [(ngModel)]="amount" placeholder="Order ₹" />
        <button class="btn btn-sm" type="submit">Check</button>
        @if (result(); as r) {
          <span class="badge" [class.badge-green]="r.ok" [class.badge-red]="!r.ok && !r.comingSoon" [class.badge-amber]="r.comingSoon">{{ r.ok ? r.zone!.name + ' · delivery ' + quote() : r.message }}</span>
        }
      </form>
    </div>
    <div class="zones">
      @for (z of db.zones(); track z.id) {
        <div class="z" [class.off]="!z.active">
          <div class="row between"><h3>{{ z.name }}</h3><label class="switch"><input type="checkbox" [checked]="z.active" (change)="toggle(z)" [attr.aria-label]="'Activate ' + z.name" /> {{ z.active ? 'Active' : 'Inactive' }}</label></div>
          <span class="small muted">{{ z.area }}</span>
          <div class="nums">
            <div><small>Charge</small><b>{{ z.charge | inr }}</b></div>
            <div><small>Free above</small><b>{{ z.freeAbove | inr }}</b></div>
            <div><small>Min. order</small><b>{{ z.minOrder | inr }}</b></div>
          </div>
          <span class="small"><app-icon name="clock" [size]="14" style="display:inline-flex;vertical-align:-2px" /> {{ z.eta }} · rider cost {{ z.riderCost | inr }}</span>
          <div class="pins">@for (p of z.pincodes; track p) { <span>{{ p }}</span> }</div>
          <div class="row"><button class="btn btn-light btn-xs" (click)="editing.set(clone(z))">Edit</button><button class="btn btn-ghost btn-xs" (click)="remove(z)">Delete</button></div>
        </div>
      }
    </div>
    <p class="a-note mt-2">Expansion ready: add Madhyamgram, Barasat, New Town or a new city as a zone, list its pincodes or ranges (e.g. 700001-700020), and switch it on.</p>

    @if (editing(); as e) {
      <div class="a-modal">
        <div class="bg" (click)="editing.set(null)"></div>
        <form class="box a-form" (ngSubmit)="save()">
          <h2>{{ isNew(e) ? 'New zone' : 'Edit ' + e.name }}</h2>
          <div class="grid-2">
            <div class="field"><label for="zn">Zone name</label><input id="zn" class="input" name="n" [(ngModel)]="e.name" required /></div>
            <div class="field"><label for="ze">Delivery time (shown to customer)</label><input id="ze" class="input" name="eta" [(ngModel)]="e.eta" /></div>
            <div class="field span-2"><label for="za">Areas covered</label><input id="za" class="input" name="a" [(ngModel)]="e.area" /></div>
            <div class="field span-2"><label for="zp">Pincodes (comma separated; ranges like 700001-700020 allowed)</label><textarea id="zp" class="textarea" rows="3" name="p" [ngModel]="e.pincodes.join(', ')" (ngModelChange)="e.pincodes = split($event)"></textarea></div>
            <div class="field"><label for="zc">Delivery charge ₹</label><input id="zc" class="input" type="number" name="c" [(ngModel)]="e.charge" /></div>
            <div class="field"><label for="zf">Free delivery above ₹</label><input id="zf" class="input" type="number" name="f" [(ngModel)]="e.freeAbove" /></div>
            <div class="field"><label for="zm">Minimum order ₹</label><input id="zm" class="input" type="number" name="m" [(ngModel)]="e.minOrder" /></div>
            <div class="field"><label for="zr">Our cost per delivery ₹</label><input id="zr" class="input" type="number" name="r" [(ngModel)]="e.riderCost" /><span class="hint">Used in profit analytics</span></div>
          </div>
          <div class="row"><button class="btn" type="submit">Save zone</button><button class="btn btn-ghost" type="button" (click)="editing.set(null)">Cancel</button></div>
        </form>
      </div>
    }
  `,
})
export class AdminDelivery {
  protected db = inject(DbService);
  private delivery = inject(DeliveryService);
  private toast = inject(ToastService);
  protected editing = signal<DeliveryZone | null>(null);
  protected pin = '';
  protected amount = 800;
  protected result = signal<Serviceability | null>(null);
  protected quote = signal('');

  test() {
    const r = this.delivery.check(String(this.pin).trim());
    this.result.set(r);
    const q = this.delivery.quote(String(this.pin).trim(), +this.amount || 0);
    this.quote.set(q ? (q.charge ? `₹${q.charge} on ₹${this.amount}` : `FREE on ₹${this.amount}`) + (q.belowMinimum ? ` (below ₹${q.minOrder} minimum)` : '') : '');
  }
  split(s: string) {
    return s.split(/[\s,]+/).map((x) => x.trim()).filter((x) => /^\d{6}(-\d{6})?$/.test(x));
  }
  isNew(z: DeliveryZone) {
    return !this.db.zones().some((x) => x.id === z.id);
  }
  clone(z: DeliveryZone) {
    return structuredClone(z);
  }
  create() {
    this.editing.set({ id: this.db.uid('z'), name: '', area: '', pincodes: [], charge: 60, freeAbove: 1499, minOrder: 249, riderCost: 50, eta: 'Next day delivery', active: true });
  }
  toggle(z: DeliveryZone) {
    this.db.zones.update((l) => l.map((x) => (x.id === z.id ? { ...x, active: !x.active } : x)));
  }
  save() {
    const z = this.editing()!;
    if (!z.name.trim() || !z.pincodes.length) return this.toast.error('Add a name and at least one valid 6-digit pincode');
    this.db.zones.update((l) => (this.isNew(z) ? [...l, z] : l.map((x) => (x.id === z.id ? z : x))));
    this.editing.set(null);
    this.toast.show('Zone saved', { body: z.name });
  }
  remove(z: DeliveryZone) {
    if (confirm(`Delete ${z.name}? Customers in these pincodes will no longer be serviceable.`)) this.db.zones.update((l) => l.filter((x) => x.id !== z.id));
  }
}
