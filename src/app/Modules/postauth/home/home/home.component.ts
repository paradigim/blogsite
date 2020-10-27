import { Component, OnInit } from '@angular/core';
import { InteractionService } from 'src/app/services/interaction.service';
import { Router } from '@angular/router';
import { switchMap, take, map } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
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
    // this.setFollowing();
  }

  allPosts(): void {
    this.interaction.getAllPosts()
      .subscribe((data: any) => {
        this.postData = data;
        this.postData.map((item, i) => {
          this.isFollowed(item.userid)
          .pipe(take(1))
          .subscribe(val => {
            this.postData[i] = {...this.postData[i], followStatus: this.checkFollower(val)};
          });
        });
        console.log('POST DATA: ', this.postData);
      });
  }

  checkFollower(user): boolean {
    if (user.follower && user.follower.length > 0) {
      const index = user.follower.findIndex(item => item === this.userId);
      return (index !== -1) ? true : false;
    } else {
      return false;
    }
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

  isFollowed (userId) {
    return this.interaction.getUser(userId);
  }
}
