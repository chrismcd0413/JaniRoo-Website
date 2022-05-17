import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { MaterialModule } from '../material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ViewChecklistComponent } from '../shared-dialogs/view-checklist/view-checklist.component'; // a plugin!
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  declarations: [
    DashboardComponent,
    ViewChecklistComponent,

  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MaterialModule,
    FlexLayoutModule,
    PipesModule
  ]
})
export class DashboardModule { }
