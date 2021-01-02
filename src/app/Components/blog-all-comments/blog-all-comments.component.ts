import { Component, Input, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { DataExchangeService } from 'src/app/services/data-exchange.service';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-blog-all-comments',
  templateUrl: './blog-all-comments.component.html',
  styleUrls: ['./blog-all-comments.component.css']
})
export class BlogAllCommentsComponent implements OnInit {
  @Input() postId = '';
  @Input() pageName = '';
  @Input() userId = '';

  deleteLoader = false;
  deleteIndex = -1;

  commentData = [];
  constructor(
    private interaction: InteractionService,
    private dataExchange: DataExchangeService
  ) { }

  ngOnInit(): void {
    this.interaction.getBlogComments(this.postId)
    .subscribe((val: any) => {
      this.interaction.getAllUser()
      .pipe(take(1))
      .subscribe(user => {
        val.comments.map((item: any) => {
          for (let i = 0; i < user.length; i++) {
            if (item.commentedUserId === user[i].id) {
              this.commentData.unshift({
                user: user[i],
                commentText: item.text,
                postDate: val.postDate,
                id: item.commentId
              });
              break;
            }
          }
        });
        console.log('CMNT: ', this.commentData);
        if (this.pageName !== '') {
          this.commentData = this.commentData.slice(0, 2);
        }
      });
    });
  }

  deleteComment(index, cmntId) {
    this.deleteLoader = true;
    this.deleteIndex = index;
    this.interaction.getBlogComments(this.postId)
      .pipe(take(1))
      .subscribe((post: any) => {
        const allComments = post.comments;
        const indexToDelete = allComments.findIndex(item => cmntId === item.commentId && item.commentedUserId === this.userId);
        
        console.log('BEFORE DLT: ', allComments);
        allComments.splice(indexToDelete, 1);
        console.log('AFTER DLT: ', allComments);
        this.interaction.updateComment(allComments, this.postId);
        this.commentData.splice(index, 1);
        this.deleteLoader = false;
      })
  }

}
