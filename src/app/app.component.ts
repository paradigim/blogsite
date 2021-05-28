import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
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

  constructor(
    
  ) {}

  ngOnInit() {
  
  }

}
