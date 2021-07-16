import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { Comments } from 'src/app/Models/post';

export interface CommentState {
  comment: Comments[];
  isLoaded: boolean;
}

export function createInitialState(): CommentState {
  return {
    comment: [],
    isLoaded: false
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'comment' })
export class CommentStore extends Store<CommentState> {

  constructor() {
    super(createInitialState());
  }

}
