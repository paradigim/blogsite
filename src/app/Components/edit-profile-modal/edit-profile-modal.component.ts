import { Component, OnInit, Output, EventEmitter, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataExchangeService } from 'src/app/services/data-exchange.service';
import { InteractionService } from 'src/app/services/interaction.service';

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
  userData: any;
  imageUrl = '';
  editForm: FormGroup;

  constructor(
    private dataExchange: DataExchangeService,
    private interaction: InteractionService,
    private fb: FormBuilder,
    private cdref: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getUserData();

    this.editForm = this.fb.group({
      imageUrl: [''],
      uname: ['']
    });
  }

  getUserData() {
    this.dataExchange.userId$
    .pipe(takeUntil(this.unSubscribe))
    .subscribe(uid => {
      this.interaction.getUser()
      .pipe(takeUntil(this.unSubscribe))
      .subscribe(uData => {
        this.userData = uData;
        this.editForm.get('imageUrl').setValue(this.userData.imageURL);
        this.editForm.get('uname').setValue(this.userData.name);
        this.isDataLoaded = true;
      });
    })
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
    this.modalClose.emit(false);
    this.cdref.detectChanges();
  }

  closeModal(e) {
    this.modalClose.emit(false);
  }

  loadFile(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imageUrl = reader.result as string;
      this.editForm.get('imageUrl').setValue(this.imageUrl);
    };
    reader.readAsDataURL(file);
  }

  ngOnDestroy(): void {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }
}
