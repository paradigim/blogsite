import { Injectable } from '@angular/core';
import { PaymentMethod } from '../models';

export interface PaymentRequest {
  orderId: string;
  amount: number; // in ₹
  method: PaymentMethod;
  customer: { name: string; email: string; phone: string };
}
export interface PaymentResult {
  ok: boolean;
  ref?: string;
  error?: string;
}

/** Any gateway (Razorpay, Cashfree, PhonePe PG, PayU…) implements this. */
export interface PaymentGateway {
  readonly name: string;
  pay(req: PaymentRequest): Promise<PaymentResult>;
}

/**
 * Razorpay adapter (simulated). Real integration:
 *  1. Server: POST /payments/order → creates a Razorpay order with amount*100 (paise), returns order_id
 *  2. Client: load https://checkout.razorpay.com/v1/checkout.js and open
 *       new Razorpay({ key, order_id, amount, prefill, method, handler }).open()
 *  3. Server: verify razorpay_signature (HMAC SHA256 of order_id|payment_id with key secret)
 *     and listen to the `payment.captured` webhook before marking the order Paid.
 * Never mark an order paid from the browser alone.
 */
export class RazorpayGateway implements PaymentGateway {
  readonly name = 'Razorpay';
  async pay(req: PaymentRequest): Promise<PaymentResult> {
    await new Promise((r) => setTimeout(r, 1800));
    return { ok: true, ref: `pay_${Math.random().toString(36).slice(2, 16)}` };
  }
}

/** Cash on Delivery — ready to switch on in Admin → Settings later. */
export class CodGateway implements PaymentGateway {
  readonly name = 'Cash on Delivery';
  async pay(): Promise<PaymentResult> {
    return { ok: true };
  }
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private gateways: Record<'online' | 'cod', PaymentGateway> = { online: new RazorpayGateway(), cod: new CodGateway() };
  readonly codEnabled = false;

  pay(req: PaymentRequest) {
    return (req.method === 'COD' ? this.gateways.cod : this.gateways.online).pay(req);
  }
}
