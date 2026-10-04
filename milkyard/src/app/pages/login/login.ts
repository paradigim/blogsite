import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, signal, viewChildren } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { SeoService } from '../../core/services/seo.service';
import { NotificationService } from '../../core/services/notification.service';
import { Address } from '../../core/models';
import { AddressForm } from '../../shared/address-form';
import { Icon } from '../../shared/icon';

type Step = 'phone' | 'otp' | 'profile' | 'address';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, AddressForm, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './login.scss',
  template: `
    <div class="wrap">
      <aside class="brand">
        <div class="inner">
          <img src="brand/milkyard-cow.png" alt="" class="cow" />
          <h2>Pure. Traditional. <em>Made with love.</em></h2>
          <ul>
            <li><app-icon name="check-circle" /> No passwords — just your mobile number</li>
            <li><app-icon name="check-circle" /> Track orders & save multiple addresses</li>
            <li><app-icon name="check-circle" /> Faster checkout every time</li>
          </ul>
        </div>
        <svg class="wave" viewBox="0 0 600 80" preserveAspectRatio="none"><path d="M0 40 C 150 0 300 0 450 30 C 520 44 570 50 600 40 L600 80 L0 80Z" fill="#141414"/></svg>
      </aside>

      <section class="panel">
        <div class="steps" aria-hidden="true">
          @for (s of visibleSteps(); track s; let i = $index) { <span [class.on]="stepIndex() >= i"></span> }
        </div>

        @switch (step()) {
          @case ('phone') {
            <h1>Login or sign up</h1>
            <p class="muted">@if (redirect()?.startsWith('/checkout')) { Almost there! Verify your mobile number to place your order. } @else { Enter your mobile number — we’ll send you a one-time password. }</p>
            <form (ngSubmit)="send()" class="stack mt-2">
              <div class="field">
                <label for="ph">Mobile number</label>
                <div class="input-group big">
                  <span class="prefix">🇮🇳 +91</span>
                  <input id="ph" name="phone" [(ngModel)]="phone" inputmode="numeric" maxlength="10" autocomplete="tel-national" placeholder="98XXXXXXXX" autofocus />
                </div>
                @if (error()) { <span class="error">{{ error() }}</span> }
              </div>
              <button class="btn btn-block btn-lg" type="submit" [disabled]="busy()">@if (busy()) { <span class="spinner"></span> } @else { Send OTP <app-icon name="arrow-right" /> }</button>
              <p class="tiny muted">By continuing you agree to our <a routerLink="/policies/terms" class="link">Terms</a> and <a routerLink="/policies/privacy" class="link">Privacy Policy</a>.</p>
            </form>
          }
          @case ('otp') {
            <h1>Enter OTP</h1>
            <p class="muted">Sent to <b>+91 {{ phone }}</b> · <button class="link" (click)="step.set('phone')">Change</button></p>
            @if (auth.demoOtp(); as demo) { <div class="placeholder-note mt-1">Demo mode — no SMS is sent. Use OTP <b>{{ demo }}</b></div> }
            <form (ngSubmit)="verify()" class="stack mt-2">
              <div class="otp" (paste)="paste($event)">
                @for (i of [0, 1, 2, 3, 4, 5]; track i) {
                  <input #box inputmode="numeric" maxlength="1" [value]="digits()[i]" (input)="type(i, $event)" (keydown)="key(i, $event)" [attr.aria-label]="'Digit ' + (i + 1)" autocomplete="one-time-code" />
                }
              </div>
              @if (error()) { <span class="error">{{ error() }}</span> }
              <button class="btn btn-block btn-lg" type="submit" [disabled]="busy() || code().length < 6">@if (busy()) { <span class="spinner"></span> } @else { Verify & continue }</button>
              <p class="small muted center">Didn’t get it? @if (timer() > 0) { Resend in {{ timer() }}s } @else { <button type="button" class="link" (click)="send()">Resend OTP</button> }</p>
            </form>
          }
          @case ('profile') {
            <h1>Welcome to MILKYARD!</h1>
            <p class="muted">Tell us a little about yourself.</p>
            <form (ngSubmit)="saveProfile()" class="stack mt-2">
              <div class="field"><label for="nm">Full name *</label><input id="nm" class="input" name="name" [(ngModel)]="profile.name" required autocomplete="name" /></div>
              <div class="field"><label for="em">Email address *</label><input id="em" class="input" type="email" name="email" [(ngModel)]="profile.email" required autocomplete="email" /><span class="hint">For order confirmations and invoices</span></div>
              <div class="field"><label for="alt">Alternate phone (optional)</label><input id="alt" class="input" name="alt" [(ngModel)]="profile.altPhone" inputmode="tel" maxlength="10" /></div>
              @if (error()) { <span class="error">{{ error() }}</span> }
              <button class="btn btn-block btn-lg" type="submit">Continue</button>
            </form>
          }
          @case ('address') {
            <h1>Where should we deliver?</h1>
            <p class="muted">We currently deliver across Kolkata.</p>
            <div class="mt-2"><app-address-form [address]="auth.blankAddress()" submitLabel="Save & continue" [cancellable]="false" (save)="saveAddress($event)" /></div>
            <button class="link small mt-2" (click)="finish()">I’ll add this later</button>
          }
        }
      </section>
    </div>
  `,
})
export class LoginPage {
  protected auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private notify = inject(NotificationService);
  readonly redirect = input<string>();

