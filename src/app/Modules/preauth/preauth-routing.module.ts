import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LoginComponent} from './login/login.component';
import {RegisterComponent} from './register/register.component';
import { ForgetpasswordComponent } from './forgetpassword/forgetpassword.component';
import { AuthGuard } from 'src/app/Guard/auth.guard';
import { AccessAuthGuard } from 'src/app/Guard/access-auth.guard';

const routes: Routes = [
  {
    path: 'login',
    component : LoginComponent,
    canActivate: [AccessAuthGuard]
  },
  {
    path: 'signup',
    component : RegisterComponent,
    canActivate: [AccessAuthGuard]
  },
  {
    path: 'forgetpassword',
    component : ForgetpasswordComponent,
    canActivate: [AccessAuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreauthRoutingModule { }
