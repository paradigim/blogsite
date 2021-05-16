import { Component, Input, OnInit } from '@angular/core';
import { skipWhile, take } from 'rxjs/operators';
import { DataExchangeService } from 'src/app/services/data-exchange.service';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-blog-comment',
  templateUrl: './blog-comment.component.html',
  styleUrls: ['./blog-comment.component.css']
})
export class BlogCommentComponent implements OnInit {

  @Input() commentCount = 0;
  @Input() postId = null;
  @Input() totalComment = 0;
  updateCount = null;

  constructor(private data: DataExchangeService) { }

  ngOnInit(): void {}

  ngOnChanges() {
    if (this.totalComment > 0) {
      this.commentCount = this.totalComment;
    }
  }

  likeCountStatusChange(): void {
    
  }

}
