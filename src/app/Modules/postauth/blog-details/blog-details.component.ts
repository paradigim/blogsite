import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
      this.getPostData(this.postId);
    });
  }

  getPostData(postId) {
    this.interaction.getPostWithId(postId)
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

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
