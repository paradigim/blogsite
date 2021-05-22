import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BlogDetailsRoutingModule } from './blog-details-routing.module';
import { BlogDetailsComponent } from './blog-details.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PipesModule } from 'src/app/pipes/pipes.module';


@NgModule({
  declarations: [
    BlogDetailsComponent,
    
  ],
  imports: [
    CommonModule,
    BlogDetailsRoutingModule,
    SharedModule,
    PipesModule
  ]
})
export class BlogDetailsModule { }
