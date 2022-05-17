import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/login/auth.guard';
import { InventoryDetailsComponent } from './inventory-details/inventory-details.component';
import { InventoryComponent } from './inventory.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: InventoryComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'details',
        component: InventoryDetailsComponent,
        canActivate: [AuthGuard]
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
