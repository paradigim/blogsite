import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css']
})
export class SideMenuComponent implements OnInit {

  userName = 'Anisya olga';
  userId = '@Anisyaolga21123';

  modalShow = false;

  constructor() { }

  ngOnInit(): void {
  }

  changeModalStatus(): void {
    this.modalShow = !this.modalShow;
    console.log('MODAL STATUS: ', this.modalShow);
  }

}
