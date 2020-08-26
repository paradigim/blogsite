import { Component, OnInit, ElementRef, Input, Output, EventEmitter } from '@angular/core';
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

  constructor() { }

  ngOnInit(): void {
    const dropdownEl = document.querySelectorAll('.dropdown')[Number(this.index)];
    dropdownEl.id = this.elemId;

    // to show the targeted dropdown elemnt
    document.getElementById(dropdownEl.id).addEventListener('click', (event) => {
      this.accessDropDownMenu(event, dropdownEl);
    });

    // to hide the targeted dropdown element on click outside of the element
    document.addEventListener('click', () => {
      this.closeDropDown(dropdownEl);
    });
  }


  // function to access and manupulate dropdown menu
  private accessDropDownMenu(event: any, dropdownEl: any): void {
    console.log('EVENT: ', event);
    event.stopPropagation();
    dropdownEl.classList.toggle('menu');
  }

  // function to delete dropdown on click outside of the element
  private closeDropDown(dropdownEl: any): void {
    if (dropdownEl.classList.contains('menu')) {
      dropdownEl.classList.remove('menu');
    }
  }
}
