import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { BookmarkStore } from 'src/app/state/bookmark/bookmark.store';
import { BookmarkQuery } from 'src/app/state/bookmark/bookmark.query';
import { PostData } from '../Models/post';
import { filter, map, skipWhile, switchMap, take } from 'rxjs/operators';
import { PostService } from './post.service';
import { UserQuery } from '../state/user/user.query';
import { UserData } from '../Models/user';

@Injectable({
  providedIn: 'root'
})
export class BookmarkService {

  user: UserData;

  constructor(
    private bookmarkStore: BookmarkStore,
    private bookmarkQuery: BookmarkQuery,
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

  // get bookmarked posts
  getBookmarkPosts() {
    return this.postService.getAllPosts()
      .pipe(
        skipWhile(res => !res),
        take(1),
        map(posts => {
          const bookmarkData = posts.filter(post => {
            const ifBookmarked = post.bookmarks.findIndex(userId => userId === String(this.user.id));
  
            if (ifBookmarked > -1) {
              return post;
            }
          });
          this.bookmarkQuery.updateBookmarkData(bookmarkData);
          return bookmarkData;
        })
      )
  }

  /**
   * save newly added bookmark to the store
   * @param data: bookmar data to store
   */
  saveBookmarkDataInStore(data: PostData) {
    this.bookmarkStore.setHasCache(true);
    this.bookmarkStore.update(state => {
      return {
        bookmarks: [
          ...state.bookmarks,
          data
        ],
        isLoaded: false
      }
    });
    this.bookmarkStore.setLoading(false);
  }

  /**
   * update bookmark status to false when ever a new bookmark is added
   * @returns 
   */
  updateBookmarkLoadingStatus() {
    this.bookmarkQuery.updateBookmarkLoadingStatus();
  }

  updateBookmark(data: PostData[]) {
    this.bookmarkQuery.updateBookmarkData(data);
  }
}
