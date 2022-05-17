import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CalendarOptions, FullCalendarComponent } from '@fullcalendar/angular';
import { Timestamp } from '@firebase/firestore';
import * as moment from 'moment-timezone';
import { UserInfo } from '../Shared Services/user-info.service';
import { Subscription } from 'rxjs';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ScheduledShift } from '../models/schedule.model';
import { Account } from '../models/account.model';
import { User } from '../models/user.model';
import { Location } from '../models/location.model';
import { FirebaseService } from '../Shared Services/firestore.service';
import { map } from 'rxjs/operators';
import RRule from 'rrule';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-schedules',
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.css'],
})
export class SchedulesComponent implements OnInit, AfterViewInit, OnDestroy {
  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    headerToolbar: false,
    height: '100%',
    eventClick: this.editEvent.bind(this),
    allDaySlot: false,
  };
  dateRangeLabel;
  accounts: Account[];
  coUsers: User[];
  calType = 'weekly';
  subscriptions: Subscription[] = [];
  scheduleFetchSubscription: Subscription;
  events: ScheduledShift[];
  @ViewChild('cal') calendar: FullCalendarComponent;
  @ViewChild('select') locationSelect: ElementRef;
  @ViewChild('testCal') testCal: ElementRef;

  constructor(
    private userInfo: UserInfo,
    private dialog: MatDialog,
    private fb: FirebaseService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.userInfo.coUsers.subscribe((u) => (this.coUsers = u))
    );
    this.subscriptions.push(
      this.userInfo.accounts.subscribe((a) => (this.accounts = a))
    );
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.setCalDate();
      // this.calendarOptions.timeZone =
    });
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((e) => e.unsubscribe());
    if (this.scheduleFetchSubscription) {
      this.scheduleFetchSubscription.unsubscribe();
    }
  }
  setCalDate() {
    const start = this.calendar.getApi().view.activeStart;
    const end1 = this.calendar.getApi().view.activeEnd;
    const end = new Date(end1.getTime() - 1000);
    const fStart = this.formatDate(start);
    const fEnd = this.formatDate(end);
    console.log('Set Cal Date Type: ', this.calType);
    if (this.calType != 'daily') {
      this.dateRangeLabel = fStart + ' - ' + fEnd;
    } else {
      this.dateRangeLabel = fStart;
    }
  }
  formatDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return month + '/' + day;
  }
  calForward() {
    this.calendar.getApi().next();
    this.setCalDate();
    this.updateFetchingSub();
  }
  calPrevious() {
    this.calendar.getApi().prev();
    this.setCalDate();
    this.updateFetchingSub();
  }
  setLocation(e) {
    this.updateFetchingSub();
    console.log('Location Changed: ', JSON.parse(e.target.value));
  }
  formatLocation(a, l) {
    const obj = { acct: a.id, loc: l.id };
    // console.log(obj);
    return JSON.stringify(obj);
  }
  changeCalType(e) {
    if (e.value === 'monthly') {
      this.calendar.getApi().changeView('dayGridMonth');
    }
    if (e.value === 'weekly') {
      this.calendar.getApi().changeView('timeGridWeek');
    }
    if (e.value === 'daily') {
      this.calendar.getApi().changeView('timeGridDay');
    }
    if (e.value === 'list') {
      this.calendar.getApi().changeView('listMonth');
    }
    this.setCalDate();
    if (this.locationSelect.nativeElement.value) {
      this.updateFetchingSub();
    }
  }
  calendarDateSelected(e) {
    console.log(e);
  }
  openNewSchedule() {
    this.dialog.open(NewEditSchedulesDialog, {
      data: {
        editMode: false,
      },
      autoFocus: false,
    });
  }
  updateFetchingSub() {
    const momentStart = moment(this.calendar.getApi().view.activeStart)
      .subtract(5, 'd')
      .format();
    const start = new Date(Date.parse(momentStart));
    const momentEnd = moment(this.calendar.getApi().view.activeEnd)
      .add(5, 'd')
      .format();
    const end = new Date(Date.parse(momentEnd));
    const acct = JSON.parse(this.locationSelect.nativeElement.value);
    console.log(acct);
    if (this.scheduleFetchSubscription) {
      this.scheduleFetchSubscription.unsubscribe();
    }
    this.scheduleFetchSubscription = this.fb
      .fetchSchedules(start, end, acct)
      .pipe(
        map((array) =>
          array.map((schedule: ScheduledShift) => {
            return {
              id: schedule.id,
              start: schedule.start_date.toDate(),
              end: schedule.end_date.toDate(),
              title: this.coUsers.find((e) => e.id === schedule.cleaner).name,
              original: schedule,
              allDay: false,
            };
          })
        )
      )
      .subscribe((s) => {
        const options = this.calendarOptions;
        const account = this.accounts.find((a) => a.id === acct.acct);
        const location = account.locations.find((l) => l.id === acct.loc);
        options.events = s;
        options.timeZone = location.address.tzId;
        console.log('FETCHING COMPLETE');
      });
  }
  editEvent(i) {
    const start = i.event.extendedProps.original.start_date.toDate();
    const end = i.event.extendedProps.original.end_date.toDate();
    console.log('EVENT CLICKED START', start);
    console.log('EVENT CLICKED END', end);
    const popup = this.dialog.open(NewEditSchedulesDialog, {
      data: {
        editMode: true,
        event: i.event.extendedProps.original,
      },
      autoFocus: false,
    });
    popup.afterClosed().subscribe((result) => {
      console.log(result);
    });
  }
}

