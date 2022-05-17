import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { UserMgtComponent } from './user-mgt/user-mgt.component';
import { AcctMgtComponent } from './acct-mgt/acct-mgt.component';
import { CoSettingsComponent } from './co-settings/co-settings.component';
import { NewUserModalComponent } from '../modals/new-user/new-user.component';
import { SettingsRoutingModule } from './settings-routing.module';
import { MaterialModule } from '../material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { EditUserComponent, NewEditLocation, ConfirmBackUserProfile, ResetPasswordDialog } from './user-mgt/edit-user/edit-user.component';
import { ConfirmGoBackDialog, EditAcctComponent } from './acct-mgt/edit-acct/edit-acct.component';
import { NewAcctComponent } from './acct-mgt/new-acct/new-acct.component';
import { EditLocComponent } from './acct-mgt/edit-acct/edit-loc/edit-loc.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [
    SettingsComponent,
    UserMgtComponent,
    AcctMgtComponent,
    CoSettingsComponent,
    NewUserModalComponent,
    EditUserComponent,
    NewEditLocation,
    ConfirmBackUserProfile,
    ResetPasswordDialog,
    EditAcctComponent,
    NewAcctComponent,
    EditLocComponent,
    ConfirmGoBackDialog,
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    GoogleMapsModule,
    FlexLayoutModule
  ]
})
export class SettingsModule { }
