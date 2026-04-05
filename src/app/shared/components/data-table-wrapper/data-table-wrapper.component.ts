import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChildren,
  QueryList,
  AfterContentInit,
  signal,
  computed,
  TemplateRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { Skeleton } from 'primeng/skeleton';

import {
  DataTableColumn,
  DataTableState,
  FilterChip,
  BulkAction,
  EmptyStateConfig,
  DataTableCellDirective,
  DataTableHeaderActionsDirective,
  DataTableRowActionsDirective,
  DataTableFilterMenuDirective,
} from './data-table-wrapper.models';
import { exportToCsv } from './data-table-wrapper.utils';

@Component({
  selector: 'app-data-table-wrapper',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TooltipModule,
    CheckboxModule,
    Skeleton,
  ],
  template: `
    <!-- Header: Title + Header Actions (OUTSIDE the card) -->
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">{{ title }}</h1>
          @if (subtitle) {
            <p class="text-surface-500 dark:text-surface-400 mt-1">{{ subtitle }}</p>
          }
        </div>
        <div class="flex items-center gap-2">
          @if (headerActionsTemplate) {
            <ng-container *ngTemplateOutlet="headerActionsTemplate"></ng-container>
          }
        </div>
      </div>

      <!-- Table Card -->
      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">

        <!-- Toolbar: single row -->
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-3 border-b border-surface-200 dark:border-surface-700">

          <!-- Left: Bulk actions + filter chips -->
          <div class="flex items-center gap-2 flex-wrap">
            @if (showSelection && selectedRows.length > 0 && bulkActions.length > 0) {
              <p-select
                [options]="bulkActions"
                optionLabel="label"
                optionValue="value"
                [placeholder]="'Bulk Actions (' + selectedRows.length + ')'"
                (onChange)="onBulkActionSelect($event.value)"
                [style]="{ minWidth: '180px' }"
                styleClass="p-select-sm" />
            }

            @for (chip of filterChips; track chip.key) {
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 border border-surface-200 dark:border-surface-700">
                {{ chip.label }}
                <i class="pi pi-times text-[10px] cursor-pointer hover:text-red-500" (click)="filterChipRemove.emit(chip.key)"></i>
              </span>
            }
          </div>

          <!-- Right: Search, Filter, Export, Refresh, Pagination -->
          <div class="flex items-center gap-2">
            <input
              type="text"
              pInputText
              [ngModel]="searchTerm()"
              (ngModelChange)="onSearchInput($event)"
              [placeholder]="searchPlaceholder"
              class="w-48 lg:w-56 text-sm" />

            @if (filterMenuTemplate) {
              <div class="relative" #filterHost>
                <p-button
                  icon="pi pi-filter"
                  [text]="true"
                  [rounded]="true"
                  severity="secondary"
                  pTooltip="Filters"
                  tooltipPosition="bottom"
                  [badge]="filterChips.length > 0 ? filterChips.length.toString() : undefined"
                  badgeSeverity="primary"
                  (onClick)="filterMenuOpen = !filterMenuOpen" />
                @if (filterMenuOpen) {
                  <div class="absolute right-0 top-full mt-1 z-50 bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg shadow-lg min-w-[220px] py-1">
                    <ng-container *ngTemplateOutlet="filterMenuTemplate"></ng-container>
                  </div>
                }
              </div>
            }

            @if (showExport) {
              <p-button
                icon="pi pi-download"
                [text]="true"
                [rounded]="true"
                severity="secondary"
                pTooltip="Export CSV"
                tooltipPosition="bottom"
                (onClick)="onExport()" />
            }

            <div class="w-px h-6 bg-surface-200 dark:bg-surface-700"></div>

            <p-button
              icon="pi pi-refresh"
              [text]="true"
              [rounded]="true"
              severity="secondary"
              pTooltip="Refresh"
              tooltipPosition="bottom"
              (onClick)="refresh.emit()" />

            <!-- Pagination (in toolbar) -->
            <div class="flex items-center gap-1 text-sm text-surface-600 dark:text-surface-400">
              <p-button
                icon="pi pi-chevron-left"
                [text]="true"
                [rounded]="true"
                severity="secondary"
                [disabled]="currentPage() <= 1"
                (onClick)="goToPage(currentPage() - 1)"
                size="small" />
              <span class="whitespace-nowrap text-xs">Page {{ currentPage() }} of {{ totalPagesCount() }}</span>
              <p-button
                icon="pi pi-chevron-right"
                [text]="true"
                [rounded]="true"
                severity="secondary"
                [disabled]="currentPage() >= totalPagesCount()"
                (onClick)="goToPage(currentPage() + 1)"
                size="small" />
            </div>
          </div>
        </div>

        <!-- Table -->
        <p-table
          [value]="data"
          [lazy]="true"
          (onLazyLoad)="onLazyLoad($event)"
          [rows]="pageSize"
          [totalRecords]="totalRecords"
          [rowHover]="true"
          [dataKey]="dataKey"
          [(selection)]="selectedRows"
          styleClass="p-datatable-sm"
          [sortField]="sortField"
          [sortOrder]="sortOrderNum">

          <!-- Header -->
          <ng-template pTemplate="header">
            <tr>
              @if (showSelection) {
                <th style="width: 3rem"><p-tableHeaderCheckbox /></th>
              }
              @for (col of visibleCols(); track col.key) {
                <th
                  [pSortableColumn]="col.sortField ?? undefined"
                  [class.text-center]="col.align === 'center'"
                  [class.text-right]="col.align === 'right'"
                  [style.width]="col.width || null">
                  {{ col.label }}
                  @if (col.sortField) {
                    <p-sortIcon [field]="col.sortField" />
                  }
                </th>
              }
              @if (rowActionsTemplate) {
                <th style="width: 4rem"></th>
              }
            </tr>
          </ng-template>

          <!-- Body -->
          <ng-template pTemplate="body" let-row let-index="rowIndex">
            <tr class="cursor-pointer" (click)="rowClick.emit(row)">
              @if (showSelection) {
                <td (click)="$event.stopPropagation()">
                  <p-tableCheckbox [value]="row" />
                </td>
              }
              @for (col of visibleCols(); track col.key) {
                <td
                  [class.text-center]="col.align === 'center'"
                  [class.text-right]="col.align === 'right'">
                  @if (cellTemplateMap.get(col.key); as cellTpl) {
                    <ng-container *ngTemplateOutlet="cellTpl; context: { $implicit: row, index: index }"></ng-container>
                  } @else {
                    {{ row[col.key] }}
                  }
                </td>
              }
              @if (rowActionsTemplate) {
                <td (click)="$event.stopPropagation()">
                  <ng-container *ngTemplateOutlet="rowActionsTemplate; context: { $implicit: row }"></ng-container>
                </td>
              }
            </tr>
          </ng-template>

          <!-- Empty State -->
          <ng-template pTemplate="emptymessage">
            <tr>
              <td [attr.colspan]="totalColSpan()" class="text-center py-16">
                <div class="flex flex-col items-center gap-3">
                  <div class="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                    <i class="{{ emptyState.icon }} text-3xl text-surface-400"></i>
                  </div>
                  <div>
                    <p class="font-medium text-surface-700 dark:text-surface-300">{{ emptyState.title }}</p>
                    <p class="text-sm text-surface-500 mt-1">
                      {{ filterChips.length > 0 || searchTerm() ? emptyState.messageFiltered : emptyState.messageEmpty }}
                    </p>
                  </div>
                  @if (filterChips.length > 0 || searchTerm()) {
                    <p-button label="Clear Filters" icon="pi pi-filter-slash" [outlined]="true" (onClick)="filtersClear.emit()" />
                  } @else if (emptyState.createLabel) {
                    <p-button [label]="emptyState.createLabel" icon="pi pi-plus" (onClick)="create.emit()" />
                  }
                </div>
              </td>
            </tr>
          </ng-template>

          <!-- Footer Summary -->
          <ng-template pTemplate="summary">
            <div class="flex items-center justify-between text-sm text-surface-500 dark:text-surface-400 px-4 py-3">
              <span>Showing {{ showingFrom() }} to {{ showingTo() }} of {{ totalRecords }} {{ entityName }}</span>
              @if (showSelection && selectedRows.length > 0) {
                <span>{{ selectedRows.length }} selected</span>
              }
            </div>
          </ng-template>
        </p-table>
      </div>
    </div>
  `,
  host: {
    '(document:click)': 'onDocumentClick($event)'
  }
})
export class DataTableWrapperComponent implements OnInit, OnDestroy, AfterContentInit {
  // Inputs
  @Input() title = '';
  @Input() subtitle = '';
  @Input() entityName = 'items';
  @Input() columns: DataTableColumn[] = [];
  @Input() data: any[] = [];
  @Input() totalRecords = 0;
  @Input() loading = false;
  @Input() dataKey = 'id';
  @Input() pageSize = 20;
  @Input() emptyState: EmptyStateConfig = {
    icon: 'pi pi-inbox',
    title: 'No items found',
    messageFiltered: 'Try adjusting your search or filter criteria.',
    messageEmpty: 'Get started by creating your first item.',
  };
  @Input() filterChips: FilterChip[] = [];
  @Input() bulkActions: BulkAction[] = [];
  @Input() searchPlaceholder = 'Search...';
  @Input() showExport = false;
  @Input() showSelection = false;

