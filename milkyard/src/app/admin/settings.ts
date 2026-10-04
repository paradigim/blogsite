import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DbService, ADMIN_PHONE } from '../core/services/db.service';
import { ToastService } from '../core/services/toast.service';
import { StoreSettings } from '../core/models';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-admin-settings',
  imports: [FormsModule, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `.layout { display: grid; gap: 16px; @media (min-width: 1100px) { grid-template-columns: 1fr 1fr; align-items: start; } } .col { display: flex; flex-direction: column; gap: 16px; } .ro { background: #f3efe3; }`,
  template: `
    <div class="a-head"><div><h1>Settings</h1><p>Store details, notifications and security.</p></div><div class="acts"><button class="btn btn-sm" (click)="save()">Save settings</button></div></div>
    <div class="layout">
      <div class="col">
        <section class="a-card a-form">
          <h3>Store details</h3>
          <div class="grid-2">
            <div class="field"><label for="sp1">Phone 1</label><input id="sp1" class="input" [(ngModel)]="s.phones[0]" name="p1" /></div>
            <div class="field"><label for="sp2">Phone 2</label><input id="sp2" class="input" [(ngModel)]="s.phones[1]" name="p2" /></div>
            <div class="field"><label for="sw">WhatsApp number (with 91)</label><input id="sw" class="input" [(ngModel)]="s.whatsapp" name="wa" /></div>
            <div class="field"><label for="se">Email</label><input id="se" class="input" [(ngModel)]="s.email" name="em" /></div>
            <div class="field span-2"><label for="sa">Business address</label><textarea id="sa" class="textarea" rows="2" [(ngModel)]="s.address" name="ad"></textarea></div>
            <div class="field"><label for="sm">Map location (search text)</label><input id="sm" class="input" [(ngModel)]="s.mapQuery" name="mq" /></div>
            <div class="field"><label for="sh">Business hours</label><input id="sh" class="input" [(ngModel)]="s.hours" name="hr" /></div>
            <div class="field"><label for="sf">FSSAI licence no.</label><input id="sf" class="input" [(ngModel)]="s.fssai" name="fs" /></div>
            <div class="field"><label for="sg">GSTIN</label><input id="sg" class="input" [(ngModel)]="s.gstin" name="gst" /></div>
          </div>
        </section>
      </div>
      <div class="col">
        <section class="a-card a-form">
          <h3>Customer notifications</h3>
          <label class="switch"><input type="checkbox" [(ngModel)]="s.notify.sms" name="ns" /> SMS (order confirmation, status updates)</label>
          <label class="switch"><input type="checkbox" [(ngModel)]="s.notify.email" name="ne" /> Email</label>
          <label class="switch"><input type="checkbox" [(ngModel)]="s.notify.whatsapp" name="nw" /> WhatsApp (needs WhatsApp Business API)</label>
          <label class="switch"><input type="checkbox" [(ngModel)]="s.lowStockAlerts" name="ls" /> Low-stock alerts for admin</label>
        </section>
        <section class="a-card a-form">
          <h3>Security</h3>
          <div class="field"><label for="ap">Administrator mobile number</label><input id="ap" class="input ro" [value]="'+91 ' + adminPhone" readonly /><span class="hint">Configured on the server. Only this number receives the admin role after OTP verification — it cannot be changed from the browser.</span></div>
          <div class="a-note"><app-icon name="shield" [size]="14" style="display:inline-flex;vertical-align:-2px" /> Every /admin API must re-check the role server-side. Hiding the admin button is not access control.</div>
        </section>
        <section class="a-card a-form">
          <h3>Demo data</h3>
          <p class="small muted mb-0">This UI build stores everything in your browser. Reset to restore the original catalogue and sample orders.</p>
          <button class="btn btn-light btn-sm" style="align-self:flex-start" (click)="reset()"><app-icon name="refresh" [size]="16" /> Reset demo data</button>
        </section>
      </div>
    </div>
  `,
})
export class AdminSettings {
  private db = inject(DbService);
  private toast = inject(ToastService);
  protected adminPhone = ADMIN_PHONE;
  protected s: StoreSettings = structuredClone(this.db.settings());
  save() {
    this.db.settings.set(structuredClone(this.s));
    this.toast.show('Settings saved');
  }
  reset() {
    if (confirm('Reset all products, orders and settings to the demo data?')) this.db.reset();
  }
}
