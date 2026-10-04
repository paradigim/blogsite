import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DeliveryService } from '../core/services/delivery.service';
import { Icon } from './icon';
import { InrPipe } from './inr.pipe';

@Component({
  selector: 'app-pincode',
  imports: [FormsModule, Icon, InrPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    form { display: flex; gap: 8px; }
    .input-group { flex: 1; }
    .res { margin-top: 10px; display: flex; gap: 10px; align-items: flex-start; font-size: .88rem; font-weight: 700; padding: 10px 12px; border-radius: 12px; line-height: 1.45; }
    .ok { background: var(--leaf-soft); color: #2f5d1e; }
    .no { background: var(--danger-soft); color: var(--danger); }
    .soon { background: var(--warn-soft); color: var(--warn); }
    .res small { display: block; font-weight: 600; opacity: .9; }
    :host(.dark) .input-group { border-color: #333; }
  `,
  template: `
    <form (ngSubmit)="check()">
      <div class="input-group">
        <span class="prefix"><app-icon name="pin" [size]="18" /></span>
        <input name="pin" [(ngModel)]="pin" inputmode="numeric" maxlength="6" placeholder="Enter delivery pincode" aria-label="Delivery pincode" autocomplete="postal-code" />
      </div>
      <button class="btn" [class.btn-yellow]="dark()" [class.btn-sm]="small()" type="submit">Check</button>
    </form>
    @if (result(); as r) {
      <div class="res" [class.ok]="r.ok" [class.no]="!r.ok && !r.comingSoon" [class.soon]="r.comingSoon" role="status">
        <app-icon [name]="r.ok ? 'check-circle' : 'info'" [size]="18" />
        <div>
          {{ r.ok ? 'Delivery available to your location.' : r.message }}
          @if (r.ok && r.zone; as z) {
            <small>{{ z.name }} · {{ z.eta }} · Delivery {{ z.charge | inr }}, free above {{ z.freeAbove | inr }}</small>
          }
        </div>
      </div>
    }
  `,
})
export class PincodeChecker {
  private delivery = inject(DeliveryService);
  readonly small = input(false);
  readonly dark = input(false);
  protected pin = this.delivery.pincode();
  private checked = signal(!!this.pin);
  protected result = computed(() => (this.checked() ? this.delivery.status() : null));

  check() {
    this.delivery.setPincode(String(this.pin ?? '').trim());
    this.checked.set(true);
  }
}
