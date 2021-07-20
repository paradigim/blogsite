import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.css']
})
export class PaymentDialogComponent implements OnInit {

  paymentForm: FormGroup;

  constructor(
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.paymentForm = this.fb.group({
      amount: ['', Validators.required],
      accountNumber: [
        '',
        Validators.required,
        Validators.minLength(16),
        Validators.maxLength(16)
      ],
      bankName: ['', Validators.required],
      ifscCode: ['', Validators.required],
      accHolderName: ['', Validators.required]
    })
  }

}
