import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxImageCompressService } from 'ngx-image-compress';
import { UserData } from 'src/app/Models/user';
import { PostService } from 'src/app/services/post.service';
import { PostData } from 'src/app/Models/post';
import { DataExchangeService } from 'src/app/services/data-exchange.service';
import { Overlay } from '@angular/cdk/overlay';
import { CommonErrorDialogComponent } from '../common-error-dialog/common-error-dialog.component';

@Component({
  selector: 'app-post-dialog',
  templateUrl: './post-dialog.component.html',
  styleUrls: ['./post-dialog.component.css']
})
export class PostDialogComponent implements OnInit {

  @ViewChild('imageUpload') imageUpload: any;

  userData: UserData;
  postForm: FormGroup;
  uploadImageUrl = '';
  formData: any;
  postData: PostData;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { user: UserData },
    private fb: FormBuilder,
    private imageCompress: NgxImageCompressService,
    private postService: PostService,
    private dataService: DataExchangeService,
    private matDialog: MatDialog,
    private overlay: Overlay
  ) { }

  ngOnInit(): void {
    this.userData = this.data.user;
    this.formData = new FormData();

    this.postForm = this.fb.group({
      content: [''],
      imageUrl: [''],
      videoUrl: ['']
    });
  }


  /**
   * process to upload a profile image
   * @param e file upload event
   */
   loadFile(e, fileType) {
    const file = e.target.files[0];

    if (file) {
      const fileName = file['name'];

      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.uploadImageUrl = reader.result as string;
        if (fileType === 'image') {
          this.postForm.get('imageUrl').setValue(this.uploadImageUrl);
        }
        
        this.compressImage(this.uploadImageUrl, fileName);
      };  
    }
  }

  dataURItoBlob(dataURI) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/jpeg' });
    return blob;
  }

  // Compress the image and reduce the size
  compressImage(imgUrl, fileName) {
    const orientation = -1;

    this.imageCompress.compressFile(imgUrl, orientation, 50, 50).then(
      result => {
        // create file from byte
        const imageName = fileName;
        // call method that creates a blob from dataUri
        const imageBlob = this.dataURItoBlob(result.split(',')[1]);
        //imageFile created below is the new compressed file which can be send to API in form data
        const newFileObj = new File([imageBlob], imageName);

        const reader = new FileReader();
        reader.readAsDataURL(newFileObj);
        reader.onload = () => {
          this.formData.append('postImage', newFileObj, fileName);
        }
      }
    );
  }

  newPost() {
    const postDate = new Date().getTime();
    this.formData.append('content', this.postForm.get('content').value);
    this.formData.append('postDate', postDate);

    this.postService.createNewPost(this.formData)
      .subscribe((post: PostData) => {
        console.log('POST: ', post);
        this.dataService.saveNewPostData(post);
      }, err => {
        this.matDialog.open(CommonErrorDialogComponent, {
          data: {
            message: err.error.message
          },
          width: '300px',
          autoFocus: false,
          scrollStrategy: this.overlay.scrollStrategies.noop()
        });
      });
  }

  removeFile() {
    this.uploadImageUrl = '';
    this.postForm.get('imageUrl').setValue('');
    this.imageUpload.nativeElement.value = '';
  }

}
