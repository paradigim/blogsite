import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class PushNotification {

  // notificationURL = 'https://blog-9a5ab.web.app/subscribe';
  notificationURL = 'https://blogpush.herokuapp.com/subscribe';

  constructor(
    private http: HttpClient
  ) {}
  
  addPushSubscriber(sub: PushSubscription) {
    return this.http.post(this.notificationURL, sub);
  }
}