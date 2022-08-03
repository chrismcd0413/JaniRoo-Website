import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource, MatTable } from "@angular/material/table";
import * as moment from "moment";
import { Subscription } from "rxjs";
import { FirebaseService } from "../Shared Services/firestore.service";
import { UserInfo } from "../Shared Services/user-info.service";
import { ViewChecklistComponent } from "../shared-dialogs/view-checklist/view-checklist.component";

@Component({
  selector: "app-checklist-viewer",
  templateUrl: "./checklist-viewer.component.html",
  styleUrls: ["./checklist-viewer.component.css"],
})
export class ChecklistViewerComponent implements OnInit, OnDestroy {
  accounts;
  users;
  checklists;
  searchForm: FormGroup;
  displayedColumns = ["name", "location", "user", "progress"];
  dataSource = new MatTableDataSource<any>();
  private subscriptions: Subscription[] = [];
  private querySub: Subscription;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatTable) table: MatTable<any>;
  constructor(private fb: FirebaseService, private userInfo: UserInfo, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.searchForm = new FormGroup({
      location: new FormControl(false, {
        validators: [],
      }),
      start: new FormControl(
        moment().subtract(14, "days").startOf("day").toDate(),
        {
          validators: [Validators.required],
        }
      ),
      end: new FormControl(moment().startOf("day").toDate(), {
        validators: [Validators.required],
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
      this.searchForm.controls['location'].valueChanges.subscribe(value => {
        if (!value) {
          this.dataSource.filter = null;
        } else {
          const filterString = value.acct + value.loc.toString();
          this.dataSource.filter = filterString;
        }
      })
    );
    this.subscriptions.push(this.userInfo.accounts.subscribe(a => this.accounts = a));
    this.subscriptions.push(this.userInfo.coUsers.subscribe(u => this.users = u));

    const endQ = this.fb.generateQueryDateLocal(this.searchForm.value.end);
    const startQ = this.fb.generateQueryDateLocal(this.searchForm.value.start);
    this.setQuery(startQ, endQ);
    this.dataSource.filterPredicate = (data, filter) => {
      const dataStr = data.location.acct + data.location.loc;
      console.log('DATA STRING: ', dataStr);
      return dataStr.indexOf(filter) != -1;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(x => x.unsubscribe());
    this.querySub.unsubscribe();
  }
  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
}
openViewDialog(checklist) {
  this.dialog.open(ViewChecklistComponent, {
    data: checklist,
    autoFocus: false
  });
}
  updateDatesValidity(){
    this.searchForm.get('start').updateValueAndValidity({ emitEvent: false });
    this.searchForm.get('end').updateValueAndValidity({ emitEvent: false });
  }
  setQuery(start, end) {
    if (this.querySub) {
      this.querySub.unsubscribe();
    }
    this.querySub = this.fb.fetchActiveChecklistsForViewer(start, end).subscribe(activeChecklists => {
      this.checklists = activeChecklists;
      this.dataSource.data = this.checklists;
      this.table.renderRows();
      console.log('DATA SOURCE: ', this.dataSource.data);
    })
  }
  datesValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const start = moment(
        this.searchForm.controls["start"].value.toISOString()
      );
      const end = moment(this.searchForm.controls["end"].value.toISOString());
      if (end.isBefore(start)) {
        return { invalidDates: { value: control.value } };
      } else {
        return null;
      }
    };
  }
}
