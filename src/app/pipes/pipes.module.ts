import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnchorPipe } from './anchor.pipe';
import { ImagePipe } from './image.pipe';



@NgModule({
  declarations: [AnchorPipe, ImagePipe],
  imports: [
    CommonModule
  ],
  exports: [AnchorPipe, ImagePipe]
})
export class PipesModule { }
