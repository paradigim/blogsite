import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { MDBBootstrapModule } from 'angular-bootstrap-md';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire';
import { PostauthModule } from './Modules/postauth/postauth.module';

import { SharedModule } from 'src/app/shared/shared.module';
import { SuiModule } from 'ng2-semantic-ui';

import { AdsenseModule } from 'ng2-adsense';
import { AngularFireMessagingModule } from '@angular/fire/messaging';


import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { PushNotification } from './services/push-notification.service';
import { AsyncPipe } from '../../node_modules/@angular/common';
import { ServiceWorkerModule } from '@angular/service-worker';
import { HttpClientModule } from '@angular/common/http';
import { PipesModule } from './pipes/pipes.module';



@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MDBBootstrapModule.forRoot(),
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    ReactiveFormsModule,
    PostauthModule,
    SharedModule,
    SuiModule,
    AngularFireMessagingModule,
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AdsenseModule.forRoot({
      adClient: 'ca-pub-9786874165700163',
      adSlot: 7259870550,
    }),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    HttpClientModule,
    PipesModule,
  ],
  schemas: [ NO_ERRORS_SCHEMA ],
  providers: [PushNotification, AsyncPipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
