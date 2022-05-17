import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  profile;
  account;
  editingUser = false;
  editingAccount = false;
  constructor() { }

  ngOnInit(): void {
  }
  setEditing(e){
    this.editingUser = e;
  }
  setEditingAccount(e){
    this.editingAccount = e;
  }
  setProfile(e){
    console.log('Passed Profile', e);
    this.profile = e;
  }
  setAccount(e){
    this.account = e;
  }
}
