import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css']
})
export class SideMenuComponent implements OnInit {

  userName = 'Anisya olga';
  userId = '@Anisyaolga21123';
  photoUrl = './assets/images/user_default.jpg';
  userData: any;
  modalShow = false;

  constructor(
    private afAuth: AngularFireAuth,
    private interaction: InteractionService
  ) { }

  ngOnInit(): void {
    this.afAuth.authState.subscribe(auth => {
      console.log('auth........', auth);
      if (auth.photoURL != null) {
        this.interaction.updateUserData(auth.uid, auth.photoURL);
      }
      this.interaction.fetchUserFromFirebase(auth.uid).subscribe(data => {
        this.userData = data;
        if (this.userData.imageURL) {
          this.photoUrl = this.userData.imageURL;
        }

        console.log('userData : ', this.userData);
        // this.spinner.hide();
      });
   });
  }

  changeModalStatus(): void {
    this.modalShow = !this.modalShow;
  }

}
