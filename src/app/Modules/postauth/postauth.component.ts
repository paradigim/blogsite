import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-postauth',
  templateUrl: './postauth.component.html',
  styleUrls: ['./postauth.component.css']
})
export class PostauthComponent implements OnInit {

  menuStatus = false;

  constructor(
  ) { }

  ngOnInit(): void {
    
  }

  sideMenuStatus() {
    this.menuStatus = !this.menuStatus;
  }

  setStatus(e) {
    this.menuStatus = e;
  }

}
