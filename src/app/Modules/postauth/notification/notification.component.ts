import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { format } from 'date-fns';
import { Subject } from 'rxjs';
import { skipWhile, take, takeUntil } from 'rxjs/operators';
import { InteractionService } from 'src/app/services/interaction.service';
import { DateService } from 'src/app/services/date.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  ngUnsubscribe = new Subject();
  userData = [];
  userId = '';
  followingUserId = [];
  postNotification = [];
  todayDate = format(new Date(), 'dd MMM, yyyy');
  isDataLoaded = true;
  deleteLoader = false;
  deleteIndex = -1;

  constructor(
    private afAuth: AngularFireAuth,
    private interaction: InteractionService,
    private date: DateService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user){
        this.userId = user.uid;
        this.getNotification();
      }
    });

    // this.setReadClass();
  }

  checkRead(readData) {
    const ifAlreadyRead = readData.filter(id => id === this.userId);
    if (ifAlreadyRead.length > 0) {
      return false;
    }
    return true;
  }

  changeReadStatus(item) {
    this.router.navigate(['/detail'], {
      queryParams: {
        id: item.id,
        userId: item.userid
      }
    });
    this.interaction.updateNotificationReadStatus(item.id, this.userId, item.read);
  }

  getNotification() {
    this.interaction.getAllUser()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(user => {
        this.userData = user;
        this.checkUserFollowingByMe(this.userData);
      });
  }

  checkUserFollowingByMe(userData) {
    let followTime = 0;
    userData.forEach(item => {
      const followerData = item.follower.filter(data => data.followingUserId === this.userId);
      if (followerData.length > 0) {
        followTime = followerData[0].followDate;
        //todayTime = this.date.getTime(new Date());
      }
      if (followerData.length > 0) {
        const dataToPush = {
          uid: item.id,
          followTime
        };
        this.followingUserId.push(dataToPush);
      }
    });
    this.interaction.getAllPosts()
      .pipe(skipWhile(item => item.length === 0))
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(post => {
        this.postNotification = []
        post.forEach(postItem => {
          const filterData = this.followingUserId.filter(item => item.uid === postItem.userid);
          if (filterData.length > 0 && (filterData[0].followTime < postItem.postDate)) {
            this.postNotification.unshift(postItem);
            this.isDataLoaded = false;
          }
        });
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
