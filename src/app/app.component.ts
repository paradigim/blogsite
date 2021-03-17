import { Component } from '@angular/core';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { PushNotification } from './services/push-notification.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  VAPID_PUBLIC_KEY = "BF7ekuEOKJrtvX4ornpRrZkkv_ALrNVb4r5RzeqzOgZP-oorGGxQsUROVK2oTymCDEkQKlaNb2WVYplrrtp9MtE";

  constructor(
    private swPush: SwPush,
    private swUpdate: SwUpdate,
    private pushNotificationService: PushNotification
  ) { }

  ngOnInit() {
    this.getPushNotificationMsg();
  }

  getPushNotificationMsg() {
    this.swPush.messages.subscribe(data => {
      console.log('DATA: ', data);
    })
  }

  subscribeToNotifications() {
    console.log('ENABLED: ', this.swPush.isEnabled);

    if (this.swPush.isEnabled) {
      this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
      })
      .then(sub => {
        console.log('SUB: ', sub);
        this.pushNotificationService.addPushSubscriber(sub).subscribe()
      })
      .catch(err => console.error("Could not subscribe to notifications", err));
    }
    
  }


  // {
  //   "publicKey":"BF7ekuEOKJrtvX4ornpRrZkkv_ALrNVb4r5RzeqzOgZP-oorGGxQsUROVK2oTymCDEkQKlaNb2WVYplrrtp9MtE",
  //   "privateKey":"M9B2G_q8S6QaN_QwOhshyNa-4tvhm4KzsSrNF51ZNGg"
  // }
}
