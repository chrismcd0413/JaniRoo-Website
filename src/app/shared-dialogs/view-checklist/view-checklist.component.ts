import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserInfo } from 'src/app/Shared Services/user-info.service';

@Component({
  selector: 'app-view-checklist',
  templateUrl: './view-checklist.component.html',
  styleUrls: ['./view-checklist.component.css']
})
export class ViewChecklistComponent implements OnInit, OnDestroy {
  accounts;
  users;
  subs = [];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<ViewChecklistComponent>,
    private userInfo: UserInfo
  ) { }

  ngOnInit(): void {
    this.subs.push(
      this.userInfo.accounts.subscribe(x => this.accounts = x)
    );
    this.subs.push(
      this.userInfo.coUsers.subscribe(x => this.users = x)
    );
  }
  ngOnDestroy(): void {
      this.subs.forEach(x => x.unsubscribe());
  }
  closeDialog(){
    this.dialogRef.close();
  }
}
