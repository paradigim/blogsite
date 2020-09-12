import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PostauthComponent } from './postauth.component';

const routes: Routes = [
  {
    path: '',
    component: PostauthComponent,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../postauth/home/home.module').then(m => m.HomeModule),
      },
      {
        path: 'notification',
        loadChildren: () => import('../postauth/notification/notification.module').then(m => m.NotificationModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostauthRoutingModule { }
