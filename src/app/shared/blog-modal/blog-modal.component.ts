import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InteractionService } from 'src/app/services/interaction.service';
import { Router } from '@angular/router';
import { format } from 'date-fns';
import * as data from 'src/assets/language.json';
import { finalize, skipWhile, take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DataExchangeService } from 'src/app/services/data-exchange.service';
import { AngularFireStorage } from '@angular/fire/storage';

@Component({
  selector: 'app-blog-modal',
  templateUrl: './blog-modal.component.html',
  styleUrls: ['./blog-modal.component.css']
})
export class BlogModalComponent implements OnInit, OnChanges {
  @Input() editPostData;
  @Input() userImage = './assets/images/default.png';
  @Input() userId = '';
  @Output() modalStatus = new EventEmitter();
  @ViewChild('modal') modal: any;
  @ViewChild('textarea') textarea: any;
  @ViewChild('imageUpload') imageUpload: any;
  @ViewChild('videoUpload') videoUpload: any;
  jsonData = (data as any).default;

  content: string;
  isPlaceholder = true;
  postForm: FormGroup;
  file: any;
  imageURL = '';
  isBlogPost = false;
  postButton = true;
  editPost = false;
  showEmoji = false;
  comment = '';
  ngUnsubscribe = new Subject();
  userFollowers = [];
  currentRoute = '';
  videoURL = '';
  selectedFile: any;
  percentageUpload;
  task;
  fileType = '';
  fileRef;

  constructor(
    private formBuilder: FormBuilder,
    private interaction: InteractionService,
    public router: Router,
    private dataService: DataExchangeService,
    private afs: AngularFireStorage
  ) {
    this.currentRoute = this.router.url;
  }

  ngOnInit(): void {
    this.postForm = this.formBuilder.group({
      content: [''],
      imageUrl: [''],
      videoUrl: ['']
    });
    
    this.interaction.getUser(this.userId)
      .pipe(skipWhile(user => !user))
      .pipe(take(1))
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((user) => {
        this.userFollowers = user.follower;
      })
  }

  ngOnChanges(): void {
    if (this.editPostData) {
      this.editPost = true;
      this.postForm.patchValue({
        content: this.editPostData.contents,
        imageUrl: this.editPostData.image,
        videoUrl: this.editPostData.video
      });
      this.postButton = false;
      this.userImage = this.editPostData.userImage;
      this.imageURL = this.editPostData.image;
      if (this.postForm.value.content) {
        this.statusPlaceholder();
      }
    }
  }

  cancelBlog(): void {
    this.modal.deny();
    this.modalStatus.emit();
  }

  statusPlaceholder(): void {
    this.isPlaceholder = false;
  }

  statusPlaceholderBlur(val): void {
    if (val === '') {
      this.isPlaceholder = true;
    }
  }

  postBlog(e): void {
    e.preventDefault();
    this.isBlogPost = true;
    const content = this.postForm.get('content').value;
    const image = this.postForm.get('imageUrl').value;
    const video = this.postForm.get('videoUrl').value;
    const postDate = new Date().getTime();

    if (this.editPost) {
      this.interaction.updatePost(this.editPostData.id, content, image, video, postDate).then(res => {
        this.modal.approve();
        this.modalStatus.emit();
        this.isBlogPost = false;
        this.router.navigate(['/home']);
      }).catch(err => {
        this.isBlogPost = false;
      });
    } else {
      const id = this.interaction.createId();
      this.interaction.postNew(content, postDate, id)
      .subscribe(async res => {
        if (this.fileType === 'video') {
          const snap = await this.afs.upload(`/videos/${new Date().getTime()}_${this.selectedFile.name}`, this.selectedFile);
          this.saveFile(snap, id);
          
        } else if(this.fileType === 'image') {
          const snap = await this.afs.upload(`/images/${new Date().getTime()}_${this.selectedFile.name}`, this.selectedFile);
          this.saveFile(snap, id);
        }
        
        if (this.userFollowers.length > 0) {
          this.dataService.setNewPostStatus(true);
          this.interaction.setNotification(id, this.userFollowers).then(() => {
            this.dataService.saveUsersForNotificationAlert(this.userFollowers);
            this.interaction.updateUserNotificationReadStatus(this.userFollowers);
            this.dataService.loadAfterNewPost(true);
            this.modal.approve();
            this.modalStatus.emit();
            this.isBlogPost = false;
            this.router.navigate(['/home']);
          });
        } else {
          this.dataService.loadAfterNewPost(true);
          this.modal.approve();
          this.modalStatus.emit();
          this.isBlogPost = false;
          this.router.navigate(['/home']);
        }
      },
      err => {
        this.isBlogPost = false;
        this.modal.denied();
        this.modalStatus.emit();
        this.router.navigate(['/home']);
      });
    }
  }

  // save the video or image url to the respective post
  saveFile(snap, postId) {
    snap.ref.getDownloadURL().then(url => {
      this.interaction.updateVideoImage(postId, this.fileType, url).then(res => {
        this.dataService.loadAfterNewPost(true);
      });
    });
  }

  // load post image in modal
  loadFile(e, fileType = ''): void {
    this.fileType = fileType;
    this.selectedFile = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      if (fileType === 'video') {
        this.imageURL = '';
        this.videoURL = reader.result as string;
        this.postForm.get('imageUrl').setValue('');
        this.postForm.get('videoUrl').setValue(this.videoURL);
        this.fileRef = this.afs.ref(`/videos/${new Date().getTime()}_${this.selectedFile.name}`);
        // this.task = this.afs.upload(`/videos/${new Date().getTime()}_${this.selectedFile.name}`, this.selectedFile);
      } else {
        this.videoURL = '';
        this.imageURL = reader.result as string;
        this.postForm.get('videoUrl').setValue('');
        this.postForm.get('imageUrl').setValue(this.imageURL);
        this.fileRef = this.afs.ref(`/images/${new Date().getTime()}_${this.selectedFile.name}`);
        // this.task = this.afs.upload(`/images/${new Date().getTime()}_${this.selectedFile.name}`, this.selectedFile);
      }
      // this.percentageUpload = this.task.percentageChanges();
      // this.percentageUpload.subscribe(data => {
      //   console.log('PERCENTGE: ', data);
      // });
      this.postButton = false;
    };
    reader.readAsDataURL(this.selectedFile);
  }

  // delete post image from modal
  deleteImage(): void {
    this.imageURL = '';
    this.postForm.get('imageUrl').setValue('');
    this.imageUpload.nativeElement.value = '';
  }

  activeCommentBTN(e?: any): void {
    this.comment = e.target.value;

    console.log('E: ', e)

    // activate comment button if there is value in textarea
    if (e.target.value) {
      this.postButton = false;
    } else {
      if (this.imageURL) {
        this.postButton = false;
      } else {
        this.postButton = true;
      }
    }
  }

  showEmojiMart() {
    this.showEmoji = !this.showEmoji;
  }

  selectEmoji(e) {
    this.comment = `${this.comment}${e.emoji.native}`;
    this.showEmoji = !this.showEmoji;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
