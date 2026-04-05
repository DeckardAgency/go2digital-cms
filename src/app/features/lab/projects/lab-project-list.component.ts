import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
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
  BulkAction,
} from '../../../shared/components/data-table-wrapper';
import { LabService, LabProjectListParams } from '../../../core/services/lab.service';
import { MediaService } from '../../../core/services/media.service';
import { LabProject, LabCategory } from '../../../core/models/lab.model';

@Component({
  selector: 'app-lab-project-list',
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
    MenuModule,
  ],
  providers: [ConfirmationService],
  template: `
    <app-data-table-wrapper
      title="Lab Projects"
      entityName="projects"
      [columns]="columns"
      [data]="projects()"
      [totalRecords]="totalRecords()"
      [loading]="labService.isLoading()"
      [filterChips]="filterChips()"
      [showSelection]="true"
      [bulkActions]="bulkActions"
      (stateChange)="onStateChange($event)"
      (rowClick)="onRowClick($event)"
      (filterChipRemove)="onFilterChipRemove($event)"
      (filtersClear)="onFiltersClear()"
      (bulkAction)="onBulkAction($event)"
      (refresh)="loadProjects()">

      <!-- Header Actions -->
      <ng-template dtHeaderActions>
        <p-button
          label="New Project"
          icon="pi pi-plus"
          (onClick)="router.navigate(['/lab/projects/new'])" />
      </ng-template>

      <!-- Filter Menu -->
      <ng-template dtFilterMenu>
        <div class="flex flex-wrap items-end gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Category</label>
            <p-select
              [options]="categoryOptions()"
              [(ngModel)]="filterCategory"
              optionLabel="label"
              optionValue="value"
              placeholder="All categories"
              [showClear]="true"
              class="w-48"
              (onChange)="applyFilters()" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Status</label>
            <p-select
              [options]="statusOptions"
              [(ngModel)]="filterStatus"
              optionLabel="label"
              optionValue="value"
              placeholder="All statuses"
              [showClear]="true"
              class="w-48"
              (onChange)="applyFilters()" />
          </div>
        </div>
      </ng-template>

      <!-- Custom Cells -->
      <ng-template dtCell="title" let-row>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center overflow-hidden flex-shrink-0">
            @if (getImageUrl(row)) {
              <img [src]="getImageUrl(row)" class="w-full h-full object-cover" />
            } @else {
              <i class="pi pi-image text-surface-400 text-sm"></i>
            }
          </div>
          <div>
            <span class="font-medium text-surface-900 dark:text-surface-100">
              {{ row.translations?.hr?.title || '(no title)' }}
            </span>
            @if (row.translations?.hr?.subtitle) {
              <p class="text-xs text-surface-400 mt-0.5 truncate max-w-xs">{{ row.translations.hr.subtitle }}</p>
            }
          </div>
        </div>
      </ng-template>

      <ng-template dtCell="categories" let-row>
        @if (row.categories?.length) {
          <div class="flex flex-wrap gap-1">
            @for (cat of row.categories; track getCatId(cat)) {
              <p-tag [value]="getCatName(cat)" severity="info" />
            }
          </div>
        } @else {
          <span class="text-surface-400">--</span>
        }
      </ng-template>

      <ng-template dtCell="status" let-row>
        <p-tag
          [value]="row.status"
          [severity]="row.status === 'published' ? 'success' : 'secondary'" />
      </ng-template>

      <ng-template dtCell="featured" let-row>
        <p-tag
          [value]="row.featured ? 'Yes' : 'No'"
          [severity]="row.featured ? 'success' : 'secondary'" />
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
export class LabProjectListComponent implements OnInit {
  readonly labService = inject(LabService);
  readonly mediaService = inject(MediaService);
  readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  projects = signal<LabProject[]>([]);
  totalRecords = signal(0);
  categories = signal<LabCategory[]>([]);
  filterChips = signal<FilterChip[]>([]);

  filterCategory: string | null = null;
  filterStatus: string | null = null;
  private currentPage = 1;
  private pageSize = 20;

  columns: DataTableColumn[] = [
    { key: 'title', label: 'Title', defaultVisible: true },
    { key: 'slug', label: 'Slug', defaultVisible: true },
    { key: 'categories', label: 'Categories', defaultVisible: true },
    { key: 'status', label: 'Status', defaultVisible: true, width: '110px' },
    { key: 'featured', label: 'Featured', defaultVisible: true, width: '110px' },
  ];

  currentRow: any = null;
  rowMenuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-pencil',
      command: () => this.router.navigate(['/lab/projects', this.currentRow?.id])
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      styleClass: 'text-red-500',
      command: () => this.confirmDelete(this.currentRow)
    }
  ];

  bulkActions: BulkAction[] = [
    { label: 'Delete selected', value: 'delete' },
  ];

  statusOptions = [
    { label: 'Published', value: 'published' },
    { label: 'Draft', value: 'draft' },
  ];

  categoryOptions = signal<{ label: string; value: string }[]>([]);

  ngOnInit(): void {
    this.loadCategories();
    this.loadProjects();
  }

  loadProjects(): void {
    const params: LabProjectListParams = {
      page: this.currentPage,
      itemsPerPage: this.pageSize,
    };

    if (this.filterCategory) params['categories.slug'] = this.filterCategory;
    if (this.filterStatus) params.status = this.filterStatus;

    this.labService.getProjects(params).subscribe({
      next: (projects) => {
        this.projects.set(projects);
        this.totalRecords.set(projects.length);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load projects' });
      },
    });
  }

  loadCategories(): void {
    this.labService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.categoryOptions.set(
          categories.map(c => ({
            label: c.translations?.hr?.name || c.slug,
            value: c.slug,
          }))
        );
      },
    });
  }

  onStateChange(state: DataTableState): void {
    this.currentPage = state.page;
    this.pageSize = state.pageSize;
    this.loadProjects();
  }

  onRowClick(row: LabProject): void {
    this.router.navigate(['/lab/projects', row.id]);
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.updateFilterChips();
    this.loadProjects();
  }

  onFilterChipRemove(key: string): void {
    if (key === 'category') this.filterCategory = null;
    if (key === 'status') this.filterStatus = null;
    this.updateFilterChips();
    this.loadProjects();
  }

  onFiltersClear(): void {
    this.filterCategory = null;
    this.filterStatus = null;
    this.updateFilterChips();
    this.loadProjects();
  }

  setCurrentRow(row: any): void {
    this.currentRow = row;
  }

  getImageUrl(row: any): string {
    const image = row.image;
    if (!image) return '';
    if (typeof image === 'object' && image.path) {
      return this.mediaService.getMediaUrl(image.path);
    }
    return '';
  }

  getCatName(cat: any): string {
    if (typeof cat === 'string') return cat.split('/').pop() || '';
    return cat.translations?.hr?.name || cat.name || cat.slug || '—';
  }

  getCatId(cat: any): string {
    if (typeof cat === 'string') return cat;
    return cat.id || cat.slug || '';
  }

  onBulkAction(event: { action: string; selected: any[] }): void {
    if (event.action === 'delete') {
      this.confirmationService.confirm({
        message: `Delete ${event.selected.length} selected project(s)?`,
        header: 'Confirm Bulk Delete',
        icon: 'pi pi-exclamation-triangle',
        acceptButtonStyleClass: 'p-button-danger',
        accept: () => {
          let completed = 0;
          const total = event.selected.length;
          for (const project of event.selected) {
            this.labService.deleteProject(project.id).subscribe({
              next: () => {
                completed++;
                if (completed === total) {
                  this.messageService.add({ severity: 'success', summary: `${total} project(s) deleted` });
                  this.loadProjects();
                }
              },
              error: () => {
                completed++;
                if (completed === total) this.loadProjects();
              },
            });
          }
        },
      });
    }
  }

  confirmDelete(project: LabProject): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${project.translations?.hr?.title || project.slug}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.labService.deleteProject(project.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Project deleted successfully' });
            this.loadProjects();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete project' });
          },
        });
      },
    });
  }

  private updateFilterChips(): void {
    const chips: FilterChip[] = [];
    if (this.filterCategory) {
      const cat = this.categoryOptions().find(c => c.value === this.filterCategory);
      chips.push({ key: 'category', label: `Category: ${cat?.label || this.filterCategory}` });
    }
    if (this.filterStatus) {
      chips.push({ key: 'status', label: `Status: ${this.filterStatus}` });
    }
    this.filterChips.set(chips);
  }
}
