import { Component, Input, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { DataExchangeService } from 'src/app/services/data-exchange.service';

@Component({
  selector: 'app-blog-comment',
  templateUrl: './blog-comment.component.html',
  styleUrls: ['./blog-comment.component.css']
})
export class BlogCommentComponent implements OnInit {

  @Input() commentCount = 0;

  constructor(private dataExchange: DataExchangeService) { }

  ngOnInit(): void {

  }

  likeCountStatusChange(): void {
    console.log('COMMENT');
  }

}
