import { Component } from '@angular/core';
import { PushNotification } from './services/push-notification.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'Blog';
  message;

  constructor(private pushNotificationService: PushNotification) { }

  ngOnInit() {
    
  }

  // {
  //   "publicKey":"BF7ekuEOKJrtvX4ornpRrZkkv_ALrNVb4r5RzeqzOgZP-oorGGxQsUROVK2oTymCDEkQKlaNb2WVYplrrtp9MtE",
  //   "privateKey":"M9B2G_q8S6QaN_QwOhshyNa-4tvhm4KzsSrNF51ZNGg"
  // }
}
