
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { skipWhile, take } from 'rxjs/operators';
import { fadeHeight } from 'src/app/animation/fade-height';
import { PostData } from 'src/app/Models/post';
import { UserData } from 'src/app/Models/user';
import { DataExchangeService } from 'src/app/services/data-exchange.service';
import { DateService } from 'src/app/services/date.service';
import { InteractionService } from 'src/app/services/interaction.service';
import { PostService } from 'src/app/services/post.service';
import { UserQuery } from 'src/app/state/user/user.query';

@Component({
  selector: 'app-bookmarks',
  templateUrl: './bookmarks.component.html',
  styleUrls: ['./bookmarks.component.css'],
  animations: [
    fadeHeight
  ]
})
export class BookmarksComponent implements OnInit {

  bookmarkData: any;
  user: UserData;
  showSnackbarStatus = false;
  snackBarText = '';

  constructor(
    private router: Router,
    private data: DataExchangeService,
    private date: DateService,
    private postService: PostService,
    private userQuery: UserQuery
  ) { 
    this.userQuery.getLoggedInUser()
      .pipe(
        skipWhile(res => !res),
        take(1)
      )
      .subscribe((user: UserData) => {
        this.user = user;
      })
  }

  ngOnInit(): void {
    this.getBookmarks();
    this.data.setPageStatus(false);
  }

  getBookmarks() {
    this.postService.getAllPosts()
      .pipe(
        skipWhile(res => !res),
        take(1)
      )
      .subscribe((posts: PostData[]) => {
        this.bookmarkData = posts.filter(post => {
          const ifBookmarked = post.bookmarks.findIndex(userId => userId === String(this.user.id));

          if (ifBookmarked > -1) {
            return post;
          }
        });
      })
  }

  stopDefaultBehaviour(e): void {
    e.preventDefault();
    e.stopPropagation();
  }

  routeToBlogDetail(e: any, postid): void { 
    this.router.navigate(['/detail'], {
      queryParams: {
        id: postid,
        userId: 1
      }
    });
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

  handleBookmarkRemove(e) {
    this.bookmarkData = this.bookmarkData.filter(item => item.id !== e);
  }

}
