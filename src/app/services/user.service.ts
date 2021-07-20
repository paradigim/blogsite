import { Injectable } from '@angular/core';
import { resetStores } from '@datorama/akita';
import { Observable, of } from 'rxjs';
import { filter, switchMap, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UserData } from '../Models/user';
import { AllUsersQuery } from '../state/all-users/all-users.query';
import { UserQuery } from '../state/user/user.query';
import { UserStore } from '../state/user/user.store';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { UpdateService } from './update.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  environment = environment;

  constructor(
    private userStore: UserStore,
    private userQuery: UserQuery,
    private authService: AuthService,
    private updateService: UpdateService,
    private apiService: ApiService,
    private allUsersQuery: AllUsersQuery
  ) { }

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

  // fetch bookmarked loading status
  getUserLoadingStatus(): Observable<boolean> {
    return this.userQuery.getUserLoggedinStatus();
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

  updateUserData(userData) {
    this.userStore.update(state => {
      return {
        user: userData,
        isLoaded: true
      }
    })
  }

  // fetch all users from database
  getAllUsers() {
    const url = `${this.environment.api.baseUrl}${this.environment.api.userAuth.getAll}`;
    return this.apiService.fetchGetUrl(url);
  }

  updateUsersFollowList(userIdWhoFollowed, followList): Observable<UserData[]> {
    return this.allUsersQuery.updateUsersFollowList(userIdWhoFollowed, followList);
  }
}
