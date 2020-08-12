import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  likeCount: number;

  constructor() { }

  ngOnInit(): void {
  }

  getLikeCounts(event: number): void {
    this.likeCount = event;
  }

}
