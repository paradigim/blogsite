import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PostData } from '../Models/post';
import { UserData } from '../Models/user';

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

  private pageStatus = new BehaviorSubject(false);
  public pageStatus$ = this.pageStatus.asObservable();

  private updatedUser = new BehaviorSubject(null);
  public updatedUser$ = this.updatedUser.asObservable();

  private userUpdateStatus = new BehaviorSubject(false);
  public userUpdateStatus$ = this.userUpdateStatus.asObservable();

  private userUpdateStart = new BehaviorSubject(false);
  public userUpdateStart$ = this.userUpdateStart.asObservable();

  private newPostData = new BehaviorSubject(null);
  public newPostData$ = this.newPostData.asObservable();

  private deletedPostId = new BehaviorSubject(null);
  public deletedPostId$ = this.deletedPostId.asObservable();

  constructor() { }

  saveDeletedPostId(postId) {
    this.deletedPostId.next(postId);
  }

  saveNewPostData(data) {
    this.newPostData.next(data);
  }

  setUpdateUserStart(status: boolean) {
    this.userUpdateStart.next(status);
  }

  setUserUpdateStatus(status: boolean) {
    this.userUpdateStatus.next(status);
  }

  saveUpdatedUser(user: UserData) {
    this.updatedUser.next(user);
  }

  setPageStatus(status) {
    this.pageStatus.next(status);
  }

  getPageStatus() {
    return this.pageStatus.value;
  }

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
