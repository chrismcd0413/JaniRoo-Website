import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/login/auth.guard';
import { PendingChangesGuard } from '../Shared Services/unsaved-data.guard';
import { ChecklistDetailsComponent } from './checklist-details/checklist-details.component';
import { ChecklistComponent } from './checklist.component';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ChecklistComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'details',
        component: ChecklistDetailsComponent,
        canActivate: [AuthGuard],
        canDeactivate: [PendingChangesGuard]
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChecklistRoutingModule { }
