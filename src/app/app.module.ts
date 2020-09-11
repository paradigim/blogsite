import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { MDBBootstrapModule } from 'angular-bootstrap-md';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire';
import { BlogPostModalComponent } from './Components/blog-post-modal/blog-post-modal.component';
import { SuiModule } from 'ng2-semantic-ui';
import { AutosizeModule } from 'ngx-autosize';
import { PostauthModule } from './Modules/postauth/postauth.module';

@NgModule({
  declarations: [
    AppComponent,
    BlogPostModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MDBBootstrapModule.forRoot(),
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    SuiModule,
    AutosizeModule,
    ReactiveFormsModule,
    PostauthModule
  ],
  schemas: [ NO_ERRORS_SCHEMA ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
