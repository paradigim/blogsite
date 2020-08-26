import { Component, OnInit } from '@angular/core';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  likeCount: number;

  constructor(
    private interaction: InteractionService
  ) { }

  ngOnInit(): void {
  }

  getLikeCounts(event: number): void {
    this.likeCount = event;
  }

}
