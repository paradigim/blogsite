import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home/home.component';
import { RightSideMenuComponent } from 'src/app/Components/right-side-menu/right-side-menu.component';
import { BlogLikeComponent } from 'src/app/Components/blog-like/blog-like.component';
import { BlogCommentComponent } from 'src/app/Components/blog-comment/blog-comment.component';
import { BlogActivityMoreComponent } from 'src/app/Components/blog-activity-more/blog-activity-more.component';
import { BlogAllCommentsComponent } from 'src/app/Components/blog-all-comments/blog-all-comments.component';

@NgModule({
  declarations: [
    HomeComponent,
    RightSideMenuComponent,
    BlogLikeComponent,
    BlogCommentComponent,
    BlogActivityMoreComponent,
    BlogAllCommentsComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule
  ]
})
export class HomeModule { }
