import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { skipWhile, take } from 'rxjs/operators';
import { DataExchangeService } from 'src/app/services/data-exchange.service';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  isDataLoaded = false;
  userData: any;

  constructor(
    private interaction: InteractionService,
    private dataExchange: DataExchangeService,
    private cdref: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isDataLoaded = true;
    this.getUserData();
  }

  getUserData(): void {
    this.dataExchange.userId$
      .pipe(
        skipWhile(val => {
          return (val === null || val === undefined || val === '');
        })
      )
      .pipe(take(1))
      .subscribe(id => {
        this.interaction.getUser(id)
          .pipe(
            skipWhile(val => {
              return (val === null || val === undefined);
            })
          )
          .pipe(take(1))
          .subscribe((data: any) => {
            this.userData = data;
            this.isDataLoaded = false;
          });
      });
  }

  signOut() {
    this.interaction.signOutUser();
  }

}
