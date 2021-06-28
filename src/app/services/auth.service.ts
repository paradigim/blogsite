import { Injectable } from '@angular/core';
import { RegisterUser } from '../Models/user';
import { InteractionService } from './interaction.service';
import { environment } from 'src/environments/environment';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  symbols = ['#', '!', '*', '%', '$', '?'];
  environment = environment;

  constructor(
    private apiService: ApiService
  ) { }

  // sign-up a new user with provided credentials
  signUp(data: RegisterUser, uniqueUserId): Observable<any> {
    const url = `${this.environment.api.baseUrl}${this.environment.api.userAuth.signUp}`;
    data['uniqueUserId'] = uniqueUserId;
    
    return this.apiService.fetchPostUrl(url, data);
  }

  login(data): Observable<any> {
    const url = `${this.environment.api.baseUrl}${this.environment.api.userAuth.login}`;
    return this.apiService.fetchPostUrl(url, data);
  }

  getUser(): Observable<any> {
    const url = `${this.environment.api.baseUrl}${this.environment.api.userAuth.getUser}`;
    return this.apiService.fetchGetUrl(url);
  }

  logoutUser(): Observable<any> {
    const url = `${this.environment.api.baseUrl}${this.environment.api.userAuth.logout}`;
    return this.apiService.fetchPostUrl(url, null)
  }


  createUniqueUserName(username: string): any {
    const name = username.split(' ').join('');
    const randomNo = this.getUniqueId();
    const randomIndex = this.getSymbolIndex();
    const randomUniqueId = `@${name}${randomNo}${this.symbols[randomIndex]}`;

    return randomUniqueId;
  }

  getUniqueId(): number {
    return Math.floor(Math.random() * 5000);
  }

  getSymbolIndex(): number {
    return Math.floor(Math.random() * 6);
  }
}
