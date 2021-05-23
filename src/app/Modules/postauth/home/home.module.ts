import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home/home.component';
import { FormsModule } from '@angular/forms';
import { AutosizeModule } from 'ngx-autosize';
import { SharedModule } from 'src/app/shared/shared.module';
import { SuiModule } from 'ng2-semantic-ui';
import { PipesModule } from 'src/app/pipes/pipes.module';
import {ScrollingModule} from '@angular/cdk/scrolling';

@NgModule({
  declarations: [
    HomeComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    FormsModule,
    AutosizeModule,
    SharedModule,
    SuiModule,
    PipesModule,
    ScrollingModule
  ],
  
})
export class HomeModule { }
