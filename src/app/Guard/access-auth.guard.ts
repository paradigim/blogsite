import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { InteractionService } from '../services/interaction.service';

@Injectable({
  providedIn: 'root'
})
export class AccessAuthGuard implements CanActivate {
  constructor(
    private interaction: InteractionService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    const token = this.interaction.getJwtFromLocalStorage();
    if (!!token) {
      this.router.navigate(['home']);
      return false;
    } else {
      return true;
    }
  }
  
}
