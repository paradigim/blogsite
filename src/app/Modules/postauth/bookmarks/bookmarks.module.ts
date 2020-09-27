import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BookmarksRoutingModule } from './bookmarks-routing.module';
import { BookmarksComponent } from './bookmarks.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    BookmarksComponent,
  ],
  imports: [
    CommonModule,
    BookmarksRoutingModule,
    SharedModule
  ]
})
export class BookmarksModule { }
