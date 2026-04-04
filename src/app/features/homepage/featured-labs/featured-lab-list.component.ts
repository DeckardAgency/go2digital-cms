import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';

import {
  DataTableWrapperComponent,
  DataTableCellDirective,
  DataTableHeaderActionsDirective,
  DataTableRowActionsDirective,
  DataTableColumn,
  DataTableState,
} from '../../../shared/components/data-table-wrapper';
import { HomepageService } from '../../../core/services/homepage.service';

@Component({
  selector: 'app-featured-lab-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ConfirmDialogModule,
    DataTableWrapperComponent,
    DataTableCellDirective,
    DataTableHeaderActionsDirective,
    DataTableRowActionsDirective,
    MenuModule,
  ],
  providers: [ConfirmationService],
  template: `
    <app-data-table-wrapper
      title="Featured Lab Items"
      entityName="featured lab items"
      [columns]="columns"
      [data]="items()"
      [totalRecords]="totalRecords()"
      [loading]="homepageService.isLoading()"
      (stateChange)="onStateChange($event)"
      (rowClick)="onRowClick($event)"
      (refresh)="loadItems()">

      <ng-template dtHeaderActions>
        <p-button
          label="New Featured Lab Item"
          icon="pi pi-plus"
          (onClick)="router.navigate(['/homepage/featured-labs/new'])" />
      </ng-template>

      <ng-template dtCell="title" let-row>
        <span class="font-medium text-surface-900 dark:text-surface-100">
          {{ row.translations?.hr?.title || '(no title)' }}
        </span>
      </ng-template>

      <ng-template dtCell="categories" let-row>
        {{ row.categories ? JSON.stringify(row.categories) : '--' }}
      </ng-template>

      <ng-template dtRowActions let-row>
        <p-button
          icon="pi pi-ellipsis-v"
          [text]="true"
          [rounded]="true"
          severity="secondary"
          (onClick)="setCurrentRow(row); rowMenu.toggle($event)" />
        <p-menu #rowMenu [model]="rowMenuItems" [popup]="true" appendTo="body" />
      </ng-template>
    </app-data-table-wrapper>

    <p-confirmDialog />
  `,
})
export class FeaturedLabListComponent implements OnInit {
  readonly homepageService = inject(HomepageService);
  readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  protected readonly JSON = JSON;

  currentRow: any = null;
  rowMenuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-pencil',
      command: () => this.router.navigate(['/homepage/featured-labs', this.currentRow?.id])
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      styleClass: 'text-red-500',
      command: () => this.confirmDelete(this.currentRow)
    }
  ];

  items = signal<any[]>([]);
  totalRecords = signal(0);

  columns: DataTableColumn[] = [
    { key: 'title', label: 'Title', defaultVisible: true },
    { key: 'slug', label: 'Slug', defaultVisible: true },
    { key: 'categories', label: 'Categories', defaultVisible: true },
    { key: 'sortOrder', label: 'Sort Order', defaultVisible: true, width: '110px' },
  ];

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.homepageService.getFeaturedLabItems().subscribe({
      next: (items) => {
        this.items.set(items);
        this.totalRecords.set(items.length);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load featured lab items' });
      },
    });
  }

  onStateChange(state: DataTableState): void {
    this.loadItems();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/homepage/featured-labs', row.id]);
  }

  setCurrentRow(row: any): void {
    this.currentRow = row;
  }

  confirmDelete(item: any): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${item.translations?.hr?.title || 'this item'}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.homepageService.deleteFeaturedLabItem(item.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Featured lab item deleted successfully' });
            this.loadItems();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete featured lab item' });
          },
        });
      },
    });
  }
}
