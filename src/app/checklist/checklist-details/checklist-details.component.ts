import {
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { TemplateChecklist } from 'src/app/models/checklists/checklist-template.model';
import { CacheService } from 'src/app/Shared Services/cache.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatTableDataSource } from '@angular/material/table';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TemplateChecklistTask } from 'src/app/models/checklists/task.model';
import { FirebaseService } from 'src/app/Shared Services/firestore.service';
import { UserInfo } from 'src/app/Shared Services/user-info.service';
import { Account } from 'src/app/models/account.model';
import { NewChecklistDialog } from '../checklist.component';
import { ComponentCanDeactivate } from 'src/app/Shared Services/unsaved-data.guard';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import { ActiveChecklist } from 'src/app/models/checklists/checklist-active.model';
import { Timestamp } from '@firebase/firestore';

@Component({
  selector: 'app-checklist-details',
  templateUrl: './checklist-details.component.html',
  styleUrls: ['./checklist-details.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ChecklistDetailsComponent
  implements OnInit, OnDestroy, ComponentCanDeactivate
{
  checklist: TemplateChecklist;
  displayedColumns = ['order', 'name', 'type', 'subtask', 'photo'];
  dataSource = new MatTableDataSource<any>();
  private _checklists: TemplateChecklist[];
  private subs: Subscription[] = [];
  private checklistEdited = false;
  constructor(
    private route: ActivatedRoute,
    private cacheService: CacheService,
    private dialog: MatDialog,
    private fb: FirebaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.cacheService.checklists.subscribe((x) => {
        this._checklists = x;
        this.subs.push(
          this.route.queryParams.subscribe((params) => {
            this.checklist = this._checklists.find(
              (x) => x.id === params['id']
            );
            this.refreshTable();
          })
        );
      })
    );
  }
  ngOnDestroy(): void {
    this.subs.forEach((x) => x.unsubscribe());
  }
  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    if (this.checklistEdited) {
      return false;
    } else {
      return true;
    }
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
  }
  refreshTable() {
    this.dataSource.data = this.checklist.tasks;
  }
  openEditDialog(row) {
    const ref = this.dialog.open(NewEditChecklistTasks, {
      data: {
        editMode: true,
        task: row,
      },
      disableClose: true,
    });
    ref.afterClosed().subscribe((r) => {
      const i = this.checklist.tasks.findIndex((x) => x.id === r.task.id);
      if (!r.delete) {
        this.checklist.tasks[i] = r.task;
      } else if (r.delete) {
        this.checklist.tasks.splice(i, 1);
      }
      this.setChecklistToEdited();
      this.refreshTable();
    });
  }
  openNewDialog() {
    const ref = this.dialog.open(NewEditChecklistTasks, {
      data: {
        editMode: false,
      },
      disableClose: true,
    });
    ref.afterClosed().subscribe((r) => {
      if (r != false) {
        this.checklist.tasks.push(r.task);
        this.refreshTable();
        this.setChecklistToEdited();
      }
    });
  }
  reorderSubtask(e: CdkDragDrop<string[]>) {
    moveItemInArray(this.checklist.tasks, e.previousIndex, e.currentIndex);
    this.refreshTable();
    this.setChecklistToEdited();
  }
  setChecklistToEdited() {
    if (!this.checklistEdited) {
      this.checklistEdited = true;
    }
  }
  saveChecklist() {
    this.fb.updateChecklist(this.checklist).then(
      (v) => {
        this.checklistEdited = false;
        this.goBack();
      },
      (e) => this.fb.displayError(e.message)
    );
  }
  archiveChecklist() {
    this.checklist.active = false;
    this.fb.updateChecklist(this.checklist).then(
      (v) => {
        this.goBack();
      },
      (e) => this.fb.displayError(e.message)
    );
  }
  editChecklistDetails() {
    this.dialog.open(EditChecklistDetails, {
      data: {
        checklist: this.checklist,
      },
    });
  }
  goBack() {
    this.router.navigateByUrl('/checklists');
  }
  openCopyChecklist(){
    const open = this.dialog.open(CopyTasksFromExistingChecklist, {
      data: {
        id: this.checklist.id
      }
    });
    open.afterClosed().subscribe(r => {
      if(r.copy){
        r.tasks.forEach(x => x.id = this.fb.generateRandomId(15));
        if(r.options === 'merge'){
          r.tasks.forEach(x => this.checklist.tasks.push(x));
          this.setChecklistToEdited();
        } if(r.options === 'overwrite'){
          this.checklist.tasks = r.tasks;
          this.setChecklistToEdited();
        }
        this.refreshTable();
      }
    });
  }
}
@Component({
  templateUrl: './new-edit-task.html',
  styleUrls: ['./checklist-details.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class NewEditChecklistTasks implements OnInit, OnDestroy {
  mode: string;
  form: FormGroup;
  subtaskForm: FormGroup;
  subtasks: string[] = [];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialog: MatDialogRef<NewEditChecklistTasks>,
    private fb: FirebaseService
  ) {}
  ngOnInit(): void {
    this.form = new FormGroup({
      title: new FormControl('', {
        validators: [Validators.required],
      }),
      description: new FormControl('', {
        validators: [],
      }),
      photo_required: new FormControl('', {
        validators: [],
      }),
    });
    this.subtaskForm = new FormGroup({
      subtask: new FormControl('', {
        validators: [],
      }),
    });
    if (this.data.editMode) {
      this.mode = 'Edit';
      this.form.setValue({
        title: this.data.task.title,
        description: this.data.task.description,
        photo_required: this.data.task.photo_required,
      });
      this.subtasks = this.data.task.subtasks;
    } else {
      this.mode = 'New';
    }
  }
  ngOnDestroy(): void {}
  pushNewSubtask() {
    const newTask = this.subtaskForm.value.subtask;
    if (newTask != null) {
      this.subtasks.push(newTask);
      this.subtaskForm.reset();
    }
  }
  removeSubtask(i) {
    this.subtasks.splice(i, 1);
  }
  reorderSubtask(e: CdkDragDrop<string[]>) {
    moveItemInArray(this.subtasks, e.previousIndex, e.currentIndex);
  }
  saveTask() {
    let id;
    const formValue = this.form.value;
    if (!this.data.editMode) {
      id = this.fb.generateRandomId(15);
    } else {
      id = this.data.task.id;
    }
    const newTask = {
      id: id,
      title: formValue.title,
      description: formValue.description,
      subtasks: this.subtasks,
      photo_required: formValue.photo_required,
    };
    this.dialog.close({
      editMode: this.data.editMode,
      task: newTask,
    });
  }
  close() {
    this.dialog.close(false);
  }
  deleteButton() {
    this.dialog.close({
      delete: true,
      task: this.data.task,
    });
  }
}
@Component({
  templateUrl: './edit-checklist-details.html',
  styleUrls: ['./checklist-details.component.css'],
})
export class EditChecklistDetails implements OnInit {
  form: FormGroup;
  accounts: Account[];
  firstRun = true;
  private subscriptions: Subscription[] = [];
  constructor(
    private userInfo: UserInfo,
    private cacheService: CacheService,
    private dialogRef: MatDialogRef<NewChecklistDialog>,
    private fb: FirebaseService,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}
  ngOnInit(): void {
    this.subscriptions.push(
      this.userInfo.accounts.subscribe((a) => (this.accounts = a))
    );
    this.form = new FormGroup({
      name: new FormControl(this.data.checklist.title, {
        validators: [Validators.required],
      }),
      type: new FormControl({value: this.data.checklist.type, disabled: true}, {
        validators: [Validators.required],
      }),
      location: new FormControl(
        JSON.stringify({
          acct: this.data.checklist.location.acct,
          loc: this.data.checklist.location.loc,
        }),
        {
          validators: [Validators.required],
        }
      ),
    });
    this.changeType(this.data.checklist.type);
  }

  formatLocation(a, l) {
    const obj = { acct: a, loc: l };
    // console.log(obj);
    return JSON.stringify(obj);
  }
  changeType(e) {
    console.log(e);
    if (e === 'Monthly') {
      if (this.form.contains('dow')) {
        this.form.removeControl('dow');
      }
      if (this.form.contains('doww')) {
        this.form.removeControl('doww');
      }
    } else if (e === 'Weekly') {
      if (this.form.contains('dow')) {
        this.form.removeControl('dow');
      }
      this.form.addControl(
        'doww',
        new FormControl('', {
          validators: [Validators.required],
        })
      );
    } else if (e === 'Daily') {
      if (this.form.contains('doww')) {
        this.form.removeControl('doww');
      }
      this.form.addControl(
        'dow',
        new FormControl('', {
          validators: [Validators.required],
        })
      );
    }
    if (this.firstRun) {
      if (this.data.checklist.type === 'Daily') {
        let weekdays = [];
        this.data.checklist.weekdays.forEach((x) =>
          weekdays.push(x.toString())
        );
        this.form.controls['dow'].setValue(weekdays);
      } else if (this.data.checklist.type === 'Weekly') {
        this.form.controls['doww'].setValue(
          this.data.checklist.weekdays.toString()
        );
      }
      this.firstRun = false;
    }
  }
  test(e) {
    console.log(e);
  }
  cancel() {
    this.dialogRef.close();
  }
  save() {
    const location = JSON.parse(this.form.value.location);
    const tzId = this.accounts
      .find((x) => x.id === location.acct)
      .locations.find((x) => x.id === location.loc).address.tzId;
    let weekdays;
    if (this.form.value.dow) {
      const temp = [];
      // console.log('DOW: ', this.form.value.dow);
      this.form.value.dow.forEach((x) => temp.push(+x));
      weekdays = temp;
    }
    if (this.form.value.doww) {
      console.log('DOWW');
      weekdays = +this.form.value.doww;
    }
    const checklist = {
      title: this.form.value.name,
      location: location,
      type: this.data.checklist.type,
      weekdays: weekdays,
    };
    this.fb
      .editChecklistDetails(checklist, this.data.checklist.id)
      .then((x) => {
      if (checklist.type === 'Weekly' && !this.form.controls['doww'].pristine) {
        this.fb.findActiveChecklist(this.data.checklist.id).subscribe(z => {
          const object = z;
          const today = moment.tz(this.data.checklist.tzId);
          const expirationDay = checklist.weekdays;
          let expiration = moment.tz(this.data.checklist.tzId).set('day', expirationDay).set('hour', 23).set('minute', 59);
          if (expiration.isBefore(today)){
           expiration.add(1, 'week');
          }
          const formattedDate = new Date(Date.parse(expiration.format())).getTime();
          const dateRange = expiration.clone().subtract(1, 'week').format('MM/DD') + ' - ' + expiration.clone().format('MM/DD');
          const timestamp = new Timestamp(formattedDate / 1000, 0);
          const sendThis = {
            expiration: timestamp,
            date_range: dateRange,
            query: this.fb.generateQueryDateFirestore(timestamp.toMillis(), this.data.checklist.tzId)
          };
          this.fb.updateActiveChecklistExpiration(object[0].id, sendThis);
          this.dialogRef.close();
        });
      }
  });
  }
}
@Component({
  templateUrl: './copy-tasks.html',
  styleUrls: ['./checklist-details.component.css'],
})
export class CopyTasksFromExistingChecklist implements OnInit, OnDestroy {
  checklists = [];
  accounts;
  formattedList = [];
  subs: Subscription[] = [];
  form: FormGroup;
  constructor(
    @Inject(MAT_DIALOG_DATA) private data,
    private userInfo: UserInfo,
    private cacheService: CacheService,
    private dialog: MatDialogRef<CopyTasksFromExistingChecklist>
  ){}
  ngOnInit(): void {
    this.subs.push(this.userInfo.accounts.subscribe(x => {
      this.accounts = x;
      this.subs.push(this.cacheService.checklists.subscribe(x => {
        this.checklists = x;
        this.formatChecklists();
      }));
    }));
    this.form = new FormGroup({
      checklist: new FormControl('', {
        validators: [Validators.required]
      }),
      options: new FormControl('merge', {
        validators: [Validators.required]
      })
    });
  }
  ngOnDestroy(): void {
      this.subs.forEach(e => e.unsubscribe());
  }
  formatChecklists(){
    let groupings = [];
    console.log(this.checklists);
    this.checklists.forEach(x => {
      if(x.id === this.data.id){
        return;
      }
      if(groupings.findIndex(z => z.acct === x.location.acct && z.loc === x.location.loc) === -1){
        const account = this.accounts.find(q => q.id === x.location.acct);
        const name = account.name + ' - ' + account.locations.find(l => l.id === x.location.loc).name;
        groupings.push({
          acct: x.location.acct,
          loc: x.location.loc,
          name: name,
          checklists: [x]
        });
      } else {
        const i = groupings.findIndex(t => t.acct === x.location.acct && t.loc === x.location.loc);
        groupings[i].checklists.push(x);
      }
    });
    this.formattedList = groupings;
    console.log(groupings);
  }
  cancel(){
    this.dialog.close({
      copy: false
    });
  }
  closeAndCopy(){
    const tasks = this.checklists.find(x => x.id === this.form.value.checklist).tasks;
    console.log('TASKS: ', tasks);

    this.dialog.close({
      copy: true,
      tasks: tasks,
      options: this.form.value.options
    });
  }
}
