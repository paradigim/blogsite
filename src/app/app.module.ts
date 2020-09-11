import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { MDBBootstrapModule } from 'angular-bootstrap-md';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SideMenuComponent } from './Components/side-menu/side-menu.component';
import { SideMenuItemComponent } from './Components/side-menu-item/side-menu-item.component';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';

import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire';
import { NotificationModule } from './Modules/notification/notification.module';
import { BlogPostModalComponent } from './Components/blog-post-modal/blog-post-modal.component';
import { SuiModule } from 'ng2-semantic-ui';
import { AutosizeModule } from 'ngx-autosize';

@NgModule({
  declarations: [
    AppComponent,
    SideMenuComponent,
    SideMenuItemComponent,
    BlogPostModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MDBBootstrapModule.forRoot(),
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    NotificationModule,
    SuiModule,
    AutosizeModule,
    ReactiveFormsModule
  ],
  schemas: [ NO_ERRORS_SCHEMA ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
