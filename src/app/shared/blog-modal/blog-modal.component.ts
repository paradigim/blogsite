import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-blog-modal',
  templateUrl: './blog-modal.component.html',
  styleUrls: ['./blog-modal.component.css']
})
export class BlogModalComponent implements OnInit {
  @Output() modalStatus = new EventEmitter();
  @ViewChild('modal') modal: any;
  @ViewChild('textarea') textarea: any;

  isPlaceholder = true;

  constructor() { }

  ngOnInit(): void {
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
