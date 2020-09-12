import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-blog-post-modal',
  templateUrl: './blog-post-modal.component.html',
  styleUrls: ['./blog-post-modal.component.css']
})
export class BlogPostModalComponent implements OnInit {
  @Output() modalStatus = new EventEmitter();
  @ViewChild('modal') modal: any;
  @ViewChild('textarea') textarea: any;

  isPlaceholder = true;

  constructor() { }

  ngOnInit(): void {
    console.log('ENTER..............');
  }

  cancelBlog(): void {
    this.modal.deny();
    this.modalStatus.emit();
  }

  postBlog(): void {
    this.modal.approve();
    this.modalStatus.emit();
  }

  statusPlaceholder(e): void {
    console.log(e);
    e.preventDefault();
    if (e.target.value === '' || e.target.value === undefined || e.target.value === null) {
      this.isPlaceholder = !this.isPlaceholder;
    }
  }

}
