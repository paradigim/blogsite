import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, skipWhile, take, takeUntil } from 'rxjs/operators';
import { DataExchangeService } from 'src/app/services/data-exchange.service';
import { DateService } from 'src/app/services/date.service';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  isDataLoaded = false;
  userData: any;
  followerCount = 0;
  followingCount = 0;
  posts: any;
  ngUnsubscribe = new Subject();

  constructor(
    private interaction: InteractionService,
    private dataExchange: DataExchangeService,
    private date: DateService
  ) { }

  ngOnInit(): void {
    this.isDataLoaded = true;
    this.getUserData();
    this.checkIsUpdated();
  }

  checkIsUpdated() {
    this.dataExchange.isUpdated$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((val) => {
        if (val) {
          this.isDataLoaded = true;
          this.getUserData();
        }
      });
  }

  getUserData(): void {
    this.dataExchange.userId$
      .pipe(
        skipWhile(val => {
          return (val === null || val === undefined || val === '');
        })
      )
      .pipe(take(1))
      .subscribe(id => {
        this.interaction.getUser(id)
          .pipe(
            skipWhile(val => {
              return (val === null || val === undefined);
            })
          )
          .pipe(take(1))
          .subscribe((data: any) => {
            this.userData = data;
            this.getFollowerData(this.userData);
            this.getFollowingData(this.userData.id);
            this.getUserPosts(this.userData.id);
          });
      });
  }

  getFollowerData(userData: any): void {
    this.followerCount = userData.follower.length;
  }

  getFollowingData(uid): void {
    this.interaction.getAllUser()
    .subscribe(user => {
      user.map(item => {
        const filterData = item.follower.filter(val => val.followingUserId === uid);

        if (filterData.length > 0) {
          this.followingCount += 1;
        }
      })
    })
  }

  getUserPosts(uid) {
    this.interaction.getAllPosts()
      .subscribe(posts => {
        this.posts = posts.filter(val => val.userid === uid);
        this.isDataLoaded = false;
      })
  }


}
