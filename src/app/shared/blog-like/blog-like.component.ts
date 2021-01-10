import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { InteractionService } from '../../services/interaction.service';

@Component({
  selector: 'app-blog-like',
  templateUrl: './blog-like.component.html',
  styleUrls: ['./blog-like.component.css']
})
export class BlogLikeComponent implements OnInit {

  @Input() postId = '';
  @Input() likedUserIds = [];
  likeCount = 0;
  likeGiven = false;
  userId = '';

  constructor(
    public afAuth: AngularFireAuth,
    private interaction: InteractionService,
  ) {}

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user){
        this.userId = user.uid;
        this.setData(this.postId);
      }
    });
  }

  setData(postId): void {
    this.interaction.getPostWithId(postId).subscribe(data => {
      this.likeCount = data.likedUserId.length;
      const checkIdExist = data.likedUserId.filter(item => {
        return item === this.userId;
      });
      if (checkIdExist.length > 0) {
        this.likeGiven = true;
      }
      else {
        this.likeGiven = false;
      }
    });
  }

  likeCountStatusChange(e): void {
      e.stopPropagation();
      this.interaction.setLikeData(this.likeCount, this.postId);
      this.setData(this.postId);
  }

}
