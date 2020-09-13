import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationRoutingModule } from './notification-routing.module';
import { NotificationComponent } from './notification.component';
// import { RightSideMenuComponent } from 'src/app/Components/right-side-menu/right-side-menu.component';


@NgModule({
  declarations: [
    NotificationComponent,
  ],
  imports: [
    CommonModule,
    NotificationRoutingModule
  ]
})
export class NotificationModule { }
