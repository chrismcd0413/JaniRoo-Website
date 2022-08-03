import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../auth/login/auth.service';
import { TemplateChecklist } from '../models/checklists/checklist-template.model';
import { ScheduledShift } from '../models/schedule.model';
import { User } from '../models/user.model';
import { UserInfo } from './user-info.service';
import { Timestamp } from '@firebase/firestore';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  constructor(
    public fb: AngularFirestore,
    private functions: AngularFireFunctions,
    private userService: UserInfo,
    private snackbar: MatSnackBar
  ) {}
  get companyId() {
    return this.userService.user.companyId;
  }
  fetchUserProfile(id: string) {
    return this.fb.doc<any>('Users/' + id).valueChanges({ idField: 'id' });
  }
  fetchCompanyUsers() {
    return this.fb
      .collection<User[]>('Users', (ref) =>
        ref.where('companyId', '==', this.userService.user.companyId)
      )
      .valueChanges({ idField: 'id' });
  }
  fetchCompanyAccounts() {
    return this.fb
      .collection<any[]>('Accounts', (ref) =>
        ref.where('companyId', '==', this.userService.user.companyId)
      )
      .valueChanges({ idField: 'id' });
  }
  fetchCompanyLocations() {
    return this.fb
      .collection<any[]>('Locations', (ref) =>
        ref.where('companyId', '==', this.userService.user.companyId)
      )
      .valueChanges({ idField: 'id' });
  }
  displayError(message) {
    this.snackbar.open(message);
  }
  createUser(data) {
    const call = this.functions.httpsCallable('createUser');
    return call(data);
  }
  resetUserPassword(data: {id: string, password: string}){
    const call = this.functions.httpsCallable('resetPassword');
    return call(data);
  }
  updateUserStatus(data: {id: string, disabled: boolean}) {
    const call = this.functions.httpsCallable('updateUserStatus');
    return call(data);
  }
  createUserProfile(user, role, phone) {
    return this.fb
      .collection('Users')
      .doc(user.uid)
      .set({
        address: {
          address1: '',
          address2: '',
          city: '',
          state: '',
          zip: null,
        },
        locations: [],
        name: user.displayName,
        phone_number: phone,
        active: true,
        role: role,
        companyId: this.userService.user.companyId,
        email: user.email,
      });
  }
  setAccountDoc(id, data) {
    return this.fb.collection('Accounts').doc(id).set(data);
  }
  setUserProfileDoc(id, data){
    return this.fb.collection('Users').doc(id).set(Object.assign({}, data));
  }

  // SCHEDULES

  fetchSchedules(start, end, acct: { acct, loc }) {
    return this.fb
      .collection('Schedules', (ref) =>
        ref
          .where('companyId', '==', this.userService.user.companyId)
          .where('location.acct', '==', acct.acct)
          .where('location.loc', '==', acct.loc)
          .where('start_date', '>', start)
          .where('start_date', '<', end)
      )
      .valueChanges({ idField: 'id' });
  }
  createSchedule(schedule: ScheduledShift){
    return this.fb.collection('Schedules').doc().set(Object.assign({}, schedule));
  }
  setSchedule(id: string, schedule: ScheduledShift){
    return this.fb.collection('Schedules').doc(id).set(Object.assign({}, schedule));
  }
  deleteSchedule(schedule: ScheduledShift){
    return this.fb.collection('Schedules').doc(schedule.id).delete();
  }
  findFutureRepeatingSchedules(schedule:ScheduledShift){
    return this.fb.collection<ScheduledShift[]>('Schedules', (ref) =>
    ref
      .where('repeatId', '==', schedule.repeatId)
      .where('start_date', '>', schedule.start_date)
      ).valueChanges({idField: 'id'}).pipe(take(1));
  }

  // CHECKLISTS

  fetchChecklistTemplates(){
    console.log('Company ID', this.companyId);
    return this.fb.collection<TemplateChecklist[]>('Checklist Templates', (ref) =>
    ref
    .where('companyId', '==', this.companyId)
    .where('active', '==', true)
    ).valueChanges({idField: 'id'});
  }
  createNewChecklistTemplate(){
    return this.fb.collection('Checklist Templates').doc();
  }
  updateChecklist(checklist){
    const id = checklist.id;
    delete checklist.id;
    return this.fb.collection('Checklist Templates').doc(id).set(Object.assign({}, checklist));
  }
  editChecklistDetails(details, id){
    return this.fb.collection('Checklist Templates').doc(id).update(details);
  }
  createNewActiveChecklist(checklist){
    return this.fb.collection('Active Checklists').doc().set(Object.assign({}, checklist));
  }
  findActiveChecklist(id){
    return this.fb.collection('Active Checklists', (ref) =>
    ref.where('templateId', '==', id)
    .where('complete', '==', false)
    .orderBy('expiration', 'desc')
    ).valueChanges({ idField: 'id'}).pipe(take(1));
  }
  updateActiveChecklistExpiration(id, fields){
    return this.fb.collection('Active Checklists').doc(id).update(fields);
  }

  // INVENTORY

  fetchInventoryItems(){
    return this.fb.collection('Inventory Items', (ref) =>
    ref.where('companyId', '==', this.companyId)
    .orderBy('last_update', 'desc')
    ).valueChanges({ idField: 'id'});
  }
  addNewInventoryItem(item) {
    return this.fb.collection('Inventory Items').doc().set(Object.assign({}, item));
  }
  editInventoryItem(item) {
    const id = item.id;
    delete item.id;
    return this.fb.collection('Inventory Items').doc(id).set(Object.assign({}, item));
  }
  deleteInventoryItem(item) {
    return this.fb.collection('Inventory Items').doc(item.id).delete();
  }

  // TIMESHEETS

  fetchTimesheets(start, end){
      return this.fb.collection('Timesheets', (ref) =>
      ref.where('companyId', '==', this.companyId)
      .where('query_start', '<=', end)
      .where('query_start', '>=', start)
      ).valueChanges({ idField: 'id'});
  }
  updateTimesheet(id, data) {
    return this.fb.collection('Timesheets').doc(id).update(data);
  }
  createNewTimesheet(data) {
    return this.fb.collection('Timesheets').doc().set(data);
  }
  deleteTimesheet(id) {
    return this.fb.collection('Timesheets').doc(id).delete();
  }
  // CHECKLIST VIEWER

  fetchActiveChecklistsForViewer(start, end) {
    return this.fb.collection('Active Checklists', (ref) =>
      ref.where('companyId', '==', this.companyId)
      .where('query', '<=', end)
      .where('query', '>=', start)
      ).valueChanges({ idField: 'id'});
  }
  // DASHBOARD FUNCTIONS

  dashboardFetchLowInventoryItems(){
    return this.fb.collection('Inventory Items', (ref) =>
    ref.where('companyId', '==', this.companyId)
    .where('low_inventory', '==', true)
    ).valueChanges({ idField: 'id'});
  }

  dashboardFetchActiveDailyChecklists() {
    return this.fb.collection('Active Checklists', (ref) =>
    ref.where('companyId', '==', this.companyId)
    .where('type', '==', 'Daily')
    .where('query', 'array-contains', this.generateQueryDateLocal(new Date().getTime()))
    ).valueChanges({ idField: 'id'});
  }
  dashboardFetchActiveRecurringChecklists() {
    return this.fb.collection('Active Checklists', (ref) =>
    ref.where('companyId', '==', this.companyId)
    .where('expiration', '>', Timestamp.fromDate(new Date()))
    ).valueChanges({ idField: 'id'});
  }
  dashboardFetchTodaysTimesheets() {
    const query = this.generateQueryDateLocal(new Date().getTime());
    console.log('Query', query);
    return this.fb.collection('Timesheets', (ref) =>
    ref.where('companyId', '==', this.companyId)
    .where('query_start', '==',query )
    ).valueChanges({ idField: 'id'});
  }

  dashboardFetchTodaysSchedules() {
    const query = this.generateQueryDateLocal(new Date().getTime());
    return this.fb.collection('Schedules', (ref) =>
    ref.where('companyId', '==', this.companyId)
    .where('query', 'array-contains', query)
    ).valueChanges({ idField: 'id'});
  }
  // RANDOM FUNCTIONS

  generateRandomId(l: number) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < l; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    console.log('ID GENERATED: ', result);
    return result;
  }

  generateQueryDateFirestore(m, tz) {
    const initial = moment(m).tz(tz);
    const year = initial.format('YY');
    const month = +initial.format('MM') + 10;
    const day = +initial.format('DD') + 10;
    const formattedString = year + month.toString() + day.toString();
    return +formattedString;
  }
  generateQueryDateLocal(m) {
    console.log('Time Sent', m);
    const initial = moment(m);
    const year = initial.format('YY');
    const month = +initial.format('MM') + 10;
    const day = +initial.format('DD') + 10;
    const formattedString = year + month.toString() + day.toString();
    return +formattedString;
  }
}