@Component({
  templateUrl: './new-edit-schedule.html',
  styleUrls: ['./schedules.component.css'],
})
export class NewEditSchedulesDialog implements OnInit, OnDestroy {
  title;
  form: FormGroup;
  today = new Date();
  accounts: Account[];
  users: User[];
  activeUsers: User[];
  subs: Subscription[] = [];
  repeatDays = [];
  maxRepeatDate = moment(new Date().getTime()).add(1, 'y').toDate();
  disableActions = false;
  @ViewChild('frequency') repeatInterval: MatSelect;
  @ViewChild('repeatUntil') repeatUntil: ElementRef;
  constructor(
    private dialog: MatDialogRef<NewEditSchedulesDialog>,
    private confirmDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data,
    private userInfo: UserInfo,
    private fb: FirebaseService
  ) {}
  ngOnInit(): void {
    this.subs.push(
      this.userInfo.accounts.subscribe((a) => (this.accounts = a))
    );
    this.subs.push(
      this.userInfo.coUsers.subscribe(
        (a) => (this.users = a.filter((x) => x.role != 'Owner'))
      )
    );
    this.form = new FormGroup({
      type: new FormControl('trad', {
        validators: [Validators.required],
      }),
      sDate: new FormControl('', {
        validators: [Validators.required],
      }),
      sTime: new FormControl('', {
        validators: [Validators.required],
      }),
      eDate: new FormControl('', {
        validators: [Validators.required],
      }),
      eTime: new FormControl('', {
        validators: [Validators.required],
      }),
      location: new FormControl('', {
        validators: [Validators.required],
      }),
      user: new FormControl('', {
        validators: [Validators.required],
      }),
    });

    if (this.data.editMode) {
      this.title = 'Edit';
      const tz = this.accounts
        .find((x) => x.id === this.data.event.location.acct)
        .locations.find((x) => x.id === this.data.event.location.loc)
        .address.tzId;
      this.form.setValue({
        type: this.data.event.type,
        sDate: new Date(
          Date.parse(
            moment
              .tz(this.data.event.start_date.toDate().getTime(), tz)
              .format('MM/DD/YYYY')
          )
        ),
        sTime: moment
          .tz(this.data.event.start_date.toDate().getTime(), tz)
          .format('HH:mm'),
        eDate: new Date(
          Date.parse(
            moment
              .tz(this.data.event.end_date.toDate().getTime(), tz)
              .format('MM/DD/YYYY')
          )
        ),
        eTime: moment
          .tz(this.data.event.end_date.toDate().getTime(), tz)
          .format('HH:mm'),
        location: JSON.stringify({
          acct: this.data.event.location.acct,
          loc: this.data.event.location.loc,
        }),
        user: this.data.event.cleaner,
      });
      this.form.controls['location'].disable();
      this.filterUsers(this.data.event.location);
      const currentDate = moment().hours(0).minute(0);
      const scheduledDate = moment(
        this.data.event.start_date.toDate().getTime()
      )
        .hour(0)
        .minute(0);
      const scheduleDateHasPassed = currentDate.isAfter(
        scheduledDate.endOf('D')
      );
      if (scheduleDateHasPassed) {
        this.form.disable();
        this.disableActions = true;
      }
    } else {
      this.title = 'New';
      this.form.controls['user'].disable();
      this.form.addControl(
        'repeat',
        new FormControl('', {
          validators: [],
        })
      );
    }
    this.form.controls['sDate'].addValidators(this.datesValidator());
    this.form.controls['sTime'].addValidators(this.datesValidator());
    this.form.controls['eDate'].addValidators(this.datesValidator());
    this.form.controls['eTime'].addValidators(this.datesValidator());
    this.subs.push(
      this.form.valueChanges.subscribe((value) => {
        this.form.get('sDate').updateValueAndValidity({ emitEvent: false });
        this.form.get('sTime').updateValueAndValidity({ emitEvent: false });
        this.form.get('eDate').updateValueAndValidity({ emitEvent: false });
        this.form.get('eTime').updateValueAndValidity({ emitEvent: false });
      })
    );
  }
  ngOnDestroy(): void {
    this.subs.forEach((e) => e.unsubscribe());
  }
  save() {
    let accountIds;
    if (this.data.editMode) {
      accountIds = this.data.event.location;
    } else {
      accountIds = JSON.parse(this.form.value.location);
    }
    const account: Account[] = this.accounts.filter(
      (x) => x.id === accountIds.acct
    );
    const location: Location[] = account[0].locations.filter(
      (x) => x.id === accountIds.loc
    );
    const finalTz = location[0].address.tzId;
    const sDate: Date = this.form.value.sDate;
    const fsDate =
      sDate.getMonth() + 1 + '/' + sDate.getDate() + '/' + sDate.getFullYear();
    const start = moment
      .tz(fsDate + ' ' + this.form.value.sTime, 'M/D/YYYY HH:mm', finalTz)
      .format();
    const eDate: Date = this.form.value.eDate;
    const feDate =
      eDate.getMonth() + 1 + '/' + eDate.getDate() + '/' + eDate.getFullYear();
    const end = moment
      .tz(feDate + ' ' + this.form.value.eTime, 'M/D/YYYY HH:mm', finalTz)
      .format();
    const sTS = Timestamp.fromDate(new Date(Date.parse(start)));
    const eTS = Timestamp.fromDate(new Date(Date.parse(end)));
    const schedule = new ScheduledShift(
      null,
      this.form.value.type,
      sTS,
      eTS,
      '',
      accountIds,
      this.fb.companyId,
      this.form.value.user
    );
    delete schedule.id;

    if (this.data.editMode && !this.form.untouched) {
      if (this.data.event.repeatId != '') {
        const confirm = this.confirmDialog.open(ConfirmChangesDialog);
        confirm.afterClosed().subscribe((value) => {
          if (value) {
            //apply to all
            schedule.id = this.data.event.id;
            schedule.repeatId = this.data.event.repeatId;
            this.applyChangesToAllShifts(schedule, finalTz, start, end);
          } else {
            //apply to only this shift
            this.fb.setSchedule(this.data.event.id, schedule);
          }
          this.dialog.close(true);
        });
      } else {
        this.fb.setSchedule(this.data.event.id, schedule);
        this.dialog.close(true);
      }
    } else if (!this.data.editMode && !this.form.value.repeat) {
      this.fb.createSchedule(schedule);
      this.dialog.close(true);
    } else if (!this.data.editMode && this.form.value.repeat) {
      let repeatingDays = [];

      this.repeatDays.forEach((element) => {
        switch (element) {
          case '1':
            repeatingDays.push(RRule.MO);
            break;
          case '2':
            repeatingDays.push(RRule.TU);
            break;
          case '3':
            repeatingDays.push(RRule.WE);
            break;
          case '4':
            repeatingDays.push(RRule.TH);
            break;
          case '5':
            repeatingDays.push(RRule.FR);
            break;
          case '6':
            repeatingDays.push(RRule.SA);
            break;
          case '0':
            repeatingDays.push(RRule.SU);
            break;
        }
      });
      console.log('Repeating Days Pattern:', repeatingDays);
      const startDate = new Date(Date.parse(start));
      const endDate = new Date(Date.parse(end));
      const difference = endDate.getTime() - startDate.getTime();
      console.log('Repeat Until Date: ', this.repeatUntil);
      const rule = new RRule({
        freq: RRule.WEEKLY,
        interval: this.repeatInterval.value,
        byweekday: repeatingDays,
        dtstart: startDate,
        until: new Date(
          Date.parse(
            moment.tz(this.repeatUntil.nativeElement.value, finalTz).format()
          )
        ),
      });
      console.log('RRULE: ', rule);
      const batch = this.fb.fb.firestore.batch();
      const repeatId = this.fb.generateRandomId(15);
      rule.all().forEach((x) => {
        console.log('Processing Date: ', x);
        const rStart = Timestamp.fromDate(
          new Date(Date.parse(moment.tz(x.getTime(), finalTz).format()))
        );
        const rEnd = Timestamp.fromDate(
          new Date(
            Date.parse(
              moment.tz(x.getTime(), finalTz).add(difference, 'ms').format()
            )
          )
        );

        const schedRef = new ScheduledShift(
          null,
          this.form.value.type,
          rStart,
          rEnd,
          repeatId,
          JSON.parse(this.form.value.location),
          this.userInfo.user.companyId,
          this.form.value.user
        );
        delete schedRef.id;
        const docRef = this.fb.fb.firestore.collection('Schedules').doc();
        batch.set(docRef, Object.assign({}, schedRef));
      });
      batch.commit();
      this.dialog.close(true);
    }
    // const start = moment(s.toDateString() + ' ' + this.form.value.sTime);
    // const startDate = start.clone().tz(finalTz);
    // console.log(startDate);
  }
  applyChangesToAllShifts(schedule: ScheduledShift, tz, start, end) {
    const startTimeHour = moment.tz(start, tz).hour();
    const startTimeMinute = moment.tz(start, tz).minute();
    console.log();
    const difference =
      new Date(Date.parse(end)).getTime() -
      new Date(Date.parse(start)).getTime();
    console.log('Difference in Hours: ', difference / 1000 / 60 / 60);
    let array = [];
    const batch = this.fb.fb.firestore.batch();
    const initialDoc = this.fb.fb.firestore
      .collection('Schedules')
      .doc(schedule.id);
    batch.set(initialDoc, Object.assign({}, schedule));
    const futureSchedules = this.fb
      .findFutureRepeatingSchedules(schedule)
      .subscribe((z) => {
        console.log('Fetched schedules to change:', z);
        z.forEach((x: any) => {
          const rStart = Timestamp.fromDate(
            new Date(
              Date.parse(
                moment
                  .tz(x.start_date.toMillis(), tz)
                  .hour(startTimeHour)
                  .minute(startTimeMinute)
                  .format()
              )
            )
          );
          const rEnd = Timestamp.fromDate(
            new Date(
              Date.parse(
                moment
                  .tz(x.start_date.toMillis(), tz)
                  .hour(startTimeHour)
                  .minute(startTimeMinute)
                  .add(difference, 'ms')
                  .format()
              )
            )
          );
          const schedRef = new ScheduledShift(
            null,
            schedule.type,
            rStart,
            rEnd,
            schedule.repeatId,
            schedule.location,
            schedule.companyId,
            schedule.cleaner
          );
          delete schedRef.id;
          const docRef = this.fb.fb.firestore.collection('Schedules').doc(x.id);
          batch.set(docRef, Object.assign({}, schedRef));
        });
        batch.commit();
        this.dialog.close();
      });
  }
  deleteFutureRepeatingShifts(schedule: ScheduledShift) {
    const batch = this.fb.fb.firestore.batch();
    const initialDoc = this.fb.fb.firestore
      .collection('Schedules')
      .doc(schedule.id);
    batch.delete(initialDoc);
    const futureSchedules = this.fb
      .findFutureRepeatingSchedules(schedule)
      .subscribe((z) => {
        console.log('Fetched Schedules to Delete: ', z);
        z.forEach((x) => {
          const docRef = this.fb.fb.firestore.collection('Schedules').doc(x.id);
          batch.delete(docRef);
        });
        batch.commit();
        this.dialog.close();
      });
  }
  formatLocationValue(a, l) {
    return JSON.stringify({ acct: a, loc: l });
  }
  buttonToggleChange(e) {
    this.repeatDays = e.value;
  }
  close() {
    this.dialog.close(true);
  }
  deleteSchedule() {
    if (this.data.event.repeatId != '') {
      const confirm = this.confirmDialog.open(ConfirmChangesDialog);
      confirm.afterClosed().subscribe((value) => {
        if (value) {
          //apply to all
          this.deleteFutureRepeatingShifts(this.data.event);
        } else {
          //apply to only this shift
          this.fb
            .deleteSchedule(this.data.event)
            .then(() => this.dialog.close());
        }
      });
    } else {
      this.fb.deleteSchedule(this.data.event).then(() => this.dialog.close());
    }
  }
  addOneYear(date: Date) {
    this.maxRepeatDate = moment(date.getTime()).add(1, 'y').toDate();
  }
  repeatChanged(e) {
    if (e.checked) {
      let date;
      if (this.form.value.sDate) {
        date = this.form.value.sDate;
      } else {
        date = new Date();
      }
      console.log('Form Date: ', date.getDay());
      this.form.addControl(
        'repeatDays',
        new FormControl(date.getDay().toString(), {
          validators: [Validators.required],
        })
      );
      this.repeatDays = [date.getDay().toString()];
      this.form.addControl(
        'frequency',
        new FormControl('1', {
          validators: [Validators.required],
        })
      );
      this.form.addControl(
        'repeatUntil',
        new FormControl(date, {
          validators: [
            Validators.required,
            Validators.min(date.getTime()),
            Validators.max(this.maxRepeatDate.getTime()),
          ],
        })
      );
    } else {
      this.form.removeControl('repeatDays');
      this.form.removeControl('frequency');
      this.form.removeControl('repeatUntil');
    }
    console.log(e);
  }
  datesValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const start = {
        date: this.form.value.sDate,
        time: this.form.value.sTime,
      };
      const end = { date: this.form.value.eDate, time: this.form.value.eTime };
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
        } else if (this.form.value.type === 'trad') {
          const dif = e - s;
          const hrs = dif / 1000 / 60 / 60;
          if (hrs > 24) {
            return { invalidDates: { value: control.value } };
          } else {
            return null;
          }
        } else {
          return null;
        }
      } else {
        return null;
      }
    };
  }
  changedLocation(e) {
    const l = JSON.parse(e);
    this.filterUsers(l);
    if (this.form.controls['user'].disabled) {
      this.form.controls['user'].enable();
    }
  }
  filterUsers(l) {
    this.activeUsers = this.users.filter((x) => {
      let bool;
      x.locations.forEach((y) => {
        console.log(y);
        if (
          y.active &&
          y.location.acct === l.acct &&
          y.location.loc === l.loc
        ) {
          bool = true;
          return;
        }
        bool = false;
      });
      return bool;
    });
  }
}
@Component({
  templateUrl: './apply-changes-to-recurring.html',
  styleUrls: ['./schedules.component.css'],
})
export class ConfirmChangesDialog {
  constructor(private dialogRef: MatDialogRef<ConfirmChangesDialog>) {}
  applyToAll() {
    this.dialogRef.close(true);
  }
  applyToOnly() {
    this.dialogRef.close(false);
  }
}
