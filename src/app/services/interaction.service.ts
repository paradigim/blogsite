import { Injectable } from '@angular/core';
import { Router } from  "@angular/router";
import { auth } from 'firebase/app';
import { AngularFireAuth } from "@angular/fire/auth";

@Injectable({
  providedIn: 'root'
})
export class InteractionService {

  user:any;

  constructor(public afAuth: AngularFireAuth, public  router:  Router) { 
    this.afAuth.authState.subscribe(user => {
      if (user){
        this.user = user;
        localStorage.setItem('user', JSON.stringify(this.user));
        this.router.navigate(['/home'])
      } else {
        localStorage.setItem('user', null);
      }
    })
  }

  async login(data:any) {
    var result = await this.afAuth.signInWithEmailAndPassword(data.email, data.password);
    return result;
  }

}