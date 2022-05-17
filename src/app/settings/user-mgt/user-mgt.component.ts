import { AfterViewInit, Component, EventEmitter, Inject, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { Account } from 'src/app/models/account.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/Shared Services/firestore.service';
import { NgForm } from '@angular/forms';
import { NewUserModalComponent } from 'src/app/modals/new-user/new-user.component';
import { UserInfo } from 'src/app/Shared Services/user-info.service';


@Component({
  selector: 'app-user-mgt',
  templateUrl: './user-mgt.component.html',
  styleUrls: ['./user-mgt.component.css']
})
export class UserMgtComponent implements OnInit, OnDestroy, AfterViewInit {
  displayedColumns = ['name', 'email', 'phone', 'role'];
  dataSource = new MatTableDataSource<any>();
  private subscriptions: Subscription[] = [];
  private _users: User[] = [];
  private accounts: Account[] = [];
  private locations: Location[] = [];
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Output() editing = new EventEmitter<boolean>(false);
  @Output() profile = new EventEmitter<any>();
  constructor(
    private fb: FirebaseService,
    private dialog: MatDialog,
    private userInfo: UserInfo
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.userInfo.coUsers
      .subscribe(u => {
        this._users = u.filter(x => x.active === true);
        this.refreshDataSource();
      })
    )
  }
  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
  refreshDataSource(){
    this.dataSource.data = this._users;
    console.log(this._users);
  }
  doFilter(value: string){
    this.dataSource.filter = value.trim().toLowerCase();
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(subs => subs.unsubscribe());
  }
  openNewUserPopup(): void {
    const dialogRef = this.dialog.open(NewUserModalComponent, {
      maxWidth: '90%',
      data: {
        editMode: false
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result.userCreated){
        this.editing.emit(true);
        this.profile.emit(result.profile)
      }
      console.log('New User Dialog Closed');
    });
  }
  openEditDialog(r){
    this.editing.emit(true);
    console.log('Row: ', r);
    this.profile.emit(r);
  }
}
