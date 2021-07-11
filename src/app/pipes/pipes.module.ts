import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnchorPipe } from './anchor.pipe';
import { ImagePipe } from './image.pipe';
import { DatePipe } from './date.pipe';



@NgModule({
  declarations: [AnchorPipe, ImagePipe, DatePipe],
  imports: [
    CommonModule
  ],
  exports: [AnchorPipe, ImagePipe]
})
export class PipesModule { }
