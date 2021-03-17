import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BlogLikeComponent } from './blog-like.component';

describe('BlogLikeComponent', () => {
  let component: BlogLikeComponent;
  let fixture: ComponentFixture<BlogLikeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BlogLikeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlogLikeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
