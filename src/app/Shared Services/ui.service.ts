import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: 'root'})
export class UiService {
  // private showHeader = true;
  private _showHeaderSub = new BehaviorSubject<boolean>(true);

  get showHeader(){
    return this._showHeaderSub.asObservable();
  }
  setShowHeader(bool: boolean){
    console.log(bool);
    this._showHeaderSub.next(bool);
  }
}
