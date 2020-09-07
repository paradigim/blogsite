import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path:'',
    loadChildren:() => import('./Modules/preauth/preauth.module').then(m => m.PreauthModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./Modules/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'notification',
    loadChildren: () => import('./Modules/notification/notification.module').then(m => m.NotificationModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
