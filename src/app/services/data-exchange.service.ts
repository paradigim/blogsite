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

  private indicator = new BehaviorSubject(false);
  public indicator$ = this.indicator.asObservable();

  private userAlertForNotification = new BehaviorSubject(null);
  public userAlertForNotification$ = this.userAlertForNotification.asObservable();

  private subscription = new BehaviorSubject(null);
  public subscription$ = this.subscription.asObservable();

  private isNewPost = new BehaviorSubject(false);
  public isNewPost$ = this.isNewPost.asObservable();

  private isLoad = new BehaviorSubject(false);
  public isLoad$ = this.isLoad.asObservable();

  constructor() { }

  loadAfterNewPost(status) {
    this.isLoad.next(status);
  }

  getLoadAfterNewPost() {
    return this.isLoad.value;
  }

  setUserId(id: string): void {
    this.userId.next(id);
  }

  checkIsUpdated(status: boolean) {
    this.isUpdated.next(status);
  }

  setNotiIndicator(status: boolean) {
    this.indicator.next(status);
  }

  getIndicatorStatus() {
    return this.indicator.value;
  }

  saveUsersForNotificationAlert(followers: any) {
    this.userAlertForNotification.next(followers);
  }

  saveSubcription(data) {
    this.subscription.next(data);
  }

  getSubscription() {
    return this.subscription.value;
  }

  setNewPostStatus(status) {
    this.isNewPost.next(status);
  }

  getNewPostStatus() {
    return this.isNewPost.value;
  }
}
