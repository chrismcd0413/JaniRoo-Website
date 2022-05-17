import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class UserInfo implements OnDestroy {
  private _userDetails;
  private _accounts = new BehaviorSubject<any[]>(null);
  private _users = new BehaviorSubject<any[]>(null);



  get user(){
    return {...this._userDetails};
  }
  get accounts(){
    return this._accounts.asObservable();
  }
  get coUsers(){
    return this._users.asObservable();
  }
  constructor() {}
  ngOnDestroy(): void {
  }
  setUser(user){
    this._userDetails = user;
  }
  setAccountsAndLocation(a: any[], l: any[]){
    a.forEach(ac => ac.locationsArray = l.filter(loc => loc.accountId = ac.id));
    this._accounts.next(a);
    console.log(this._accounts);
  }
  setCompanyUsers(u: any[]){
    this._users.next(u);
  }
  clearUser(){
    this._userDetails = null;
  }
}
