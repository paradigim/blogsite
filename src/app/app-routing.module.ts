import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('./Modules/postauth/postauth.module').then(m => m.PostauthModule)
  },
  {
    path: '',
    loadChildren: () => import('./Modules/preauth/preauth.module').then(m => m.PreauthModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
