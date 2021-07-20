import { Overlay } from '@angular/cdk/overlay';
import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { skipWhile, take, takeUntil } from 'rxjs/operators';
import { UserData } from 'src/app/Models/user';
import { DataExchangeService } from 'src/app/services/data-exchange.service';
import { InteractionService } from 'src/app/services/interaction.service';
import { UserService } from 'src/app/services/user.service';
import { EditProfileModalComponent } from '../edit-profile-modal/edit-profile-modal.component';

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
    private router: Router,
    private userService: UserService,
    private matDialog: MatDialog,
    private overlay: Overlay
  ) { }

  ngOnInit(): void {
    this.getUserData();
  }

  getUserData() {
    this.userService.fetchUserData()
      .pipe(skipWhile(res => !res))
      .pipe(take(1))
      .subscribe((user: UserData) => {
        this.userData = user;
      });
  }

  editProfile() {
    this.matDialog.open(EditProfileModalComponent, {
      data: {
        user: this.userData
      },
      width: '500px',
      autoFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.noop()
    });
  }

  modalStatusClose(e) {
    this.showModal = false;
  }

  logout(): void {
    const getJwtFromStorage = localStorage.getItem('jwt');
    if (getJwtFromStorage) {
      this.interaction.removeFromLocalStorage('jwt');
      this.userService.updateStatusOnLogout()
      this.router.navigate(['auth/login']);
    } else {
      return;
    }
  }

  ngOnDestroy(): void {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }

}
