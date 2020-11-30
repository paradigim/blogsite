import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataExchangeService {

  private userId = new BehaviorSubject<string>('');
  public userId$ = this.userId.asObservable();

  constructor() { }

  setUserId(id: string): void {
    this.userId.next(id);
  }
}
