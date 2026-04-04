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
} from '../../../shared/components/data-table-wrapper';
import { BlogService, BlogPostListParams } from '../../../core/services/blog.service';
import { BlogPost, BlogCategory } from '../../../core/models/blog.model';

@Component({
  selector: 'app-blog-post-list',
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
      title="Blog Posts"
      entityName="posts"
      [columns]="columns"
      [data]="posts()"
      [totalRecords]="totalRecords()"
      [loading]="blogService.isLoading()"
      [filterChips]="filterChips()"
      (stateChange)="onStateChange($event)"
      (rowClick)="onRowClick($event)"
      (filterChipRemove)="onFilterChipRemove($event)"
      (filtersClear)="onFiltersClear()"
      (refresh)="loadPosts()">

      <!-- Header Actions -->
      <ng-template dtHeaderActions>
        <p-button
          label="New Post"
          icon="pi pi-plus"
          (onClick)="router.navigate(['/blog/posts/new'])" />
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
        <span class="font-medium text-surface-900 dark:text-surface-100">
          {{ row.translations?.hr?.title || '(no title)' }}
        </span>
      </ng-template>

      <ng-template dtCell="category" let-row>
        @if (row.category) {
          <p-tag [value]="row.category.translations?.hr?.name || row.category.slug" severity="info" />
        } @else {
          <span class="text-surface-400">--</span>
        }
      </ng-template>

      <ng-template dtCell="status" let-row>
        <p-tag
          [value]="row.status"
          [severity]="row.status === 'published' ? 'success' : 'secondary'" />
      </ng-template>

      <ng-template dtCell="date" let-row>
        {{ row.date | date:'dd.MM.yyyy' }}
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
export class BlogPostListComponent implements OnInit {
  readonly blogService = inject(BlogService);
  readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  posts = signal<BlogPost[]>([]);
  totalRecords = signal(0);
  categories = signal<BlogCategory[]>([]);
  filterChips = signal<FilterChip[]>([]);

  filterCategory: string | null = null;
  filterStatus: string | null = null;
  private currentPage = 1;
  private pageSize = 20;

  columns: DataTableColumn[] = [
    { key: 'title', label: 'Title', defaultVisible: true },
    { key: 'slug', label: 'Slug', defaultVisible: true },
    { key: 'category', label: 'Category', defaultVisible: true },
    { key: 'date', label: 'Date', defaultVisible: true, width: '120px' },
    { key: 'status', label: 'Status', defaultVisible: true, width: '110px' },
    { key: 'author', label: 'Author', defaultVisible: true, width: '130px' },
  ];

  currentRow: any = null;
  rowMenuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-pencil',
      command: () => this.router.navigate(['/blog/posts', this.currentRow?.id])
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      styleClass: 'text-red-500',
      command: () => this.confirmDelete(this.currentRow)
    }
  ];

  statusOptions = [
    { label: 'Published', value: 'published' },
    { label: 'Draft', value: 'draft' },
  ];

  categoryOptions = signal<{ label: string; value: string }[]>([]);

  ngOnInit(): void {
    this.loadCategories();
    this.loadPosts();
  }

  loadPosts(): void {
    const params: BlogPostListParams = {
      page: this.currentPage,
      itemsPerPage: this.pageSize,
    };

    if (this.filterCategory) params['category.slug'] = this.filterCategory;
    if (this.filterStatus) params.status = this.filterStatus;

    this.blogService.getPosts(params).subscribe({
      next: (posts) => {
        this.posts.set(posts);
        this.totalRecords.set(posts.length); // API may return total in headers; adjust as needed
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load posts' });
      },
    });
  }

  loadCategories(): void {
    this.blogService.getCategories().subscribe({
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
    this.loadPosts();
  }

  onRowClick(row: BlogPost): void {
    this.router.navigate(['/blog/posts', row.id]);
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.updateFilterChips();
    this.loadPosts();
  }

  onFilterChipRemove(key: string): void {
    if (key === 'category') this.filterCategory = null;
    if (key === 'status') this.filterStatus = null;
    this.updateFilterChips();
    this.loadPosts();
  }

  onFiltersClear(): void {
    this.filterCategory = null;
    this.filterStatus = null;
    this.updateFilterChips();
    this.loadPosts();
  }

  setCurrentRow(row: any): void {
    this.currentRow = row;
  }

  confirmDelete(post: BlogPost): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${post.translations?.hr?.title || post.slug}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.blogService.deletePost(post.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Post deleted successfully' });
            this.loadPosts();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete post' });
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
