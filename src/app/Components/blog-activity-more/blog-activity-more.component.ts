import { Component, OnInit, ElementRef } from '@angular/core';
// import * as $ from 'jquery';
declare var JQuery: any;

interface JQuery {
  dropdown(): any;
}
@Component({
  selector: 'app-blog-activity-more',
  templateUrl: './blog-activity-more.component.html',
  styleUrls: ['./blog-activity-more.component.css']
})
export class BlogActivityMoreComponent implements OnInit {

  constructor(private dropdown: ElementRef) { }

  ngOnInit(): void {
  }

  showDropDown(): void {
    JQuery(this.dropdown.nativeElement).dropdown();
  }
}
