import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { Observable } from 'rxjs';
import { BookmarkStore, BookmarkState } from './bookmark.store';
import { PostData } from 'src/app/Models/post';

@Injectable({ providedIn: 'root' })
export class BookmarkQuery extends Query<BookmarkState> {

  constructor(protected bookmarkStore: BookmarkStore) {
    super(bookmarkStore);
  }

  // get all the bookmarks from store
  getBookmarks(): Observable<PostData[]> {
    return this.select(state => state.bookmarks);
  }

  // fetch bookmarked loading status
  getBookmarkLoadingStatus(): Observable<boolean> {
    return this.select(state => state.isLoaded);
  }

  /**
   * update bookmark loading status to false when new bookmark adde so that 
   * bookmark can be fetched from the database
   * @returns 
   */
  updateBookmarkLoadingStatus(): Observable<boolean> {
    return this.bookmarkStore.update(state => {
      return {
        isLoaded: false
      }
    });
  }

  /**
   * update bookmark data
   * @param bookmarks: posts that are being bookmarked 
   */
  updateBookmarkData(bookmarks) {
    this.bookmarkStore.update(state => {
      return {
        bookmarks: bookmarks,
        isLoaded: true
      }
    })
  }

}
