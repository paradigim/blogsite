import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-blog-post-modal',
  templateUrl: './blog-post-modal.component.html',
  styleUrls: ['./blog-post-modal.component.css']
})
export class BlogPostModalComponent implements OnInit, OnDestroy {

  constructor(private elemRef: ElementRef) { }

  ngOnInit(): void {
    document.body.appendChild(this.elemRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.elemRef.nativeElement.remove();
  }

}
