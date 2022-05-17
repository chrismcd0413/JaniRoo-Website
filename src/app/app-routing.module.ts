import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/login/auth.guard';
import { LoginComponent } from './auth/login/login.component';

import { PendingChangesGuard } from './Shared Services/unsaved-data.guard';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full'},
  { path: 'settings', loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule)},
  { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
  { path: 'login', component: LoginComponent },
  {
    path: 'schedules', loadChildren: () => import('./schedules/schedules.module').then(m => m.SchedulesModule)  },
  {
    path: 'checklists',
    loadChildren: () => import('./checklist/checklist.module').then(m => m.ChecklistModule)
  },
  {
    path: 'inventory',
    loadChildren: () => import('./inventory/inventory.module').then(m => m.InventoryModule)
  },
  {
    path: 'timesheets',
    loadChildren: () => import('./time/time.module').then(m => m.TimeModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard, PendingChangesGuard],
})
export class AppRoutingModule {}
