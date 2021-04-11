import { Component, OnInit, Input } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { skipWhile, take } from 'rxjs/operators';
import { DataExchangeService } from 'src/app/services/data-exchange.service';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-side-menu-item',
  templateUrl: './side-menu-item.component.html',
  styleUrls: ['./side-menu-item.component.css']
})
export class SideMenuItemComponent implements OnInit {

  @Input() text = '';
  @Input() icon = '';
  @Input() route = '';
  @Input() userToNotify = [];

  showIndicator = false;
  userId = '';
  alert = false;
  userToReadNotification: boolean;

  constructor(
    private data: DataExchangeService,
    private interaction: InteractionService,
    private afAuth: AngularFireAuth,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.afAuth.authState.subscribe(auth => {
      this.userId = auth.uid;
      this.interaction.getUser()
        .subscribe(user => {
          this.userToReadNotification = user.notificationToRead;
          if (!user.notificationToRead) {
            this.alert = false;
          }
        })
    })
  }

  ngAfterViewInit() {
    this.setNotificationIndicator();
  }

  ngOnChanges() {
    // console.log('DATA NOTI ITEM: ', this.userToNotify);
    this.interaction.getNotification()
    .pipe(skipWhile(item => item.length <= 0))
    .pipe(take(1))
    .subscribe(data => {
      for(let i = 0; i < data.length; i++) {
        const userDeleteAllow = data[i].deletePostByUserToAllow.filter(item => item === this.userId);
        const userdeletedNoti = data[i].deletedByUsers.filter(item => item === this.userId);

        this.interaction.getPostWithId(data[i].notificationPostId)
        .pipe(take(1))
        .subscribe(post => {
          const postReadByUser = post?.read.filter(item => item === this.userId);
          if (this.userToReadNotification && this.text === 'Notifications' && userDeleteAllow.length > 0 && userdeletedNoti.length <= 0 && postReadByUser.length <= 0) {
            this.alert = true;
          }
        })
      }
    })
  }

  stopAlert(e) {
    e.preventDefault();
    if (this.text === 'Notifications') {
      this.interaction.chnageNotificationAlertStatus().then(res => {
        this.alert = false;
        // this.router.navigate([this.route]);
      });
    }
  }

  setNotificationIndicator() {
    const getIndicator = this.data.getIndicatorStatus();
    if (this.text === 'Notifications' && getIndicator) {
      this.showIndicator = true;
    }
  }

}
