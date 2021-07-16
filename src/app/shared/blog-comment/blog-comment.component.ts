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

  totalComment = 0;

  constructor(private data: DataExchangeService) { }

  ngOnInit(): void {
    this.totalComment = this.commentCount;
  }

  ngOnChanges() {
    this.totalComment = this.commentCount;
  }

  likeCountStatusChange(): void {}

}
