import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { InteractionService } from 'src/app/services/interaction.service';
import { Router } from '@angular/router';
import { filter, skipWhile, switchMap, take, takeUntil } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { Subject } from 'rxjs';
import { DateService } from 'src/app/services/date.service';
import { PushNotification } from 'src/app/services/push-notification.service';
import { DataExchangeService } from 'src/app/services/data-exchange.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  likeCount: number;
  postData: any;
  userId: string;
  checkFollow = false;
  isDataLoaded = false;
  unSubscribe = new Subject();
  followDate = new Date().getTime();
  message;
  userFCMToken = [];
  totalComment = 0;
  updateCountToPostId = '';
  screenHeight: number;

  constructor(
    private interaction: InteractionService,
    private router: Router,
    private afAuth: AngularFireAuth,
    private date: DateService,
    private pushNotificationService: PushNotification,
    private data: DataExchangeService,
    private cdref: ChangeDetectorRef
  ) {
    this.afAuth.authState.subscribe(user => {
      if (user){
        this.userId = user.uid;
        this.pushNotificationService.requestPermission();
      }
    });
  }

  ngOnInit(): void {
    //fcm
    this.pushNotificationService.receiveMessage();
    this.message = this.pushNotificationService.currentMessage;
    //fcm

    this.data.setPageStatus(false);

    this.data.isLoad$
    .pipe(filter(val => val === true))
    .subscribe(isStatus => {
      if (isStatus) {
        this.allPosts();
        this.showNotificationToUser();
        this.data.loadAfterNewPost(false);
      }
    });
    this.isDataLoaded = true;
    this.allPosts();
  }

  redirectLink(e) {
    e.stopPropagation();
  }

  setCommentsLength(e, postId) {
    this.updateCountToPostId = postId;
    this.totalComment = e;
  }

  showNotificationToUser() {
    const notificationShowStatus = this.data.getNewPostStatus();
      if (notificationShowStatus) {
        this.interaction.getUser()
        .pipe(skipWhile(data => !data))
        .pipe(take(1))
        .subscribe(user => {
          this.data.setNewPostStatus(false);
          this.fetchUserTosendNotification(user.follower);
        })
      }
  }

  fetchUserTosendNotification(followers: string[]) {
    followers.forEach((userid, i) => {
      this.interaction.getUser(userid)
      // .pipe(take(1))
      .subscribe(data => {
        if (data.fcmToken.length > 0) {
          data?.fcmToken.forEach(item => {
            this.userFCMToken.push(item)
          });
        }
        if (i === followers.length - 1) {
          this.pushNotificationService.addPushSubscriber(this.userFCMToken, 'Heyllo.com', 'You have got a notification')
          .pipe(takeUntil(this.unSubscribe))
          .subscribe(res => {
            this.userFCMToken = [];
          }, 
          err => {
            this.userFCMToken = [];
          });
        }
      });
    });
  }

  // set following status on init
  allPosts(): void {
    const users = this.interaction.getAllUser().pipe(takeUntil(this.unSubscribe));
    this.interaction.getAllPosts()
      .pipe(take(1))
      .pipe(takeUntil(this.unSubscribe))
      .subscribe((data: any) => {
        this.postData = data;
        users.subscribe(users => {
          users.map(user => {
            if (user.follower.includes(this.userId)) {
              this.postData.forEach((post, i) => {
                if (post.userid === user.id) {
                  this.postData[i]['followStatus'] = true;
                } 
              });
            }
          })
          this.data.loadAfterNewPost(false);
          this.isDataLoaded = false;
        })
      });
  }

  deletePostFromList(e, i) {
    if (e) {
      this.allPosts();
    }
  }

  getLikeCounts(event: number): void {
    this.likeCount = event;
  }

  stopDefaultBehaviour(e): void {
    e.cancelBubble=true;
    e.returnValue=false;
  }

  routeToBlogDetail(e: any, postid, followStatus): void { 
    this.router.navigate(['/detail'], {
      queryParams: {
        id: postid,
        userId: this.userId,
        followStatus: followStatus
      }
    });
  }


  goOtherUserProfile(userId, e) {
    e.stopPropagation();
    this.router.navigate(['/profile'], {
      queryParams: {
        userId
      }
    })
  }

  // on destroy of the component
  ngOnDestroy(): void {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }

}
