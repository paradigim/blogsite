import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SuiModule } from 'ng2-semantic-ui';

import {BlogModalComponent } from './blog-modal/blog-modal.component';
import { RightSideMenuComponent } from './right-side-menu/right-side-menu.component';


@NgModule({
  declarations: [
    BlogModalComponent,
    RightSideMenuComponent
  ],
  imports: [
    CommonModule,
    SuiModule
  ],
  exports: [BlogModalComponent, RightSideMenuComponent],
  schemas: [ NO_ERRORS_SCHEMA ],
  entryComponents: [BlogModalComponent]
})
export class SharedModule { }
