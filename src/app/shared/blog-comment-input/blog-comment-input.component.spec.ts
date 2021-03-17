import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BlogCommentInputComponent } from './blog-comment-input.component';

describe('BlogCommentInputComponent', () => {
  let component: BlogCommentInputComponent;
  let fixture: ComponentFixture<BlogCommentInputComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BlogCommentInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlogCommentInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
