import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogPostModalComponent } from './blog-post-modal.component';

describe('BlogPostModalComponent', () => {
  let component: BlogPostModalComponent;
  let fixture: ComponentFixture<BlogPostModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlogPostModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlogPostModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
