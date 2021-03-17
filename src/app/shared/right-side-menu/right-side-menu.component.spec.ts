import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RightSideMenuComponent } from './right-side-menu.component';

describe('RightSideMenuComponent', () => {
  let component: RightSideMenuComponent;
  let fixture: ComponentFixture<RightSideMenuComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RightSideMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RightSideMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