  // Outputs
  @Output() stateChange = new EventEmitter<DataTableState>();
  @Output() bulkAction = new EventEmitter<{ action: string; selected: any[] }>();
  @Output() filterChipRemove = new EventEmitter<string>();
  @Output() filtersClear = new EventEmitter<void>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() refresh = new EventEmitter<void>();
  @Output() create = new EventEmitter<void>();

  // Content children
  @ContentChildren(DataTableCellDirective) cellDirectives!: QueryList<DataTableCellDirective>;
  @ContentChildren(DataTableHeaderActionsDirective) headerActionsDirs!: QueryList<DataTableHeaderActionsDirective>;
  @ContentChildren(DataTableRowActionsDirective) rowActionsDirs!: QueryList<DataTableRowActionsDirective>;
  @ContentChildren(DataTableFilterMenuDirective) filterMenuDirs!: QueryList<DataTableFilterMenuDirective>;

  // Template references
  headerActionsTemplate: TemplateRef<any> | null = null;
  rowActionsTemplate: TemplateRef<any> | null = null;
  filterMenuTemplate: TemplateRef<any> | null = null;
  cellTemplateMap = new Map<string, TemplateRef<any>>();

  // State
  searchTerm = signal('');
  selectedRows: any[] = [];
  sortField = '';
  sortOrderNum = 1;
  filterMenuOpen = false;

