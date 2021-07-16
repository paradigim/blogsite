import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnchorPipe } from './anchor.pipe';
import { ImagePipe } from './image.pipe';
import { DatePipe } from './date.pipe';
import { CommentPipe } from './comment.pipe';



@NgModule({
  declarations: [
    AnchorPipe, 
    ImagePipe, 
    DatePipe, 
    CommentPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [AnchorPipe, ImagePipe, CommentPipe]
})
export class PipesModule { }
