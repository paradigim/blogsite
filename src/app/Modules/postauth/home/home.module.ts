import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home/home.component';
import { BlogAllCommentsComponent } from 'src/app/Components/blog-all-comments/blog-all-comments.component';
import { BlogCommentInputComponent } from 'src/app/Components/blog-comment-input/blog-comment-input.component';
import { FormsModule } from '@angular/forms';
import { AutosizeModule } from 'ngx-autosize';
import { SharedModule } from 'src/app/shared/shared.module';
import { SuiModule } from 'ng2-semantic-ui';

// import { SuiModule } from 'ng2-semantic-ui';

@NgModule({
  declarations: [
    HomeComponent,
    BlogAllCommentsComponent,
    BlogCommentInputComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    FormsModule,
    AutosizeModule,
    SharedModule,
    SuiModule
  ],
})
export class HomeModule { }
