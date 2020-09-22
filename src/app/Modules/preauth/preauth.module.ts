import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PreauthRoutingModule } from './preauth-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ForgetpasswordComponent } from './forgetpassword/forgetpassword.component';


@NgModule({
  declarations: [LoginComponent, RegisterComponent, ForgetpasswordComponent],
  imports: [
    CommonModule,
    PreauthRoutingModule,
    ReactiveFormsModule
  ]
})
export class PreauthModule { }
