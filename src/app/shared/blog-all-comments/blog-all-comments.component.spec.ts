import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogAllCommentsComponent } from './blog-all-comments.component';

describe('BlogAllCommentsComponent', () => {
  let component: BlogAllCommentsComponent;
  let fixture: ComponentFixture<BlogAllCommentsComponent>;

  beforeEach(async(() => {
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
