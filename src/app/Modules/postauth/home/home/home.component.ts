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
  postData: any;

  constructor(
    private interaction: InteractionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.allPosts();
  }

  allPosts() {
    this.interaction.getAllPosts()
      .subscribe((data: any) => {
        this.postData = data;
      });
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
