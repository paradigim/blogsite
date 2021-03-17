import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BlogActivityMoreComponent } from './blog-activity-more.component';

describe('BlogActivityMoreComponent', () => {
  let component: BlogActivityMoreComponent;
  let fixture: ComponentFixture<BlogActivityMoreComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BlogActivityMoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlogActivityMoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
