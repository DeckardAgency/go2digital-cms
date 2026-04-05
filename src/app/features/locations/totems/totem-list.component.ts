import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MenuItem, MessageService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';

import {
  DataTableWrapperComponent,
  DataTableCellDirective,
  DataTableHeaderActionsDirective,
  DataTableRowActionsDirective,
  DataTableFilterMenuDirective,
  DataTableColumn,
  DataTableState,
  FilterChip,
} from '../../../shared/components/data-table-wrapper';
import { LocationService, Totem, City } from '../../../core/services/location.service';

@Component({
  selector: 'app-totem-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TagModule,
    ButtonModule,
    SelectModule,
    DataTableWrapperComponent,
    DataTableCellDirective,
    DataTableHeaderActionsDirective,
    DataTableRowActionsDirective,
    DataTableFilterMenuDirective,
    MenuModule,
  ],
  template: `
    <app-data-table-wrapper
      title="Totems"
      [subtitle]="'Manage totems (' + totems().length + ' total)'"
      entityName="totems"
      [columns]="columns"
      [data]="totems()"
      [totalRecords]="totems().length"
      [loading]="locationService.isLoading()"
      [filterChips]="filterChips()"
      (stateChange)="onStateChange($event)"
      (rowClick)="onRowClick($event)"
      (filterChipRemove)="onFilterChipRemove($event)"
      (filtersClear)="onFiltersClear()"
      (refresh)="loadTotems()">

      <!-- Header Actions -->
      <ng-template dtHeaderActions>
        <p-button
          icon="pi pi-arrow-left"
          label="Back"
          severity="secondary"
          [text]="true"
          (onClick)="router.navigate(['/locations'])" />
      </ng-template>

      <!-- Filter Menu -->
      <ng-template dtFilterMenu>
        <div class="flex flex-wrap items-end gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">City</label>
            <p-select
              [options]="cityOptions()"
              [(ngModel)]="filterCity"
              optionLabel="label"
              optionValue="value"
              placeholder="All cities"
              [showClear]="true"
              class="w-48"
              (onChange)="applyFilters()" />
          </div>
        </div>
      </ng-template>

      <!-- Custom Cells -->
      <ng-template dtCell="name" let-row>
        <span class="font-medium text-surface-900 dark:text-surface-100">{{ row.name }}</span>
      </ng-template>

      <ng-template dtCell="cityName" let-row>
        {{ row.cityName }}
      </ng-template>

      <ng-template dtCell="totemType" let-row>
        @if (row.totemType) {
          <p-tag [value]="row.totemType" severity="info" />
        } @else {
          <span class="text-surface-400">--</span>
        }
      </ng-template>

      <ng-template dtCell="postbuyCategory" let-row>
        @if (row.postbuyCategory) {
          <p-tag [value]="row.postbuyCategory" severity="secondary" />
        } @else {
          <span class="text-surface-400">--</span>
        }
      </ng-template>

      <ng-template dtCell="reach" let-row>
        {{ row.reach | number }}
      </ng-template>

      <ng-template dtCell="isPublished" let-row>
        <p-tag
          [value]="row.isPublished ? 'Published' : 'Unpublished'"
          [severity]="row.isPublished ? 'success' : 'danger'" />
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
export class TotemListComponent implements OnInit {
  readonly locationService = inject(LocationService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  totems = signal<Totem[]>([]);
  cities = signal<City[]>([]);
  filterChips = signal<FilterChip[]>([]);
  cityOptions = signal<{ label: string; value: string }[]>([]);

  filterCity: string | null = null;
  currentRow: Totem | null = null;

  columns: DataTableColumn[] = [
    { key: 'name', label: 'Name', defaultVisible: true },
    { key: 'cityName', label: 'City', defaultVisible: true, width: '140px' },
    { key: 'totemType', label: 'Type', defaultVisible: true, width: '120px' },
    { key: 'postbuyCategory', label: 'Category', defaultVisible: true, width: '130px' },
    { key: 'reach', label: 'Reach', defaultVisible: true, width: '100px' },
    { key: 'isPublished', label: 'Status', defaultVisible: true, width: '120px' },
  ];

  ngOnInit(): void {
    this.loadCities();

    // Check for cityId query param
    const cityId = this.route.snapshot.queryParamMap.get('cityId');
    if (cityId) {
      this.filterCity = cityId;
    }

    this.loadTotems();
    this.updateFilterChips();
  }

  loadCities(): void {
    this.locationService.getCities().subscribe({
      next: (cities) => {
        this.cities.set(cities);
        this.cityOptions.set(
          cities.map(c => ({ label: c.name, value: c.id }))
        );
      },
    });
  }

  loadTotems(): void {
    this.locationService.getTotems(this.filterCity || undefined).subscribe({
      next: (totems) => this.totems.set(totems),
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load totems' });
      },
    });
  }

  onStateChange(state: DataTableState): void {
    this.loadTotems();
  }

  onRowClick(row: Totem): void {
    this.router.navigate(['/locations/totems', row.id]);
  }

  applyFilters(): void {
    this.updateFilterChips();
    this.loadTotems();
  }

  onFilterChipRemove(key: string): void {
    if (key === 'city') this.filterCity = null;
    this.updateFilterChips();
    this.loadTotems();
  }

  onFiltersClear(): void {
    this.filterCity = null;
    this.updateFilterChips();
    this.loadTotems();
  }

  setCurrentRow(row: Totem): void {
    this.currentRow = row;
  }

  getRowMenuItems(row: Totem): MenuItem[] {
    return [
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => this.router.navigate(['/locations/totems', row.id]),
      },
      {
        label: row.isPublished ? 'Unpublish' : 'Publish',
        icon: row.isPublished ? 'pi pi-eye-slash' : 'pi pi-eye',
        command: () => this.togglePublished(row),
      },
    ];
  }

  togglePublished(totem: Totem): void {
    this.locationService.updateTotem(totem.id, { isPublished: !totem.isPublished }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: `${totem.name} ${totem.isPublished ? 'unpublished' : 'published'}`,
        });
        this.loadTotems();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update totem' });
      },
    });
  }

  private updateFilterChips(): void {
    const chips: FilterChip[] = [];
    if (this.filterCity) {
      const city = this.cityOptions().find(c => c.value === this.filterCity);
      chips.push({ key: 'city', label: `City: ${city?.label || this.filterCity}` });
    }
    this.filterChips.set(chips);
  }
}
