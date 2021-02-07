import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { delay, takeUntil } from 'rxjs/operators';
import { DateService } from 'src/app/services/date.service';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-blog-details',
  templateUrl: './blog-details.component.html',
  styleUrls: ['./blog-details.component.css']
})
export class BlogDetailsComponent implements OnInit, OnDestroy {

  postId = '';
  postData: any;
  userId = '';
  isDataLoaded = true;
  followStatus: boolean;

  ngUnsubscribe = new Subject();

  constructor(
    private route: ActivatedRoute,
    private interaction: InteractionService,
    private date: DateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(queryParams => {
      this.postId = queryParams.get('id');
      this.userId = queryParams.get('userId');
      this.followStatus = Boolean(queryParams.get('followStatus'));
      this.getPostData(this.postId);
    });
  }

  getPostData(postId) {
    this.interaction.getPostWithId(postId)
      .pipe(delay(1000))
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(post => {
        this.postData = post;
        this.isDataLoaded = false;
      });
  }

  goOtherUserProfile(userId) {
    this.router.navigate(['/profile'], {
      queryParams: {
        userId
      }
    })
  }

  stopDefaultBehaviour(e): void {
    e.preventDefault();
    e.stopPropagation();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
