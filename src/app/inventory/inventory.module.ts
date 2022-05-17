import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryRoutingModule } from './inventory-routing.module';
import { MaterialModule } from '../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { InventoryComponent } from './inventory.component';
import { InventoryDetailsComponent, NewEditInventoryDialog } from './inventory-details/inventory-details.component';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  declarations: [
    InventoryComponent,
    InventoryDetailsComponent,
    NewEditInventoryDialog,
  ],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    PipesModule
  ]
})
export class InventoryModule { }
