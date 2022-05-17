import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment-timezone';
import { Subscription } from 'rxjs';
import { Account } from '../models/account.model';
import { CacheService } from '../Shared Services/cache.service';
import { UserInfo } from '../Shared Services/user-info.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css'],
})
export class InventoryComponent implements OnInit, OnDestroy, AfterViewInit {
  accounts: Account[];
  locations: any[];
  inventory: any[] = [];
  displayedColumns = ['location', 'status', 'total', 'last'];
  dataSource = new MatTableDataSource<any>();
  private subscriptions: Subscription[] = [];
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatTable) table: MatTable<any>;
  private finishedLoading = false;
  constructor(
    private userInfo: UserInfo,
    private cacheService: CacheService,
    private router: Router,
    private route: ActivatedRoute
    ) {}

  ngOnInit(): void {

    this.subscriptions.push(
      this.userInfo.accounts.subscribe((a) => {
        let formattedLocations = [];
        console.log('Accounts: ', a);
        a.forEach((account) => {
          account.locations.forEach((location) => {
            const loc = {
              name: account.name + ' - ' + location.name,
              id: { acct: account.id, loc: location.id },
              last_snapshot: location.last_snapshot
                ? moment(location.last_snapshot.toMillis())
                    .tz(location.address.tzId)
                    .format('MM/DD/YY h:mm a')
                : 'N/A',
            };
            formattedLocations.push(loc);
          });
        });
        this.locations = formattedLocations;

        this.subscriptions.push(
          this.cacheService.inventoryItems.subscribe((ii) => {
            this.inventory = ii;
            this.refreshTable();
            this.finishedLoading = true;
          })
        );
      })
    );

  }
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
  }
  refreshTable() {
    this.dataSource.data = this.locations;
    // this.table.renderRows();
  }
  getNumberOfInventoryItems(ids) {
    if (this.inventory !== null) {
      const loc = this.inventory.findIndex(
        (x) => x.location.acct === ids.acct && x.location.loc === ids.loc
      );
      if (loc != -1) {
        return this.inventory[loc].items.length;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }
  getLocationStatus(ids) {
    if (this.inventory !== null) {
      const loc = this.inventory.findIndex(
        (x) => x.location.acct === ids.acct && x.location.loc === ids.loc
      );
      if (loc !== -1) {
        const isLow = this.inventory[loc].items.findIndex(
          (x) => x.low_inventory === true
        );
        if (isLow != -1) {
          return 'Low Inventory';
        } else {
          return 'Ok!';
        }
        } else {
          return 'Ok!';
        }
      }
     else {
      return 'Ok!';
    }
  }
  getLastUpdate(ids) {
    if (this.inventory !== null) {
      const loc = this.inventory.findIndex(
        (x) => x.location.acct === ids.acct && x.location.loc === ids.loc
      );
      if (loc !== -1) {
        return moment(this.inventory[loc].items[0].last_update.toMillis()).format('M/D/YY h:mm a');
      } else {
        return 'N/A';
      }
    } else {
      return 'N/A';
    }
  }
  openEditDialog(row) {
    this.router.navigate(['details'], {relativeTo: this.route, queryParams: {acct: row.id.acct, loc: row.id.loc}});
  }
}
