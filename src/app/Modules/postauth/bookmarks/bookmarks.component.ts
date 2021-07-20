
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { filter, skipWhile, take } from 'rxjs/operators';
import { fadeHeight } from 'src/app/animation/fade-height';
import { Comments, PostData } from 'src/app/Models/post';
import { UserData } from 'src/app/Models/user';
import { DataExchangeService } from 'src/app/services/data-exchange.service';
import { DateService } from 'src/app/services/date.service';
import { InteractionService } from 'src/app/services/interaction.service';
import { PostService } from 'src/app/services/post.service';
import { UserQuery } from 'src/app/state/user/user.query';
import { BookmarkService } from 'src/app/services/bookmark.service';
import { BookmarkQuery } from 'src/app/state/bookmark/bookmark.query';
import { CommentQuery } from 'src/app/state/comment/comment.query';
import { CommentService } from 'src/app/services/comment.service';
import { MatDialog } from '@angular/material/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { CommonErrorDialogComponent } from 'src/app/Components/common-error-dialog/common-error-dialog.component';
import { FollowService } from 'src/app/services/follow.service';
import { UserService } from 'src/app/services/user.service';
import { AllUsersQuery } from 'src/app/state/all-users/all-users.query';

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
  commentData: Comments[];
  isNewPost = false;
  isDataLoaded = true;
  allUsers: UserData[];
  defaultImageUrl = './assets/images/default-1.jpg';

  constructor(
    private router: Router,
    private data: DataExchangeService,
    private date: DateService,
    private postService: PostService,
    private userQuery: UserQuery,
    private bookmarkService: BookmarkService,
    private bookmarkQuery: BookmarkQuery,
    private commentQuery: CommentQuery,
    private commentService: CommentService,
    private matDialog: MatDialog,
    private overlay: Overlay,
    private followService: FollowService,
    private userService: UserService,
    private allUserQuery: AllUsersQuery
  ) {}

  ngOnInit(): void {
    this.userQuery.getLoggedInUser()
      .pipe(
        skipWhile(res => !res),
        take(1)
      )
      .subscribe((user: UserData) => {
        this.user = user;
        console.log('USER: ', this.user);
        this.getBookmarks();
        this.getComments();
      })


    this.data.newPostData$
      .pipe(
        skipWhile(res => !res)
      )
      .subscribe(post => {
        if (post) {
          this.isNewPost = true;
          this.bookmarkData = this.bookmarkData.filter(item => item.id !== post.id);
          this.showSnackbarStatus = false;
          this.getNewlyAddedPostFromDatabase(post);
        }
      })

    this.data.setPageStatus(false);
    this.getAllUsers();
  }

  getAllUsers() {
    this.allUserQuery.getAllUsersLoadingStatus()
      .pipe(take(1))
      .subscribe(status => {
        if (status) {
          this.fetchUsersFromStore();
        } else {
          this.fetchUsersFromDatabase();
        }
      })
  }

  fetchUsersFromStore() {
    this.allUserQuery.getAllUsers()
      .pipe(
        skipWhile(res => !res),
        take(1)
      )
      .subscribe((users: UserData[]) => {
        this.allUsers = [...users];
      })
  }

  fetchUsersFromDatabase() {
    this.userService.getAllUsers()
      .pipe(
        skipWhile(res => !res),
        take(1)
      )
      .subscribe((users: UserData[]) => {
        this.allUsers = users;
        this.allUserQuery.updateAllUsersData(this.allUsers);
      })
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
        this.bookmarkData.unshift(post);
        console.log('NEW-2: ', this.isNewPost);
      }, 1200)
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

  // fetch all comments from store/database
  getComments() {
    this.commentQuery.getCommentLoadingStatus()
      .pipe(take(1))
      .subscribe(status => {
        if (status) {
          this.fetchCommentFromStore();
        } else {
          this.fetchCommentFromDatabase();
        }
      })
  }

  fetchCommentFromStore() {
    this.commentQuery.getComment()
      .pipe(
        skipWhile(res => !res),
        take(1)
      )
      .subscribe((comments: Comments[]) => {
        this.commentData = comments;
      })
  }

  fetchCommentFromDatabase() {
    this.commentService.getAllComments()
      .pipe(
        skipWhile(res => !res),
        take(1)
      )
      .subscribe((comments: Comments[]) => {
        this.commentData = comments;
        this.commentService.updateCommentData(this.commentData);
        console.log('FROM DB: ', this.commentData);
      })
  }

  // get bookmarks based on the condition if isLoaded from state is true or false
  getBookmarks() {
    this.bookmarkQuery.getBookmarkLoadingStatus()
      .pipe(take(1))
      .subscribe(status => {
        if (status) {
          this.fetchBookMarkFromStore();
        } else {
          this.fetchBookMarkFromDatabase();
        }
      })
  }

  // Get bookmark from database
  fetchBookMarkFromDatabase() {
    this.bookmarkService.getBookmarkPosts()
      .pipe(
        skipWhile(res => !res),
        take(1)
      )
      .subscribe((bookmarks: PostData[]) => {
        this.bookmarkData = bookmarks;
        this.isDataLoaded = false;
        this.bookmarkService.updateBookmark(this.bookmarkData);
      })
  }

  // Get bookmark from store
  fetchBookMarkFromStore() {
    this.bookmarkQuery.getBookmarks()
      .pipe(
        skipWhile(res => !res),
        take(1)
      )
      .subscribe(bookmarks => {
        this.bookmarkData = bookmarks;
        this.isDataLoaded = false;
      })
  }

  addNewComment(comment) {
    this.fetchCommentFromDatabase();
  }

  removeComment(commentId) {
    this.commentData = this.commentData.filter(item => item.id !== commentId);
  }

  // change foloow status pritam
  changeFollowStatus(e, post: PostData) {
    e.stopPropagation();
    const data = {
      userWhoFollow: String(this.user.id)
    }
    this.followService.updateFollowStatus(post.userId, data)
      .subscribe(res => {
        if (res) {
          // this.followStatus = true;
          this.userService.updateUsersFollowList(post.userId, res)
            .subscribe(users => {
              this.fetchUsersFromStore();
            });
        }
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
