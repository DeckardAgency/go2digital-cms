import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { MenuItem, MessageService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';

import {
  DataTableWrapperComponent,
  DataTableCellDirective,
  DataTableHeaderActionsDirective,
  DataTableRowActionsDirective,
  DataTableColumn,
  DataTableState,
} from '../../../shared/components/data-table-wrapper';
import { LocationService, City } from '../../../core/services/location.service';

@Component({
  selector: 'app-city-list',
  standalone: true,
  imports: [
    CommonModule,
    TagModule,
    ButtonModule,
    DataTableWrapperComponent,
    DataTableCellDirective,
    DataTableHeaderActionsDirective,
    DataTableRowActionsDirective,
    MenuModule,
  ],
  template: `
    <app-data-table-wrapper
      title="Cities"
      subtitle="Manage city visibility and order"
      entityName="cities"
      [columns]="columns"
      [data]="cities()"
      [totalRecords]="cities().length"
      [loading]="locationService.isLoading()"
      (stateChange)="onStateChange($event)"
      (refresh)="loadCities()">

      <!-- Header Actions -->
      <ng-template dtHeaderActions>
        <p-button
          icon="pi pi-arrow-left"
          label="Back"
          severity="secondary"
          [text]="true"
          (onClick)="router.navigate(['/locations'])" />
      </ng-template>

      <!-- Custom Cells -->
      <ng-template dtCell="name" let-row>
        <span class="font-medium text-surface-900 dark:text-surface-100">{{ row.name }}</span>
      </ng-template>

      <ng-template dtCell="totemCount" let-row>
        {{ row.totemCount }}
      </ng-template>

      <ng-template dtCell="sortOrder" let-row>
        {{ row.sortOrder }}
      </ng-template>

      <ng-template dtCell="isActive" let-row>
        <p-tag
          [value]="row.isActive ? 'Active' : 'Inactive'"
          [severity]="row.isActive ? 'success' : 'danger'" />
      </ng-template>

      <ng-template dtCell="lastSyncedAt" let-row>
        @if (row.lastSyncedAt) {
          {{ row.lastSyncedAt | date:'dd.MM.yyyy HH:mm' }}
        } @else {
          <span class="text-surface-400">--</span>
        }
      </ng-template>

      <!-- Row Actions -->
      <ng-template dtRowActions let-row>
        <p-button
          icon="pi pi-ellipsis-v"
          [text]="true"
          [rounded]="true"
          severity="secondary"
          (onClick)="setCurrentRow(row); rowMenu.toggle($event)" />
        <p-menu #rowMenu [model]="getRowMenuItems(row)" [popup]="true" appendTo="body" />
      </ng-template>
    </app-data-table-wrapper>
  `,
})
export class CityListComponent implements OnInit {
  readonly locationService = inject(LocationService);
  readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  cities = signal<City[]>([]);
  currentRow: City | null = null;

  columns: DataTableColumn[] = [
    { key: 'name', label: 'Name', defaultVisible: true },
    { key: 'totemCount', label: 'Totems', defaultVisible: true, width: '100px' },
    { key: 'sortOrder', label: 'Sort Order', defaultVisible: true, width: '120px' },
    { key: 'isActive', label: 'Status', defaultVisible: true, width: '110px' },
    { key: 'lastSyncedAt', label: 'Last Synced', defaultVisible: true, width: '160px' },
  ];

  ngOnInit(): void {
    this.loadCities();
  }

  loadCities(): void {
    this.locationService.getCities().subscribe({
      next: (cities) => this.cities.set(cities),
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load cities' });
      },
    });
  }

  onStateChange(state: DataTableState): void {
    this.loadCities();
  }

  setCurrentRow(row: City): void {
    this.currentRow = row;
  }

  getRowMenuItems(row: City): MenuItem[] {
    return [
      {
        label: row.isActive ? 'Deactivate' : 'Activate',
        icon: row.isActive ? 'pi pi-eye-slash' : 'pi pi-eye',
        command: () => this.toggleActive(row),
      },
      {
        label: 'View Totems',
        icon: 'pi pi-map',
        command: () => this.router.navigate(['/locations/totems'], { queryParams: { cityId: row.id } }),
      },
    ];
  }

  toggleActive(city: City): void {
    this.locationService.updateCity(city.id, { isActive: !city.isActive }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: `${city.name} ${city.isActive ? 'deactivated' : 'activated'}`,
        });
        this.loadCities();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update city' });
      },
    });
  }
}
