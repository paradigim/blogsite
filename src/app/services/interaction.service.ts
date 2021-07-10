import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { map, skipWhile, take, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { DataExchangeService } from './data-exchange.service';
import { data } from 'jquery';
import { AngularFireStorage } from '@angular/fire/storage';


@Injectable({
  providedIn: 'root'
})
export class InteractionService implements OnDestroy {

  user: any;
  userId: any;
  uniqueUserName = '';
  userName = '';
  unSubscribe = new Subject();
  // symbols = ['#', '!', '*', '%', '$', '?'];

  constructor(
    public afAuth: AngularFireAuth,
    public router: Router,
    public afs: AngularFirestore,
    public ngZone: NgZone,
    private dataExchange: DataExchangeService,
    private afStorage: AngularFireStorage
  ) {
    this.afAuth.authState.subscribe(user => {
      if (user){
        this.user = user;
        this.userId = user.uid;
        this.dataExchange.setUserId(this.userId);
        localStorage.setItem('user', JSON.stringify(this.user));
        // this.router.navigate(['/home']);
      } else {
        localStorage.setItem('user', null);
      }
    });
  }


  // new code for mysql database #start

  storeJwtInLocalStorage(res) {
    localStorage.setItem('jwt', res);
  }

  getJwtFromLocalStorage() {
    return localStorage.getItem('jwt');
  }

  removeFromLocalStorage(key) {
    localStorage.removeItem(key);
  }
  // new code for mysql database #end


  createId() {
    return this.afs.createId();
  }

  postNew(postText: string, postDate: string | number, postId, image = '', video = ''): Observable<any> {
    return this.getUser()
    .pipe(map((user): any => {
      const postData = {
        contents: postText,
        image,
        video,
        comments: [],
        likeCount: 0,
        likedUserId: [],
        bookmark: false,
        userid: this.userId,
        postDate,
        userName: user.name,
        uniqueId: user.uniqueId,
        userImage: user.imageURL,
        read: [],
        id: postId
      };

      return this.afs.collection('posts').doc(postId).set(postData).then(res => {
        return this.updateNewPost(postId, postData.contents, postData.image, postData.video, postData.postDate).then(res => {
          return res;
        });
      })
    }));
   }

   updateNewPost(postId?: string, contents?: string, image?: string, video?: string, lastUpdateDate?: number | string): Promise<any> {
    return this.afs.collection('posts').doc(postId).update({
      id: postId,
      image,
      video,
      contents,
      lastUpdateDate
    });
  }

  updateVideoImage(postId, fileType, url) {
    return this.afs.collection('posts').doc(postId).update({
      video: fileType === 'video' ? url : '',
      image: fileType === 'image' ? url : ''
    })
  }

    // update post
    updateEditedPost(postId?: string, contents?: string, lastUpdateDate?: number | string): Promise<any> {
    return this.afs.collection('posts').doc(postId).update({
      id: postId,
      contents,
      lastUpdateDate
    });
  }

  getAllNotification(): Observable<any[]> {
    return this.afs.collection('notification').valueChanges();
  }

  updateNotificationReadStatus(postid, userid, readData) {
    const userRead = [...readData, userid]
    return this.afs.collection('posts').doc(postid).update({
      read: userRead
    });
  }

  // add comment to post
  addCommentToPost(comment, postId, postDate) {
    this.getPostWithId(postId)
    .pipe(take(1))
    .subscribe(val => {
      let getComment = val.comments;
      const data = {
        text: comment,
        commentedUserId: this.userId,
        commentId: getComment.length,
        commentPostTime: postDate
      };
      getComment = [...getComment, data];
      this.updateComment(getComment, postId);
    });
  }

  // update comment data
  updateComment(comments: any, postId: string): void {
    this.afs.collection('posts').doc(postId).update({
      comments
    });
  }

  // get all comments
  getBlogComments(postId): Observable<any> {
    return this.getPostWithId(postId);
  }

  // update post's like data
  updateLike(likedUserId: any, postId: string) {
    this.afs.collection('posts').doc(postId).update({
      likedUserId
    });
  }

  // get a specific post with postId
  getPostWithId(postId: string): Observable<any> {
    return this.afs.collection('posts').doc(postId).valueChanges();
  }

  // get all posts
  getAllPosts(): Observable<any[]> {
    return this.afs.collection('posts', ref => ref.orderBy('postDate', 'desc')).valueChanges();
  }

  // get the notification id's
  getNotification(): Observable<any[]> {
    return this.afs.collection('notification').valueChanges();
  }

  setNotification(postId, followers): Promise<any> {
    const notificationData = {
      notificationPostId: postId,
      deletePostByUserToAllow: followers,
      deleteStatus: false,
      deletedByUsers: []
    }
    
    return this.afs.collection('notification').add(notificationData).then((res) => {
      return this.updateNotification(res.id);
    });
  }

  setMoreNotification(item, currentUserId) {
    let notificationData;
    notificationData = {
      notificationId: item.id,
      deletePostByUser: this.userId,
      deleteStatus: false
    }

    return this.afs.collection('notification').add(notificationData).then((res) => {
      this.updateNotification(res.id);
    });
  }

  updateNotification(id): Promise<any> {
    return this.afs.collection('notification').doc(id).update({
      id: id
    })
  }

  deleteNotificationFromDatabase(postid, notificationId, deletedBy): Promise<any> {
    return this.afs.collection('notification').doc(notificationId).update({
      deleteStatus: true,
      deletedByUsers: deletedBy
    });
  }

  deleteNoti(notiAfterDelete): Promise<any> {
    return this.afs.collection('notification').doc(notiAfterDelete[0].id).delete();
    // notiAfterDelete.map(data => {
    //   this.afs.collection('notification', ref => ref.where('ref.id', '==', 'data.id')).doc(data.id).delete();
    // });
    // return;
  } 

  // get all users
  getAllUser(): Observable<any[]> {
    return this.afs.collection('users').valueChanges();
  }

  // get user by userId
  getUser(userId = ''): Observable<any> {
    const uId = userId !== '' ? userId : this.userId;
    return this.afs.collection('users').doc(uId).valueChanges();
  }

  // Hault google authentication as we change database from firebase to mysql - Pritam
  // async googleAuthentication(): Promise<void> { 
  //   const provider = new auth.GoogleAuthProvider();
  //   const credentials = await this.afAuth.signInWithPopup(provider);

  //   this.afs.collection('users').doc(credentials.user.uid).snapshotChanges().subscribe((data: any) => {
  //     if (data.payload.exists === false) {
  //       this.createUniqueUserName(credentials.user.displayName).subscribe((uniqueId: any) => {
  //         this.uniqueUserName = uniqueId;
  //         this.createUserByGoogle(credentials.user.uid, credentials.user, this.uniqueUserName)
  //         .then(res => {
  //           this.router.navigate(['/home']);
  //         });
  //       });
  //     }
  //     else {
  //       this.router.navigate(['/home']);
  //     }
  //   });
  // }

  // create unique user name
  // createUniqueUserName(username: string): any {
  //   const name = username.split(' ').join('');
  //   const randomNo = this.getUniqueId();
  //   const randomIndex = this.getSymbolIndex();
  //   const randomUniqueId = `@${name}${randomNo}${this.symbols[randomIndex]}`;

  //   return this.afs.collection('users').valueChanges()
  //     .pipe(map((x: any) => {
  //       const matchedUniqueId = x.filter(item => {
  //         return item.uniqueId === randomUniqueId;
  //       });
  //       if (matchedUniqueId.length > 0) {
  //         this.createUniqueUserName(username);
  //       } else {
  //         return randomUniqueId;
  //       }
  //     }));
  // }

  getUniqueId(): number {
    return Math.floor(Math.random() * 5000);
  }

  getSymbolIndex(): number {
    return Math.floor(Math.random() * 6);
  }

  async createUserByGoogle(userId, userData, uniqueUserName) {
    await this.afs.collection('users').doc(userId).set({
      dob: '',
      email: userData.email,
      gender: '',
      id: userData.uid,
      follower: [],
      uniqueId: this.uniqueUserName.toLowerCase(),
      imageURL: userData.photoURL,
      name: userData.displayName,
      phone: '',
      totalEarnings: 0,
      availableEarnings: 0,
      pendingEarnings: 0,
      notificationToRead: false
    }, {merge: true}).then(res => {
      return;
    }).catch(err => {
      console.log(err);
    });
  }

  /* Setting up user data when sign in with username/password, 
  sign up with username/password and sign in with social auth  
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  SetUserData(user) {
    const userData: any = {
      id: user.uid,
      email: user.email
    };
    this.afs.collection('users').doc(user.uid).set(userData);
  }

  // Sign out
  signOutUser() {
    this.afAuth
    .signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['auth/login']);
    });
  }

  async updateUserData(userId, photoUrl) {
    return await this.afs.collection('users').doc(userId).update({
      imageURL: photoUrl,
    });
  }

  fetchUserFromFirebase(userId): Observable<any> {
    return this.afs.collection('users').doc(userId).valueChanges();
  }

  // delete post
  // deletePost(postId: string): Promise<any> {
  //   return this.afs.collection('posts').doc(postId).delete();
  // }

  updateFollower(follower, userId): void {
    this.afs.collection('users').doc(userId).update({
      follower
    });
  }

  // update user profile
  updateUser(data) { 
    return this.afs.collection('users').doc(this.userId).update({
      imageURL: data.image,
      name: data.uname
    });
  }

  updateUserNotificationReadStatus(userArr) {
    userArr.map((id: any) => {
      return this.afs.collection('users').doc(id).update({
        notificationToRead: true
      })
    })
  }

  chnageNotificationAlertStatus(): Promise<any> {
    return this.afs.collection('users').doc(this.userId).update({
      notificationToRead: false
    })
  }

  updatePostData(dataToChange) {
    this.getAllPosts()
    .pipe(skipWhile(val => !val))
    .pipe(take(1))
    .subscribe((data: any) => {
      const filterPost = data.filter((item) => item.userid === this.userId);
      
      filterPost.map(item => {
        this.afs.collection('posts').doc(item.id).update({
          userName: dataToChange.uname,
          userImage: dataToChange.image
        });
      })
    })

    // this.afs.collection('posts', ref => ref.where('ref.userid', '==', this.userId));
  }

  // pritam
  saveUniqueEndpoint(endpoint) {
    return this.afs.collection('users').doc(this.userId).update({
      uniqueEndpoint: endpoint
    });
  }

  updateFCMToken(token = []) {
    this.afs.collection('users').doc(this.userId).update({
      fcmToken: token
    });
  }

  deleteFileFromStaorage(url): Promise<any> {
    const urlToDelete = this.afStorage.storage.refFromURL(url);
    urlToDelete.delete();
    return;
  }

  // on destroy of the component
  ngOnDestroy(): void {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }
}

