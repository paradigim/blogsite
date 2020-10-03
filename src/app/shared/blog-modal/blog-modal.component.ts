import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InteractionService } from 'src/app/services/interaction.service';
import { Router } from '@angular/router';
import { format } from 'date-fns';

@Component({
  selector: 'app-blog-modal',
  templateUrl: './blog-modal.component.html',
  styleUrls: ['./blog-modal.component.css']
})
export class BlogModalComponent implements OnInit {
  @Output() modalStatus = new EventEmitter();
  @ViewChild('modal') modal: any;
  @ViewChild('textarea') textarea: any;

  content: string;
  isPlaceholder = true;
  postForm: FormGroup;
  file: any;
  imageURL = '';
  isBlogPost = false;
  postButton = true;

  constructor(
    private formBuilder: FormBuilder,
    private interaction: InteractionService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.postForm = this.formBuilder.group({
      content: [''],
      imageUrl: ['']
    });
  }

  cancelBlog(): void {
    this.modal.deny();
    this.modalStatus.emit();
  }

  statusPlaceholder(e): void {
    e.preventDefault();
    const val = (e.target.value).trim();

    if (val === '' || val === undefined || val === null) {
      this.isPlaceholder = !this.isPlaceholder;
      console.log('isPlaceholder: ', this.isPlaceholder);
    }
    console.log('Form: ', this.postForm);
  }


  // submitted = false;
  // get f() { return this.postForm.controls; }

  postBlog(e): void {
    e.preventDefault();
    this.isBlogPost = true;
    const content = this.postForm.get('content').value;
    const image = this.postForm.get('imageUrl').value;
    const postDate = format(new Date(), 'dd MMM, yyyy');

    this.interaction.post(content, postDate, image).then(res => {
      this.isBlogPost = false;
      this.modal.approve();
      this.modalStatus.emit();
      this.router.navigate(['/home']);
    }).catch(err => {
      this.isBlogPost = false;
    });
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
