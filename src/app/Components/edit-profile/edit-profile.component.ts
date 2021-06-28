import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataExchangeService } from 'src/app/services/data-exchange.service';
import { InteractionService } from 'src/app/services/interaction.service';
import { UserService } from 'src/app/state/user/user.service'

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
    private userService: UserService
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
