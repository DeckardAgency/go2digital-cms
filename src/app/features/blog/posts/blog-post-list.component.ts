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
import { TableModule } from 'primeng/table';

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
import { BlockTypographyCardComponent } from '../../../shared/components/block-typography-card/block-typography-card.component';
import { BlogService, BlogPostListParams } from '../../../core/services/blog.service';
import { MediaService } from '../../../core/services/media.service';
import { BlogPost, BlogCategory } from '../../../core/models/blog.model';

@Component({
  selector: 'app-blog-post-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TagModule, ConfirmDialogModule, SelectModule,
    ButtonModule, TableModule, DataTableWrapperComponent, DataTableCellDirective,
    DataTableHeaderActionsDirective, DataTableRowActionsDirective,
    DataTableFilterMenuDirective, MenuModule, BlockTypographyCardComponent,
  ],
  providers: [ConfirmationService],
  template: `
    <app-block-typography-card
      blockId="blog-list"
      [elementKeys]="['cardTitle', 'cardMeta', 'cardCategory']"
      title="Post Card Typography"
      subtitle="Applied to every post card on the public /blog list page." />

    @if (!reorderMode()) {
    <app-data-table-wrapper
      title="Blog Posts"
      entityName="posts"
      [columns]="columns"
      [data]="paginatedPosts()"
      [totalRecords]="filteredPosts().length"
      [loading]="blogService.isLoading()"
      [filterChips]="filterChips()"
      [showSelection]="true"
      [bulkActions]="bulkActions"
      (stateChange)="onStateChange($event)"
      (rowClick)="onRowClick($event)"
      (filterChipRemove)="onFilterChipRemove($event)"
      (filtersClear)="onFiltersClear()"
      (bulkAction)="onBulkAction($event)"
      (refresh)="loadPosts()">

      <ng-template dtHeaderActions>
        <p-button icon="pi pi-sort-alt" label="Reorder" severity="secondary" [outlined]="true" (onClick)="enterReorderMode()" />
        <p-button label="New Post" icon="pi pi-plus" (onClick)="router.navigate(['/blog/posts/new'])" />
      </ng-template>

      <ng-template dtFilterMenu>
        <div class="flex flex-wrap items-end gap-4 p-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Category</label>
            <p-select [options]="categoryOptions()" [(ngModel)]="filterCategory" optionLabel="label" optionValue="value" placeholder="All categories" [showClear]="true" class="w-48" appendTo="body" (onChange)="applyFilters()" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Status</label>
            <p-select [options]="statusOptions" [(ngModel)]="filterStatus" optionLabel="label" optionValue="value" placeholder="All statuses" [showClear]="true" class="w-48" appendTo="body" (onChange)="applyFilters()" />
          </div>
        </div>
      </ng-template>

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
            <span class="font-medium text-surface-900 dark:text-surface-100">{{ row.translations?.hr?.title || '(no title)' }}</span>
            @if (row.translations?.hr?.excerpt) {
              <p class="text-xs text-surface-400 mt-0.5 truncate max-w-xs">{{ row.translations.hr.excerpt }}</p>
            }
          </div>
        </div>
      </ng-template>

      <ng-template dtCell="category" let-row>
        @if (row.category) {
          <p-tag [value]="getCatName(row.category)" severity="info" />
        } @else {
          <span class="text-surface-400">--</span>
        }
      </ng-template>

      <ng-template dtCell="status" let-row>
        <p-tag [value]="row.status" [severity]="row.status === 'published' ? 'success' : 'secondary'" />
      </ng-template>

      <ng-template dtCell="date" let-row>
        {{ row.date | date:'dd.MM.yyyy' }}
      </ng-template>

      <ng-template dtRowActions let-row>
        <p-button icon="pi pi-ellipsis-v" [text]="true" [rounded]="true" severity="secondary" (onClick)="setCurrentRow(row); rowMenu.toggle($event)" />
        <p-menu #rowMenu [model]="rowMenuItems" [popup]="true" appendTo="body" />
      </ng-template>
    </app-data-table-wrapper>

    }

    @if (reorderMode()) {
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Reorder Posts</h1>
            <p class="text-surface-500 dark:text-surface-400 mt-1">Drag rows to change order, then save</p>
          </div>
          <div class="flex items-center gap-2">
            <p-button label="Cancel" severity="secondary" [outlined]="true" (onClick)="exitReorderMode()" />
            <p-button label="Save Order" icon="pi pi-save" [loading]="savingOrder()" (onClick)="saveOrder()" />
          </div>
        </div>

        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
          <p-table [value]="reorderList()" styleClass="p-datatable-sm" (onRowReorder)="onRowReorder()">
            <ng-template pTemplate="header">
              <tr>
                <th style="width: 3rem"></th>
                <th style="width: 3rem">#</th>
                <th>Title</th>
                <th style="width: 120px">Date</th>
                <th style="width: 110px">Status</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-row let-index="rowIndex">
              <tr [pReorderableRow]="index">
                <td><span class="pi pi-bars cursor-grab text-surface-400" pReorderableRowHandle></span></td>
                <td><span class="text-xs font-bold text-surface-400">{{ index + 1 }}</span></td>
                <td><span class="font-medium text-surface-900 dark:text-surface-0">{{ row.translations?.hr?.title || row.slug }}</span></td>
                <td>{{ row.date | date:'dd.MM.yyyy' }}</td>
                <td><p-tag [value]="row.status" [severity]="row.status === 'published' ? 'success' : 'secondary'" /></td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>
    }

    <p-confirmDialog />
  `,
})
export class BlogPostListComponent implements OnInit {
  readonly blogService = inject(BlogService);
  readonly mediaService = inject(MediaService);
  readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  posts = signal<BlogPost[]>([]);
  totalRecords = signal(0);
  categories = signal<BlogCategory[]>([]);
  filterChips = signal<FilterChip[]>([]);

