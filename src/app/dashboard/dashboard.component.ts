import {
  Component,
  OnDestroy,
  OnInit,
  Pipe,
  PipeTransform,
  ViewEncapsulation,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { CacheService } from '../Shared Services/cache.service';
import { FirebaseService } from '../Shared Services/firestore.service';
import { UserInfo } from '../Shared Services/user-info.service';
import { Timestamp } from '@firebase/firestore';
import * as moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { ViewChecklistComponent } from '../shared-dialogs/view-checklist/view-checklist.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  coUsers = [];
  accounts = [];
  lowInventoryItems = [];
  activeDailyChecklists = [];
  activeRecurringChecklists = [];
  todaysTimesheets = [];
  todaysSchedules = [];
  subs: Subscription[] = [];
  noResultsDailyChecklist = 0;
  noResultsRecurringChecklist = 0;
  noResultsSchedules = 0;
  noResultsLowInventory = 0;
  constructor(
    private fb: FirebaseService,
    private userInfo: UserInfo,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.subs.push(this.userInfo.coUsers.subscribe((x) => (this.coUsers = x)));

    this.subs.push(
      this.userInfo.accounts.subscribe((x) => (this.accounts = x))
    );


    this.subs.push(
      this.fb
        .dashboardFetchLowInventoryItems()
        .subscribe((x: any[]) => {
          this.lowInventoryItems = x.reduce(function (obj, item) {
            const formatted = {acct: item.location.acct, loc: item.location.loc};
            obj[JSON.stringify(formatted)] =
              obj[JSON.stringify(formatted)] || [];
            obj[JSON.stringify(formatted)].push(item);
            return obj;
          }, {});
          this.noResultsLowInventory = Object.keys(this.lowInventoryItems).length;
        })
    );
    this.subs.push(
      this.fb
        .dashboardFetchTodaysTimesheets()
        .subscribe((x) => (this.todaysTimesheets = x))
    );
    this.subs.push(
      this.fb.dashboardFetchTodaysSchedules().subscribe((x: any[]) => {
        this.todaysSchedules = x.reduce(function (obj, item) {
          const formatted = {acct: item.location.acct, loc: item.location.loc};
          obj[JSON.stringify(formatted)] =
            obj[JSON.stringify(formatted)] || [];
          obj[JSON.stringify(formatted)].push(item);
          return obj;
        }, {});
        this.noResultsSchedules = Object.keys(this.todaysSchedules).length;
      })
    );
    this.subs.push(
      this.fb.dashboardFetchActiveDailyChecklists().subscribe((x: any[]) => {
        this.activeDailyChecklists = x.reduce(function (obj, item) {
          const formatted = {acct: item.location.acct, loc: item.location.loc};
          obj[JSON.stringify(formatted)] =
            obj[JSON.stringify(formatted)] || [];
          obj[JSON.stringify(formatted)].push(item);
          return obj;
        }, {});
        this.noResultsDailyChecklist = Object.keys(this.activeDailyChecklists).length;
      })
    );
    this.subs.push(
      this.fb.dashboardFetchActiveRecurringChecklists().subscribe((x: any[]) => {
        this.activeRecurringChecklists = x.reduce(function (obj, item) {
          const formatted = {acct: item.location.acct, loc: item.location.loc};
          obj[JSON.stringify(formatted)] =
            obj[JSON.stringify(formatted)] || [];
          obj[JSON.stringify(formatted)].push(item);
          return obj;
        }, {});
        this.noResultsRecurringChecklist = Object.keys(this.activeRecurringChecklists).length;
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((x) => x.unsubscribe());
  }
  getTimesheetsForLocation(user, location) {
    const tsArray = this.todaysTimesheets.filter(
      (x) =>
        x.user === user &&
        x.location.acct === location.acct &&
        x.location.loc === location.loc
    );

    return tsArray;
  }
  getUserClockInStatus(user, location) {
    const tsArray = this.todaysTimesheets.filter(
      (x) =>
        x.user === user &&
        x.location.acct === location.acct &&
        x.location.loc === location.loc
    );
    if (tsArray.length === 0) {
      return 'blobr';
    } else {
      if (tsArray.findIndex((x) => !x.clock_out_time) != -1) {
        return 'blob';
      } else {
        return 'blobr';
      }
    }
  }
  openChecklistViewer(checklist) {
    this.dialog.open(ViewChecklistComponent, {
      data: checklist,
      autoFocus: false
    });
  }
}
