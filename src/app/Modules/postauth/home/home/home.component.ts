import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { InteractionService } from 'src/app/services/interaction.service';
import { Router } from '@angular/router';
import { delay, skipWhile, take, takeUntil } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { Subject } from 'rxjs';
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
    console.log('HELLO INIT');
    this.data.isLoad$
    .subscribe(isStatus => {
      console.log('STATUS: ', isStatus);
      if (isStatus) {
        console.log('INSIDE STATUS: ', isStatus);
        this.allPosts();
        // this.data.loadAfterNewPost(false);
      }
    });
    this.isDataLoaded = true;
    this.allPosts();
    this.showNotificationToUser();
    
  }

  showNotificationToUser() {
    const notificationShowStatus = this.data.getNewPostStatus();
    console.log('STATUS NOTI: ', notificationShowStatus);
    if (notificationShowStatus) {
      this.interaction.getUser()
      .pipe(take(1))
      .subscribe(user => {
        console.log('CURRENT USER: ', user);
        this.fetchUserTosendNotification(user.follower);
      })
    }
  }

  fetchUserTosendNotification(followers) {
    followers.forEach(userid => {
      this.interaction.getUser(userid)
      .subscribe(user => {
        if (user.uniqueEndpoint) {
          console.log('SUB OBJ: ', JSON.parse(user.uniqueEndpoint));
          this.pushNotificationService.addPushSubscriber(JSON.parse(user.uniqueEndpoint)).subscribe();
        }
      });
    });
  }

  // set following status on init
  allPosts(): void {
    console.log('ALLPOST - 1');
    const users = this.interaction.getAllUser().pipe(takeUntil(this.unSubscribe));
    this.interaction.getAllPosts()
      .pipe(takeUntil(this.unSubscribe))
      .pipe(take(1))
      .subscribe((data: any) => {
        console.log('ALLPOST - 2');
        this.postData = data;
        users.subscribe(users => {
          console.log('ALLPOST - 3');
          users.map(user => {
            if (user.follower.includes(this.userId)) {
              console.log('POST DATA: ', this.postData.length);
              console.log('POST DATA: ', this.postData);
              this.postData.forEach((post, i) => {
                if (post.userid === user.id) {
                  this.postData[i]['followStatus'] = true;
                } 
              });
            }
          })
          this.isDataLoaded = false;
        })
      });
  }

  deletePostFromList(e, i) {
    if (e) {
      this.allPosts();
      // this.postData.splice(i, 1);
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
