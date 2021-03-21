import { Component } from '@angular/core';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { PushNotification } from './services/push-notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  defferedPrompt;
  subscriptionObj: any;

  VAPID_PUBLIC_KEY = "BF7ekuEOKJrtvX4ornpRrZkkv_ALrNVb4r5RzeqzOgZP-oorGGxQsUROVK2oTymCDEkQKlaNb2WVYplrrtp9MtE";

  constructor(
    private swPush: SwPush,
    private swUpdate: SwUpdate,
    private pushNotificationService: PushNotification
  ) {}

  ngOnInit() {
    // window.addEventListener('beforeinstallprompt', (e) => {
    //   e.preventDefault();
    //   this.defferedPrompt = e;
    //   this.defferedPrompt.prompt();

    //   this.defferedPrompt.userChoice.then(choice => {
    //     if (choice.outcome === 'accepted') {
    //       console.log('Accepted');
    //     }
    //     this.defferedPrompt = null;
    //   })
    // })
    // this.updateApp();
    this.subscribeToNotifications();
    this.getPushNotificationMsg();
    this.pushActionOnClick();
  }

  pushActionOnClick() {
    this.swPush.notificationClicks.subscribe(payload => {
      window.open(payload.notification.data.url);
    })
  }

  // updateApp() {
  //   this.swUpdate.available.subscribe(() => {
  //     this.swUpdate.activateUpdate().then(() => {
  //       document.location.reload();
  //     })
  //   })
  // }

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
        this.subscriptionObj = sub;
        // this.pushNotificationService.addPushSubscriber(sub).subscribe()
      })
      .catch(err => console.error("Could not subscribe to notifications", err));
    }
  }

  sendNotificationRequest() {
    this.pushNotificationService.addPushSubscriber(this.subscriptionObj).subscribe()
  }
}