  filterCategory: string | null = null;
  filterStatus: string | null = null;
  searchTerm = '';
  private currentPage = 1;
  private pageSize = 20;

  // Reorder
  reorderMode = signal(false);
  reorderList = signal<BlogPost[]>([]);
  savingOrder = signal(false);

  columns: DataTableColumn[] = [
    { key: 'title', label: 'Title', defaultVisible: true },
    { key: 'category', label: 'Category', defaultVisible: true },
    { key: 'date', label: 'Date', defaultVisible: true, width: '120px' },
    { key: 'status', label: 'Status', defaultVisible: true, width: '110px' },
    { key: 'author', label: 'Author', defaultVisible: true, width: '130px' },
  ];

  bulkActions: BulkAction[] = [
    { label: 'Delete selected', value: 'delete' },
  ];

  currentRow: any = null;
  rowMenuItems: MenuItem[] = [
    { label: 'Edit', icon: 'pi pi-pencil', command: () => this.router.navigate(['/blog/posts', this.currentRow?.id]) },
    { label: 'Delete', icon: 'pi pi-trash', styleClass: 'text-red-500', command: () => this.confirmDelete(this.currentRow) },
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
    const params: BlogPostListParams = { page: this.currentPage, itemsPerPage: this.pageSize };
    if (this.filterCategory) params['category.slug'] = this.filterCategory;
    if (this.filterStatus) params.status = this.filterStatus;

    this.blogService.getPosts(params).subscribe({
      next: (posts) => { this.posts.set(posts); this.totalRecords.set(posts.length); },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load posts' }),
    });
  }

