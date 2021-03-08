import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs'
@Injectable()
export class PushNotification {

  currentMessage = new BehaviorSubject(null);

  constructor(private angularFireMessaging: AngularFireMessaging) {

    this.angularFireMessaging.messages.subscribe(
      (messaging) => {
        // messaging.onMessage = messaging.onMessage.bind(messaging);
        // messaging.onTokenRefresh = messaging.onTokenRefresh.bind(messaging);
      }
    );

  }
  
  requestPermission() {
    this.angularFireMessaging.requestToken.subscribe(
      (token) => {
        console.log(token);
      },
      (err) => {
        console.error('Unable to get permission to notify.', err);
      }
    );
  }
  receiveMessage() {
    this.angularFireMessaging.messages.subscribe(
      (payload) => {
        console.log("new message received. ", payload);
        this.currentMessage.next(payload);
      })
  }
}