import { Component, OnInit, ElementRef } from '@angular/core';
// import * as $ from 'jquery';
declare var $: any;

@Component({
  selector: 'app-blog-activity-more',
  templateUrl: './blog-activity-more.component.html',
  styleUrls: ['./blog-activity-more.component.css']
})
export class BlogActivityMoreComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    this.accessDropDownMenu();
  }


  // function to access and manupulate dropdown menu
  private accessDropDownMenu(): void {
    const dropdownEl = document.querySelector('.dropdown');
    dropdownEl.addEventListener('click', (event) => {
      event.stopPropagation();
      dropdownEl.classList.toggle('menu');
    });
    document.addEventListener('click', (event) => {
      if (dropdownEl.classList.contains('menu')) {
        dropdownEl.classList.remove('menu');
      }
    });
  }
}
