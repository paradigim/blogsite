import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { InteractionService } from 'src/app/services/interaction.service';
import { Router } from '@angular/router';
import { delay, filter, skipWhile, switchMap, take, takeUntil } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { combineLatest, Subject } from 'rxjs';
import { DateService } from 'src/app/services/date.service';
import { PushNotification } from 'src/app/services/push-notification.service';
import { DataExchangeService } from 'src/app/services/data-exchange.service';
// import { PushNotification } from 'src/app/services/push-notification.service';

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

  constructor(
    private interaction: InteractionService,
    private router: Router,
    private afAuth: AngularFireAuth,
    private date: DateService,
    private pushNotificationService: PushNotification,
    private data: DataExchangeService
  ) {
    this.afAuth.authState.subscribe(user => {
      if (user){
        this.userId = user.uid;
      }
    });
  }

  ngOnInit(): void {
    this.data.isLoad$
    .pipe(filter(val => val === true))
    .subscribe(isStatus => {
      if (isStatus) {
        this.allPosts();
        this.showNotificationToUser();
      }
    });
    this.isDataLoaded = true;
    this.allPosts();
    // this.showNotificationToUser();
  }

  showNotificationToUser() {
    const notificationShowStatus = this.data.getNewPostStatus();
    console.log('N STATUS: ', notificationShowStatus);
      if (notificationShowStatus) {
        this.interaction.getUser()
        .pipe(take(1))
        .subscribe(user => {
          this.data.setNewPostStatus(false);
          console.log('USER N: ', user);
          this.fetchUserTosendNotification(user.follower);
        })
      }
  }

  fetchUserTosendNotification(followers: string[]) {
    // const obsUserArr = followers.map(userid => this.interaction.getUser(userid));

    // combineLatest(obsUserArr)
    // .subscribe((users: any[]) => {
      
    //   const body = users.filter(u => !!u.uniqueEndpoint).map(u => JSON.parse(u.uniqueEndpoint));
    //   this.pushNotificationService.addPushSubscriber(body).subscribe(res => {
    //     console.log(res);
    //   });
    // })
    
    followers.forEach(userid => {
      this.interaction.getUser(userid)
      .pipe(take(1))
      .subscribe(user => {
        if (user.uniqueEndpoint) {
          console.log('USER SEND N: ', user);
          console.log('SUB OBJ: ', JSON.parse(user.uniqueEndpoint));
          this.pushNotificationService.addPushSubscriber(JSON.parse(user.uniqueEndpoint))
          .subscribe(res => {
            console.log('PUSH RESPONSE: ', res);
          }, error => {
            console.log('RES ERROR: ', error);
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
