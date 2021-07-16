import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiService } from './api.service';
import { CommentQuery } from '../state/comment/comment.query';
import { Comments } from '../Models/post';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  environment = environment;

  constructor(
    private apiService: ApiService,
    private commentQuery: CommentQuery
  ) { }

  savePostComment(data, postId) {
    const url = `${this.environment.api.baseUrl}${this.environment.api.comment.addComment}/${postId}`;
    return this.apiService.fetchPutUrl(url, data);
  }

  /**
   * update comment status to false when ever a new bookmark is added
   * @returns 
   */
   updateCommentLoadingStatus(status: boolean) {
    this.commentQuery.updateCommentLoadingStatus(status);
  }

  /**
   * update comment data to the store when fetch data from database
   * @returns 
   */
  updateCommentData(commentData: Comments[]) {
    this.commentQuery.updateCommentData(commentData);
  }

  // get all the comment from DB
  getAllComments() {
    const url = `${this.environment.api.baseUrl}${this.environment.api.comment.getAllComments}`;
    return this.apiService.fetchGetUrl(url);
  }

  /**
   * Delete a comment
   * @param commentId id of the comment to be deleted
   * @returns 
   */
  deleteComment(commentId) {
    const url = `${this.environment.api.baseUrl}${this.environment.api.comment.deleteComment}/${commentId}`;
    return this.apiService.fetchDelete(url);
  }
}
