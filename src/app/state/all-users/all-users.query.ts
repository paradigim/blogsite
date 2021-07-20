import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { AllUsersStore, AllUsersState } from './all-users.store';
import { UserData } from 'src/app/Models/user';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class AllUsersQuery extends Query<AllUsersState> {

  constructor(protected allUserStore: AllUsersStore) {
    super(allUserStore);
  }

  // get all the users from store
  getAllUsers(): Observable<UserData[]> {
    return this.select(state => state.allUsers);
  }

  // fetch all-users loading status
  getAllUsersLoadingStatus(): Observable<boolean> {
    return this.select(state => state.isLoaded);
  }

  updateAllUsersLoadingStatus(): Observable<boolean> {
    return this.allUserStore.update(state => {
      return {
        isLoaded: false
      }
    });
  }

  updateAllUsersData(allUsers) {
    this.allUserStore.update(state => {
      return {
        allUsers: allUsers,
        isLoaded: true
      }
    })
  }

  updateUsersFollowList(userIdWhoFollowed, followList) {
    return this.getAllUsers()
      .pipe(
        map(users => {
          const followedUserIndex = users.findIndex(user => user.id === userIdWhoFollowed);
          users[followedUserIndex].follower = followList;

          return this.allUserStore.update(state => {
            return {
              allUsers: users
            }
          })
        })
      )

    
  }

}
