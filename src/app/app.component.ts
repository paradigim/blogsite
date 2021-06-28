import { Component } from '@angular/core';

import { enableAkitaProdMode } from '@datorama/akita';
import { environment } from 'src/environments/environment';

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

  constructor() {}

  ngOnInit() {
  
  }

}
