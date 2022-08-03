import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/login/auth.guard';
import { ChecklistViewerComponent } from './checklist-viewer.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ChecklistViewerComponent,
        canActivate: [AuthGuard],
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChecklistViewerRoutingModule { }
