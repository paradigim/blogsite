import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { DeliveryService } from '../../core/services/delivery.service';
import { ToastService } from '../../core/services/toast.service';
import { Address } from '../../core/models';
import { AddressForm } from '../../shared/address-form';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-account-addresses',
  imports: [AddressForm, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .head { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 18px; h1 { font-size: 2rem; margin: 0; } }
    .grid { display: grid; gap: 14px; @media (min-width: 760px) { grid-template-columns: 1fr 1fr; } }
    .a { background: #fff; border: 1.5px solid var(--line); border-radius: 22px; padding: 18px; display: flex; flex-direction: column; gap: 6px; }
    .a.def { border-color: var(--ink); }
    .a p { margin: 0; color: var(--muted); font-size: .9rem; }
    .acts { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
    .svc { font-size: .76rem; font-weight: 800; color: var(--leaf); display: flex; gap: 4px; align-items: center; }
    .svc.no { color: var(--danger); }
  `,
  template: `
    <div class="head"><h1>Saved addresses</h1>@if (!editing()) { <button class="btn btn-sm" (click)="editing.set(auth.blankAddress())"><app-icon name="plus" [size]="16" /> Add address</button> }</div>
    @if (editing(); as e) {
      <div class="card mb-3"><h3>{{ e.id ? 'Edit address' : 'New address' }}</h3><app-address-form [address]="e" (save)="save($event)" (cancel)="editing.set(null)" /></div>
    }
    <div class="grid">
      @for (a of auth.user()?.addresses ?? []; track a.id) {
        @let s = delivery.check(a.pincode);
        <div class="a" [class.def]="a.isDefault">
          <div class="row"><span class="badge" [class.badge-yellow]="a.isDefault">{{ a.label }}</span>@if (a.isDefault) { <span class="tiny bold">Default</span> }</div>
          <b>{{ a.name }} · +91 {{ a.phone }}</b>
          <p>{{ a.line1 }}@if (a.line2) {, {{ a.line2 }}}@if (a.landmark) {, {{ a.landmark }}}, {{ a.city }}, {{ a.state }} – {{ a.pincode }}</p>
          <span class="svc" [class.no]="!s.ok"><app-icon [name]="s.ok ? 'check-circle' : 'alert'" [size]="14" /> {{ s.ok ? 'Deliverable · ' + s.zone!.name : 'Not serviceable yet' }}</span>
          <div class="acts">
            <button class="btn btn-light btn-xs" (click)="editing.set(a)">Edit</button>
            @if (!a.isDefault) { <button class="btn btn-light btn-xs" (click)="auth.setDefaultAddress(a.id)">Set as default</button> }
            <button class="btn btn-ghost btn-xs" (click)="remove(a)">Delete</button>
          </div>
        </div>
      } @empty {
        @if (!editing()) { <div class="card empty span-2"><h3>No saved addresses</h3><p>Add your home or office address for faster checkout.</p></div> }
      }
    </div>
  `,
})
export class AccountAddresses {
  protected auth = inject(AuthService);
  protected delivery = inject(DeliveryService);
  private toast = inject(ToastService);
  protected editing = signal<Address | null>(null);
  save(a: Address) {
    this.auth.saveAddress(a);
    this.editing.set(null);
    this.toast.show('Address saved');
  }
  remove(a: Address) {
    if (confirm(`Delete the ${a.label} address?`)) this.auth.deleteAddress(a.id);
  }
}
