import { Component, OnInit } from '@angular/core';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(
    private interaction: InteractionService
  ) { }

  ngOnInit(): void {
  }

  signOut() {
    this.interaction.signOutUser();
  }

}
