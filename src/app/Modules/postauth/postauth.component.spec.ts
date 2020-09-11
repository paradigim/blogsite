import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostauthComponent } from './postauth.component';

describe('PostauthComponent', () => {
  let component: PostauthComponent;
  let fixture: ComponentFixture<PostauthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostauthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostauthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
