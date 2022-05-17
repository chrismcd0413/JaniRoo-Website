import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import * as moment from 'moment-timezone';
import { Subscription } from 'rxjs';
import { FirebaseService } from '../Shared Services/firestore.service';
import { UserInfo } from '../Shared Services/user-info.service';
import { Timestamp } from '@firebase/firestore';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-time',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.css']
})
export class TimeComponent implements OnInit, OnDestroy, AfterViewInit {
  accounts;
  users;
  timesheets;
  searchForm: FormGroup;
  displayedColumns = ['name', 'location', 'in', 'out', 'hrs'];
  dataSource = new MatTableDataSource<any>();
  private subscriptions: Subscription[] = [];
  private querySub: Subscription;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatTable) table: MatTable<any>;
  constructor(
    private fb: FirebaseService,
    private userInfo: UserInfo,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // SET UP FORM ELEMENT
    this.searchForm = new FormGroup({
      filter: new FormControl('', {
        validators: []
      }),
      location: new FormControl(false, {
        validators: []
      }),
      start: new FormControl(moment().subtract(14, 'days').startOf('day').toDate(), {
        validators: [Validators.required]
      }),
      end: new FormControl(moment().startOf('day').toDate(), {
        validators: [Validators.required]
      }),
    });
    this.searchForm.controls['start'].addValidators(this.datesValidator());
    this.searchForm.controls['end'].addValidators(this.datesValidator());
    this.searchForm.markAllAsTouched();
    this.subscriptions.push(
      this.searchForm.controls['start'].valueChanges.subscribe(value => {
        this.updateDatesValidity()
        if (this.searchForm.valid) {
          const startQ = this.fb.generateQueryDateLocal(value);
          const endQ = this.fb.generateQueryDateLocal(this.searchForm.value.end);
          this.setQuery(startQ, endQ);
        }
      })
    );
    this.subscriptions.push(
      this.searchForm.controls['end'].valueChanges.subscribe(value => {
        this.updateDatesValidity()
        if (this.searchForm.valid) {
          const endQ = this.fb.generateQueryDateLocal(value);
          const startQ = this.fb.generateQueryDateLocal(this.searchForm.value.start);
          this.setQuery(startQ, endQ);
        }
      })
    );
      this.subscriptions.push(
        this.searchForm.controls['filter'].valueChanges.subscribe(value => this.dataSource.filter = value.trim().toLowerCase())
      );
      this.subscriptions.push(
        this.searchForm.controls['location'].valueChanges.subscribe(value => {
          if (!value) {
            this.dataSource.filter = null;
          } else {
            const filterString = value.acct + value.loc.toString();
            this.dataSource.filter = filterString;
          }
        })
      );
      this.dataSource.filterPredicate = (data, filter) => {
        const dataStr = this.getUserName(data.user).trim().toLowerCase() + this.getLocation(data.location).trim().toLowerCase() + data.location.acct + data.location.loc;
        console.log('DATA STRING: ', dataStr);
        return dataStr.indexOf(filter) != -1;
      }
    // CONNECT NECESSARY DATA

    this.subscriptions.push(this.userInfo.accounts.subscribe(a => this.accounts = a));
    this.subscriptions.push(this.userInfo.coUsers.subscribe(u => this.users = u));

    const endQ = this.fb.generateQueryDateLocal(this.searchForm.value.end);
    const startQ = this.fb.generateQueryDateLocal(this.searchForm.value.start);
    this.setQuery(startQ, endQ);
  }
  ngOnDestroy(): void {
      this.subscriptions.forEach(x => x.unsubscribe());
      this.querySub.unsubscribe();
  }
  ngAfterViewInit(): void {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
  }
  updateDatesValidity(){
    this.searchForm.get('start').updateValueAndValidity({ emitEvent: false });
    this.searchForm.get('end').updateValueAndValidity({ emitEvent: false });
  }
  setQuery(start, end) {
    if (this.querySub) {
      this.querySub.unsubscribe();
    }
    this.querySub = this.fb.fetchTimesheets(start, end).subscribe(timesheets => {
      this.timesheets = timesheets;
      this.dataSource.data = this.timesheets;
      this.table.renderRows();
      console.log('DATA SOURCE: ', this.dataSource.data);
    })
  }
  openEditDialog(row) {
    this.dialog.open(NewEditTimesheetDialog, {
      data: {
        editMode: true,
        timesheet: row
      }
    });
  }
  openNewTimesheetDialog() {
    this.dialog.open(NewEditTimesheetDialog, {
      data: {
        editMode: false
      }
    });
  }
  getUserName(id) {
    const u = this.users.find(x => x.id === id);
    return u.name;
  }
  getLocation(location) {
    const acct = this.accounts.find(x => x.id === location.acct);
    const loc = acct.locations.find(x => x.id === location.loc);
    return loc.name;
  }
  datesValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const start = moment(this.searchForm.controls['start'].value.toISOString());
        const end = moment(this.searchForm.controls['end'].value.toISOString());
        if (end.isBefore(start)){
          return {invalidDates: {value: control.value}};
        } else {
          return null;
        }
    };
  }
}
@Component({
  templateUrl: './new-edit-timesheet.html',
  styleUrls: ['./time.component.css']
})
export class NewEditTimesheetDialog implements OnInit, OnDestroy {
  title;
  users;
  accounts;
  form: FormGroup;
  private subs: Subscription[] = [];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private fb: FirebaseService,
    private userInfo: UserInfo,
    private dialogRef: MatDialogRef<NewEditTimesheetDialog>
  ){}
  ngOnInit(): void {

    this.subs.push(
      this.userInfo.accounts.subscribe(a => this.accounts = a)
    );
    this.subs.push(
      this.userInfo.coUsers.subscribe(u => this.users = u)
    );

    this.form = new FormGroup({
      user: new FormControl('', {
        validators: [Validators.required]
      }),
      location: new FormControl('', {
        validators: [Validators.required]
      }),
      inDate: new FormControl('', {
        validators: [Validators.required]
      }),
      inTime: new FormControl('', {
        validators: [Validators.required]
      }),
      outDate: new FormControl('', {
        validators: [Validators.required]
      }),
      outTime: new FormControl('', {
        validators: [Validators.required]
      }),
    });
    this.form.controls['inDate'].addValidators(this.datesValidator());
    this.form.controls['inTime'].addValidators(this.datesValidator());
    this.form.controls['outDate'].addValidators(this.datesValidator());
    this.form.controls['outTime'].addValidators(this.datesValidator());
    this.subs.push(
      this.form.valueChanges.subscribe((value) => {
        this.form.get('inDate').updateValueAndValidity({ emitEvent: false });
        this.form.get('inTime').updateValueAndValidity({ emitEvent: false });
        this.form.get('outDate').updateValueAndValidity({ emitEvent: false });
        this.form.get('outTime').updateValueAndValidity({ emitEvent: false });
      })
    );
    if (this.data.editMode){
      this.title = 'Edit';
      this.form.markAllAsTouched();

      const ts = this.data.timesheet;
      const account = this.accounts.find(x => x.id === ts.location.acct);
      const location = account.locations.find(x => x.id === ts.location.loc);
      const tz = location.address.tzId;
      console.log('Timesheet: ', ts);
      this.form.setValue({
        user: ts.user,
        location: {acct: ts.location.acct, loc: ts.location.loc},
        inDate: new Date(Date.parse(moment.tz(ts.clock_in_time.toMillis(), tz).format('MM/DD/YYYY'))),
        inTime: moment.tz(ts.clock_in_time.toMillis(), tz).format('HH:mm'),
        outDate: new Date(Date.parse(moment.tz(ts.clock_out_time.toMillis(), tz).format('MM/DD/YYYY'))),
        outTime: moment.tz(ts.clock_out_time.toMillis(), tz).format('HH:mm')
      })
    } else {
      this.title = 'New'
    }
  }
  ngOnDestroy(): void {
    this.subs.forEach(x => x.unsubscribe());
  }
  save(){
    const data = this.data;
    const selectedLocation = this.form.value.location;
    const account = this.accounts.find(x => x.id === selectedLocation.acct);
    const location = account.locations.find(x => x.id === selectedLocation.loc);
    const tz = location.address.tzId;
    const inDate = this.form.value.inDate;
    const inTime = this.form.value.inTime;
    const outDate = this.form.value.outDate;
    const outTime = this.form.value.outTime;
    const formattedInDate = moment(inDate.toISOString()).format('MM/DD/YYYY');
    const formattedOutDate = moment(outDate.toISOString()).format('MM/DD/YYYY');
    const finalInTime = moment.tz(formattedInDate + ' ' + inTime, 'MM/DD/YYYY HH:mm', tz).format();
    const finalOutTime = moment.tz(formattedOutDate + ' ' + outTime, 'MM/DD/YYYY HH:mm', tz).format();
    const inTimestamp = Timestamp.fromDate(new Date(Date.parse(finalInTime)));
    const outTimestamp = Timestamp.fromDate(new Date(Date.parse(finalOutTime)));
    const timesheet = {
      clock_in_time: inTimestamp,
      clock_out_time: outTimestamp,
      companyId: this.fb.companyId,
      location: this.form.value.location,
      query_start: this.fb.generateQueryDateFirestore(inTimestamp.toMillis(), tz),
      query_end: this.fb.generateQueryDateFirestore(outTimestamp.toMillis(), tz),
      user: this.form.value.user
    };
    if (data.editMode){
      this.saveEdit(timesheet);
    } else {
      this.saveNew(timesheet);
    }
  }
  saveEdit(ts) {
    this.fb.updateTimesheet(this.data.timesheet.id, ts).then(x => this.close());
  }
  saveNew(ts) {
    this.fb.createNewTimesheet(ts).then(x => this.close());
  }
  close() {
    this.dialogRef.close();
  }
  deleteTimesheet() {
    this.fb.deleteTimesheet(this.data.timesheet.id).then(x => this.close());
  }
  compareObjects(o1: any, o2: any): boolean {
    return o1.acct === o2.acct && o1.loc === o2.loc;
}
  datesValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const start = {
        date: this.form.value.inDate,
        time: this.form.value.inTime,
      };
      const end = { date: this.form.value.outDate, time: this.form.value.outTime };
      if (start.date && end.date && start.time && end.time) {
        const q = moment(start.date.getTime()).format('MM/DD/YYYY');
        const s = moment(q + '' + start.time, 'MM/DD/YYYY HH:mm')
          .toDate()
          .getTime();
        const w = moment(end.date.getTime()).format('MM/DD/YYYY');
        const e = moment(w + '' + end.time, 'MM/DD/YYYY HH:mm')
          .toDate()
          .getTime();
        if (e < s || e === s) {
          return { invalidDates: { value: control.value } };
        } else {
          return null;
        }
      } else {
        return null;
      }
    };
  }
}
