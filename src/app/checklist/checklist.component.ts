import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment-timezone';
import { Subscription } from 'rxjs';
import { Account } from '../models/account.model';
import { TemplateChecklist } from '../models/checklists/checklist-template.model';
import { CacheService } from '../Shared Services/cache.service';
import { FirebaseService } from '../Shared Services/firestore.service';
import { UserInfo } from '../Shared Services/user-info.service';
import { Timestamp } from '@firebase/firestore';
import { ActiveChecklist } from '../models/checklists/checklist-active.model';

@Component({
  selector: 'app-checklist',
  templateUrl: './checklist.component.html',
  styleUrls: ['./checklist.component.css']
})
export class ChecklistComponent implements OnInit, OnDestroy, AfterViewInit {
  accounts: Account[];
  checklists: TemplateChecklist[];
  displayedColumns = ['name', 'type', 'location', 'tasks'];
  dataSource = new MatTableDataSource<any>();
  private subscriptions: Subscription[] = [];
  private locationFilter;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(
    private fb: FirebaseService,
    private userInfo: UserInfo,
    private cacheService: CacheService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.userInfo.accounts.subscribe((a) => (this.accounts = a))
    );
    this.subscriptions.push(
      this.cacheService.checklists.subscribe(x => {
        console.log(x);
        this.checklists = x;
        this.refreshDataSource();
        })
    );
    this.dataSource.filterPredicate = (data, filter) => {
      const fil = JSON.parse(filter);
      if(data.location.acct === fil.acct && data.location.loc === fil.loc){
        return true;
      } else if (filter === 'false'){
        return true;
      } else {
        return false;
      }
    }
  }
  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
  refreshDataSource(){
    this.dataSource.data = this.checklists;
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((e) => e.unsubscribe());
  }
  setLocation(z) {
    let e = z.target.value;;
    console.log(z.target.value);
    this.dataSource.filter = e;

  }
  formatLocation(a, l) {
    const obj = { acct: a.id, loc: l.id };
    // console.log(obj);
    return JSON.stringify(obj);
  }
  getLocationName(x){
    const acc = this.accounts.find(z => z.id === x.acct);
    const loc = acc.locations.find(z => z.id === x.loc);
    return loc.name;
  }
  openEditDialog(row){
    this.router.navigate(['details'], {relativeTo: this.route, queryParams: {id: row.id}});
  }
  openNewChecklist(){
    const dialog = this.dialog.open(NewChecklistDialog, {
      maxWidth: '500px'
    });
  }
}
@Component({
  templateUrl: './new-checklist.html',
})
export class NewChecklistDialog implements OnInit {
  form: FormGroup;
  accounts: Account[];
  private subscriptions: Subscription[] = [];

  constructor(
    private userInfo: UserInfo,
    private cacheService: CacheService,
    private dialogRef: MatDialogRef<NewChecklistDialog>,
    private fb: FirebaseService
  ){}
  ngOnInit(): void {
    this.subscriptions.push(
      this.userInfo.accounts.subscribe((a) => (this.accounts = a))
    );
    this.form = new FormGroup({
      name: new FormControl('', {
        validators: [Validators.required]
      }),
      type: new FormControl('Daily', {
        validators: [Validators.required]
      }),
      location: new FormControl('', {
        validators: [Validators.required]
      }),
      dow: new FormControl('', {
        validators: [Validators.required]
      }),
    });
  }
  formatLocation(a, l) {
    const obj = { acct: a, loc: l };
    // console.log(obj);
    return JSON.stringify(obj);
  }
  changeType(e){
    if (e === 'Monthly'){
      if (this.form.contains('dow')){
        this.form.removeControl('dow');
      }
      if (this.form.contains('doww')){
        this.form.removeControl('doww');
      }
    } else if (e === 'Weekly'){
      if (this.form.contains('dow')){
        this.form.removeControl('dow');
      }
      this.form.addControl('doww', new FormControl('', {
        validators: [Validators.required]
      }));
    } else if (e === 'Daily'){
      if (this.form.contains('doww')){
        this.form.removeControl('doww');
      }
      this.form.addControl('dow', new FormControl('', {
        validators: [Validators.required]
      }));
    }
  }
  test(e){
    console.log(e);
  }
  cancel(){
    this.dialogRef.close();
  }
  save(){
    const location = JSON.parse(this.form.value.location);
    const tzId = this.accounts.find(x => x.id === location.acct).locations.find(x => x.id === location.loc).address.tzId;
    const checklist = new TemplateChecklist(null, this.userInfo.user.companyId, [], this.form.value.name, this.form.value.type, location, tzId, true);
    let weekdays ;
    if (this.form.value.dow){
      const temp = []
      // console.log('DOW: ', this.form.value.dow);
      this.form.value.dow.forEach(x => temp.push(+x));
      weekdays = temp;
    }
    if (this.form.value.doww){
      console.log('DOWW');
      weekdays = +this.form.value.doww;
    }
    if (this.form.value.type === 'Monthly'){
      weekdays = [];
    }
    checklist.weekdays = weekdays;
    delete checklist.id;
    const doc = this.fb.createNewChecklistTemplate();
    const id = doc.ref.id;

    doc.set(Object.assign({}, checklist)).then(() =>{
      this.dialogRef.close();
      this.createFirstActiveChecklist(checklist, id);
    });
  }
  createFirstActiveChecklist(checklist, id){
    if(checklist.type === 'Daily'){
      return;
    }
    console.log('PASSING IN TEMPLATE: ', checklist);
    console.log('PASSING IN ID: ', id);
    let firstExpiration;
    const today = moment.tz(checklist.tzId);
    let activeChecklist;
    if (checklist.type === 'Weekly'){
      const expirationDay = checklist.weekdays;
      let expiration = moment.tz(checklist.tzId).set('day', expirationDay).set('hour', 23).set('minute', 59);
      if (expiration.isBefore(today)){
        expiration.add(1, 'week');
      }
      const formattedDate = new Date(Date.parse(expiration.format())).getTime();
      const dateRange = expiration.clone().subtract(1, 'week').format('MM/DD') + ' - ' + expiration.clone().format('MM/DD');
      const timestamp = new Timestamp(formattedDate / 1000, 0);
      activeChecklist = new ActiveChecklist(checklist.companyId, checklist.location, [], timestamp, dateRange, id, checklist.title, false);

    }
    else if (checklist.type === 'Monthly'){
      let expiration = moment.tz(checklist.tzId).endOf('month');
      const formattedDate = new Date(Date.parse(expiration.format()));
      const dateRange = expiration.clone().startOf('month').format('MM/DD') + ' - ' + expiration.clone().format('MM/DD');
      const timestamp = new Timestamp(expiration.unix(), 0);
      activeChecklist = new ActiveChecklist(checklist.companyId, checklist.location, [], timestamp, dateRange, id, checklist.title, false);
    }
    delete activeChecklist.id;
    delete activeChecklist.user;
    activeChecklist.type = checklist.type;
    activeChecklist.query = this.fb.generateQueryDateFirestore(activeChecklist.expiration.toMillis(), checklist.tzId);
    activeChecklist.tzId = checklist.tzId;
    console.log('ACTIVE CHECKLIST CREATED: ', activeChecklist);
    this.fb.createNewActiveChecklist(activeChecklist);
  }
}
