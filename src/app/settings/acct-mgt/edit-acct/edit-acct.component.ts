import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { FirebaseService } from 'src/app/Shared Services/firestore.service';
import { EditLocComponent } from './edit-loc/edit-loc.component';

@Component({
  selector: 'app-edit-acct',
  templateUrl: './edit-acct.component.html',
  styleUrls: ['./edit-acct.component.css']
})
export class EditAcctComponent implements OnInit, OnDestroy {
  @Input() account: any;
  @Output() editing = new EventEmitter<boolean>();
  @Output() setAccount = new EventEmitter<any>();
  @ViewChild(MatSort) sort: MatSort;
  detailsForm: FormGroup;
  dataSource = new MatTableDataSource<any>();
  displayedColumns = ['name', 'address', 'geo'];
  locationsEdited = false;
  showArchivedLocations = false;
  @ViewChild(MatTable) table: MatTable<any>;
  constructor(
    private dialog: MatDialog,
    private fb: FirebaseService
  ) { }

  ngOnInit(): void {
    console.log('Account: ', this.account);
    this.detailsForm = new FormGroup({
      aname: new FormControl(this.account.name,{
        validators: [Validators.required]
      }),
      cemail: new FormControl(this.account.details.email,{
        validators: [ Validators.email]
      }),
      cname: new FormControl(this.account.details.name,{
        validators: []
      }),
      cphone: new FormControl(this.account.details.phone,{
        validators: []
      }),
      notes: new FormControl(this.account.details.notes,{
        validators: []
      }),
      a1: new FormControl(this.account.details.address.address1,{
        validators: []
      }),
      a2: new FormControl(this.account.details.address.address2,{
        validators: []
      }),
      city: new FormControl(this.account.details.address.city,{
        validators: []
      }),
      state: new FormControl(this.account.details.address.state,{
        validators: []
      }),
      zip: new FormControl(this.account.details.address.zip,{
        validators: []
      }),
    });
    this.refreshDataSource();
  }
  ngOnDestroy(): void {
      this.account = null;
  }
  goBack(){
    console.log('Form untouched: ', this.detailsForm.untouched);
    console.log('Locations Edited: ', this.locationsEdited);
    if(this.detailsForm.touched || this.locationsEdited){
      const dialogRef = this.dialog.open(ConfirmGoBackDialog);
      dialogRef.afterClosed().subscribe(result => {
        if (result){
          this.saveAccountData();
        } else {
          this.locationsEdited = false;
          this.detailsForm.markAsUntouched();
          this.goBack();
        }
      })
    } else {
      this.editing.emit(false);
      this.setAccount.emit(null);
    }

  }
  openNewLocation(){
    const dialogRef = this.dialog.open(EditLocComponent, {
      maxWidth: '500px',
      data: {
        editMode: false,
        location: {},
        id: this.account.locations.length + 1
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('New Location Submitted: ', result);
      if(!result.editMode && result.changeToSave){
        this.locationsEdited = true;
        console.log(result);
        this.account.locations.push({
          active: result.active,
          geo_enabled: result.data.geo_enabled,
          geo_radius: result.data.geo_radius,
          name: result.data.name,
          address: {
            formatted_address: result.data.formatted_address,
            address2: result.data.a2,
            geo: result.data.latlng,
            notes: result.data.notes,
            tzId: result.data.tzId
          },
          id: result.id
        });
        this.refreshDataSource();
        this.table.renderRows();

      }
    });
  }
  openEditLocation(r, bool, i){
    const dialogRef = this.dialog.open(EditLocComponent, {
      maxWidth: '500px',
      data: {
        editMode: true,
        location: r,
        id: r.id
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result.changeToSave){
        const index = this.account.locations.findIndex((loc => loc.id === result.id));
        this.locationsEdited = true;
        console.log(result);
        this.account.locations[index] = {
          active: result.active,
          geo_enabled: result.data.geo_enabled,
          geo_radius: result.data.geo_radius,
          name: result.data.name,
          address: {
            formatted_address: result.data.formatted_address,
            address2: result.data.a2,
            geo: result.data.latlng,
            notes: result.data.notes,
            tzId: result.data.tzId
          },
          id: result.id
        };

      }
      this.refreshDataSource();
      this.table.renderRows();

    });
  }
  refreshDataSource(){
    if (this.showArchivedLocations){
      const active = this.account.locations.filter(l => l.active === true);
      const accts = active.concat(this.account.locations.filter(l => l.active === false));
      this.dataSource = accts;
    } else {
      this.dataSource = this.account.locations.filter(l => l.active === true);
    }
  }
  saveAccountData(){
    if(this.detailsForm.untouched && !this.locationsEdited){
      this.goBack();
    } else {
      const acct = {
        companyId: this.account.companyId,
        details: {
          address: {
            address1: this.detailsForm.value.a1,
            address2: this.detailsForm.value.a2,
            city: this.detailsForm.value.city,
            state: this.detailsForm.value.state,
            zip: this.detailsForm.value.zip,
            formatted_address: this.detailsForm.value.a1 + ' ' + this.detailsForm.value.a2 + ' ' + this.detailsForm.value.city + ', ' + this.detailsForm.value.state + ' ' + this.detailsForm.value.zip
          },
          email: this.detailsForm.value.cemail,
          name: this.detailsForm.value.cname,
          notes: this.detailsForm.value.notes,
          phone: this.detailsForm.value.cphone
        },
        locations: this.account.locations,
        name: this.detailsForm.value.aname
      }
      console.log('Saved Account: ', acct);
      this.fb.setAccountDoc(this.account.id, acct).then(() => {
        this.locationsEdited = false;
        this.detailsForm.markAsUntouched();
        this.goBack()
      }).catch(error => this.fb.displayError(error.message));
    }

  }
  setShowArchivedLocations(b){
    this.showArchivedLocations = b.checked;
    this.refreshDataSource();
  }
}
@Component({
  selector: 'app-confirm-go-back',
  templateUrl: 'confirm-go-back.html',
})
export class ConfirmGoBackDialog {
  constructor(
    private dialog: MatDialogRef<ConfirmGoBackDialog>
  ){

  }
  closeAndSave(){
    this.dialog.close(true);
  }
  closeAndCancel(){
    this.dialog.close(false);
  }
}
