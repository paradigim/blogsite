import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Address } from '../core/models';
import { DeliveryService } from '../core/services/delivery.service';
import { Icon } from './icon';

@Component({
  selector: 'app-address-form',
  imports: [FormsModule, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .labels { display: flex; gap: 8px; flex-wrap: wrap; }
    .svc { display: flex; gap: 6px; align-items: center; font-size: .8rem; font-weight: 800; margin-top: 4px; }
    .ok { color: var(--leaf); } .no { color: var(--danger); } .soon { color: var(--warn); }
    .actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 6px; }
  `,
  template: `
    <form class="grid-2" (ngSubmit)="submit()" #f="ngForm" novalidate>
      <div class="field span-2">
        <span class="label">Save address as</span>
        <div class="labels">
          @for (l of ['Home', 'Office', 'Other']; track l) { <button type="button" class="chip" [class.active]="a.label === l" (click)="a.label = l">{{ l }}</button> }
        </div>
      </div>
      <div class="field"><label for="an">Full name *</label><input id="an" class="input" name="name" [(ngModel)]="a.name" required autocomplete="name" [class.invalid]="tried() && !a.name" /></div>
      <div class="field"><label for="ap">Mobile number *</label><input id="ap" class="input" name="phone" [(ngModel)]="a.phone" required inputmode="tel" maxlength="10" autocomplete="tel-national" [class.invalid]="tried() && !validPhone()" />@if (tried() && !validPhone()) {<span class="error">Enter a 10-digit mobile number</span>}</div>
      <div class="field span-2"><label for="a1">House / flat no., building, street *</label><input id="a1" class="input" name="line1" [(ngModel)]="a.line1" required autocomplete="address-line1" [class.invalid]="tried() && !a.line1" /></div>
      <div class="field span-2"><label for="a2">Area / locality</label><input id="a2" class="input" name="line2" [(ngModel)]="a.line2" autocomplete="address-line2" /></div>
      <div class="field"><label for="al">Landmark</label><input id="al" class="input" name="landmark" [(ngModel)]="a.landmark" placeholder="e.g. Near Deshapriya Park" /></div>
      <div class="field">
        <label for="apin">Pincode *</label>
        <input id="apin" class="input" name="pincode" [ngModel]="a.pincode" (ngModelChange)="a.pincode = $event; pin.set($event)" required inputmode="numeric" maxlength="6" autocomplete="postal-code" [class.invalid]="tried() && !svc()?.ok" />
        @if (svc(); as s) {
          <span class="svc" [class.ok]="s.ok" [class.no]="!s.ok && !s.comingSoon" [class.soon]="s.comingSoon"><app-icon [name]="s.ok ? 'check-circle' : 'info'" [size]="14" />{{ s.ok ? 'Delivery available · ' + s.zone?.name : s.message }}</span>
        }
      </div>
      <div class="field"><label for="ac">City</label><input id="ac" class="input" name="city" [(ngModel)]="a.city" autocomplete="address-level2" /></div>
      <div class="field"><label for="as">State</label><input id="as" class="input" name="state" [(ngModel)]="a.state" autocomplete="address-level1" /></div>
      <label class="check span-2"><input type="checkbox" name="def" [(ngModel)]="a.isDefault" /> Make this my default address</label>
      <div class="actions span-2">
        <button class="btn" type="submit">{{ submitLabel() }}</button>
        @if (cancellable()) { <button class="btn btn-ghost" type="button" (click)="cancel.emit()">Cancel</button> }
      </div>
    </form>
  `,
})
export class AddressForm {
  private delivery = inject(DeliveryService);
  readonly address = input.required<Address>();
  readonly submitLabel = input('Save address');
  readonly cancellable = input(true);
  readonly save = output<Address>();
  readonly cancel = output<void>();

  protected a!: Address;
  protected pin = signal('');
  protected tried = signal(false);
  protected svc = computed(() => (this.pin().length === 6 ? this.delivery.check(this.pin()) : null));

  ngOnInit() {
    this.a = { ...this.address() };
    this.pin.set(this.a.pincode);
  }
  validPhone() {
    return /^[6-9]\d{9}$/.test(String(this.a.phone).replace(/\D/g, '').slice(-10));
  }
  submit() {
    this.tried.set(true);
    if (!this.a.name || !this.a.line1 || !this.validPhone() || !this.svc()?.ok) return;
    this.save.emit({ ...this.a, phone: String(this.a.phone).replace(/\D/g, '').slice(-10) });
  }
}
