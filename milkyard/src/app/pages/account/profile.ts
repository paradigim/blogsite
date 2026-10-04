import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-account-profile',
  imports: [FormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `h1 { font-size: 2rem; } .card { max-width: 640px; } .ro { background: var(--line-2); }`,
  template: `
    <h1>Profile</h1>
    <form class="card stack" (ngSubmit)="save()">
      <div class="grid-2">
        <div class="field span-2"><label for="pn">Full name</label><input id="pn" class="input" name="name" [(ngModel)]="f.name" required /></div>
        <div class="field"><label for="pm">Mobile number</label><input id="pm" class="input ro" [value]="'+91 ' + auth.user()?.phone" readonly /><span class="hint">Your login number. Contact support to change it.</span></div>
        <div class="field"><label for="pa">Alternate phone</label><input id="pa" class="input" name="alt" [(ngModel)]="f.altPhone" inputmode="tel" maxlength="10" /></div>
        <div class="field span-2"><label for="pe">Email address</label><input id="pe" class="input" type="email" name="email" [(ngModel)]="f.email" /></div>
      </div>
      <p class="tiny muted mb-0">Member since {{ auth.user()?.createdAt | date: 'MMMM y' }}</p>
      <div><button class="btn" type="submit">Save changes</button></div>
    </form>
  `,
})
export class AccountProfile {
  protected auth = inject(AuthService);
  private toast = inject(ToastService);
  protected f = { name: this.auth.user()?.name ?? '', email: this.auth.user()?.email ?? '', altPhone: this.auth.user()?.altPhone ?? '' };
  save() {
    if (!this.f.name.trim()) return this.toast.error('Name is required');
    if (this.f.email && !/^\S+@\S+\.\S+$/.test(this.f.email)) return this.toast.error('Please enter a valid email');
    this.auth.updateProfile(this.f);
    this.toast.show('Profile updated');
  }
}
