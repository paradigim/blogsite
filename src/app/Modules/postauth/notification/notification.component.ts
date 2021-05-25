import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { format } from 'date-fns';
import { concat, Subject } from 'rxjs';
import { filter, first, single, skip, skipWhile, take, takeUntil } from 'rxjs/operators';
import { InteractionService } from 'src/app/services/interaction.service';
import { DateService } from 'src/app/services/date.service';
import { Router } from '@angular/router';
import { ConditionalExpr, isNgTemplate } from '@angular/compiler';
import { post } from 'jquery';
import { PushNotification } from 'src/app/services/push-notification.service';
import { DataExchangeService } from 'src/app/services/data-exchange.service';


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
    private router: Router,
    private data: DataExchangeService
  ) {
  }

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user){
        this.userId = user.uid;
        this.getNotification();
      }
    });
    this.data.setPageStatus(false);
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
    this.postNotificationIds = [];
    this.interaction.getAllNotification()
      .pipe(take(1))
      .subscribe(data => {
        if (data.length > 0) {
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
          
          // based on post id we need to remove notifications which has same postid
          const uniqueObject = {};
          const uniqueArray = [];
          for (let i in this.postNotificationIds) {
            // Extract the title
            const objTitle = this.postNotificationIds[i]['postId'];
  
            // Use the title as the index
            uniqueObject[objTitle] = this.postNotificationIds[i];
          }

          // Loop to push unique object into array
          for (let i in uniqueObject) {
            uniqueArray.push(uniqueObject[i]);
          }

          if (uniqueArray.length > 0) {
            this.getAllNotificationPost(uniqueArray);
          } else {
            this.isDataLoaded = false;
          }
        } else {
          this.isDataLoaded = false;
        }
      });
  }

  getAllNotificationPost(postIds) {
    this.interaction.getAllPosts()
      .subscribe(posts => {
        this.postToShowInNotification = [];
        postIds.forEach((item, i) => {
          this.postToShowInNotification = [...this.postToShowInNotification, ...posts.filter(val => val.id === item.postId)];
          if (this.postToShowInNotification?.length > 0) {
            if (i <= this.postToShowInNotification?.length - 1) {
              this.postToShowInNotification[i].notificationId = item.notificationId;
              this.postToShowInNotification[i].deletedBy = item.deletedBy;
            }
          }
        });
        this.isDataLoaded = false;
      },
      (err) => {
        this.isDataLoaded = false;
      })
  }


  deleteNotification(index, postid, notificationId, e, deletedBy = []) {
    e.stopPropagation();
    this.deleteLoader = true;
    this.deleteIndex = index;

    if (deletedBy?.length > 0) {
      const updatedDeletedByUserIndex = deletedBy.findIndex(item => item === this.userId);
      if (updatedDeletedByUserIndex < 0) {
        deletedBy.push(this.userId);
      }
    } else {
      deletedBy.push(this.userId);
    }

    setTimeout(() => {
      this.interaction.deleteNotificationFromDatabase(postid, notificationId, deletedBy).then(res => {
        this.postToShowInNotification.splice(index, 1);
        this.deleteLoader = false;
        this.deleteIndex = -1;
      });
    }, 1000);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

  }

}