  protected step = signal<Step>('phone');
  protected phone = '';
  protected busy = signal(false);
  protected error = signal('');
  protected digits = signal<string[]>(['', '', '', '', '', '']);
  protected code = computed(() => this.digits().join(''));
  protected timer = signal(0);
  protected isNew = signal(false);
  protected profile = { name: '', email: '', altPhone: '' };
  private boxes = viewChildren<ElementRef<HTMLInputElement>>('box');

  protected visibleSteps = computed<Step[]>(() => (this.isNew() ? ['phone', 'otp', 'profile', 'address'] : ['phone', 'otp']));
  protected stepIndex = computed(() => this.visibleSteps().indexOf(this.step()));

  constructor() {
    inject(SeoService).set({ title: 'Login or Sign up', path: '/login' });
    if (this.auth.isLoggedIn() && this.auth.needsProfile()) {
      this.isNew.set(true);
      this.phone = this.auth.user()!.phone;
      this.step.set('profile');
    } else if (this.auth.isLoggedIn()) queueMicrotask(() => this.finish());
  }

  async send() {
    this.error.set('');
    const n = this.auth.normalise(this.phone);
    if (!/^[6-9]\d{9}$/.test(n)) return this.error.set('Please enter a valid 10-digit Indian mobile number.');
    this.phone = n;
    this.busy.set(true);
    await this.auth.sendOtp(n);
    this.busy.set(false);
    this.digits.set(['', '', '', '', '', '']);
    this.step.set('otp');
    this.timer.set(30);
    const t = setInterval(() => {
      this.timer.update((x) => x - 1);
      if (this.timer() <= 0) clearInterval(t);
    }, 1000);
    setTimeout(() => this.boxes()[0]?.nativeElement.focus(), 50);
  }

  type(i: number, e: Event) {
    const el = e.target as HTMLInputElement;
    const v = el.value.replace(/\D/g, '').slice(-1);
    this.digits.update((d) => d.map((x, j) => (j === i ? v : x)));
    el.value = v;
    if (v && i < 5) this.boxes()[i + 1].nativeElement.focus();
    if (this.code().length === 6) this.verify();
  }
  key(i: number, e: KeyboardEvent) {
    if (e.key === 'Backspace' && !this.digits()[i] && i > 0) this.boxes()[i - 1].nativeElement.focus();
  }
  paste(e: ClipboardEvent) {
    const v = (e.clipboardData?.getData('text') ?? '').replace(/\D/g, '').slice(0, 6);
    if (!v) return;
    e.preventDefault();
    this.digits.set([...v.padEnd(6, ' ')].map((c) => c.trim()));
    if (v.length === 6) this.verify();
  }

  async verify() {
    if (this.busy()) return;
    this.error.set('');
    this.busy.set(true);
    const r = await this.auth.verifyOtp(this.code());
    this.busy.set(false);
    if (!r.ok) {
      this.error.set('That OTP is incorrect. Please try again.');
      this.digits.set(['', '', '', '', '', '']);
      this.boxes()[0]?.nativeElement.focus();
      return;
    }
    if (r.isNew) {
      this.isNew.set(true);
      this.step.set('profile');
      return;
    }
    this.toast.show(r.isAdmin ? 'Welcome back, Admin' : `Welcome back, ${this.auth.user()!.name.split(' ')[0]}!`, { tone: 'success' });
    this.finish();
  }

  saveProfile() {
    this.error.set('');
    if (!this.profile.name.trim()) return this.error.set('Please enter your name.');
    if (!/^\S+@\S+\.\S+$/.test(this.profile.email)) return this.error.set('Please enter a valid email address.');
    this.auth.updateProfile({ name: this.profile.name.trim(), email: this.profile.email.trim(), altPhone: this.profile.altPhone });
    this.notify.customer('registration', 'Welcome to MILKYARD', `Hi ${this.profile.name}, your account is ready.`);
    this.notify.push({ audience: 'admin', channel: 'in-app', type: 'customer', title: 'New customer registered', body: `${this.profile.name} · +91 ${this.phone}`, link: '/admin/customers' });
    this.step.set('address');
  }

  saveAddress(a: Address) {
    this.auth.saveAddress(a);
    this.toast.show('Address saved');
    this.finish();
  }

  finish() {
    const r = this.redirect();
    if (r && r.startsWith('/')) this.router.navigateByUrl(r);
    else this.router.navigateByUrl(this.auth.isAdmin() ? '/admin' : '/account');
  }
}
