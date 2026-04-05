import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
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
    CommonModule, FormsModule, TagModule, ButtonModule, SelectModule,
    TableModule, DataTableWrapperComponent, DataTableCellDirective,
    DataTableHeaderActionsDirective, DataTableRowActionsDirective,
    DataTableFilterMenuDirective, MenuModule,
  ],
  template: `
    <!-- Normal mode -->
    @if (!reorderMode()) {
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

        <ng-template dtHeaderActions>
          <p-button icon="pi pi-arrow-left" label="Back" severity="secondary" [text]="true" (onClick)="router.navigate(['/locations'])" />
          <p-button icon="pi pi-sort-alt" label="Reorder" severity="secondary" [outlined]="true" (onClick)="enterReorderMode()" />
        </ng-template>

        <ng-template dtFilterMenu>
          <div class="flex flex-wrap items-end gap-4">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-surface-700 dark:text-surface-300">City</label>
              <p-select [options]="cityOptions()" [(ngModel)]="filterCity" optionLabel="label" optionValue="value" placeholder="All cities" [showClear]="true" class="w-48" (onChange)="applyFilters()" />
            </div>
          </div>
        </ng-template>

        <ng-template dtCell="name" let-row>
          <span class="font-medium text-surface-900 dark:text-surface-100">{{ row.name }}</span>
        </ng-template>
        <ng-template dtCell="cityName" let-row>{{ row.cityName }}</ng-template>
        <ng-template dtCell="totemType" let-row>
          @if (row.totemType) { <p-tag [value]="row.totemType" severity="info" /> } @else { <span class="text-surface-400">--</span> }
        </ng-template>
        <ng-template dtCell="postbuyCategory" let-row>
          @if (row.postbuyCategory) { <p-tag [value]="row.postbuyCategory" severity="secondary" /> } @else { <span class="text-surface-400">--</span> }
        </ng-template>
        <ng-template dtCell="reach" let-row>{{ row.reach | number }}</ng-template>
        <ng-template dtCell="isPublished" let-row>
          <p-tag [value]="row.isPublished ? 'Published' : 'Unpublished'" [severity]="row.isPublished ? 'success' : 'danger'" />
        </ng-template>

        <ng-template dtRowActions let-row>
          <p-button icon="pi pi-ellipsis-v" [text]="true" [rounded]="true" severity="secondary" (onClick)="setCurrentRow(row); rowMenu.toggle($event)" />
          <p-menu #rowMenu [model]="getRowMenuItems(row)" [popup]="true" appendTo="body" />
        </ng-template>
      </app-data-table-wrapper>
    }

    <!-- Reorder mode -->
    @if (reorderMode()) {
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Reorder Totems</h1>
            <p class="text-surface-500 dark:text-surface-400 mt-1">Drag rows to change order, then save</p>
          </div>
          <div class="flex items-center gap-2">
            <p-button label="Cancel" severity="secondary" [outlined]="true" (onClick)="exitReorderMode()" />
            <p-button label="Save Order" icon="pi pi-save" [loading]="savingOrder()" (onClick)="saveOrder()" />
          </div>
        </div>

        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
          <p-table [value]="reorderList()" [reorderableColumns]="false" styleClass="p-datatable-sm"
            (onRowReorder)="onRowReorder()">
            <ng-template pTemplate="header">
              <tr>
                <th style="width: 3rem"></th>
                <th style="width: 3rem">#</th>
                <th>Name</th>
                <th>City</th>
                <th style="width: 100px">Type</th>
                <th style="width: 100px">Status</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-row let-index="rowIndex">
              <tr [pReorderableRow]="index">
                <td>
                  <span class="pi pi-bars cursor-grab text-surface-400" pReorderableRowHandle></span>
                </td>
                <td>
                  <span class="text-xs font-bold text-surface-400">{{ index + 1 }}</span>
                </td>
                <td>
                  <span class="font-medium text-surface-900 dark:text-surface-0">{{ row.name }}</span>
                </td>
                <td>
                  <span class="text-surface-600 dark:text-surface-400">{{ row.cityName }}</span>
                </td>
                <td>
                  @if (row.totemType) { <p-tag [value]="row.totemType" severity="info" /> } @else { <span class="text-surface-400">--</span> }
                </td>
                <td>
                  <p-tag [value]="row.isPublished ? 'Published' : 'Draft'" [severity]="row.isPublished ? 'success' : 'danger'" />
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>
    }
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

  // Reorder
  reorderMode = signal(false);
  reorderList = signal<Totem[]>([]);
  savingOrder = signal(false);

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
    const cityId = this.route.snapshot.queryParamMap.get('cityId');
    if (cityId) this.filterCity = cityId;
    this.loadTotems();
    this.updateFilterChips();
  }

  loadCities(): void {
    this.locationService.getCities().subscribe({
      next: (cities) => {
        this.cities.set(cities);
        this.cityOptions.set(cities.map(c => ({ label: c.name, value: c.id })));
      },
    });
  }

  loadTotems(): void {
    this.locationService.getTotems(this.filterCity || undefined).subscribe({
      next: (totems) => this.totems.set(totems),
      error: () => this.messageService.add({ severity: 'error', summary: 'Failed to load totems' }),
    });
  }

  onStateChange(state: DataTableState): void { this.loadTotems(); }
  onRowClick(row: Totem): void { this.router.navigate(['/locations/totems', row.id]); }

  applyFilters(): void { this.updateFilterChips(); this.loadTotems(); }
  onFilterChipRemove(key: string): void { if (key === 'city') this.filterCity = null; this.updateFilterChips(); this.loadTotems(); }
  onFiltersClear(): void { this.filterCity = null; this.updateFilterChips(); this.loadTotems(); }

  setCurrentRow(row: Totem): void { this.currentRow = row; }

  getRowMenuItems(row: Totem): MenuItem[] {
    return [
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.router.navigate(['/locations/totems', row.id]) },
      { label: row.isPublished ? 'Unpublish' : 'Publish', icon: row.isPublished ? 'pi pi-eye-slash' : 'pi pi-eye', command: () => this.togglePublished(row) },
    ];
  }

  togglePublished(totem: Totem): void {
    this.locationService.updateTotem(totem.id, { isPublished: !totem.isPublished }).subscribe({
      next: () => { this.messageService.add({ severity: 'success', summary: `${totem.name} ${totem.isPublished ? 'unpublished' : 'published'}` }); this.loadTotems(); },
      error: () => this.messageService.add({ severity: 'error', summary: 'Failed to update totem' }),
    });
  }

  // ─── Reorder ───────────────────────────────────────────

  enterReorderMode(): void {
    this.reorderList.set([...this.totems()]);
    this.reorderMode.set(true);
  }

  exitReorderMode(): void {
    this.reorderMode.set(false);
  }

  onRowReorder(): void {
    // PrimeNG already reordered the array in-place
  }

  saveOrder(): void {
    const updates = this.reorderList().map((t, i) => ({ id: t.id, sortOrder: i + 1 }));
    this.savingOrder.set(true);
    let completed = 0;

    for (const update of updates) {
      this.locationService.updateTotem(update.id, { sortOrder: update.sortOrder }).subscribe({
        next: () => {
          completed++;
          if (completed === updates.length) {
            this.savingOrder.set(false);
            this.messageService.add({ severity: 'success', summary: 'Order saved', detail: `${updates.length} totems reordered` });
            this.reorderMode.set(false);
            this.loadTotems();
          }
        },
        error: () => {
          completed++;
          if (completed === updates.length) { this.savingOrder.set(false); this.loadTotems(); }
        },
      });
    }
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
