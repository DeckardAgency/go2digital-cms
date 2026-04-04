import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';

import {
  DataTableWrapperComponent,
  DataTableCellDirective,
  DataTableHeaderActionsDirective,
  DataTableRowActionsDirective,
  DataTableColumn,
} from '../../../shared/components/data-table-wrapper';
import { BlogService } from '../../../core/services/blog.service';
import { BlogCategory } from '../../../core/models/blog.model';

@Component({
  selector: 'app-blog-category-list',
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
  ],
  providers: [ConfirmationService],
  template: `
    <app-data-table-wrapper
      title="Blog Categories"
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
          (onClick)="router.navigate(['/blog/categories/new'])" />
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
        <div class="flex items-center justify-end gap-1">
          <p-button
            icon="pi pi-pencil"
            severity="secondary"
            [text]="true"
            size="small"
            pTooltip="Edit"
            (onClick)="router.navigate(['/blog/categories', row.id])" />
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
export class BlogCategoryListComponent implements OnInit {
  readonly blogService = inject(BlogService);
  readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  categories = signal<BlogCategory[]>([]);
  loading = signal(false);

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
    this.blogService.getCategories().subscribe({
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

  onRowClick(row: BlogCategory): void {
    this.router.navigate(['/blog/categories', row.id]);
  }

  confirmDelete(category: BlogCategory): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${category.translations?.hr?.name || category.slug}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.blogService.deleteCategory(category.id).subscribe({
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
