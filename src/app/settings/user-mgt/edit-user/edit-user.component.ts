import {
  AfterViewInit,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { Account } from 'src/app/models/account.model';
import { UserPermissions } from 'src/app/models/user-permission.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/Shared Services/firestore.service';
import { UserInfo } from 'src/app/Shared Services/user-info.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css'],
})
export class EditUserComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() profile: User;
  @Output() editing = new EventEmitter<boolean>();
  @Output() setProfile = new EventEmitter<any>();
  @ViewChild(MatSort) sort: MatSort;
  detailsForm: FormGroup;
  dataSource = new MatTableDataSource<UserPermissions>();
  displayedColumns = ['name', 'email', 'phone', 'role'];
  @ViewChild(MatTable) table: MatTable<any>;
  accounts: Account[];
  subs: Subscription[] = [];
  locationChanges = false;
  firstRun = true;
  constructor(
    private dialog: MatDialog,
    private userInfo: UserInfo,
    private fb: FirebaseService
  ) {}

  ngOnInit(): void {
    console.log('Profile: ', this.profile);
    this.subs.push(
      this.userInfo.accounts.subscribe((a) => (this.accounts = a))
    );
    this.refreshTable();
    this.detailsForm = new FormGroup({
      name: new FormControl(this.profile.name, {
        validators: [Validators.required],
      }),
      email: new FormControl(this.profile.email, {
        validators: [Validators.required, Validators.email],
      }),
      phone: new FormControl(this.profile.phone_number, {
        validators: [Validators.required],
      }),
      role: new FormControl(this.profile.role, {
        validators: [Validators.required],
      }),
      a1: new FormControl(this.profile.address.address1, {
        validators: [],
      }),
      a2: new FormControl(this.profile.address.address2, {
        validators: [],
      }),
      city: new FormControl(this.profile.address.city, {
        validators: [],
      }),
      state: new FormControl(this.profile.address.state, {
        validators: [],
      }),
      zip: new FormControl(this.profile.address.zip, {
        validators: [],
      }),
    });
    if (this.profile.role === 'Owner'){
      this.detailsForm.disable();
    }
  }
  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }
  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
  goBack() {
    if (!this.detailsForm.untouched || this.locationChanges) {
      const ref = this.dialog.open(ConfirmBackUserProfile);
      ref.afterClosed().subscribe((i) => {
        if (i) {
          this.saveUserProfile();
        } else {
          this.back();
        }
      });
    } else {
      this.back();
    }
  }
  back() {
    this.editing.emit(false);
    this.setProfile.emit(null);
  }
  openEditDialog(row, i) {
    const ref = this.dialog.open(NewEditLocation, {
      data: {
        editMode: true,
        permission: row,
        currentPermissions: this.profile.locations.filter(
          (x) => x.active === true
        ),
      },
    });
    ref.afterClosed().subscribe((result) => {
      console.log('Edit Location Instance');
      const oL = this.profile.locations.findIndex(
        (l) => l.id === result.permission.id
      );
      if (result.changes) {
        this.profile.locations[oL] = result.permission;
        this.locationChanges = true;
      }
      this.refreshTable();
    });
  }
  openNewLocation() {
    const ref = this.dialog.open(NewEditLocation, {
      data: {
        editMode: false,
        currentPermissions: this.profile.locations.filter(
          (x) => x.active === true
        ),
        permission: null
      },
    });
    ref.afterClosed().subscribe((result) => {
      console.log('New Location Instance');
      if (result.changes) {
        this.profile.locations.push(result.permission);
        this.locationChanges = true;
        this.refreshTable();
      }
      console.log(result);
    });
  }
  refreshTable() {
    this.dataSource = new MatTableDataSource(
      this.profile.locations.filter((l) => l.active === true)
    );
    if (!this.firstRun) {
      this.table.renderRows();
    }
  }
  getLocationName(e) {
    const acct = this.accounts.filter((a) => a.id === e.acct);
    const loc = acct[0].locations.filter((l) => l.id === e.loc);
    const string = acct[0].name + ' - ' + loc[0].name;
    return string;
  }
  saveUserProfile() {
    console.log('SAVing: ', this.profile);
    const theId = this.profile.id;
    const data = {...this.profile};
    console.log('Pure Profile: ', data);
    delete data.id;
    data.locations = this.profile.locations.map((obj) => {return Object.assign({}, obj)});
    console.log('DATA: ', data);
    this.fb.setUserProfileDoc(theId, data);
    this.back();
  }
  archiveUser() {
    this.profile.active = false;
    const data = this.profile;
    delete data.id;
    data.locations = Object.assign({}, this.profile.locations);
    this.fb.setUserProfileDoc(this.profile.id, data);
    this.fb.updateUserStatus({id: this.profile.id, disabled: true})
    .subscribe(() => {
      this.back();
    }, (error) => this.fb.displayError(error.message));
  }
  openResetPassword(){
    const popup = this.dialog.open(ResetPasswordDialog, {
      data: { id: this.profile.id}
    });
  }
}

