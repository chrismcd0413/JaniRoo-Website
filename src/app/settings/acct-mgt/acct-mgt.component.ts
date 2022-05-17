import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { UserInfo } from 'src/app/Shared Services/user-info.service';

@Component({
  selector: 'app-acct-mgt',
  templateUrl: './acct-mgt.component.html',
  styleUrls: ['./acct-mgt.component.css']
})
export class AcctMgtComponent implements OnInit, OnDestroy, AfterViewInit {
  displayedColumns = ['name', 'email', 'phone'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;

  private subscriptions: Subscription[] = [];
  private accounts = [];
  @ViewChild(MatSort) sort: MatSort;
  @Output() editing = new EventEmitter<boolean>(false);
  @Output() account = new EventEmitter<any>();
  constructor(
    private coInfo: UserInfo,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.coInfo.accounts
      .subscribe(a => {
        this.accounts = a;
        this.refreshDataSource();
      })
    )
  }
  ngOnDestroy(): void {
      this.subscriptions.forEach(s => s.unsubscribe());
  }
  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
  refreshDataSource(){
    this.dataSource.data = this.accounts;
  }
  doFilter(v){
    this.dataSource.filter = v.trim().toLowerCase();
  }
  openEditDialog(r){
    this.editing.emit(true);
    console.log('Row: ', r);
    this.account.emit(r);
  }
  formatLocations(names){
    let strings = [];
    const active = names.filter(a => a.active);
    active.forEach(n => strings.push(n.name));
    const stringsF = strings.join(', ');
    return stringsF;
  }
  saveAccountData(){
    // const acct = {
    //   companyId,
    //   details: {
    //     address: {
    //       address1,
    //       address2,
    //       city,
    //       state,
    //       zip,
    //       formatted_address
    //     },
    //     email,
    //     name,
    //     notes,
    //     phone
    //   },
    //   locations,
    //   name
    // }
  }
}
