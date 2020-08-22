import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InteractionService {

  // private likeStatus = new BehaviorSubject<boolean>(false);
  // public likeStatus$ = this.likeStatus.asObservable();

  constructor() { }


  // changeStatus(status: boolean): void {
  //   this.likeStatus.next(status);
  // }
}
