import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataExchangeService } from 'src/app/services/data-exchange.service';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  @Input() userStatus = false;
  unSubscribe = new Subject();
  showModal = false;
  userData: any;

  constructor(
    private interaction: InteractionService,
    private dataExchange: DataExchangeService
  ) { }

  ngOnInit(): void {
  }

  editProfile() {
    this.showModal = true;
  }

  modalStatusClose(e) {
    this.showModal = false;
  }

  logout(): void {
    this.interaction.signOutUser();
  }

  ngOnDestroy(): void {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }

}
