import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-blog-comment',
  templateUrl: './blog-comment.component.html',
  styleUrls: ['./blog-comment.component.css']
})
export class BlogCommentComponent implements OnInit {

  commentCount = 1234;

  constructor() { }

  ngOnInit(): void {
  }

  likeCountStatusChange(): void {
    console.log('COMMENT');
  }

}
