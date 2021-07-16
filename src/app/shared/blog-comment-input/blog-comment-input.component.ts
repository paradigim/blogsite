import { Overlay } from '@angular/cdk/overlay';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonErrorDialogComponent } from 'src/app/Components/common-error-dialog/common-error-dialog.component';
import { UserData } from 'src/app/Models/user';
import { DataExchangeService } from 'src/app/services/data-exchange.service';
import { InteractionService } from 'src/app/services/interaction.service';
import { PostService } from 'src/app/services/post.service';
import { UserQuery } from 'src/app/state/user/user.query';
import * as data from 'src/assets/language.json';
import { CommentService } from 'src/app/services/comment.service';


@Component({
  selector: 'app-blog-comment-input',
  templateUrl: './blog-comment-input.component.html',
  styleUrls: ['./blog-comment-input.component.css']
})
export class BlogCommentInputComponent implements OnInit {
  @Input() index = 0;
  @Input() postId: number;
  @Input() user: UserData;
  @Output() showNewComment = new EventEmitter<Comment>();

  comment = '';
  jsonData = (data as any).default;
  isDisabled = true;
  commentBTN: any;
  textArea: any;
  showEmoji = false;

  constructor(
    private dataExchange: DataExchangeService,
    private matDialog: MatDialog,
    private overlay: Overlay,
    private commentService: CommentService
  ) { }

  ngOnInit(): void {
    this.commentBTN = document.querySelectorAll('.comment-button');
    this.textArea = document.querySelectorAll('.comment-box');

    document.addEventListener('click', () => {
      this.closeDropDown();
    });
  }

  closeDropDown() {
    if (this.showEmoji) {
      this.showEmoji = false;
    }
  }

  showEmojiMart() {
    this.showEmoji = !this.showEmoji;
  }

  selectEmoji(e) {
    this.comment = `${this.comment}${e.emoji.native}`;
    this.showEmoji = !this.showEmoji;
  }

  // add comment
  addComment(e): void {
    e.stopPropagation();
    const postDate = new Date().getTime();
    
    const data = {
      text: this.comment,
      commentTime: String(postDate),
      commentedUserId: this.user.id,
      userImage: this.user.imageUrl,
      uniqueUserId: this.user.uniqueUserId,
      userName: this.user.name,
      postId: this.postId
    };

    this.commentService.savePostComment(data, this.postId)
      .subscribe((res: Comment) => {
        this.commentService.updateCommentLoadingStatus(false);
        this.showNewComment.emit(res);
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
    this.comment = '';
  }

  activeCommentBTN(e: any): void {
    this.comment = e.target.value;

    // activate comment button if there is value in textarea
    if (this.textArea[this.index].value) {
      this.commentBTN[Number(this.index)].removeAttribute('disabled');
    } else {
      this.commentBTN[Number(this.index)].setAttribute('disabled', 'true');
    }
  }

}
