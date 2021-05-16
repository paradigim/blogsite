import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnchorPipe } from './anchor.pipe';



@NgModule({
  declarations: [AnchorPipe],
  imports: [
    CommonModule
  ],
  exports: [AnchorPipe]
})
export class PipesModule { }
