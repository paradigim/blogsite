import { AfterViewInit, Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, ɵɵNgOnChangesFeature } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { DataExchangeService } from 'src/app/services/data-exchange.service';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css'],
  host: {
    '(document:click)': 'onClick($event)',
  },
})
export class SideMenuComponent implements OnInit {
  userName = 'Anisya olga';
  photoUrl = './assets/images/default.png';
  userData: any;
  modalShow = false;
  uniqueUserId = '';
  userNotificationAlert = []

  @Input() menuStatus;
  @Output() changeMenuStatus = new EventEmitter<boolean>();

  constructor(
    private afAuth: AngularFireAuth,
    private interaction: InteractionService,
    private dataService: DataExchangeService
  ) { }

  ngOnInit(): void {
    this.afAuth.authState.subscribe(auth => {
      this.interaction.fetchUserFromFirebase(auth.uid).subscribe(data => {
        this.userData = data;
        if (this.userData.imageURL) {
          this.photoUrl = this.userData.imageURL;
          this.uniqueUserId = this.userData.uniqueId;
          this.interaction.updateUserData(auth.uid, this.userData.imageURL);
        } else if (auth.photoURL != null) {
          this.interaction.updateUserData(auth.uid, auth.photoURL);
        }
      });
   });


   this.dataService.userAlertForNotification$
    .subscribe(data => {
      this.userNotificationAlert = data;
    })
  }

  onClick(e) {
    if (e.target.parentElement.className !== 'menubar' && this.menuStatus === true) {
      this.menuStatus = false;
      this.changeMenuStatus.emit(this.menuStatus);
    }
  }

  ngOnChanges() {}

  changeModalStatus(): void {
    this.modalShow = !this.modalShow;
  }

}
