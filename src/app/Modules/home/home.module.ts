import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home/home.component';
import { RightSideMenuComponent } from 'src/app/Components/right-side-menu/right-side-menu.component';


@NgModule({
  declarations: [
    HomeComponent,
    RightSideMenuComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule
  ]
})
export class HomeModule { }