  loadCategories(): void {
    this.blogService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.categoryOptions.set(categories.map(c => ({ label: c.translations?.hr?.name || c.slug, value: c.slug })));
      },
    });
  }

  filteredPosts(): BlogPost[] {
    let result = this.posts();
    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        (p.translations?.hr?.title || '').toLowerCase().includes(q) ||
        (p.translations?.en?.title || '').toLowerCase().includes(q) ||
        (p.slug || '').toLowerCase().includes(q) ||
        (p.author || '').toLowerCase().includes(q)
      );
    }
    return result;
  }

  paginatedPosts(): BlogPost[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPosts().slice(start, start + this.pageSize);
  }

  onStateChange(state: DataTableState): void {
    this.currentPage = state.page;
    this.pageSize = state.pageSize;
    if (state.search !== undefined) this.searchTerm = state.search;
  }

  onRowClick(row: BlogPost): void { this.router.navigate(['/blog/posts', row.id]); }

  applyFilters(): void { this.currentPage = 1; this.updateFilterChips(); this.loadPosts(); }
  onFilterChipRemove(key: string): void { if (key === 'category') this.filterCategory = null; if (key === 'status') this.filterStatus = null; this.updateFilterChips(); this.loadPosts(); }
  onFiltersClear(): void { this.filterCategory = null; this.filterStatus = null; this.updateFilterChips(); this.loadPosts(); }

  setCurrentRow(row: any): void { this.currentRow = row; }

  getImageUrl(row: any): string {
    const image = row.image;
    if (!image) return '';
    if (typeof image === 'object' && image.path) return this.mediaService.getMediaUrl(image.path);
    return '';
  }

  getCatName(cat: any): string {
    if (typeof cat === 'string') {
      const id = cat.split('/').pop() || '';
      const found = this.categories().find(c => c.id === id);
      return found?.translations?.hr?.name || found?.slug || id;
    }
    return cat.translations?.hr?.name || cat.name || cat.slug || '—';
  }

  // ─── Reorder ───────────────────────────────────────────

  enterReorderMode(): void {
    this.reorderList.set([...this.posts()]);
    this.reorderMode.set(true);
  }

  exitReorderMode(): void {
    this.reorderMode.set(false);
  }

  onRowReorder(): void {}

  saveOrder(): void {
    const updates = this.reorderList().map((p, i) => ({ id: p.id, sortOrder: i + 1 }));
    this.savingOrder.set(true);
    let completed = 0;

    for (const update of updates) {
      this.blogService.updatePost(update.id, { sortOrder: update.sortOrder }).subscribe({
        next: () => {
          completed++;
          if (completed === updates.length) {
            this.savingOrder.set(false);
            this.messageService.add({ severity: 'success', summary: 'Order saved', detail: `${updates.length} posts reordered` });
            this.reorderMode.set(false);
            this.loadPosts();
          }
        },
        error: () => {
          completed++;
          if (completed === updates.length) { this.savingOrder.set(false); this.loadPosts(); }
        },
      });
    }
  }

  onBulkAction(event: { action: string; selected: any[] }): void {
    if (event.action === 'delete') {
      this.confirmationService.confirm({
        message: `Delete ${event.selected.length} selected post(s)?`,
        header: 'Confirm Bulk Delete',
        icon: 'pi pi-exclamation-triangle',
        acceptButtonStyleClass: 'p-button-danger',
        accept: () => {
          let completed = 0;
          const total = event.selected.length;
          for (const post of event.selected) {
            this.blogService.deletePost(post.id).subscribe({
              next: () => { completed++; if (completed === total) { this.messageService.add({ severity: 'success', summary: `${total} post(s) deleted` }); this.loadPosts(); } },
              error: () => { completed++; if (completed === total) this.loadPosts(); },
            });
          }
        },
      });
    }
  }

  confirmDelete(post: BlogPost): void {
    this.confirmationService.confirm({
      message: `Delete "${post.translations?.hr?.title || post.slug}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.blogService.deletePost(post.id).subscribe({
          next: () => { this.messageService.add({ severity: 'success', summary: 'Post deleted' }); this.loadPosts(); },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete post' }),
        });
      },
    });
  }

  private updateFilterChips(): void {
    const chips: FilterChip[] = [];
    if (this.filterCategory) { const cat = this.categoryOptions().find(c => c.value === this.filterCategory); chips.push({ key: 'category', label: `Category: ${cat?.label || this.filterCategory}` }); }
    if (this.filterStatus) chips.push({ key: 'status', label: `Status: ${this.filterStatus}` });
    this.filterChips.set(chips);
  }
}
