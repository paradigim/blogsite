import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InteractionService {

  // private likeStatus = new BehaviorSubject<string>('');
  // public likeStatus$ = this.likeStatus.asObservable();

  constructor() { }


  // changeStatus(id: string): void {
  //   this.likeStatus.next(id);
  // }
}
