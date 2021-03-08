import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { subscribeOn } from 'rxjs/operators';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit {

  users: any;
  filteredItems = [];
  searching = false;

  constructor(
    private interaction: InteractionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getAllUser();
  }

  getAllUser() {
    this.interaction.getAllUser()
      .subscribe(users => {
        this.users = users;
      })
  }

  filterInputData(e) {
    this.searching = true;
    if (!e.target.value) {
      this.filteredItems = [];
    } else {
      this.filteredItems = Object.assign([], this.users).filter(
        item => (item.name.toLowerCase().indexOf(e.target.value.toLowerCase()) > -1 || 
        item.uniqueId.toLowerCase().indexOf(e.target.value.toLowerCase()) > -1)
      ) 
    }
    this.searching = false;
  }

  // stopDefaultBehaviour(e) {
  //   e.cancelBubble=true;
  //   e.returnValue=false;
  // }

  redirectToUserProfile(userId, e) {
    this.router.navigate(['/profile'], {
      queryParams: {
        userId
      }
    })
  }
}
