import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class PushNotification {
  
  notificationURL = 'https://blogpush.herokuapp.com/subscribe';

  constructor(
    private http: HttpClient
  ) {}
  
  addPushSubscriber(sub: PushSubscription) {
    return this.http.post(this.notificationURL, sub);
  }
}