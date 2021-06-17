import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { InteractionService } from '../services/interaction.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private interaction: InteractionService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    const token = this.interaction.getJwtFromLocalStorage();
    if (!!token === false) {
      console.log('JWT: ', !!token);
      // this.router.navigate(['home']);
      this.router.navigate(['auth/login']);
      return false;
      
    } else {
      // console.log('NO TOKEN - 1');
      return true;
    }
  }
  
}
