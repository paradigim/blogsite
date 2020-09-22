import { Injectable, NgZone } from '@angular/core';
import { Router } from "@angular/router";
import { auth, User } from 'firebase/app';
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestoreDocument, AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class InteractionService {

  user: any;
  private userCollection: AngularFirestoreCollection;
  afs: any;

  constructor(public afAuth: AngularFireAuth, public router: Router, afs: AngularFirestore, public ngZone: NgZone) {
    this.userCollection = afs.collection('users');
    // this.afAuth.authState.subscribe(user => {
    //   if (user){
    //     this.user = user;
    //     localStorage.setItem('user', JSON.stringify(this.user));
    //     this.router.navigate(['/home'])
    //   } else {
    //     localStorage.setItem('user', null);
    //   }
    // })
  }
  async login(data: any) {
    var result = await this.afAuth.signInWithEmailAndPassword(data.email, data.password);
    return result;
  }

  async register(data: any) {

    console.log("data" + data);
    return new Promise<any>((resolve, reject) => {
      this.afAuth.createUserWithEmailAndPassword(data.email, data.password)
        .then((result) => {

          const userData: any = {
            id: result.user.uid,
            email: data.email,
            dob: data.dob,
            gender: data.gender
          }
          this.userCollection.doc(result.user.uid).set(userData);
          resolve(result)

        }).catch((error) => {
          reject(error.message)
        })
    })
  }
  GoogleAuth() {
    return this.AuthLogin(new auth.GoogleAuthProvider());
  }

  // Auth logic to run auth providers
  AuthLogin(provider) {
    return this.afAuth.signInWithPopup(provider)
    .then((result) => {
       this.ngZone.run(() => {
          this.router.navigate(['dashboard']);
        })
      this.SetUserData(result.user);
    }).catch((error) => {
      window.alert(error)
    })
  }

  /* Setting up user data when sign in with username/password, 
  sign up with username/password and sign in with social auth  
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  SetUserData(user) {
          const userData: any = {
            id: user.uid,
            email: user.email,
            dob: user.dob,
            gender: user.gender
          }
          this.userCollection.doc(user.uid).set(userData);
  }

  // Sign out 
  SignOut() {
    return this.afAuth
    .signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['sign-in']);
    })
  }
}