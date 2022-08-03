import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationNamePipe } from './location-name.pipe';
import { GetUserNamePipe } from './get-user-name.pipe';
import { FormatDateTZPipe } from './format-date-tz.pipe';
import { ChecklistProgressPipe } from './checklist-progress.pipe';
import { ActiveLocationsPipe } from './active-locations.pipe';


@NgModule({
  declarations: [
    LocationNamePipe,
    GetUserNamePipe,
    FormatDateTZPipe,
    ChecklistProgressPipe,
    ActiveLocationsPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    LocationNamePipe,
    GetUserNamePipe,
    FormatDateTZPipe,
    ChecklistProgressPipe,
    ActiveLocationsPipe
  ]
})
export class PipesModule { }
