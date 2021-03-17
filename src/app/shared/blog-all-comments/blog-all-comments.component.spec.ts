import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BlogAllCommentsComponent } from './blog-all-comments.component';

describe('BlogAllCommentsComponent', () => {
  let component: BlogAllCommentsComponent;
  let fixture: ComponentFixture<BlogAllCommentsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BlogAllCommentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlogAllCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
