import { Component, OnInit, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { InteractionService } from 'src/app/services/interaction.service';
// import * as $ from 'jquery';
declare var $: any;

@Component({
  selector: 'app-blog-activity-more',
  templateUrl: './blog-activity-more.component.html',
  styleUrls: ['./blog-activity-more.component.css']
})
export class BlogActivityMoreComponent implements OnInit {

  @Output() chngStatus = new EventEmitter<boolean>();
  @Input() elemId = '';
  @Input() index: number;
  @Input() postId = '';

  bookmarkStatus: boolean;
  bookmarkText = 'Bookmark';

  constructor(
    private interaction: InteractionService
  ) { }

  ngOnInit(): void {
    const dropdownEl = document.querySelectorAll('.dropdown')[Number(this.index)];
    dropdownEl.id = this.elemId;

    // to show the targeted dropdown element
    document.getElementById(dropdownEl.id).addEventListener('click', (event) => {
      this.accessDropDownMenu(event, dropdownEl);
    });

    // to hide the targeted dropdown element on click outside of the element
    document.addEventListener('click', () => {
      this.closeDropDown(dropdownEl);
    });

    this.getPostData();
  }


  // function to access and manupulate dropdown menu
  private accessDropDownMenu(event: any, dropdownEl: any): void {
    event.stopPropagation();
    dropdownEl.classList.toggle('menu');
  }

  // function to delete dropdown on click outside of the element
  private closeDropDown(dropdownEl: any): void {
    if (dropdownEl.classList.contains('menu')) {
      dropdownEl.classList.remove('menu');
    }
  }

  // bookmark
  bookmark(): void {
    this.bookmarkStatus = !this.bookmarkStatus;
    this.interaction.changeBookMark(this.postId, this.bookmarkStatus);
    if (this.bookmarkStatus) {
      this.bookmarkText = 'Remove Bookmark';
    } else {
      this.bookmarkText = 'Bookmark';
    }
  }

  // get post data
  getPostData(): void {
    this.interaction.getPostWithId(this.postId)
      .subscribe((res: any) => {
        this.bookmarkStatus = res.bookmark;
        if (res.bookmark) {
          this.bookmarkText = 'Remove Bookmark';
        } else {
          this.bookmarkText = 'Bookmark';
        }
      });
  }
}