@Component({
  templateUrl: './new-loc.html',
  styleUrls: ['./edit-user.component.css'],
})
export class NewEditLocation implements OnInit, OnDestroy {
  title;
  form: FormGroup;
  accounts: Account[];
  subs: Subscription[] = [];
  currentLocations = [];
  constructor(
    private userInfo: UserInfo,
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<NewEditLocation>,
    private fb: FirebaseService
  ) {}

  ngOnInit(): void {
    console.log(this.data);
    const test: UserPermissions[] = this.data.currentPermissions;
    this.subs.push(
      this.userInfo.accounts.subscribe((a) => {
        this.accounts = a.filter((x) => x.active === true);
      })
    );
    this.form = new FormGroup({
      location: new FormControl('', {
        validators: [Validators.required],
      }),
      inspection: new FormControl(false, {
        validators: [],
      }),
      inventory: new FormControl(false, {
        validators: [],
      }),
      rate: new FormControl('', {
        validators: [Validators.required],
      }),
      type: new FormControl('', {
        validators: [Validators.required],
      }),
    });
    if (!this.data.editMode) {
      this.title = 'New';
    } else {
      this.title = 'Edit';
      const loc = JSON.stringify({ loc: this.data.permission.location.loc, acct: this.data.permission.location.acct});
      this.form.setValue({
        location: loc,
        inspection: this.data.permission.inspection,
        inventory: this.data.permission.inventory,
        rate: this.data.permission.pay_rate,
        type: this.data.permission.pay_frequency,
      });
    }
    if (this.data.currentPermissions.length === 0) {
      this.currentLocations = [];
    } else {
      let a = [];
      this.data.currentPermissions.forEach((x) =>
        a.push(JSON.stringify({ loc: x.location.loc, acct: x.location.acct}))
      );
      this.currentLocations = a;
      console.log('Current Formatted Locations', a);
    }
  }
  ngOnDestroy(): void {
    this.subs.forEach((a) => a.unsubscribe());
  }
  setLocationValue(a, l) {
    return JSON.stringify({ loc: l, acct: a });
  }
  save() {
    let id;

    if (this.data.editMode) {
      id = this.data.permission.id;
    } else {
      id = this.fb.generateRandomId(15);
    }
    const permission = new UserPermissions(
      id,
      JSON.parse(this.form.value.location),
      this.form.value.inspection,
      this.form.value.inventory,
      this.form.value.rate,
      this.form.value.type,
      true
    );
    const obj = {
      changes: true,
      permission: permission,
      editMode: this.data.editMode,
    };
    this.dialogRef.close(obj);
  }
  delete() {
    const permission = new UserPermissions(
      this.data.permission.id,
      JSON.parse(this.form.value.location),
      this.form.value.inspection,
      this.form.value.inventory,
      this.form.value.rate,
      this.form.value.type,
      false
    );
    this.dialogRef.close({
      changes: true,
      permission: permission,
    });
  }
  isLocationDisabled(o) {
    const i = JSON.stringify({ loc: o.loc, acct: o.acct});
    let current;
    if(this.data.permission){
      current = JSON.stringify({ loc: this.data.permission.location.loc, acct: this.data.permission.location.acct});
    } else {
      current = '';
    }
    if (this.currentLocations.indexOf(i) === -1 || i === current) {
      return false;
    } else {
      return true;
    }
  }
}
@Component({
  templateUrl: './confirm-changes.html',
  styleUrls: ['./edit-user.component.css'],
})
export class ConfirmBackUserProfile {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<ConfirmBackUserProfile>
  ) {}
  close(i) {
    this.dialogRef.close(i);
  }
}
@Component({
  templateUrl: './reset-password.html',
  styleUrls: ['./edit-user.component.css'],
})
export class ResetPasswordDialog {
  form: FormGroup;
  constructor(
    @Inject(MAT_DIALOG_DATA) private data,
    private dialogRef: MatDialogRef<ResetPasswordDialog>,
    private fb: FirebaseService
  ){
    this.form = new FormGroup({
      password: new FormControl('', {
        validators: [Validators.required, Validators.minLength(6)],
      })
    });
  }
  cancel(){
    this.dialogRef.close(false);
  }
  submit(){
    this.fb.resetUserPassword({id: this.data.id, password: this.form.value.password})
    .subscribe(() => {
      this.fb.displayError('Password Reset Successful');

    }, (error) => {
      this.fb.displayError(error.message);
    });
    this.dialogRef.close(true);
  }
}
