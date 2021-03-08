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
    this.pushNotificationService.requestPermission();
    this.pushNotificationService.receiveMessage();
    this.message = this.pushNotificationService.currentMessage;
  }
}
