import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataExchangeService {

  private userId = new BehaviorSubject<string>('');
  public userId$ = this.userId.asObservable();

  private isUpdated = new BehaviorSubject<boolean>(false);
  public isUpdated$ = this.isUpdated.asObservable();

  constructor() { }

  setUserId(id: string): void {
    this.userId.next(id);
  }

  checkIsUpdated(status: boolean) {
    this.isUpdated.next(status);
  }
}
