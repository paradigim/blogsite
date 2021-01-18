import { Component, OnInit, Input } from '@angular/core';
import { InteractionService } from 'src/app/services/interaction.service';
import * as data from 'src/assets/language.json';


@Component({
  selector: 'app-blog-comment-input',
  templateUrl: './blog-comment-input.component.html',
  styleUrls: ['./blog-comment-input.component.css']
})
export class BlogCommentInputComponent implements OnInit {
  @Input() index = 0;
  @Input() postId = '';
  comment = '';
  jsonData = (data as any).default;
  isDisabled = true;
  commentBTN: any;
  textArea: any;
  showEmoji = false;

  constructor(private interaction: InteractionService) { }

  ngOnInit(): void {
    this.commentBTN = document.querySelectorAll('.comment-button');
    this.textArea = document.querySelectorAll('.comment-box');

    document.addEventListener('click', () => {
      this.closeDropDown();
    });
  }

  closeDropDown() {
    if (this.showEmoji) {
      this.showEmoji = false;
    }
  }

  showEmojiMart() {
    this.showEmoji = !this.showEmoji;
  }

  selectEmoji(e) {
    this.comment = `${this.comment}${e.emoji.native}`;
    this.showEmoji = !this.showEmoji;
  }

  // add comment
  addComment(e): void {
    e.stopPropagation();
    const postDate = new Date().getTime();
    this.interaction.addCommentToPost(this.comment, this.postId, postDate);
    this.comment = '';
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
