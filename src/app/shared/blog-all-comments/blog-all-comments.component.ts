import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Subject } from 'rxjs';
import { delay, take, takeUntil } from 'rxjs/operators';
import { DataExchangeService } from 'src/app/services/data-exchange.service';
import { DateService } from 'src/app/services/date.service';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-blog-all-comments',
  templateUrl: './blog-all-comments.component.html',
  styleUrls: ['./blog-all-comments.component.css']
})
export class BlogAllCommentsComponent implements OnInit, OnDestroy {
  @Input() postId = '';
  @Input() pageName = '';
  @Output() totalCommentLength = new EventEmitter();

  deleteLoader = false;
  deleteIndex = -1;
  ngUnsubscribe = new Subject();
  commentData = [];
  userId = '';

  constructor(
    private interaction: InteractionService,
    private dataExchange: DataExchangeService,
    private date: DateService,
    private afAuth: AngularFireAuth
  ) { 
    this.afAuth.authState.subscribe(user => {
      if (user){
        this.userId = user.uid;
      }
    });
  }

  ngOnInit(): void {
    this.interaction.getBlogComments(this.postId)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe((val: any) => {
      this.interaction.getAllUser()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((user: any) => {
        this.commentData = [];
        val.comments.forEach((item: any) => {
          const userData = user.filter(data => data.id === item.commentedUserId);

          this.commentData.unshift({
            user: userData[0],
            commentText: item.text,
            postDate: val.postDate,
            id: item.commentId,
            time: item.commentPostTime
          });
        });
        if (this.pageName !== '') {
          this.commentData = this.commentData.slice(0, 2);
        }
        this.totalCommentLength.emit(val.comments.length);
      });
    });
  }

  ngOnChanges() {}

  deleteComment(index, cmntId, e) {
    e.stopPropagation();
    this.deleteLoader = true;
    this.deleteIndex = index;
    this.interaction.getBlogComments(this.postId)
      .pipe(delay(1000))
      .pipe(take(1))
      .subscribe((post: any) => {
        const allComments = post.comments;
        const indexToDelete = allComments.findIndex(item => cmntId === item.commentId && item.commentedUserId === this.userId);

        allComments.splice(indexToDelete, 1);
        this.interaction.updateComment(allComments, this.postId);
        this.commentData.splice(index, 1);
      
        this.deleteLoader = false;
        this.deleteIndex = -1;
      })
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
