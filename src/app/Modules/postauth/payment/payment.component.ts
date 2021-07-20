import { Overlay } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { skipWhile, take } from 'rxjs/operators';
import { PaymentDialogComponent } from 'src/app/Components/payment-dialog/payment-dialog.component';
import { UserData } from 'src/app/Models/user';
import { UserQuery } from 'src/app/state/user/user.query';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {

  user: UserData;

  constructor(
    private userQuery: UserQuery,
    private matDialog: MatDialog,
    private overlay: Overlay
  ) {
    this.userQuery.getLoggedInUser()
      .pipe(
        skipWhile(res => !res),
        take(1)
      )
      .subscribe((user: UserData) => {
        this.user = user;
      });
  }

  ngOnInit(): void {
  }

  makePayment() {
    this.matDialog.open(PaymentDialogComponent, {
      width: '500px',
      scrollStrategy: this.overlay.scrollStrategies.noop()
    })
  }

}
