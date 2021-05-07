import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { BehaviorSubject, Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { skipWhile, take } from 'rxjs/operators';
import { InteractionService } from './interaction.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class PushNotification {
  
  notificationURL = 'https://blogpush.herokuapp.com/subscribe';

  currentMessage = new BehaviorSubject(null);

  constructor(
    private http: HttpClient,
    private afMessaging: AngularFireMessaging,
    private afAuth: AngularFireAuth,
    private interaction: InteractionService
  ) {}

  private updateToken(token) {
    this.afAuth.authState
    .pipe(take(1))
    .subscribe(user => {
      if (!user) return;

      this.interaction.updateFCMToken(token);
    })
  }


  requestPermission() {
    this.afMessaging.requestToken
    .subscribe(token => {
      console.log('FCM TOKEN: ', token)
      this.interaction.getUser()
        .pipe(skipWhile(data => !data))
        .pipe(take(1))
        .subscribe(data => {
          if (!data?.fcmToken || !data?.fcmToken.includes(token)) {
            const fcmArr = data.fcmToken ? data.fcmToken : [];
            fcmArr.push(token);
            this.interaction.updateFCMToken(fcmArr);
          }
        })
    },
    err => {
      console.log('FCM ERROR: ', err);
    })
  }

  receiveMessage() {
    this.afMessaging.messages
    .subscribe(payload => {
      console.log("MESSEGE: ", payload);
      this.currentMessage.next(payload);
    })
  }
  

  addPushSubscriber(fcmTokens: any[], title: string, body: string): Observable<any> {
    const dataSet = {
      registration_ids: fcmTokens,
      collapse_key: 'type_a',
      notification: {
        title,
        body
      },
      data: {
        title,
        body,
      }
    };

    // webpush: {
    //   fcm_options: {
    //     link: "https://blog-9a5ab.web.app/home"
    //   }
    // }

    const httpOptionsuser = {
      headers: new HttpHeaders({
        Authorization: `key=${environment.serverKey}`,
        'Content-Type': 'application/json',
      })
    };
    return this.http.post(`https://fcm.googleapis.com/fcm/send`, dataSet, httpOptionsuser);

  }

  
}