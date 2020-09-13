import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SuiModule } from 'ng2-semantic-ui';

import { BlogPostModalComponent } from './blog-post-modal/blog-post-modal.component';
import { RightSideMenuComponent } from './right-side-menu/right-side-menu.component';


@NgModule({
  declarations: [
    BlogPostModalComponent,
    RightSideMenuComponent
  ],
  imports: [
    CommonModule,
    SuiModule
  ],
  exports: [BlogPostModalComponent, RightSideMenuComponent],
  schemas: [ NO_ERRORS_SCHEMA ],
})
export class SharedModule { }
