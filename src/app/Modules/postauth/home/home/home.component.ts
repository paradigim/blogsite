import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { InteractionService } from 'src/app/services/interaction.service';
import { Router } from '@angular/router';
import { delay, skipWhile, take, takeUntil } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { Subject } from 'rxjs';
import { DateService } from 'src/app/services/date.service';

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

  constructor(
    private interaction: InteractionService,
    private router: Router,
    private afAuth: AngularFireAuth,
    private date: DateService
  ) {
    this.afAuth.authState.subscribe(user => {
      if (user){
        this.userId = user.uid;
      }
    });
  }

  ngOnInit(): void {
    this.isDataLoaded = true;
    this.allPosts();
  }

  // set following status on init
  allPosts(): void {
    const users = this.interaction.getAllUser().pipe(takeUntil(this.unSubscribe));
    this.interaction.getAllPosts()
      .pipe(delay(1000))
      .pipe(
        skipWhile(value => {
          return (value === null || value === undefined || value.length <= 0);
        }),
        take(1)
      )
      .pipe(takeUntil(this.unSubscribe))
      .subscribe((data: any) => {
        this.postData = data;
        this.postData.map((item, i) => {
          users
          .pipe(take(1))
          .subscribe(val => {
            for (const user of val) {
              if (user.id === item.userid) {
                this.postData[i] = {
                  ...this.postData[i],
                  followStatus: this.checkFollower(user, true)
                };
                const flTxt = this.postData[i].followStatus ? 'Following' : 'Follow';
                this.postData[i].followText = flTxt;
                break;
              }
            }
            // this.isDataLoaded = false;
          });
        });
        this.isDataLoaded = false;
      });
  }

  // check if followed by the current user and return the status
  checkFollower(user, initial: boolean): boolean {
      const index = user.follower.findIndex(item => {
        return (item.followingUserId === this.userId);
      });
      if (!initial) {
        this.allPosts();
      } else {
        return (index !== -1) ? true : false;
      }
  }

  getLikeCounts(event: number): void {
    this.likeCount = event;
  }

  stopDefaultBehaviour(e): void {
    e.preventDefault();
    e.stopPropagation();
  }

  routeToBlogDetail(e: any, postid): void { 
    this.router.navigate(['/detail'], {
      queryParams: {
        id: postid,
        userId: this.userId
      }
    });
  }

  // set status when click on follow button
  followUser(userId, e): void {
    e.preventDefault();
    this.checkFollow = false;
    let follower = [];
    this.interaction.getUser(userId)
    .pipe(take(1))
    .pipe(takeUntil(this.unSubscribe))
    .subscribe(user => {

      for (const [i, item] of user.follower.entries()) {
        if (item.followingUserId === this.userId) {
          follower = user.follower;
          follower.splice(i, 1);
          this.checkFollow = true;
          break;
        }
      }

      if (!this.checkFollow) {
        const data = {
          followingUserId: this.userId,
          followDate: this.followDate
        };
        follower = [...user.follower, data];
      }
      // debugger;
      this.interaction.updateFollower(follower, userId);
      this.checkFollowerStatus(userId);
    });
  }

  // set the follow status after click on the button
  checkFollowerStatus(uid): void {
    this.interaction.getUser(uid)
      .pipe(take(1))
      .pipe(takeUntil(this.unSubscribe))
      .subscribe(user => {
      this.checkFollower(user, false);
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
