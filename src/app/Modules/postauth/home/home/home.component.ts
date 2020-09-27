import { Component, OnInit } from '@angular/core';
import { InteractionService } from 'src/app/services/interaction.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  likeCount: number;
  myLists: any;
  myUsers: any;

  constructor(
    private interaction: InteractionService,
    private router: Router
  ) { 

    //this.myLists = this.interaction.getpost();
   // console.log("users"+this.myLists);
   // this.myUsers = this.interaction.getusers();
  //   this.interaction.getusers().subscribe((data: any) => {
  //     this.myUsers = data;
  //     console.log(this.myUsers);
  // });
 
  }


  getposts(){
    this.interaction.getposts().subscribe((res: any) => {
      this.myUsers = res;
      console.log("posts"+res);
    });
  }
  ngOnInit(): void {
   this.getposts();
  }

  getLikeCounts(event: number): void {
    this.likeCount = event;
  }

  stopDefaultBehaviour(e): void {
    e.preventDefault();
    e.stopPropagation();
  }

  routeToBlogDetail(e: any): void {
    // this.router.navigate();
  }

}
