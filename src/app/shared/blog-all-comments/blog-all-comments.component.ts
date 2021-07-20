import { Overlay } from '@angular/cdk/overlay';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { pipe, Subject } from 'rxjs';
import { delay, skipWhile, take, takeUntil } from 'rxjs/operators';
import { CommonErrorDialogComponent } from 'src/app/Components/common-error-dialog/common-error-dialog.component';
import { Comments, PostData } from 'src/app/Models/post';
import { CommentService } from 'src/app/services/comment.service';
import { DateService } from 'src/app/services/date.service';
import { InteractionService } from 'src/app/services/interaction.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-blog-all-comments',
  templateUrl: './blog-all-comments.component.html',
  styleUrls: ['./blog-all-comments.component.css']
})
export class BlogAllCommentsComponent implements OnInit, OnDestroy {
  @Input() postId: number;
  @Input() userId: number;
  @Input() pageName = '';
  @Input() post: PostData = null;
  @Input() allComment: Comments[];
  @Output() totalCommentLength = new EventEmitter();
  @Output() deleteStatus = new EventEmitter<number>();

  deleteLoader = false;
  deleteIndex = -1;
  ngUnsubscribe = new Subject();
  commentData = [];
  defaultImageUrl = './assets/images/default-1.jpg';

  constructor(
    private date: DateService,
    private commentService: CommentService,
    private matDialog: MatDialog,
    private overlay: Overlay,
  ) {}

  ngOnInit(): void {
    this.setCommentData();
  }

  ngOnChanges() {
    this.setCommentData();
  }

  setCommentData() {
    this.commentData = _.orderBy(this.allComment, ['id'], ['desc']);

    if (this.pageName !== '') {
      this.commentData = this.commentData.slice(0, 2);
    }
    this.totalCommentLength.emit(this.commentData.length);
  }

  deleteComment(index, cmntId, e) {
    e.stopPropagation();
    this.deleteLoader = true;
    this.deleteIndex = index;

    this.commentService.deleteComment(cmntId)
      .subscribe(res => {
        if (res) {
          setTimeout(() => {
            this.allComment = this.allComment.filter(item => item.id !== cmntId);
            this.setCommentData();
            this.commentService.updateCommentLoadingStatus(false);
            this.deleteStatus.emit(cmntId);
            this.deleteLoader = false;
            this.deleteIndex = -1;
          }, 1200);
        }
      }, err => {
        this.deleteLoader = false;
        this.deleteIndex = -1;

        this.matDialog.open(CommonErrorDialogComponent, {
          data: {
            message: err.error.message
          },
          width: '300px',
          autoFocus: false,
          scrollStrategy: this.overlay.scrollStrategies.noop()
        });
      });



    // this.interaction.getBlogComments(this.postId)
    //   .pipe(delay(1000))
    //   .pipe(take(1))
    //   .subscribe((post: any) => {
    //     const allComments = post.comments;
    //     const indexToDelete = allComments.findIndex(item => cmntId === item.commentId && item.commentedUserId === this.userId);

    //     allComments.splice(indexToDelete, 1);
        
    //     this.commentData.splice(index, 1);
      
    //     this.deleteLoader = false;
    //     this.deleteIndex = -1;
    //   })
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
