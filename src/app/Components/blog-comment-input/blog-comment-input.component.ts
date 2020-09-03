import { Component, OnInit, Input } from '@angular/core';
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

  constructor() { }

  ngOnInit(): void {}


  getInputValue(val: any): void {
    this.comment = val;
    console.log(this.comment);
  }

  activeCommentBTN(e): void {
    if (e.target.value) {
      const dropdownEl = document.querySelectorAll('.comment-button');
      console.log('ELEM: ', dropdownEl[Number(this.index)].getAttribute('class'));

      this.isDisabled = !(dropdownEl[Number(this.index)].getAttribute('disabled'));
      dropdownEl[Number(this.index)].setAttribute('disabled', 'false');
      console.log(dropdownEl[Number(this.index)].getAttribute('disabled'));
    }
  }
}
