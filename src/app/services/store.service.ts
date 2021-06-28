import { Injectable } from '@angular/core';
import { UserData } from '../Models/user';
import { UserStore } from '../state/user/user.store';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  constructor(
    private userStore: UserStore,
  ) { }

  
}
