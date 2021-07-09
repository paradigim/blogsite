import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
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
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { PipesModule } from './pipes/pipes.module';
import { AuthInterceptor } from './interceptor/auth-interceptor';
import { AuthGuard } from './Guard/auth.guard';
import { AccessAuthGuard } from './Guard/access-auth.guard';
import { NG_ENTITY_SERVICE_CONFIG } from '@datorama/akita-ng-entity-service';
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';
import {MatIconModule} from '@angular/material/icon'
import { NgxImageCompressService } from 'ngx-image-compress';
import { CommonMaterialModule } from './common/common-material/common-material.module';
import { CommonErrorDialogComponent } from './Components/common-error-dialog/common-error-dialog.component';
import { PostDialogComponent } from './Components/post-dialog/post-dialog.component';
import { AutosizeModule } from 'ngx-autosize';
@NgModule({
  declarations: [
    AppComponent,
    CommonErrorDialogComponent,
    PostDialogComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
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
    environment.production ? [] : AkitaNgDevtools.forRoot(),
    AkitaNgRouterStoreModule,
    MatIconModule,
    CommonMaterialModule,
    AutosizeModule
  ],
  schemas: [ NO_ERRORS_SCHEMA ],
  providers: [
    PushNotification, 
    AsyncPipe,
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
    AuthGuard,
    AccessAuthGuard,
    { provide: NG_ENTITY_SERVICE_CONFIG, useValue: { baseUrl: 'https://jsonplaceholder.typicode.com' }},
    NgxImageCompressService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
