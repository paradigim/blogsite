import { Overlay } from '@angular/cdk/overlay';
import { Component, OnInit, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { filter, skipWhile, take, takeUntil } from 'rxjs/operators';
import { ConfirmationComponent } from 'src/app/Components/confirmation/confirmation.component';
import { PostDialogComponent } from 'src/app/Components/post-dialog/post-dialog.component';
import { PostData } from 'src/app/Models/post';
import { UserData } from 'src/app/Models/user';
import { DataExchangeService } from 'src/app/services/data-exchange.service';
import { InteractionService } from 'src/app/services/interaction.service';
import { PostService } from 'src/app/services/post.service';
import { UpdateService } from 'src/app/services/update.service';
import { UserService } from 'src/app/state/user/user.service';
// import * as $ from 'jquery';
declare var $: any;

@Component({
  selector: 'app-blog-activity-more',
  templateUrl: './blog-activity-more.component.html',
  styleUrls: ['./blog-activity-more.component.css']
})
export class BlogActivityMoreComponent implements OnInit {

  @Output() chngStatus = new EventEmitter<boolean>();
  @Output() isPostDelete = new EventEmitter<boolean>();
  @Output() snackbarBookmarkStatus = new EventEmitter<string>();
  @Output() removeFromArray = new EventEmitter<number>();

  @Input() elemId = '';
  @Input() index: number;
  @Input() postData: PostData;
  @Input() postUserId: number;
  @Input() videoUrl = '';
  @Input() imageUrl = '';
  @Input() user: UserData;

  bookmarkStatus: boolean;
  bookmarkText = 'Bookmark';
  modalShow = false;
  editPostData: any;

  ngUnsubscribe = new Subject();

  constructor(
    private interaction: InteractionService,
    private afAuth: AngularFireAuth,
    private afStorage: AngularFireStorage,
    private userService: UserService,
    private updateService: UpdateService,
    private dataExchange: DataExchangeService,
    private matDialog: MatDialog,
    private overlay: Overlay,
    private postService: PostService
  ) {}

  ngOnInit(): void {

    const dropdownEl = document.querySelectorAll('.dropdown')[Number(this.index)];
    dropdownEl.id = this.elemId;

    // to show the targeted dropdown element
    document.getElementById(dropdownEl.id).addEventListener('click', (event) => {
      this.accessDropDownMenu(event, dropdownEl);
    });

    // to hide the targeted dropdown element on click outside of the element
    document.addEventListener('click', () => {
      this.closeDropDown(dropdownEl);
    });

    this.initialBookmarkCheck();
  }

  initialBookmarkCheck(bookmarkStatusAfterAction = false) {
    const ifBookmarked = this.postData.bookmarks.filter(item => item === String(this.user.id));

    if (ifBookmarked.length > 0) {
      this.bookmarkStatus = true;
      this.bookmarkText = 'Remove Bookmark';

      if (bookmarkStatusAfterAction) {
        this.snackbarBookmarkStatus.emit('added');
      }
    } else {
      this.bookmarkText = 'Bookmark';
      if (bookmarkStatusAfterAction) {
        this.snackbarBookmarkStatus.emit('removed');
        this.removeFromArray.emit(this.postData.id);
      }
    }
  }

  bookmark() {
    let newBookmarkList = this.postData.bookmarks;
    const bookmarkUserIndex = this.postData.bookmarks.findIndex(userId => userId === String(this.user.id));

    if (bookmarkUserIndex < 0) {
      newBookmarkList = [...newBookmarkList, String(this.user.id)];
    } else {
      newBookmarkList.splice(bookmarkUserIndex, 1);
    }

    this.postService.updateBookmarkData(newBookmarkList, this.postData.id)
      .subscribe((post: PostData) => {
          this.postData = post;
          this.initialBookmarkCheck(true);
      });
  }


  // function to access and manupulate dropdown menu
  private accessDropDownMenu(event: any, dropdownEl: any): void {
    event.stopPropagation();
    dropdownEl.classList.toggle('menu');
  }

  // function to delete dropdown on click outside of the element
  private closeDropDown(dropdownEl: any): void {
    if (dropdownEl.classList.contains('menu')) {
      dropdownEl.classList.remove('menu');
    }
  }

  // edit the post
  editPost(): void {
    console.log('POST DATA: ', this.postData);

    this.matDialog.open(PostDialogComponent, {
      data: {
        user: this.user,
        post: this.postData,
        edit: true
      },
      width: '500px',
      autoFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.noop()
    });
  }

  changeModalStatus(): void {
    this.modalShow = !this.modalShow;
  }

  // permanently delete the post
  doDeletePermanently() {
    let url = '';
    if (this.videoUrl) {
      url = this.videoUrl;
    } else if(this.imageUrl) {
      url = this.imageUrl;
    }

    this.updateService.deletePost(this.postData.id)
      .subscribe(() => {
        this.dataExchange.saveDeletedPostId(this.postData.id);
      });
  }

  // delete the post
  askForDeletePostConfirmation(): void {
    const matDialogRef = this.matDialog.open(ConfirmationComponent, {
      data: {
        message: 'Are you sure ?'
      },
      width: '300px',
      autoFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.noop()
    });

    
    matDialogRef.afterClosed()
      .pipe(
        filter(res => res)
      )
      .subscribe(result => {
        this.doDeletePermanently();
      })


    
    // this.interaction.deletePost(this.postId)
    //   .then(() => {
    //     this.interaction.getAllNotification()
    //       .pipe(skipWhile(val => !val))
    //       .pipe(take(1))
    //       .subscribe(data => {
    //         if (data.length > 0) {
    //           this.isPostDelete.emit(true);
    //           const notiAfterDelete = data.filter(item => item.notificationPostId === this.postId);
    //           this.interaction.deleteNoti(notiAfterDelete);
    //           if (url) {
    //             this.interaction.deleteFileFromStaorage(url);
    //           }
    //         }
    //       })
    //   }).catch(err => {
    //     console.log('Post can not be removed');
    //   });
  }
}
