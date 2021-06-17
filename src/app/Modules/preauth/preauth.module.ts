import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PreauthRoutingModule } from './preauth-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ForgetpasswordComponent } from './forgetpassword/forgetpassword.component';
import { SuiModule } from 'ng2-semantic-ui';
import { AuthGuard } from 'src/app/Guard/auth.guard';


@NgModule({
  declarations: [LoginComponent, RegisterComponent, ForgetpasswordComponent],
  imports: [
    CommonModule,
    PreauthRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SuiModule
  ],
  providers: [AuthGuard]
})
export class PreauthModule { }
