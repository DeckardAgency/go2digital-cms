import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';

import {
  DataTableWrapperComponent,
  DataTableCellDirective,
  DataTableHeaderActionsDirective,
  DataTableRowActionsDirective,
  DataTableFilterMenuDirective,
  DataTableColumn,
  DataTableState,
  FilterChip,
} from '../../shared/components/data-table-wrapper';
import { NavigationAdminService } from '../../core/services/navigation-admin.service';

@Component({
  selector: 'app-nav-item-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TagModule,
    ConfirmDialogModule,
    SelectModule,
    ButtonModule,
    DataTableWrapperComponent,
    DataTableCellDirective,
    DataTableHeaderActionsDirective,
    DataTableRowActionsDirective,
    DataTableFilterMenuDirective,
  ],
  providers: [ConfirmationService],
  template: `
    <app-data-table-wrapper
      title="Navigation Items"
      entityName="items"
      [columns]="columns"
      [data]="items()"
      [totalRecords]="totalRecords()"
      [loading]="navService.isLoading()"
      [filterChips]="filterChips()"
      (stateChange)="onStateChange($event)"
      (rowClick)="onRowClick($event)"
      (filterChipRemove)="onFilterChipRemove($event)"
      (filtersClear)="onFiltersClear()"
      (refresh)="loadItems()">

      <ng-template dtHeaderActions>
        <p-button
          label="New Item"
          icon="pi pi-plus"
          (onClick)="router.navigate(['/navigation/new'])" />
      </ng-template>

      <ng-template dtFilterMenu>
        <div class="flex flex-wrap items-end gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Group</label>
            <p-select
              [options]="groupOptions"
              [(ngModel)]="filterGroup"
              optionLabel="label"
              optionValue="value"
              placeholder="All groups"
              [showClear]="true"
              class="w-48"
              (onChange)="applyFilters()" />
          </div>
        </div>
      </ng-template>

      <ng-template dtCell="label" let-row>
        <span class="font-medium text-surface-900 dark:text-surface-100">
          {{ row.translations?.hr?.label || '(no label)' }}
        </span>
      </ng-template>

      <ng-template dtCell="group" let-row>
        <p-tag [value]="row.group" severity="info" />
      </ng-template>

      <ng-template dtCell="isActive" let-row>
        <p-tag
          [value]="row.isActive ? 'Active' : 'Inactive'"
          [severity]="row.isActive ? 'success' : 'secondary'" />
      </ng-template>

      <ng-template dtRowActions let-row>
        <div class="flex items-center justify-end gap-1">
          <p-button
            icon="pi pi-pencil"
            severity="secondary"
            [text]="true"
            size="small"
            pTooltip="Edit"
            (onClick)="router.navigate(['/navigation', row.id])" />
          <p-button
            icon="pi pi-trash"
            severity="danger"
            [text]="true"
            size="small"
            pTooltip="Delete"
            (onClick)="confirmDelete(row)" />
        </div>
      </ng-template>
    </app-data-table-wrapper>

    <p-confirmDialog />
  `,
})
export class NavItemListComponent implements OnInit {
  readonly navService = inject(NavigationAdminService);
  readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  items = signal<any[]>([]);
  totalRecords = signal(0);
  filterChips = signal<FilterChip[]>([]);

  filterGroup: string | null = null;

  columns: DataTableColumn[] = [
    { key: 'label', label: 'Label', defaultVisible: true },
    { key: 'url', label: 'URL', defaultVisible: true },
    { key: 'group', label: 'Group', defaultVisible: true, width: '110px' },
    { key: 'sortOrder', label: 'Sort Order', defaultVisible: true, width: '120px' },
    { key: 'isActive', label: 'Active', defaultVisible: true, width: '100px' },
  ];

  groupOptions = [
    { label: 'Main', value: 'main' },
    { label: 'Footer', value: 'footer' },
  ];

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.navService.getItems(this.filterGroup || undefined).subscribe({
      next: (items) => {
        this.items.set(items);
        this.totalRecords.set(items.length);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load navigation items' });
      },
    });
  }

  onStateChange(state: DataTableState): void {
    this.loadItems();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/navigation', row.id]);
  }

  applyFilters(): void {
    this.updateFilterChips();
    this.loadItems();
  }

  onFilterChipRemove(key: string): void {
    if (key === 'group') this.filterGroup = null;
    this.updateFilterChips();
    this.loadItems();
  }

  onFiltersClear(): void {
    this.filterGroup = null;
    this.updateFilterChips();
    this.loadItems();
  }

  confirmDelete(item: any): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${item.translations?.hr?.label || 'this item'}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.navService.deleteItem(item.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Item deleted successfully' });
            this.loadItems();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete item' });
          },
        });
      },
    });
  }

  private updateFilterChips(): void {
    const chips: FilterChip[] = [];
    if (this.filterGroup) {
      chips.push({ key: 'group', label: `Group: ${this.filterGroup}` });
    }
    this.filterChips.set(chips);
  }
}
