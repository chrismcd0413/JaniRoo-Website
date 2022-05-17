import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SchedulesRoutingModule } from './schedules-routing.module';
import { MaterialModule } from '../material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import momentTimezonePlugin from '@fullcalendar/moment-timezone';
import { SchedulesComponent, NewEditSchedulesDialog, ConfirmChangesDialog } from './schedules.component';

FullCalendarModule.registerPlugins([
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  momentTimezonePlugin
]);

@NgModule({
  declarations: [
    SchedulesComponent,
    NewEditSchedulesDialog,
    ConfirmChangesDialog,
  ],
  imports: [
    CommonModule,
    SchedulesRoutingModule,
    MaterialModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    FullCalendarModule,
    FormsModule
  ]
})
export class SchedulesModule { }
