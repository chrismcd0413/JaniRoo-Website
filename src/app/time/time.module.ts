import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimeRoutingModule } from './time-routing.module';
import { MaterialModule } from '../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TimeComponent, NewEditTimesheetDialog } from './time.component';
import { PipesModule } from '../pipes/pipes.module';


@NgModule({
  declarations: [
    TimeComponent,
    NewEditTimesheetDialog,
  ],
  imports: [
    CommonModule,
    TimeRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    PipesModule
  ]
})
export class TimeModule { }
