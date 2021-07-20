import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnchorPipe } from './anchor.pipe';
import { ImagePipe } from './image.pipe';
import { DatePipe } from './date.pipe';
import { CommentPipe } from './comment.pipe';
import { FollowPipe } from './follow.pipe';



@NgModule({
  declarations: [
    AnchorPipe, 
    ImagePipe, 
    DatePipe, 
    CommentPipe, 
    FollowPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    AnchorPipe, 
    ImagePipe, 
    CommentPipe,
    FollowPipe
  ]
})
export class PipesModule { }
