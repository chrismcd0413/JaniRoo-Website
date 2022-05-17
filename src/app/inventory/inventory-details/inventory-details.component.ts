import {
  AfterViewInit,
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Account } from 'src/app/models/account.model';
import { CacheService } from 'src/app/Shared Services/cache.service';
import { FirebaseService } from 'src/app/Shared Services/firestore.service';
import { ComponentCanDeactivate } from 'src/app/Shared Services/unsaved-data.guard';
import { UserInfo } from 'src/app/Shared Services/user-info.service';
import { Timestamp } from '@firebase/firestore';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-inventory-details',
  templateUrl: './inventory-details.component.html',
  styleUrls: ['./inventory-details.component.css'],
})
export class InventoryDetailsComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  inventory: any[] = [];
  currentLocation;
  displayedColumns = ['name', 'type', 'status', 'current', 'last'];
  dataSource = new MatTableDataSource<any>();
  noChangesToSave = true;
  firstRun = true;
  accounts = [];
  private subscriptions: Subscription[] = [];
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatTable) table: MatTable<any>;
  constructor(
    private route: ActivatedRoute,
    private userInfo: UserInfo,
    private cacheService: CacheService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.userInfo.accounts.subscribe(x => this.accounts = x)
    );
    this.subscriptions.push(
      this.route.queryParams.subscribe((x) => {
        const formatted = { acct: x.acct, loc: +x.loc };
        this.currentLocation = formatted;

        this.subscriptions.push(
          this.userInfo.accounts.subscribe((x) => {
            const account = x.find((a) => a.id === this.currentLocation.acct);
            const location = account.locations.find(
              (l) => l.id === +this.currentLocation.loc
            );
            this.currentLocation.name = account.name + ' - ' + location.name;
            this.currentLocation.tzId = location.address.tzId;
          })
        );
      })
    );

    this.subscriptions.push(
      this.cacheService.inventoryItems.subscribe((x) => {
        console.log('Array: ', x);
        const temp = x.find(
          (inv) =>
          inv.location.acct === this.currentLocation.acct &&
          inv.location.loc === this.currentLocation.loc
          );
          this.inventory = temp.items;
          console.log('All Items: ', this.inventory);
        this.refreshTable();
      })
    );
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
  }
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  refreshTable() {
    this.dataSource.data = this.inventory;
    if (!this.firstRun) {
      this.table.renderRows();
    }
    this.firstRun = false;
  }
  openEditDialog(row) {
    const popup = this.dialog.open(NewEditInventoryDialog, {
      data: {
        editMode: true,
        item: row,
      },
      disableClose: true,
    });
  }
  goBack() {
    this.router.navigate(['inventory']);
  }
  addNewInventoryItem() {
    const popup = this.dialog.open(NewEditInventoryDialog, {
      data: {
        editMode: false,
        location: {acct: this.currentLocation.acct, loc: +this.currentLocation.loc}
      },
      disableClose: true,
    });
  }
  formatDate(ts) {
    return moment(ts.toMillis()).format('M/D/YY h:mm a');
  }
}
@Component({
  templateUrl: './new-edit-inventory.html',
  styleUrls: ['./inventory-details.component.css'],
})
export class NewEditInventoryDialog implements OnInit {
  form: FormGroup;
  title;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<NewEditInventoryDialog>,
    private fb: FirebaseService
  ) {}
  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl('', {
        validators: [Validators.required],
      }),
      type: new FormControl('', {
        validators: [Validators.required],
      }),
      current: new FormControl('', {
        validators: [Validators.required],
      }),
      minimum: new FormControl('', {
        validators: [Validators.required],
      }),
    });
    if (this.data.editMode) {
      this.title = 'Edit';
      const item = this.data.item;
      this.form.setValue({
        name: item.name,
        type: item.type,
        current: item.current,
        minimum: item.minimum,
      });
    } else {
      this.title = 'New';
    }
  }
  save() {
    const newItem = this.form.value;
    const data = this.data;
    if (data.editMode) {
      if(this.form.dirty){
        const item = this.data.item;
        item.name = newItem.name;
        item.type = newItem.type;
        item.current = newItem.current;
        item.minimum = newItem.minimum;
        item.last_update = Timestamp.fromDate(new Date());
        item.low_inventory = newItem.current <= newItem.minimum ? true : false;
        this.fb.editInventoryItem(item).then(q => this.dialogRef.close());
      } else {
        this.dialogRef.close();
      }
    } else {
      const item = {
        name: newItem.name,
        type: newItem.type,
        current: newItem.current,
        minimum: newItem.minimum,
        low_inventory: newItem.current <= newItem.minimum ? true : false,
        companyId: this.fb.companyId,
        last_update: Timestamp.fromDate(new Date()),
        location: data.location
      };
      this.fb.addNewInventoryItem(item).then(q => this.dialogRef.close());
    }
  }
  cancel() {
    this.dialogRef.close();
  }
  delete() {
    this.fb.deleteInventoryItem(this.data.item).then(q => this.dialogRef.close());
  }
}
