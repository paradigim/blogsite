import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { skipWhile, take } from 'rxjs/operators';
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
  // VAPID_PUBLIC_KEY = "BIDfKRckGeFnvXPpufCU5aVrd3WiBl4A__m7rzo2WVKV8NniO901ybBz6hxgzmhBktzHJ124y-fFoutriKN7IBU";
  constructor(
    private swPush: SwPush,
    private swUpdate: SwUpdate,
    private pushNotificationService: PushNotification,
    private afAuth: AngularFireAuth,
    private interaction: InteractionService,
    private data: DataExchangeService
  ) {}

  ngOnInit() {
    
  }

}
