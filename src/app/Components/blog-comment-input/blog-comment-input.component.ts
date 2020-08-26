import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-blog-comment-input',
  templateUrl: './blog-comment-input.component.html',
  styleUrls: ['./blog-comment-input.component.css']
})
export class BlogCommentInputComponent implements OnInit {

  comment = '';

  constructor() { }

  ngOnInit(): void {
  }

  getInputValue(val: any): void {
    this.comment = val;
    console.log(this.comment);
  }

}
