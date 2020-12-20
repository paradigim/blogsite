import { Component, Input, OnInit, OnChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
  @ViewChild('modal') modal: any;

  uData: any;
  isDataLoaded = false;
  unSubscribe = new Subject();
  userData: any;
  imageUrl = '';
  editForm: FormGroup;

  constructor(
    private dataExchange: DataExchangeService,
    private interaction: InteractionService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.isDataLoaded = true;
    this.getUserData();

    this.editForm = this.fb.group({
      name: ['', Validators.required],
      imageUrl: ['']
    })
  }

  getUserData() {
    this.dataExchange.userId$
    .pipe(takeUntil(this.unSubscribe))
    .subscribe(uid => {
      this.interaction.getUser()
      .pipe(takeUntil(this.unSubscribe))
      .subscribe(uData => {
        this.userData = uData;
        this.editForm.get('imageUrl').setValue(this.userData.imageURL)
        this.isDataLoaded = false;
        console.log('U DATA: ', uData);
      });
    })
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
