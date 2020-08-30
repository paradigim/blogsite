import { Component, OnInit } from '@angular/core';
import * as data from 'src/assets/language.json';

@Component({
  selector: 'app-blog-comment-input',
  templateUrl: './blog-comment-input.component.html',
  styleUrls: ['./blog-comment-input.component.css']
})
export class BlogCommentInputComponent implements OnInit {

  comment = '';
  jsonData = (data as any).default;
  rowCount = 2;
  counter = 0;

  constructor() { }

  ngOnInit(): void {
  }


  setRowCount(): void {
    this.counter++;
    if (this.counter >= 2) {
      this.rowCount++;
    }
  }

  getInputValue(val: any): void {
    this.comment = val;
    console.log(this.comment);
  }

}
