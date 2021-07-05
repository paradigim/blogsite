
import { Inject, Injectable } from '@angular/core';
import { PersistState } from '@datorama/akita';
import { Observable, of } from 'rxjs';
import { filter, switchMap, take, tap } from 'rxjs/operators';
import { UserData } from 'src/app/Models/user';
import { AuthService } from 'src/app/services/auth.service';
import { UserQuery } from './user.query';
import { UserStore } from './user.store';
import { resetStores } from "@datorama/akita";
import { UpdateService } from 'src/app/services/update.service';

@Injectable({ providedIn: 'root' })
export class UserService {

  userData: UserData;

  constructor(
    private userStore: UserStore,
    private userQuery: UserQuery,
    private authService: AuthService,
    private updateService: UpdateService
  ) {}

  // saved loggedIn user data to store
  saveUserDataInStore(data: UserData) {
    this.userStore.setLoading(true);
    this.userStore.setHasCache(true);
    this.userStore.update(state => {
      return {
        user: {
          ...state.user,
          ...data
        }
      }
    });
    this.userStore.setLoading(false);
  }

  /**
   * fetch user data from api
   * if user already fetched then dont call api
   * @returns user observables
   */
  getUserFromStore(): Observable<UserData> {
    return this.userQuery.getUserLoggedinStatus().pipe(
      take(1),
      filter(res => !res),
      switchMap(() => {
        this.userStore.setLoading(true);
        return this.authService.getUser();
      }),
      switchMap(res => {
        if (res.imageUrl) {
          res.imageUrl = this.updateService.getProfileImage(res.imageUrl);
        }
        this.userStore.update(sate => {
          return {
            user: res,
            isLoaded: true
          }
        });
        this.userStore.setLoading(false);
        return of(res);
      })
    )
  }

  /**
   * only update the isLoading status of the store
   * @returns boolean -> true/false
   */
  updateUserLoadingStatus() {
    return of(this.userStore.update(state => { // TODO: need to update the store after change the profile image
      return {
        isLoaded: false
      }
    }))
  }

  /**
   * fetch onlu user data from store
   * @returns user observables
   */
   fetchUserData(): Observable<UserData> {
    return this.userQuery.getLoggedInUser();
   }

  /**
   * clear user data from store
   * @returns 
   */
  updateStatusOnLogout() {
    resetStores();
    return this.userStore.update({
      isLoaded: false
    })
  }

  updateUserData(file) {
    this.fetchUserData()
      .subscribe((user: any) => {
        console.log('USER STATE: ', user);
        // newUser['imageUrl'] = 'http://localhost:3000/' + file.path;

        this.userStore.update(state => {
          return {
            user
          }
        })
      })
  }
}