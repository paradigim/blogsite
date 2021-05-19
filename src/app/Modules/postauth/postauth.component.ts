import { Component, OnInit } from '@angular/core';
import { pipe, Subject } from 'rxjs';
import { distinctUntilChanged, take, takeUntil } from 'rxjs/operators';
import { DataExchangeService } from 'src/app/services/data-exchange.service';

@Component({
  selector: 'app-postauth',
  templateUrl: './postauth.component.html',
  styleUrls: ['./postauth.component.css']
})
export class PostauthComponent implements OnInit {

  menuStatus = false;
  ifPageIsPiggyBank = false;
  ngUnsubscribe = new Subject();

  constructor(
    private data: DataExchangeService  
  ) { }

  ngOnInit() {
    this.data.pageStatus$
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(val => {
      if (val) {
        this.ifPageIsPiggyBank = true;
      } else {
        this.ifPageIsPiggyBank = false;
      }
    })
  }

  sideMenuStatus() {
    this.menuStatus = !this.menuStatus;
  }

  setStatus(e) {
    this.menuStatus = e;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
