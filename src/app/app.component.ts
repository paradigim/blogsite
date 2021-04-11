import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { take } from 'rxjs/operators';
import { DataExchangeService } from './services/data-exchange.service';
import { InteractionService } from './services/interaction.service';
import { PushNotification } from './services/push-notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  defferedPrompt;
  subscriptionObj: any;
  userId;

  VAPID_PUBLIC_KEY = "BF7ekuEOKJrtvX4ornpRrZkkv_ALrNVb4r5RzeqzOgZP-oorGGxQsUROVK2oTymCDEkQKlaNb2WVYplrrtp9MtE";

  constructor(
    private swPush: SwPush,
    private swUpdate: SwUpdate,
    private pushNotificationService: PushNotification,
    private afAuth: AngularFireAuth,
    private interaction: InteractionService,
    private data: DataExchangeService
  ) {}

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user){
        this.userId = user.uid;
        this.subscribeToNotifications(this.userId);
      }
    });
    if (window.matchMedia('(display-mode: standalone)').matches) {  
      console.log('Not installed');
    }
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

  subscribeToNotifications(userId) {
    if (this.swPush.isEnabled) {
      this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
      })
      .then(sub => {
        console.log('SUB: ', sub);
        this.subscriptionObj = sub;
        this.data.saveSubcription(this.subscriptionObj);
        this.interaction.getUser()
        .pipe(take(1))
        .subscribe(data => {
          if (!data.uniqueEndpoint) {
            console.log('SUB STRINGI: ', JSON.stringify(sub));
            this.interaction.saveUniqueEndpoint(JSON.stringify(sub));
          }
        })
      })
      .catch(err => console.error("Could not subscribe to notifications", err));
    }
  }

  // sendNotificationRequest() {
  //   console.log('SUBSCRIPTION: ', this.subscriptionObj);
  //   this.pushNotificationService.addPushSubscriber(this.subscriptionObj).subscribe();
  // }
}
