import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';

import {
  DataTableWrapperComponent,
  DataTableCellDirective,
  DataTableHeaderActionsDirective,
  DataTableRowActionsDirective,
  DataTableColumn,
} from '../../../shared/components/data-table-wrapper';
import { LabService } from '../../../core/services/lab.service';
import { LabCategory } from '../../../core/models/lab.model';

@Component({
  selector: 'app-lab-category-list',
  standalone: true,
  imports: [
    CommonModule,
    TagModule,
    ConfirmDialogModule,
    ButtonModule,
    DataTableWrapperComponent,
    DataTableCellDirective,
    DataTableHeaderActionsDirective,
    DataTableRowActionsDirective,
    MenuModule,
  ],
  providers: [ConfirmationService],
  template: `
    <app-data-table-wrapper
      title="Lab Categories"
      entityName="categories"
      [columns]="columns"
      [data]="categories()"
      [totalRecords]="categories().length"
      [loading]="loading()"
      (rowClick)="onRowClick($event)"
      (refresh)="loadCategories()">

      <!-- Header Actions -->
      <ng-template dtHeaderActions>
        <p-button
          label="New Category"
          icon="pi pi-plus"
          (onClick)="router.navigate(['/lab/categories/new'])" />
      </ng-template>

      <!-- Custom Cells -->
      <ng-template dtCell="name" let-row>
        <span class="font-medium text-surface-900 dark:text-surface-100">
          {{ row.translations?.hr?.name || '(no name)' }}
        </span>
      </ng-template>

      <ng-template dtCell="isActive" let-row>
        <p-tag
          [value]="row.isActive ? 'Active' : 'Inactive'"
          [severity]="row.isActive ? 'success' : 'secondary'" />
      </ng-template>

      <!-- Row Actions -->
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
export class LabCategoryListComponent implements OnInit {
  readonly labService = inject(LabService);
  readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  categories = signal<LabCategory[]>([]);
  loading = signal(false);

  currentRow: any = null;
  rowMenuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-pencil',
      command: () => this.router.navigate(['/lab/categories', this.currentRow?.id])
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      styleClass: 'text-red-500',
      command: () => this.confirmDelete(this.currentRow)
    }
  ];

  columns: DataTableColumn[] = [
    { key: 'name', label: 'Name', defaultVisible: true },
    { key: 'slug', label: 'Slug', defaultVisible: true },
    { key: 'sortOrder', label: 'Sort Order', defaultVisible: true, width: '120px' },
    { key: 'isActive', label: 'Active', defaultVisible: true, width: '100px' },
  ];

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.labService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load categories' });
        this.loading.set(false);
      },
    });
  }

  onRowClick(row: LabCategory): void {
    this.router.navigate(['/lab/categories', row.id]);
  }

  setCurrentRow(row: any): void {
    this.currentRow = row;
  }

  confirmDelete(category: LabCategory): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${category.translations?.hr?.name || category.slug}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.labService.deleteCategory(category.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Category deleted successfully' });
            this.loadCategories();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete category' });
          },
        });
      },
    });
  }
}
