import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-right-side-menu',
  templateUrl: './right-side-menu.component.html',
  styleUrls: ['./right-side-menu.component.css']
})
export class RightSideMenuComponent implements OnInit {

  totalPosts = Array.from({ length: 3 }).map(() => ({}));
  totalPosts2 = Array.from({ length: 3 }).map(() => ({}));

  constructor() { }

  ngOnInit(): void {
  }

}
