import { Component, OnInit, Output, EventEmitter, ViewChild, ChangeDetectorRef, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { skipWhile, take, takeUntil } from 'rxjs/operators';
import { UserData } from 'src/app/Models/user';
import { DataExchangeService } from 'src/app/services/data-exchange.service';
import { InteractionService } from 'src/app/services/interaction.service';
import {ErrorStateMatcher} from '@angular/material/core';
import { UpdateService } from 'src/app/services/update.service';

// export class MyErrorStateMatcher implements ErrorStateMatcher {
//   isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
//     const isSubmitted = form && form.submitted;
//     return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
//   }
// }

@Component({
  selector: 'app-edit-profile-modal',
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.css']
})
export class EditProfileModalComponent implements OnInit {
  @Output() modalClose = new EventEmitter<boolean>();

  uData: any;
  isDataLoaded = null;
  unSubscribe = new Subject();
  imageUrl = '';
  editForm: FormGroup;
  userData: UserData;

  showSnackbarStatus = false;
  snackbarText = '';

  constructor(
    private dataExchange: DataExchangeService,
    private interaction: InteractionService,
    private fb: FormBuilder,
    private cdref: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: {user: UserData},
    private updateService: UpdateService
  ) { }

  ngOnInit(): void {
    this.userData = this.data.user;
    console.log('DATA: ', this.userData);

    this.editForm = this.fb.group({
      name: ['', Validators.required],
      phone: [null],
      gender: ['']
    });

    if (this.userData) {
      this.initialFormWithData();
    }
  }

  initialFormWithData() {
    this.editForm.patchValue({
      name: this.userData.name,
      phone: !this.userData.phone ? '' : this.userData.phone,
      gender: this.userData.gender
    })
  }

  updateProfile() {
    const dataToUpdate = {
      name: this.editForm.get('name').value,
      phone: this.editForm.get('phone').value,
      gender: this.editForm.get('gender').value
    }

    this.updateService.updateProfileData(dataToUpdate)
      .pipe(
        skipWhile(res => !res),
        take(1)
      )
      .subscribe(res => {
        console.log('RES: ', res);
        this.showSnackbarStatus = true;
        this.snackbarText = res.status;
      }, err => {
        console.log('ERROR: ', err);
        // this.updateErrorText = err.error.message; TODO: need to show error popup
      });
  }

  saveProfile() {
    const dataToUpdate = {
      uname: this.editForm.get('uname').value,
      image: this.editForm.get('imageUrl').value
    }
    this.interaction.updateUser(dataToUpdate);
    this.interaction.updatePostData(dataToUpdate);
    this.dataExchange.checkIsUpdated(true);
    this.isDataLoaded = false;
    this.closeModal();
    this.cdref.detectChanges();
  }

  closeModal(e = null) {
    this.modalClose.emit(false);
  }

  ngOnDestroy(): void {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }
}
