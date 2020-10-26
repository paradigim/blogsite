import { Component, OnInit } from '@angular/core';
import { InteractionService } from 'src/app/services/interaction.service';
import { Router } from '@angular/router';
import { switchMap, take } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { map } from 'jquery';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  likeCount: number;
  postData: any;
  userId: string;
  checkFollow = false;

  constructor(
    private interaction: InteractionService,
    private router: Router,
    private afAuth: AngularFireAuth
  ) {
    this.afAuth.authState.subscribe(user => {
      if (user){
        this.userId = user.uid;
      }
    });
  }

  ngOnInit(): void {
    this.allPosts();
    // this.isFollowed();
  }

  allPosts(): void {
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

  followUser(userId) {
    this.interaction.followedUser(userId);
  }

  isFollowed(userId) {
    this.interaction.getUser(userId)
    .pipe(take(1))
    .pipe(switchMap((item) => {
      const index = item.follower.findIndex(val => {
        return val === this.userId;
      });
      this.checkFollow = index >= 0 ? true : false;
      return of(this.checkFollow);
    }));
  }

}
