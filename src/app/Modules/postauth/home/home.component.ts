import { Component, OnDestroy, OnInit } from '@angular/core';
import { InteractionService } from 'src/app/services/interaction.service';
import { Router } from '@angular/router';
import { filter, skipWhile, switchMap, take, takeUntil } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, pipe, Subject } from 'rxjs';
import { DateService } from 'src/app/services/date.service';
import { PushNotification } from 'src/app/services/push-notification.service';
import { DataExchangeService } from 'src/app/services/data-exchange.service';
import { CdkVirtualScrollViewport, FixedSizeVirtualScrollStrategy, VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PostService } from 'src/app/services/post.service';
import { PostData } from 'src/app/Models/post';
import * as _ from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { CommonErrorDialogComponent } from 'src/app/Components/common-error-dialog/common-error-dialog.component';
import { Overlay } from '@angular/cdk/overlay';
import { UserService } from 'src/app/state/user/user.service';
import { UserQuery } from 'src/app/state/user/user.query';
import { UserData } from 'src/app/Models/user';
import { fadeHeight } from 'src/app/animation/fade-height';


export interface VirtualScrollStrategy {
  scrolledIndexChange: Observable<number>;
  attach(viewport: CdkVirtualScrollViewport): void;
  detach(): void;
  onContentScrolled(): void;
  onDataLengthChanged(): void;
  onContentRendered(): void;
  onRenderedOffsetChanged(): void;
  scrollToIndex(index: number, behavior: ScrollBehavior): void;
}

export class CustomVirtualScrollStrategy extends FixedSizeVirtualScrollStrategy {
  constructor() {
    super(50, 250, 500);
  }
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [{provide: VIRTUAL_SCROLL_STRATEGY, useClass: CustomVirtualScrollStrategy}],
  animations: [
    fadeHeight
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  likeCount: number;
  postData: any;
  userId: number;
  checkFollow = false;
  isDataLoaded = false;
  unSubscribe = new Subject();
  followDate = new Date().getTime();
  message;
  userFCMToken = [];
  totalComment = 0;
  updateCountToPostId = '';
  screenHeight: number;
  showSnackbarStatus = false;
  snackBarText = '';
  isNewPost = false;
  user: UserData;

  constructor(
    private interaction: InteractionService,
    private router: Router,
    private date: DateService,
    private pushNotificationService: PushNotification,
    private data: DataExchangeService,
    private postService: PostService,
    private matDialog: MatDialog,
    private overlay: Overlay,
    private userQuery: UserQuery
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
    //fcm
    // this.pushNotificationService.receiveMessage();
    // this.message = this.pushNotificationService.currentMessage;
    //fcm

    this.data.setPageStatus(false);

    this.isDataLoaded = true;
    this.getAllPosts();

    this.data.newPostData$
      .pipe(
        skipWhile(res => !res)
      )
      .subscribe(post => {
        if (post) {
          this.postData = this.postData.filter(item => item.id !== post.id);
          this.showSnackbarStatus = false;
          this.isNewPost = true;
          this.getNewlyAddedPostFromDatabase(post);
        }
      })

    this.data.deletedPostId$
      .pipe(
        skipWhile(res => !res)
      )
      .subscribe(postId => {
        if (postId) {
          this.data.saveDeletedPostId(null);
          this.postData = this.postData.filter(item => item.id !== postId);
          this.showSnackbarStatus = true;
          this.snackBarText = 'Post Deleted';
        }
      })
  }

  handleSnackbarStatus(e) {
    this.showSnackbarStatus = true;
    this.snackBarText = e === 'added' ? 'Bookmark added' : 'Bookmark removed';
  }

  handleSnackbarClose(e) {
    if (e) {
      this.showSnackbarStatus = false;
      this.snackBarText = '';
    }
  }

  getNewlyAddedPostFromDatabase(post) {
    this.postService.getNewPost(post.id)
    .pipe(
      skipWhile(res => !res),
      take(1)
    )
    .subscribe(post => {
      setTimeout(() => {
        this.isNewPost = false;
        this.showSnackbarStatus = true;
        this.data.saveNewPostData(null);
        this.snackBarText = 'Posted';
        this.postData.unshift(post);
      }, 2000)
    }, err => {
      this.matDialog.open(CommonErrorDialogComponent, {
        data: {
          message: err.error.message
        },
        width: '300px',
        autoFocus: false,
        scrollStrategy: this.overlay.scrollStrategies.noop()
      });
    });
  }

  // new database code #start
  getAllPosts() {
    this.postService.getAllPosts()
    .pipe(
      skipWhile(res => !res),
      take(1)
    )
    .subscribe((posts: PostData[]) => {
      this.postData = _.orderBy(posts, ['id'], ['desc']);
      this.isDataLoaded = false;
    }, err => {
      this.matDialog.open(CommonErrorDialogComponent, {
        data: {
          message: err.error.message
        },
        width: '300px',
        autoFocus: false,
        scrollStrategy: this.overlay.scrollStrategies.noop()
      });
    });  
  }
  // new database code #end

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
      .pipe(take(1))
      .subscribe(data => {
        if (data?.fcmToken.length > 0) {
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
  // allPosts(): void {
  //   const users = this.interaction.getAllUser().pipe(take(1),takeUntil(this.unSubscribe));
  //   this.interaction.getAllPosts()
  //     .pipe(take(1))
  //     .pipe(takeUntil(this.unSubscribe))
  //     .subscribe((data: any) => {
  //       this.postData = data;
  //       users.subscribe(users => {
  //         users.map(user => {
  //           if (user.follower.includes(this.userId)) {
  //             this.postData.forEach((post, i) => {
  //               if (post.userid === user.id) {
  //                 this.postData[i]['followStatus'] = true;
  //               } 
  //             });
  //           }
  //         })
  //         this.data.loadAfterNewPost(false);
  //         this.isDataLoaded = false;
  //       })
  //     });
  // }

  deletePostFromList(e, i) {
    console.log('E I', e, i);
    if (e) {
      this.postData.splice(i, 1);
      // this.allPosts();
    }
    this.showSnackbarStatus = true;
    this.snackBarText = 'Deleted';
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
        userId: this.user.id,
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
