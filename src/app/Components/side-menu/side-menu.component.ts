import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserStore } from 'src/app/state/user/user.store';
import { UserQuery } from 'src/app/state/user/user.query';
import { filter, skipWhile, switchMap, take } from 'rxjs/operators';
import { UserData } from 'src/app/Models/user';
import { AuthService } from 'src/app/services/auth.service';
import { DataExchangeService } from 'src/app/services/data-exchange.service';
import { MatDialog } from '@angular/material/dialog';
import { PostDialogComponent } from '../post-dialog/post-dialog.component';
import { Overlay } from '@angular/cdk/overlay';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css'],
  host: {
    '(document:click)': 'onClick($event)',
  },
})
export class SideMenuComponent implements OnInit {
  userName = 'Anisya olga';
  defaultImageUrl = './assets/images/default-1.jpg';
  uniqueUserId = '';
  userNotificationAlert = [];
  loading = false;
  userData: Object;

  @Input() menuStatus;
  @Output() changeMenuStatus = new EventEmitter<boolean>();

  constructor(
    private userQuery: UserQuery,
    private userService: UserService,
    private dataService: DataExchangeService,
    private matDialog: MatDialog,
    public overlay: Overlay
  ) { }

  ngOnInit(): void {
    this.getLoggedInUserData();

    this.dataService.updatedUser$
      .subscribe(user => {
        this.userData = user;
      })
  }

  /**
   * fetch loggedin user data from store
   * also each time refresh page, the user data fetch from the api
   */
  getLoggedInUserData() {
    this.userQuery.getIsLoading().subscribe(res => this.loading = res);
    this.userService.getUserFromStore()
      .pipe(
        skipWhile(res => !res),
        take(1)
      )
      .subscribe(user => {
        this.userData = user;
      });
  }

  onClick(e) {
    if (e.target.parentElement.className !== 'menubar' && this.menuStatus === true) {
      this.menuStatus = false;
      this.changeMenuStatus.emit(this.menuStatus);
    }
  }

  openDialog(): void {
    this.matDialog.open(PostDialogComponent, {
      width: '500px',
      data: {
        user: this.userData
      },
      scrollStrategy: this.overlay.scrollStrategies.noop()
    })
  }

}
