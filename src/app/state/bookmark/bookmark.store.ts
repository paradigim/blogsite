import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { PostData } from 'src/app/Models/post';

export interface BookmarkState {
   bookmarks: PostData[];
   isLoaded: boolean;
}

export function createInitialState(): BookmarkState {
  return {
    bookmarks: [],
    isLoaded: false
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'bookmark' })
export class BookmarkStore extends Store<BookmarkState> {

  constructor() {
    super(createInitialState());
  }

}
