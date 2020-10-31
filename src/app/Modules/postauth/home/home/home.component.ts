import { Component, OnDestroy, OnInit } from '@angular/core';
import { InteractionService } from 'src/app/services/interaction.service';
import { Router } from '@angular/router';
import { take, takeUntil } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { Subject } from 'rxjs';

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
  unSubscribe = new Subject();

  constructor(
    private interaction: InteractionService,
    private router: Router,
    private afAuth: AngularFireAuth
  ) {
    this.afAuth.authState.subscribe(user => {
      if (user){
        this.userId = user.uid;
      }
    });
  }

  ngOnInit(): void {
    this.allPosts();
  }

  // set following status on init
  allPosts(): void {
    const users = this.interaction.getAllUser().pipe(takeUntil(this.unSubscribe));
    this.interaction.getAllPosts()
      .pipe(takeUntil(this.unSubscribe))
      .subscribe((data: any) => {
        this.postData = data;
        this.postData.map((item, i) => {
          users.subscribe(val => {
            for (const user of val) {
              if (user.id === item.userid) {
                this.postData[i] = {...this.postData[i], followStatus: this.checkFollower(user, true)};
                break;
              }
            }
          });
        });
      });
  }

  // check if followed by the current user and return the status
  checkFollower(user, initial = false): boolean {
    if (user.follower && user.follower.length > 0) {
      const index = user.follower.findIndex(item => item === this.userId);
      if (!initial) {
        this.allPosts();
      } else {
        return (index !== -1) ? true : false;
      }
    }
  }

  getLikeCounts(event: number): void {
    this.likeCount = event;
  }

  stopDefaultBehaviour(e): void {
    e.preventDefault();
    e.stopPropagation();
  }

  routeToBlogDetail(e: any): void {
    // this.router.navigate();
  }

  // set follow status when click on follow button
  followUser(userId, e): void {
    e.stopPropagation();
    e.preventDefault();
    this.checkFollow = false;
    let follower = [];
    this.interaction.getUser(userId)
    .pipe(take(1))
    .pipe(takeUntil(this.unSubscribe))
    .subscribe(user => {
      for (const [i, item] of user.follower.entries()) {
        if (item === this.userId) {
          follower = user.follower.splice(i, item);
          this.checkFollow = true;
          break;
        }
      }
      if (!this.checkFollow) {
        follower = [...user.follower, this.userId];
      }
      this.interaction.updateFollower(follower, userId);
      this.checkFollowerStatus(userId);
    });
  }

  // set the follow status after click on the button
  checkFollowerStatus(uid): void {
    this.interaction.getUser(uid)
      .pipe(takeUntil(this.unSubscribe))
      .subscribe(user => {
      this.checkFollower(user);
    });
  }

  // on destroy of the component
  ngOnDestroy(): void {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }

}
