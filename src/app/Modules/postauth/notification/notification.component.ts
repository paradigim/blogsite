import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { format } from 'date-fns';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InteractionService } from 'src/app/services/interaction.service';
import { DateService } from 'src/app/services/date.service';

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

  constructor(
    private afAuth: AngularFireAuth,
    private interaction: InteractionService,
    private dateService: DateService
  ) {
  }

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user){
        this.userId = user.uid;
        this.getNotification();
      }
    });
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
    // let todayTime = 0;
    userData.forEach(item => {
      const followerData = item.follower.filter(data => data.followingUserId === this.userId);
      if (followerData.length > 0) {
        followTime = followerData[0].followDate;
        //todayTime = this.dateService.getTime(new Date());
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
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(post => {
        post.forEach(postItem => {
          const filterData = this.followingUserId.filter(item => item.uid === postItem.userid);
          if (filterData.length > 0 && (filterData[0].followTime < postItem.postDate)) {
            this.postNotification.unshift(postItem);
          }
        });
      });
  }

}
