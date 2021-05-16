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
        loadChildren: () =>
          import('../postauth/home/home.module').then((m) => m.HomeModule),
      },
      {
        path: 'notification',
        loadChildren: () =>
          import('../postauth/notification/notification.module').then(
            (m) => m.NotificationModule
          ),
      },
      {
        path: 'explore',
        loadChildren: () =>
          import('../postauth/explore/explore.module').then(
            (m) => m.ExploreModule
          ),
      },
      {
        path: 'bookmarks',
        loadChildren: () =>
          import('../postauth/bookmarks/bookmarks.module').then(
            (m) => m.BookmarksModule
          ),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('../postauth/profile/profile.module').then(
            (m) => m.ProfileModule
          ),
      },
      {
        path: 'detail',
        loadChildren: () =>
          import('../postauth/blog-details/blog-details.module').then(
            (m) => m.BlogDetailsModule
          ),
      },
      {
        path: 'piggybank',
        loadChildren: () =>
          import('../postauth/piggy-bank/piggy-bank.module').then(
            (m) => m.PiggyBankModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PostauthRoutingModule {}
