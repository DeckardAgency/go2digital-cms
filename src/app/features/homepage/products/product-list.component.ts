import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

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
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    TagModule,
    ButtonModule,
    ConfirmDialogModule,
    DataTableWrapperComponent,
    DataTableCellDirective,
    DataTableHeaderActionsDirective,
    DataTableRowActionsDirective,
  ],
  providers: [ConfirmationService],
  template: `
    <app-data-table-wrapper
      title="Homepage Products"
      entityName="products"
      [columns]="columns"
      [data]="items()"
      [totalRecords]="totalRecords()"
      [loading]="homepageService.isLoading()"
      (stateChange)="onStateChange($event)"
      (rowClick)="onRowClick($event)"
      (refresh)="loadItems()">

      <ng-template dtHeaderActions>
        <p-button
          label="New Product"
          icon="pi pi-plus"
          (onClick)="router.navigate(['/homepage/products/new'])" />
      </ng-template>

      <ng-template dtCell="title" let-row>
        <span class="font-medium text-surface-900 dark:text-surface-100">
          {{ row.translations?.hr?.title || '(no title)' }}
        </span>
      </ng-template>

      <ng-template dtCell="productType" let-row>
        <p-tag [value]="row.productType" [severity]="row.productType === 'display' ? 'info' : 'secondary'" />
      </ng-template>

      <ng-template dtCell="badge" let-row>
        {{ row.translations?.hr?.badge || '--' }}
      </ng-template>

      <ng-template dtRowActions let-row>
        <div class="flex items-center justify-end gap-1">
          <p-button
            icon="pi pi-pencil"
            severity="secondary"
            [text]="true"
            size="small"
            (onClick)="router.navigate(['/homepage/products', row.id])" />
          <p-button
            icon="pi pi-trash"
            severity="danger"
            [text]="true"
            size="small"
            (onClick)="confirmDelete(row)" />
        </div>
      </ng-template>
    </app-data-table-wrapper>

    <p-confirmDialog />
  `,
})
export class ProductListComponent implements OnInit {
  readonly homepageService = inject(HomepageService);
  readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  items = signal<any[]>([]);
  totalRecords = signal(0);

  columns: DataTableColumn[] = [
    { key: 'title', label: 'Title', defaultVisible: true },
    { key: 'productType', label: 'Type', defaultVisible: true, width: '120px' },
    { key: 'badge', label: 'Badge', defaultVisible: true, width: '150px' },
  ];

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.homepageService.getProducts().subscribe({
      next: (items) => {
        this.items.set(items);
        this.totalRecords.set(items.length);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load products' });
      },
    });
  }

  onStateChange(state: DataTableState): void {
    this.loadItems();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/homepage/products', row.id]);
  }

  confirmDelete(item: any): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${item.translations?.hr?.title || 'this product'}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.homepageService.deleteProduct(item.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Product deleted successfully' });
            this.loadItems();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete product' });
          },
        });
      },
    });
  }
}
