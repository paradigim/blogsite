import { ComponentFactoryResolver, Injectable, NgZone, ɵAPP_ID_RANDOM_PROVIDER } from '@angular/core';
import { Router } from '@angular/router';
import { auth, User } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class InteractionService {

  user: any;
  userId: any;
  uniqueUserName = '';

  symbols = ['#', '!', '*', '%', '$', '=', '?'];

  constructor(
    public afAuth: AngularFireAuth,
    public router: Router,
    public afs: AngularFirestore,
    public ngZone: NgZone
  ) {
    this.afAuth.authState.subscribe(user => {
      if (user){
        this.user = user;
        this.userId = user.uid;
        localStorage.setItem('user', JSON.stringify(this.user));
        // this.router.navigate(['/home']);
      } else {
        localStorage.setItem('user', null);
      }
    });
  }

  async login(data: any) {
    const result = await this.afAuth.signInWithEmailAndPassword(data.email, data.password);
    return result;
  }

  async register(data: any) {
    return new Promise<any>((resolve, reject) => {
      this.afAuth.createUserWithEmailAndPassword(data.email, data.password)
        .then((result) => {
          const userData: any = {
            id: result.user.uid,
            email: data.email,
            dob: data.dob,
            gender: data.gender
          };
          this.afs.collection('users').doc(result.user.uid).set(userData);
          resolve(result);
        }).catch((error) => {
          reject(error.message);
        });
    });
  }

  async post(postText: any) {
    const postData = {
      contents: postText,
      comments: [],
      likes: 0,
      dislike: 0,
      bookmark: false,
      userid: this.userId
    };
    this.afs.collection('posts').add(postData).then((res) => {
      console.log('SUCCESS............', res);
    });
   }

  // GoogleAuth() {
  //   return this.authLogin(new auth.GoogleAuthProvider());
  // }

  // Auth logic to run auth providers
  // authLogin(provider) {
  //   return this.afAuth.signInWithPopup(provider)
  //   .then((result) => {
  //     this.ngZone.run(() => {
  //       this.router.navigate(['/home']);
  //     });
  //     this.SetUserData(result.user);
  //   }).catch((error) => {
  //     window.alert(error);
  //   });
  // }



  async googleAuthentication(): Promise<void> {
    const provider = new auth.GoogleAuthProvider();
    const credentials = await this.afAuth.signInWithPopup(provider);

    this.afs.collection('users').doc(credentials.user.uid).snapshotChanges().subscribe(async (data: any) => {
      if (data.payload.exists === false) {
        await this.createUniqueUserName(credentials.user.displayName);
        console.log('uniqueUserName: ', this.uniqueUserName);
        await this.createUserByGoogle(credentials.user.uid, credentials.user)
        .then(res => {
          this.router.navigate(['/home']);
        });
      }
      else {
        this.router.navigate(['/home']);
      }
    });
  }

  // create unique user name
  createUniqueUserName(username: string) {
    const name = username.split(' ').join('');
    const randomNo = this.getUniqueId();
    const randomIndex = this.getSymbolIndex();
    const randomUniqueId = `@${name}${randomNo}${this.symbols[randomIndex]}`;
    console.log('randomUniqueId: ', randomUniqueId, typeof randomUniqueId);

    this.afs.collection('users').valueChanges()
    .subscribe((data: any) => {
      const matchedUniqueId = data.filter(item => {
        return item.uniqueId === randomUniqueId;
      });
      if (matchedUniqueId.length > 0) {
        this.createUniqueUserName(username);
      } else {
        this.uniqueUserName = randomUniqueId;
        return;
      }
    });
  }

  getUniqueId(): number {
    return Math.floor(Math.random() * 5000);
  }

  getSymbolIndex(): number {
    return Math.floor(Math.random() * 7);
  }

  async createUserByGoogle(userId, userData) {
    console.log(userId);
    console.log('..........', this.uniqueUserName);
    
    await this.afs.collection('users').doc(userId).set({
      dob: '',
      email: userData.email,
      gender: '',
      id: userData.uid,
      uniqueId: this.uniqueUserName,
      imageURL: userData.photoURL,
      name: userData.displayName,
      phone: '',
      totalEarnings: 0,
      availableEarnings: 0,
      pendingEarnings: 0
    }, {merge: true}).then(res => {
      console.log('response', this.afAuth.authState);
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

  fetchUserFromFirebase(userId) {
    return this.afs.collection('users').doc(userId).valueChanges();
  }
}

