import { Injectable, NgZone } from '@angular/core';
import { Router } from "@angular/router";
import { auth, User } from 'firebase/app';
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestoreDocument, AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/from'; 

@Injectable({
  providedIn: 'root'
})
export class InteractionService {

  user: any;
  private userCollection: AngularFirestoreCollection;
  private postCollection: AngularFirestoreCollection;

  afs: any;

  constructor(public afAuth: AngularFireAuth, public router: Router, afs: AngularFirestore, public ngZone: NgZone) {
    this.userCollection = afs.collection('users');
    this.postCollection = afs.collection('posts');
    this.afAuth.authState.subscribe(user => {
      if (user){
        this.user = user;
        localStorage.setItem('user', JSON.stringify(this.user));
        this.router.navigate(['/home']);
      } else {
        localStorage.setItem('user', null);
      }
<<<<<<< HEAD
    })

  //   let userDoc = this.afs.firestore.collection(`posts`);
  //   userDoc.get().then((querySnapshot) => { 
  //  querySnapshot.forEach((doc) => {
  //      // console.log(doc.id, "=>", doc.data());  
  //  })

=======
    });
>>>>>>> 9dae84183a0f24cb8833b85e14e3875e801a1b7c
  }

  async login (data: any) {
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
          }
          this.userCollection.doc(result.user.uid).set(userData);
          resolve(result);

        }).catch((error) => {
          reject(error.message);
        })
    })
  }

   async post(data:any){
    const uuidv4 = Math.floor(Math.random() * 100);
   var userId = JSON.parse(localStorage.getItem('user'));
   // alert("userId");
   // const ids = this.afs.createId();
     //alert('ids'+ uuidv4);
    const userData: any = {
      id: uuidv4,
      contents: data.contents,
      comments: [],
      likes:0,
      dislike: 0,
      userid: userId.uid
    }

 //alert(JSON.stringify(userData));
    this.postCollection.doc(uuidv4.toString()).set(userData);
   }

  GoogleAuth() {
    return this.AuthLogin(new auth.GoogleAuthProvider());
  }

  // Auth logic to run auth providers
  AuthLogin(provider) {
    return this.afAuth.signInWithPopup(provider)
    .then((result) => {
       this.ngZone.run(() => {
          this.router.navigate(['/home']);
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
   //alert("set"+user);
//console.log(user);
   // console.log("user data"+user.gender);
          const userData: any = {
            id: user.uid,
            email: user.email//,
           // dob: user.dob,
           // gender: user.gender
          }
          this.userCollection.doc(user.uid).set(userData);
  }

  async getposts(): Promise<Observable<any[]>>{
    return this.postCollection.snapshotChanges().pipe(
      map(actions => {       
        return actions.map(a => {
          const data = a.payload.doc.data();
          data.id = a.payload.doc.id;
          data.$key = a.payload.doc.id;
          return data;
        });
      })
    );
   }
   async getusers(): Promise<Observable<any[]>>{
    return this.userCollection.snapshotChanges().pipe(
      map(actions => {       
        return actions.map(a => {
          const data = a.payload.doc.data();
          data.id = a.payload.doc.id;
          data.$key = a.payload.doc.id;
          console.log("users"+data);
          return data;
        });
      })
    );
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