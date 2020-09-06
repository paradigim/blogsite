import { Component, OnInit, Input, ViewChildren, ElementRef, QueryList } from '@angular/core';
import * as data from 'src/assets/language.json';

@Component({
  selector: 'app-blog-comment-input',
  templateUrl: './blog-comment-input.component.html',
  styleUrls: ['./blog-comment-input.component.css']
})
export class BlogCommentInputComponent implements OnInit {
  @Input() index = 0;
  @Input() commentId = '';
  comment = '';
  jsonData = (data as any).default;
  isDisabled = true;
  commentBTN: any;
  textArea: any;

  constructor(private elemRef: ElementRef) { }

  ngOnInit(): void {
    this.commentBTN = document.querySelectorAll('.comment-button');
    this.textArea = document.querySelectorAll('.comment-box');
  }


  getInputValue(): void {
    console.log(this.comment);
  }

  activeCommentBTN(e: any): void {
    this.comment = e.target.value;

    // activate comment button if there is value in textarea
    if (this.textArea[this.index].value) {
      this.commentBTN[Number(this.index)].removeAttribute('disabled');
    } else {
      this.commentBTN[Number(this.index)].setAttribute('disabled', 'true');
    }
  }
}
