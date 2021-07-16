import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SuiModule } from 'ng2-semantic-ui';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BlogModalComponent } from './blog-modal/blog-modal.component';
import { RightSideMenuComponent } from './right-side-menu/right-side-menu.component';
import { BlogLikeComponent } from './blog-like/blog-like.component';
import { BlogCommentComponent } from './blog-comment/blog-comment.component';
import { BlogActivityMoreComponent } from './blog-activity-more/blog-activity-more.component';
import { CommonModalComponent } from './common-modal/common-modal.component';
import { BlogAllCommentsComponent } from './blog-all-comments/blog-all-comments.component';
import { BlogCommentInputComponent } from './blog-comment-input/blog-comment-input.component';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { SnackbarmodalComponent } from './snackbarmodal/snackbarmodal.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  declarations: [
    BlogModalComponent,
    RightSideMenuComponent,
    BlogLikeComponent,
    BlogCommentComponent,
    BlogActivityMoreComponent,
    CommonModalComponent,
    BlogAllCommentsComponent,
    BlogCommentInputComponent,
    SnackbarmodalComponent
  ],
  imports: [
    CommonModule,
    SuiModule,
    FormsModule,
    ReactiveFormsModule,
    PickerModule,
    EmojiModule,
    AngularFireStorageModule,
    MatSnackBarModule,
    PipesModule
  ],
  exports: [
    BlogModalComponent,
    RightSideMenuComponent,
    BlogLikeComponent,
    BlogCommentComponent,
    BlogActivityMoreComponent,
    CommonModalComponent,
    BlogAllCommentsComponent,
    BlogCommentInputComponent,
    SnackbarmodalComponent
  ],
  schemas: [NO_ERRORS_SCHEMA],
  entryComponents: [BlogModalComponent],
})
export class SharedModule {}
