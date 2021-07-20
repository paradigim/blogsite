import { Pipe, PipeTransform } from '@angular/core';
import { UserData } from '../Models/user';

@Pipe({
  name: 'follow'
})
export class FollowPipe implements PipeTransform {

  transform(allUser: UserData[], userFollowed: number, userIdWhoFollow: number): any {
    const fetchPostUser: UserData = allUser.filter(item => item.id === userFollowed)[0];
    const follower: string[] = fetchPostUser.follower;

    if (follower.length > 0 && follower.includes(String(userIdWhoFollow)) ) {
      return 'Following'
    }
    return 'Follow';
  }

}
