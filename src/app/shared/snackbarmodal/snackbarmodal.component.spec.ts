import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnackbarmodalComponent } from './snackbarmodal.component';

describe('SnackbarmodalComponent', () => {
  let component: SnackbarmodalComponent;
  let fixture: ComponentFixture<SnackbarmodalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SnackbarmodalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SnackbarmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
