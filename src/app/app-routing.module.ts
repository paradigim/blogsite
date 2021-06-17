import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AngularFireAuthGuard, loggedIn, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';
import { AccessAuthGuard } from './Guard/access-auth.guard';
import { AuthGuard } from './Guard/auth.guard';


const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['auth/login']);
const redirectLoggedInToItems = () => redirectLoggedInTo(['home']);

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./Modules/postauth/postauth.module').then(m => m.PostauthModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./Modules/preauth/preauth.module').then(m => m.PreauthModule),
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { 
    relativeLinkResolution: 'legacy',
    onSameUrlNavigation: 'reload' 
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
