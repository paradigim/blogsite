import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SuiModule } from 'ng2-semantic-ui';
import { AutosizeModule } from 'ngx-autosize';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BlogModalComponent } from './blog-modal/blog-modal.component';
import { RightSideMenuComponent } from './right-side-menu/right-side-menu.component';
import { BlogLikeComponent } from './blog-like/blog-like.component';
import { BlogCommentComponent } from './blog-comment/blog-comment.component';
import { BlogActivityMoreComponent } from './blog-activity-more/blog-activity-more.component';
import { CommonModalComponent } from './common-modal/common-modal.component';


@NgModule({
  declarations: [
    BlogModalComponent,
    RightSideMenuComponent,
    BlogLikeComponent,
    BlogCommentComponent,
    BlogActivityMoreComponent,
    CommonModalComponent
  ],
  imports: [
    CommonModule,
    SuiModule,
    AutosizeModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    BlogModalComponent,
    RightSideMenuComponent,
    BlogLikeComponent,
    BlogCommentComponent,
    BlogActivityMoreComponent,
    CommonModalComponent
  ],
  schemas: [ NO_ERRORS_SCHEMA ],
  entryComponents: [BlogModalComponent]
})
export class SharedModule { }
