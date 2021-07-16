import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { Observable } from 'rxjs';
import { Comments } from 'src/app/Models/post';
import { CommentStore, CommentState } from './comment.store';

@Injectable({ providedIn: 'root' })
export class CommentQuery extends Query<CommentState> {

  constructor(protected commentStore: CommentStore) {
    super(commentStore);
  }

  // get all the comment from store
  getComment(): Observable<Comments[]> {
    return this.select(state => state.comment); // TODO: fetch data based on postid
  }

  // fetch bookmarked loading status
  getCommentLoadingStatus(): Observable<boolean> {
    return this.select(state => state.isLoaded);
  }

  /**
   * update comment loading status to false when new comment added so that 
   * comment can be fetched from the database
   * @returns 
   */
   updateCommentLoadingStatus(status: boolean): Observable<boolean> {
    return this.commentStore.update(state => {
      return {
        isLoaded: status
      }
    });
  }


  /**
   * update comment data
   * @param comment: comment of the post
   */
   updateCommentData(comment) {
    this.commentStore.update(state => {
      return {
        comment: comment,
        isLoaded: true
      }
    })
  }

}
