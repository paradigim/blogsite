import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class PushNotification {

  notificationURL = 'https://blog-9a5ab.web.app';

  constructor(
    private http: HttpClient
  ) {}
  
  addPushSubscriber(sub) {
    return this.http.post(this.notificationURL, sub, {responseType: 'text'})
  }
}