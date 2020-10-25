import { Component, Input, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-blog-all-comments',
  templateUrl: './blog-all-comments.component.html',
  styleUrls: ['./blog-all-comments.component.css']
})
export class BlogAllCommentsComponent implements OnInit {
  @Input() postId = '';
  commentData = [];
  constructor(private interaction: InteractionService) { }

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
                postDate: val.postDate
              });
              break;
            }
          }
        });
      });
    });
  }

}
