import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InteractionService } from 'src/app/services/interaction.service';
import { Router } from '@angular/router';
import { format } from 'date-fns';
import * as data from 'src/assets/language.json';

@Component({
  selector: 'app-blog-modal',
  templateUrl: './blog-modal.component.html',
  styleUrls: ['./blog-modal.component.css']
})
export class BlogModalComponent implements OnInit, OnChanges {
  @Input() editPostData;
  @Output() modalStatus = new EventEmitter();
  @ViewChild('modal') modal: any;
  @ViewChild('textarea') textarea: any;
  jsonData = (data as any).default;

  content: string;
  isPlaceholder = true;
  postForm: FormGroup;
  file: any;
  imageURL = '';
  isBlogPost = false;
  postButton = true;
  editPost = false;

  constructor(
    private formBuilder: FormBuilder,
    private interaction: InteractionService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.postForm = this.formBuilder.group({
      content: [''],
      imageUrl: [''],
      videoUrl: ['']
    });
  }

  ngOnChanges(): void {
    console.log('POST: ', this.editPostData);
    if (this.editPostData) {
      this.editPost = true;
      this.postForm.patchValue({
        content: this.editPostData.contents,
        imageUrl: this.editPostData.image
      });
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
    const postDate = format(new Date(), 'dd MMM, yyyy');

    if (this.editPost) {
      this.interaction.updatePost(this.editPostData.id, content, image, video, postDate).then(res => {
        this.isBlogPost = false;
        this.modal.approve();
        this.modalStatus.emit();
        this.router.navigate(['/home']);
      }).catch(err => {
        this.isBlogPost = false;
      });
    } else {
      this.interaction.post(content, postDate, image, video).then(res => {
        debugger;
        this.isBlogPost = false;
        this.modal.approve();
        this.modalStatus.emit();
        this.router.navigate(['/home']);
      }).catch(err => {
        this.isBlogPost = false;
      });
    }
  }

  loadFile(e): void {
    this.file = e.target.files[0];
    const reader = new FileReader();
    console.log('reader......', reader);
    reader.onload = () => {
      this.imageURL = reader.result as string;
      this.postForm.get('imageUrl').setValue(this.imageURL);
    };
    reader.readAsDataURL(this.file);
  }

  deleteImage(): void {
    this.imageURL = '';
  }

  activeCommentBTN(e: any): void {
    // activate comment button if there is value in textarea
    if (e.target.value) {
      this.postButton = false;
    } else {
      this.postButton = true;
    }
  }
}
