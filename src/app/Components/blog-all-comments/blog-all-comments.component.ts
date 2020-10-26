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

  commentData = [];
  constructor(
    private interaction: InteractionService,
    private dataExchange: DataExchangeService
  ) { }

  ngOnInit(): void {
    this.interaction.getBlogComments(this.postId)
    .subscribe((val: any) => {
      this.interaction.getAllUser()
      .subscribe(user => {
        val.comments.map((item: any) => {
          for (let i = 0; i < user.length; i++) {
            if (item.commentedUserId === user[i].id) {
              this.commentData.unshift({
                user: user[i],
                commentText: item.text,
                postDate: val.postDate
              });
              break;
            }
          }
        });
        if (this.pageName !== '') {
          this.commentData = this.commentData.slice(0, 2);
        }
      });
    });
  }

}
