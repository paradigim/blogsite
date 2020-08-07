import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-side-menu-item',
  templateUrl: './side-menu-item.component.html',
  styleUrls: ['./side-menu-item.component.css']
})
export class SideMenuItemComponent implements OnInit {

  @Input() text = '';
  @Input() icon = '';
  @Input() route = '';

  constructor() { }

  ngOnInit(): void {
  }

}
