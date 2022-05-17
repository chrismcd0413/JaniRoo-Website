import { Injectable, OnDestroy } from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';
import { FirebaseService } from './firestore.service';
@Injectable({ providedIn: 'root' })
export class CacheService implements OnDestroy {
  private subs: Subscription[] = [];

  private _checklists = new BehaviorSubject<any[]>(null);
  private _inventoryItems = new BehaviorSubject<any[]>(null);
  private firstLoadChecklist = false;
  private firstLoadInventoryItems = false;
  get checklists() {
    if (this.firstLoadChecklist) {
      return this._checklists.asObservable();
    } else {
      this.subs.push(
        this.fb.fetchChecklistTemplates().subscribe((x) => {
          this._checklists.next(x);
          this.firstLoadChecklist = true;
        })
      );
      return this._checklists.asObservable();
    }
  }
  get inventoryItems() {
    if (this.firstLoadInventoryItems) {
      return this._inventoryItems.asObservable();
    } else {
      this.subs.push(
        this.fb.fetchInventoryItems().subscribe((result) => {
          console.log('Inventory Items Result: ', result);
          this.processInventoryItems(result);
        })
      );
      return this._inventoryItems.asObservable();
    }
  }
  constructor(private fb: FirebaseService) {}
  ngOnDestroy(): void {
    this.subs.forEach((x) => x.unsubscribe());
  }
  processInventoryItems(items: any[]) {
    this.firstLoadInventoryItems = true;
    let formattedArray = [];
    items.forEach((ii) => {
      const index = formattedArray.findIndex(
        (x) =>
          x.location.acct === ii.location.acct &&
          x.location.loc === ii.location.loc
      );
      if (index === -1) {
        const toPush = {
          location: { acct: ii.location.acct, loc: ii.location.loc },
          items: [ii],
        };
        formattedArray.push(toPush);
      } else {
        formattedArray[index].items.push(ii);
      }
    });
    this._inventoryItems.next(formattedArray);
  }
}
