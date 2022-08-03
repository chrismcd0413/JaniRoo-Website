import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChecklistViewerComponent } from './checklist-viewer.component';
import { ChecklistViewerRoutingModule } from './checklist-viewer-routing.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '../material.module';
import { PipesModule } from '../pipes/pipes.module';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    ChecklistViewerComponent
  ],
  imports: [
    CommonModule,
    ChecklistViewerRoutingModule,
    MaterialModule,
    FlexLayoutModule,
    PipesModule,
    ReactiveFormsModule
  ]
})
export class ChecklistViewerModule { }
