import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PreauthRoutingModule } from './preauth-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SuiModule } from 'ng2-semantic-ui';


@NgModule({
  declarations: [LoginComponent, RegisterComponent],
  imports: [
    CommonModule,
    PreauthRoutingModule,
    ReactiveFormsModule,
    SuiModule
  ]
})
export class PreauthModule { }
