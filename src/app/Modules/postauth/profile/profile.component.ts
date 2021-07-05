import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, map, skipWhile, switchMap, take, takeUntil } from 'rxjs/operators';
import { DataExchangeService } from 'src/app/services/data-exchange.service';
import { DateService } from 'src/app/services/date.service';
import { InteractionService } from 'src/app/services/interaction.service';
import { UserService } from 'src/app/state/user/user.service';
import { NgxImageCompressService } from 'ngx-image-compress';
import { UpdateService } from 'src/app/services/update.service';
import { UserData } from 'src/app/Models/user';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  isDataLoaded = false;
  userData: any;
  followerCount = 0;
  followingCount = 0;
  posts: any;
  ngUnsubscribe = new Subject();
  otherUserId = '';
  otherUserStatus: boolean;
  defaultProfileImage = './assets/images/default-1.jpg';
  ngUnSubscribe = new Subject();
  userId = '';
  followStatus: boolean;
  followText = 'Follow';
  isFollowedByCurrentUser: any;

  diameter = 140;
  value = 0;
  isImageUploading = false;

  constructor(
    private interaction: InteractionService,
    private dataExchange: DataExchangeService,
    private router: Router,
    private afAuth: AngularFireAuth,
    private userService: UserService,
    private imageCompress: NgxImageCompressService,
    private updateService: UpdateService
  ) {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
      }
    });
  }

  ngOnInit(): void {
    this.isDataLoaded = true;
    // this.route.queryParamMap.subscribe(queryParams => {
    //   this.otherUserId = queryParams.get('userId');
    //   this.getUserData(this.otherUserId);
    // });

    // this.checkIsUpdated();
    this.getUserData();


    this.dataExchange.userUpdateStart$
      .subscribe(res => {
        if (res) {
          this.dataExchange.setUpdateUserStart(false);
          this.isDataLoaded = true;
        }
      })
    

    this.dataExchange.userUpdateStatus$
      .subscribe((res) => {
        if (res) {
          this.dataExchange.setUserUpdateStatus(false);
          this.fetchUpdatedUser();
        }
      })
  }

  /**
   * process to upload a profile image
   * @param e file upload event
   */
  loadImage(e) {
    const file = e.target.files[0];
    const fileName = file['name'];

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const imgUrl = reader.result as string;
      this.compressImage(imgUrl, fileName);
    };
    
  }

  dataURItoBlob(dataURI) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/jpeg' });
    return blob;
  }


  // Compress the image and reduce the size
  compressImage(imgUrl, fileName) {
    const orientation = -1;

    this.imageCompress.compressFile(imgUrl, orientation, 50, 50).then(
      result => {
        // create file from byte
        const imageName = fileName;
        // call method that creates a blob from dataUri
        const imageBlob = this.dataURItoBlob(result.split(',')[1]);
        //imageFile created below is the new compressed file which can be send to API in form data
        const newFileObj = new File([imageBlob], imageName);

        const reader = new FileReader();
        reader.readAsDataURL(newFileObj);
        reader.onload = () => {
          const formData = new FormData();
          formData.append('profileImage', newFileObj, fileName);

          this.isImageUploading = true;
          const imgUrl = this.userData.imageUrl.split('/');
          const prevImageName = imgUrl[imgUrl.length - 1];

          // if already a profile image exist then first delete then upload new image
          // else just upload the image without call the delete api
          if (prevImageName) {
            this.updateService.deleteProfileImage(prevImageName)
            .subscribe(() => {
              this.uploadNewImage(formData, true);
            })
          } else {
            this.uploadNewImage(formData, true);
          }
        }
      }
    );
  }

  /**
   * @param formData image to upload
   * @param imageUploadStatus sattus true to indicate this is uploading an image
   * Upload a profile image
   */
  uploadNewImage(formData, imageUploadStatus) {
    this.updateService.uploadImage(formData, imageUploadStatus)
      .pipe(map(event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.value = (event.loaded / event.total) * 100;
        } else if (event.type === HttpEventType.Response) {
          return event;
        }
      }))
      .subscribe(() => {
        this.userService.updateUserLoadingStatus()
          .subscribe(() => {
            this.fetchUpdatedUser();
          })
      });
  }

  //fetch updated user data and hide the progress loader
  fetchUpdatedUser() {
    this.userService.getUserFromStore()
      .pipe(
        skipWhile(res => !res),
        take(1)
      )
      .subscribe(user => {
        this.userData = user;
        this.isDataLoaded = false;
        this.dataExchange.saveUpdatedUser(this.userData);
        if (this.value === 100) {
          setTimeout(() => {
            this.value = 0;
            this.isImageUploading = false;
          }, 700);
        }
      });
  }


  redirectLink(e) {
    e.stopPropagation();
  }

  // checkIsUpdated() {
  //   this.dataExchange.isUpdated$
  //     .pipe(takeUntil(this.ngUnsubscribe))
  //     .subscribe((val) => {
  //       if (val) {
  //         this.isDataLoaded = true;
  //         this.getUserData();
  //       }
  //     });
  // }

  getImage(imageUrl: string) {
    return this.updateService.getProfileImage(imageUrl);
  }

  getUserData() {
    this.userService.fetchUserData()
      .pipe(skipWhile(res => !res))
      .pipe(take(1))
      .subscribe((user: UserData) => {
        this.userData = user;
        this.isDataLoaded = false;
      });
  }

  getFollowerData(userData: any): void {
    this.followerCount = userData.follower.length;
  }

  getFollowingData(uid): void {
    this.interaction.getAllUser()
      .subscribe(user => {
        user.map(item => {
          const filterData = item.follower.filter(val => val.followingUserId === uid);

          if (filterData.length > 0) {
            this.followingCount = filterData.length;
          }
        })
      })
  }

  getUserPosts(uid) {
    this.interaction.getAllPosts()
      .subscribe(posts => {
        this.posts = posts.filter(val => val.userid === uid);
        this.isDataLoaded = false;
      })
  }

  goToPostDetail(e: any, postid) {
    this.router.navigate(['/detail'], {
      queryParams: {
        id: postid,
        userId: this.otherUserId
      }
    });
  }

  stopDefaultBehaviour(e): void {
    e.preventDefault();
    e.stopPropagation();
  }

  followUser(followedUserId, e) {
    e.preventDefault();
    let follower = [];
    this.interaction.getUser(followedUserId)
      .pipe(take(1))
      .pipe(takeUntil(this.ngUnSubscribe))
      .subscribe(user => {
        const isFollowerExist = user.follower.filter(item => item === this.userId);
        if (isFollowerExist.length > 0) {
          follower = user.follower.filter(item => item !== this.userId);
          this.interaction.updateFollower(follower, followedUserId);
          this.followText = 'Follow'
          this.followStatus = false;
        } else {
          follower = [...user.follower, this.userId];
          this.interaction.updateFollower(follower, followedUserId);
          this.followText = 'Following';
          this.followStatus = true;
        }
      })
  }

  stopDefaultBrowserBehaviour(e) {
    e.stopPropagation();
    e.cancelBubble = true;
    e.returnValue = false;
  }

}
