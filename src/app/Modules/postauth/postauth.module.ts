import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PostauthRoutingModule } from './postauth-routing.module';
import { PostauthComponent } from './postauth.component';
import { SideMenuComponent } from 'src/app/Components/side-menu/side-menu.component';
import { SideMenuItemComponent } from 'src/app/Components/side-menu-item/side-menu-item.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AutosizeModule } from 'ngx-autosize';
import { SuiModule } from 'ng2-semantic-ui';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { AuthGuard } from 'src/app/Guard/auth.guard';



@NgModule({
  declarations: [
    PostauthComponent,
    SideMenuComponent,
    SideMenuItemComponent,
  ],
  imports: [
    CommonModule,
    PostauthRoutingModule,
    SharedModule,
    AutosizeModule,
    SuiModule,
    PipesModule
  ],
  schemas: [ NO_ERRORS_SCHEMA ],
  providers: [AuthGuard]
})
export class PostauthModule { }
