import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { PostData } from 'src/app/Models/post';
import { UserData } from 'src/app/Models/user';
import { PostService } from 'src/app/services/post.service';
import { InteractionService } from '../../services/interaction.service';

@Component({
  selector: 'app-blog-like',
  templateUrl: './blog-like.component.html',
  styleUrls: ['./blog-like.component.css']
})
export class BlogLikeComponent implements OnInit {

  @Input() postData: PostData;
  @Input() user: UserData;
  @Input() likedUserIds = [];
  likeCount = 0;
  likeGiven = false;
  userId = '';

  constructor(
    public afAuth: AngularFireAuth,
    private interaction: InteractionService,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    this.setInitialLikeStatus();
  }

  // set initial like status
  setInitialLikeStatus() {
    this.likeCount = this.postData.likedUserId.length;
    const checkIfLikeIsGiven = this.postData.likedUserId.filter(item => item === String(this.user.id));

    if (checkIfLikeIsGiven.length > 0) {
      this.likeGiven = true;
    } else {
      this.likeGiven = false;
    }
  }

  setLikeStatusOnAction() {
    let newLikeList = this.postData.likedUserId;
    const likeUserIndex = this.postData.likedUserId.findIndex(userId => userId === String(this.user.id));

    if (likeUserIndex < 0) {
      newLikeList = [...newLikeList, String(this.user.id)];
    } else {
      newLikeList.splice(likeUserIndex, 1);
    }

    this.postService.updateLikeData(newLikeList, this.postData.id)
      .subscribe((post: PostData) => {
          this.postData = post;
          this.setInitialLikeStatus();
      });
  }

  // set like status when click on the like button
  likeCountStatusChange(e): void {
      e.stopPropagation();
      this.setLikeStatusOnAction();
  }

}
