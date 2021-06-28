import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { UserData } from 'src/app/Models/user';

export interface UserState {
  user: UserData;
  isLoaded: boolean;
}

export function createInitialState(): UserState {
  return {
    user: null,
    isLoaded: false
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ 
  name: 'user',
  resettable: true 
})
export class UserStore extends Store<UserState> {

  constructor() {
    super(createInitialState());
  }

}
