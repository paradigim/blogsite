import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { auth } from 'firebase/app';
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestoreDocument, AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class InteractionService {

  user: any;
  private userCollection: AngularFirestoreCollection;

  constructor(public afAuth: AngularFireAuth, public router: Router, afs: AngularFirestore) {
    this.userCollection = afs.collection('users');
    // panja
    this.afAuth.authState.subscribe(user => {
      if (user){
        this.user = user;
        localStorage.setItem('user', JSON.stringify(this.user));
        this.router.navigate(['/home']);
      } else {
        localStorage.setItem('user', null);
      }
    });
  }

  async login (data: any) {
    const result = await this.afAuth.signInWithEmailAndPassword(data.email, data.password);
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
          resolve(result);

        }).catch((error) => {
          reject(error.message);
        })
    })
  }

}