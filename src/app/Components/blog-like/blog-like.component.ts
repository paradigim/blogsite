import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-blog-like',
  templateUrl: './blog-like.component.html',
  styleUrls: ['./blog-like.component.css']
})
export class BlogLikeComponent implements OnInit {

  likeCount = 1234;
  likeGiven = false;

  constructor() { }

  ngOnInit(): void {
  }

  likeCountStatusChange(): void {
    if (!this.likeGiven) {
      this.likeGiven = true;
      this.likeCount += 1;
    }
    else {
      this.likeGiven = false;
      this.likeCount -= 1;
    }
  }

}
