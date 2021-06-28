import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { Observable } from 'rxjs';
import { UserData } from 'src/app/Models/user';

import { UserState, UserStore } from './user.store';

@Injectable({ providedIn: 'root' })
export class UserQuery extends Query<UserState> {

  constructor(protected store: UserStore) {
    super(store);
  }

  getLoggedInUser(): Observable<UserData> {
    return this.select(state => state.user);
  }

  getUserLoggedinStatus(): Observable<boolean> {
      return this.select(state => state.isLoaded);
  }

  getIsLoading(): Observable<boolean> {
      return this.selectLoading();
  }

}
