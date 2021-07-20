import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class FollowService {

  environment = environment;

  constructor(
    private apiService: ApiService
  ) { }

  updateFollowStatus(userToFollow, userWhoFollow) {
    const url = `${this.environment.api.baseUrl}${this.environment.api.update.updateFollow}/${userToFollow}`;
    return this.apiService.fetchPutUrl(url, userWhoFollow);
  }
}
