import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { DeliveryService } from '../../core/services/delivery.service';
import { OrderService } from '../../core/services/order.service';
import { PaymentService } from '../../core/services/payment.service';
import { ToastService } from '../../core/services/toast.service';
import { SeoService } from '../../core/services/seo.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { Address, PaymentMethod } from '../../core/models';
import { AddressForm } from '../../shared/address-form';
import { Icon } from '../../shared/icon';
import { InrPipe } from '../../shared/inr.pipe';

@Component({
  selector: 'app-checkout',
  imports: [RouterLink, FormsModule, AddressForm, Icon, InrPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './checkout.scss',
  templateUrl: './checkout.html',
})
export class CheckoutPage {
  protected auth = inject(AuthService);
  protected cart = inject(CartService);
  protected delivery = inject(DeliveryService);
  private orders = inject(OrderService);
  protected payments = inject(PaymentService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private analytics = inject(AnalyticsService);

  protected user = computed(() => this.auth.user()!);
  protected addresses = computed(() => this.user()?.addresses ?? []);
  protected selectedId = linkedSignal(() => (this.addresses().find((a) => a.isDefault) ?? this.addresses()[0])?.id ?? '');
  protected selected = computed(() => this.addresses().find((a) => a.id === this.selectedId()));
  protected adding = linkedSignal(() => this.addresses().length === 0);
  protected editing = signal<Address | null>(null);
  protected method = signal<PaymentMethod>('UPI');
  protected processing = signal(false);
  protected code = '';
  protected couponError = signal('');
  protected agreed = signal(true);

  protected totals = computed(() => this.cart.computeTotals(this.selected()?.pincode ?? ''));
  protected svc = computed(() => (this.selected() ? this.delivery.check(this.selected()!.pincode) : null));
  protected canPay = computed(() => !!this.selected() && !!this.svc()?.ok && !this.totals().belowMinimum && this.cart.lines().length > 0 && this.agreed());

  protected methods: { id: PaymentMethod; label: string; sub: string; icon: string }[] = [
    { id: 'UPI', label: 'UPI', sub: 'Google Pay, PhonePe, Paytm, BHIM', icon: 'upi' },
    { id: 'Card', label: 'Credit / Debit card', sub: 'Visa, Mastercard, RuPay', icon: 'card' },
    { id: 'NetBanking', label: 'Net banking', sub: 'All major Indian banks', icon: 'bank' },
    { id: 'Wallet', label: 'Wallets', sub: 'Paytm, Amazon Pay, Mobikwik', icon: 'wallet' },
  ];

  constructor() {
    inject(SeoService).set({ title: 'Checkout', path: '/checkout' });
    if (this.auth.needsProfile()) this.router.navigate(['/login'], { queryParams: { redirect: '/checkout' } });
    if (!this.cart.lines().length) this.router.navigateByUrl('/cart');
    this.analytics.beginCheckout(this.cart.totals().total);
  }

  saveAddress(a: Address) {
    const saved = this.auth.saveAddress(a);
    this.selectedId.set(saved.id);
    this.delivery.setPincode(saved.pincode);
    this.adding.set(false);
    this.editing.set(null);
  }
  pick(a: Address) {
    this.selectedId.set(a.id);
    this.delivery.setPincode(a.pincode);
  }
  apply() {
    this.couponError.set(this.cart.applyCoupon(this.code));
    if (!this.couponError()) this.code = '';
  }

  async pay() {
    if (!this.canPay()) return;
    this.processing.set(true);
    const res = await this.orders.place(this.selected()!, this.method());
    this.processing.set(false);
    if (!res.ok) {
      this.toast.error('Payment could not be completed', res.error);
      return;
    }
    this.analytics.purchase(res.order!.id, res.order!.total);
    this.router.navigate(['/order-success', res.order!.id]);
  }
}
