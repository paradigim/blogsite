import { Component, OnInit, Input } from '@angular/core';
import { DataExchangeService } from 'src/app/services/data-exchange.service';

@Component({
  selector: 'app-side-menu-item',
  templateUrl: './side-menu-item.component.html',
  styleUrls: ['./side-menu-item.component.css']
})
export class SideMenuItemComponent implements OnInit {

  @Input() text = '';
  @Input() icon = '';
  @Input() route = '';

  showIndicator = false;

  constructor(
    private data: DataExchangeService
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.setNotificationIndicator();
  }

  setNotificationIndicator() {
    const getIndicator = this.data.getIndicatorStatus();
    if (this.text === 'Notifications' && getIndicator) {
      this.showIndicator = true;
    }
  }

}
