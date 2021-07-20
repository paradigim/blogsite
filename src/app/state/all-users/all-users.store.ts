import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { UserData } from 'src/app/Models/user';

export interface AllUsersState {
  allUsers: UserData[];
  isLoaded: boolean;
}

export function createInitialState(): AllUsersState {
  return {
    allUsers: [],
    isLoaded: false
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ 
  name: 'all-users',
  resettable: true  
})
export class AllUsersStore extends Store<AllUsersState> {

  constructor() {
    super(createInitialState());
  }

}
