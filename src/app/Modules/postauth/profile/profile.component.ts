import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  otherUserId = '';
  otherUserStatus: boolean;
  defaultProfileImage = './assets/images/default.png';

  constructor(
    private interaction: InteractionService,
    private dataExchange: DataExchangeService,
    private date: DateService,
    private route: ActivatedRoute,
    private cdref: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isDataLoaded = true;
    this.route.queryParamMap.subscribe(queryParams => {
      this.otherUserId = queryParams.get('userId');
      this.getUserData(this.otherUserId);
    });
    
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

  getUserData(userId = ''): void {
    this.dataExchange.userId$
      .pipe(
        skipWhile(val => {
          return (val === null || val === undefined || val === '');
        })
      )
      .pipe(take(1))
      .subscribe(id => {
        const selectedUserId = userId ? userId : id;
        if (selectedUserId !== id) {
          this.otherUserStatus = true;
        } else {
          this.otherUserStatus = false;
        }
        this.cdref.markForCheck();
        this.interaction.getUser(selectedUserId)
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
          this.followingCount = filterData.length;
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

  goToPostDetail(e: any, postid) {
    this.router.navigate(['/detail'], {
      queryParams: {
        id: postid,
        userId: this.otherUserId
      }
    });
  }

  stopDefaultBehaviour(e): void {
    e.preventDefault();
    e.stopPropagation();
  }


}
