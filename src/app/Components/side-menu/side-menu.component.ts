import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css']
})
export class SideMenuComponent implements OnInit {

  userName = 'Anisya olga';
  userId = '@Anisyaolga21123';

  constructor() { }

  ngOnInit(): void {
  }

}
