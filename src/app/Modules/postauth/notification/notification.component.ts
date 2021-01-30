import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { format } from 'date-fns';
import { Subject } from 'rxjs';
import { filter, skipWhile, take, takeUntil } from 'rxjs/operators';
import { InteractionService } from 'src/app/services/interaction.service';
import { DateService } from 'src/app/services/date.service';
import { Router } from '@angular/router';
import { isNgTemplate } from '@angular/compiler';
import { post } from 'jquery';

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
  postToShowInNotification = [];
  postNotificationIds = [];

  constructor(
    private afAuth: AngularFireAuth,
    private interaction: InteractionService,
    private date: DateService,
    private router: Router,
    private cdref: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user){
        this.userId = user.uid;
        this.getNotification();
      }
    });

    // this.dataService.userAlertForNotification$
    // .subscribe(data => {
    //   this.userNotificationAlert = data;
    //   console.log('DATA---------', this.userNotificationAlert);
    // })

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
    // this.interaction.getAllUser()
    //   .pipe(takeUntil(this.ngUnsubscribe))
    //   .subscribe(user => {
    //     this.userData = user;
    //   });
    this.interaction.getAllNotification()
      .pipe(take(1))
      .subscribe(data => {
        data.map(val => {
          const ifDeletedByUser = val.deletedByUsers;
          const checkIfUserDeleteNotification = val.deletedByUsers.filter(item => item === this.userId);
          const notificationFilter = val.deletePostByUserToAllow.filter(item => item === this.userId && checkIfUserDeleteNotification.length <= 0);
          if (notificationFilter.length > 0) {
            this.postNotificationIds.push({
              postId: val.notificationPostId,
              notificationId: val.id,
              deletedBy: ifDeletedByUser
            });
          }
        })
        console.log('DELETE: ', this.postNotificationIds);
        if (this.postNotificationIds.length > 0) {
          this.getAllNotificationPost(this.postNotificationIds);
        } else {
          this.isDataLoaded = false;
        }
      });
  }

  getAllNotificationPost(postIds) {
    this.interaction.getAllPosts()
      .pipe(take(1))
      .subscribe(posts => {
        console.log('ALL POSTS: ', posts);
        console.log('POST IDS: ', postIds);
        postIds.map((item, i) => {
          this.postToShowInNotification = [...this.postToShowInNotification, ...posts.filter(val => val.id === item.postId)];
          this.postToShowInNotification[i].notificationId = item.notificationId;
          this.postToShowInNotification[i].deletedBy = item.deletedBy;
        });
        console.log('POSTS: ', this.postToShowInNotification);
        this.isDataLoaded = false;
      },
      (err) => {
        this.isDataLoaded = false;
      })
  }


  deleteNotification(index, postid, notificationId, e, deletedBy) {
    e.stopPropagation();
    this.deleteLoader = true;
    this.deleteIndex = index;

    if (deletedBy.length > 0) {
      const updatedDeletedByUserIndex = deletedBy.findIndex(item => item === this.userId);
      if (updatedDeletedByUserIndex < 0) {
        deletedBy.push(this.userId);
      }
    } else {
      deletedBy.push(this.userId);
    }



    //this.interaction.deleteNotificationFromDatabase(postid, notificationId)
    setTimeout(() => {
      this.interaction.deleteNotificationFromDatabase(postid, notificationId, deletedBy);
      this.postToShowInNotification.splice(index, 1);
      this.deleteLoader = false;
      this.deleteIndex = -1;
    }, 1000);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

  }

}