  currentPage = signal(1);

  private searchSubject = new Subject<string>();
  private searchSub!: Subscription;

  visibleCols = computed(() => this.columns.filter(c => c.defaultVisible));

  totalPagesCount(): number { return Math.max(1, Math.ceil(this.totalRecords / this.pageSize)); }

  showingFrom(): number {
    if (this.totalRecords === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize + 1;
  }

  showingTo(): number { return Math.min(this.currentPage() * this.pageSize, this.totalRecords); }

  totalColSpan = computed(() => {
    let count = this.visibleCols().length;
    if (this.showSelection) count++;
    if (this.rowActionsTemplate) count++;
    return count;
  });

  ngOnInit(): void {
    this.searchSub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage.set(1);
      this.emitStateChange();
    });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  ngAfterContentInit(): void {
    this.cellDirectives.forEach(d => this.cellTemplateMap.set(d.columnKey, d.templateRef));
    this.cellDirectives.changes.subscribe(() => {
      this.cellTemplateMap.clear();
      this.cellDirectives.forEach(d => this.cellTemplateMap.set(d.columnKey, d.templateRef));
    });

    if (this.headerActionsDirs.first) {
      this.headerActionsTemplate = this.headerActionsDirs.first.templateRef;
    }
    if (this.rowActionsDirs.first) {
      this.rowActionsTemplate = this.rowActionsDirs.first.templateRef;
    }
    if (this.filterMenuDirs.first) {
      this.filterMenuTemplate = this.filterMenuDirs.first.templateRef;
    }
  }

  onSearchInput(term: string): void {
    this.searchTerm.set(term);
    this.searchSubject.next(term);
  }

  onLazyLoad(event: any): void {
    const page = Math.floor((event.first || 0) / this.pageSize) + 1;
    this.currentPage.set(page);
    if (event.sortField) {
      this.sortField = event.sortField;
      this.sortOrderNum = event.sortOrder ?? 1;
    }
    this.emitStateChange();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPagesCount()) return;
    this.currentPage.set(page);
    this.emitStateChange();
  }

  onBulkActionSelect(action: string): void {
    this.bulkAction.emit({ action, selected: [...this.selectedRows] });
  }

  onExport(): void {
    exportToCsv(this.columns, this.data, this.entityName);
  }

  onDocumentClick(event: Event): void {
    if (this.filterMenuOpen) {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        this.filterMenuOpen = false;
      }
    }
  }

  private emitStateChange(): void {
    this.stateChange.emit({
      page: this.currentPage(),
      pageSize: this.pageSize,
      sortField: this.sortField,
      sortOrder: this.sortOrderNum === 1 ? 'asc' : 'desc',
      search: this.searchTerm(),
    });
  }
}
