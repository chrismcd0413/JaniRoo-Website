import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChecklistRoutingModule } from './checklist-routing.module';
import { ChecklistComponent, NewChecklistDialog } from './checklist.component';
import { ChecklistDetailsComponent, NewEditChecklistTasks, EditChecklistDetails, CopyTasksFromExistingChecklist } from './checklist-details/checklist-details.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  declarations: [
    ChecklistComponent,
    NewChecklistDialog,
    ChecklistDetailsComponent,
    NewEditChecklistTasks,
    EditChecklistDetails,
    CopyTasksFromExistingChecklist,
  ],
  imports: [
    CommonModule,
    ChecklistRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FlexLayoutModule,
    PipesModule
  ]
})
export class ChecklistModule { }
