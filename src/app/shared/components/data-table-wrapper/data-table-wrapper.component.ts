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
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
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
    <!-- Header -->
    <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
      <div class="p-5 pb-0">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-semibold text-surface-900 dark:text-surface-0">{{ title }}</h2>
            @if (subtitle) {
              <p class="text-sm text-surface-500 dark:text-surface-400 mt-1">{{ subtitle }}</p>
            }
          </div>
          <div class="flex items-center gap-2">
            @if (headerActionsTemplate) {
              <ng-container *ngTemplateOutlet="headerActionsTemplate"></ng-container>
            }
          </div>
        </div>

        <!-- Toolbar -->
        <div class="flex flex-wrap items-center gap-3 pb-4">
          <!-- Bulk Actions -->
          @if (showSelection && selectedRows.length > 0 && bulkActions.length > 0) {
            <div class="flex items-center gap-2">
              <span class="text-sm text-surface-500">{{ selectedRows.length }} selected</span>
              @for (action of bulkActions; track action.value) {
                <p-button
                  [label]="action.label"
                  [icon]="action.icon || ''"
                  severity="secondary"
                  size="small"
                  (onClick)="bulkAction.emit(action.value)" />
              }
            </div>
          }

          <!-- Filter Chips -->
          @if (filterChips.length > 0) {
            <div class="flex items-center gap-2 flex-wrap">
              @for (chip of filterChips; track chip.key) {
                <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  {{ chip.label }}
                  <button
                    class="ml-1 hover:text-primary-700 cursor-pointer"
                    (click)="filterChipRemove.emit(chip.key)">
                    <i class="pi pi-times text-[10px]"></i>
                  </button>
                </span>
              }
              <button
                class="text-xs text-surface-500 hover:text-surface-700 cursor-pointer"
                (click)="filtersClear.emit()">
                Clear all
              </button>
            </div>
          }

          <div class="flex-1"></div>

          <!-- Search -->
          <div class="relative">
            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm"></i>
            <input
              pInputText
              type="text"
              [placeholder]="searchPlaceholder"
              class="pl-9 w-64"
              [ngModel]="searchValue()"
              (ngModelChange)="onSearchChange($event)" />
          </div>

          <!-- Filter Menu Button -->
          @if (filterMenuTemplate) {
            <p-button
              icon="pi pi-filter"
              severity="secondary"
              [outlined]="true"
              pTooltip="Filters"
              tooltipPosition="top"
              (onClick)="showFilterMenu = !showFilterMenu" />
          }

          <!-- Refresh -->
          <p-button
            icon="pi pi-refresh"
            severity="secondary"
            [outlined]="true"
            pTooltip="Refresh"
            tooltipPosition="top"
            (onClick)="refresh.emit()" />

          <!-- Export -->
          @if (showExport) {
            <p-button
              icon="pi pi-download"
              severity="secondary"
              [outlined]="true"
              pTooltip="Export CSV"
              tooltipPosition="top"
              (onClick)="onExport()" />
          }
        </div>
      </div>

      <!-- Filter Menu Overlay -->
      @if (showFilterMenu && filterMenuTemplate) {
        <div class="px-5 pb-4">
          <div class="p-4 bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700">
            <ng-container *ngTemplateOutlet="filterMenuTemplate"></ng-container>
          </div>
        </div>
      }

      <!-- Table -->
      <p-table
        [value]="data"
        [lazy]="true"
        [paginator]="false"
        [rows]="pageSize"
        [totalRecords]="totalRecords"
        [loading]="loading"
        [dataKey]="dataKey"
        [sortField]="currentState().sortField"
        [sortOrder]="currentState().sortOrder === 'asc' ? 1 : -1"
        [selection]="selectedRows"
        [selectionMode]="showSelection ? 'multiple' : undefined"
        (selectionChange)="selectedRows = $any($event)"
        (onLazyLoad)="onLazyLoad($event)"
        [tableStyle]="{ 'min-width': '100%' }"
        styleClass="p-datatable-sm">

        <!-- Header -->
        <ng-template #header>
          <tr>
            @if (showSelection) {
              <th class="w-12">
                <p-checkbox
                  [ngModel]="allSelected()"
                  [binary]="true"
                  (ngModelChange)="toggleSelectAll($event)" />
              </th>
            }
            @for (col of visibleColumns(); track col.key) {
              <th
                [pSortableColumn]="col.sortField || col.key"
                [style.width]="col.width || 'auto'"
                [style.text-align]="col.align || 'left'"
                [class.frozen-column]="col.frozen">
                {{ col.label }}
                <p-sortIcon [field]="col.sortField || col.key" />
              </th>
            }
            @if (rowActionsTemplate) {
              <th class="w-24 text-right">Actions</th>
            }
          </tr>
        </ng-template>

        <!-- Body -->
        <ng-template #body let-row let-ri="rowIndex">
          <tr
            class="cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
            (click)="rowClick.emit(row)">
            @if (showSelection) {
              <td (click)="$event.stopPropagation()">
                <p-checkbox
                  [ngModel]="isSelected(row)"
                  [binary]="true"
                  (ngModelChange)="toggleRowSelection(row)" />
              </td>
            }
            @for (col of visibleColumns(); track col.key) {
              <td
                [style.text-align]="col.align || 'left'"
                [class.frozen-column]="col.frozen">
                @if (getCellTemplate(col.key); as tmpl) {
                  <ng-container *ngTemplateOutlet="tmpl; context: { $implicit: row, row: row }"></ng-container>
                } @else {
                  {{ row[col.key] }}
                }
              </td>
            }
            @if (rowActionsTemplate) {
              <td class="text-right" (click)="$event.stopPropagation()">
                <ng-container *ngTemplateOutlet="rowActionsTemplate; context: { $implicit: row, row: row }"></ng-container>
              </td>
            }
          </tr>
        </ng-template>

        <!-- Loading -->
        <ng-template #loadingbody>
          @for (i of skeletonRows; track i) {
            <tr>
              @if (showSelection) { <td><p-skeleton width="1.5rem" height="1.5rem" /></td> }
              @for (col of visibleColumns(); track col.key) {
                <td><p-skeleton></p-skeleton></td>
              }
              @if (rowActionsTemplate) { <td><p-skeleton width="4rem" /></td> }
            </tr>
          }
        </ng-template>

        <!-- Empty -->
        <ng-template #emptymessage>
          <tr>
            <td [attr.colspan]="totalColumns()" class="text-center py-16">
              <div class="flex flex-col items-center gap-3">
                <i [class]="'pi ' + emptyState.icon + ' text-4xl text-surface-300 dark:text-surface-600'"></i>
                <div>
                  <p class="text-surface-700 dark:text-surface-300 font-medium">{{ emptyState.title }}</p>
                  <p class="text-sm text-surface-500 dark:text-surface-400 mt-1">
                    {{ hasActiveFilters() ? emptyState.messageFiltered : emptyState.messageEmpty }}
                  </p>
                </div>
                @if (!hasActiveFilters() && emptyState.createLabel) {
                  <p-button
                    [label]="emptyState.createLabel"
                    icon="pi pi-plus"
                    size="small"
                    (onClick)="create.emit()" />
                }
                @if (hasActiveFilters()) {
                  <p-button
                    label="Clear filters"
                    icon="pi pi-filter-slash"
                    severity="secondary"
                    size="small"
                    (onClick)="filtersClear.emit()" />
                }
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Footer -->
      <div class="flex items-center justify-between px-5 py-3 border-t border-surface-200 dark:border-surface-700">
        <span class="text-sm text-surface-500 dark:text-surface-400">
          @if (totalRecords > 0) {
            Showing {{ rangeStart() }}–{{ rangeEnd() }} of {{ totalRecords }} {{ entityName }}
          } @else {
            No {{ entityName }}
          }
        </span>
        <div class="flex items-center gap-2">
          <p-button
            icon="pi pi-chevron-left"
            severity="secondary"
            [outlined]="true"
            size="small"
            [disabled]="currentState().page <= 1"
            (onClick)="goToPage(currentState().page - 1)" />
          <span class="text-sm text-surface-700 dark:text-surface-300 px-2">
            Page {{ currentState().page }} of {{ totalPages() }}
          </span>
          <p-button
            icon="pi pi-chevron-right"
            severity="secondary"
            [outlined]="true"
            size="small"
            [disabled]="currentState().page >= totalPages()"
            (onClick)="goToPage(currentState().page + 1)" />
        </div>
      </div>
    </div>
  `,
})
export class DataTableWrapperComponent implements AfterContentInit {
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
    icon: 'pi-inbox',
    title: 'No items found',
    messageFiltered: 'Try adjusting your filters',
    messageEmpty: 'Get started by creating your first item',
  };
  @Input() filterChips: FilterChip[] = [];
  @Input() bulkActions: BulkAction[] = [];
  @Input() searchPlaceholder = 'Search...';
  @Input() showExport = false;
  @Input() showSelection = false;

  // Outputs
  @Output() stateChange = new EventEmitter<DataTableState>();
  @Output() bulkAction = new EventEmitter<string>();
  @Output() filterChipRemove = new EventEmitter<string>();
  @Output() filtersClear = new EventEmitter<void>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() refresh = new EventEmitter<void>();
  @Output() create = new EventEmitter<void>();

  // Content children
  @ContentChildren(DataTableCellDirective) cellTemplates!: QueryList<DataTableCellDirective>;
  @ContentChildren(DataTableHeaderActionsDirective) headerActions!: QueryList<DataTableHeaderActionsDirective>;
  @ContentChildren(DataTableRowActionsDirective) rowActions!: QueryList<DataTableRowActionsDirective>;
  @ContentChildren(DataTableFilterMenuDirective) filterMenus!: QueryList<DataTableFilterMenuDirective>;

  // Internal state
  headerActionsTemplate: TemplateRef<any> | null = null;
  rowActionsTemplate: TemplateRef<any> | null = null;
  filterMenuTemplate: TemplateRef<any> | null = null;
  showFilterMenu = false;
  selectedRows: any[] = [];
  private cellTemplateMap = new Map<string, TemplateRef<any>>();
  private searchDebounce: any;

  searchValue = signal('');
  currentState = signal<DataTableState>({
    page: 1,
    pageSize: 20,
    sortField: '',
    sortOrder: 'asc',
    search: '',
  });

  visibleColumns = computed(() =>
    this.columns.filter(c => c.defaultVisible)
  );

  totalColumns = computed(() => {
    let count = this.visibleColumns().length;
    if (this.showSelection) count++;
    if (this.rowActionsTemplate) count++;
    return count;
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalRecords / this.currentState().pageSize))
  );

  rangeStart = computed(() => {
    const state = this.currentState();
    return (state.page - 1) * state.pageSize + 1;
  });

  rangeEnd = computed(() => {
    const state = this.currentState();
    return Math.min(state.page * state.pageSize, this.totalRecords);
  });

  allSelected = computed(() =>
    this.data.length > 0 && this.selectedRows.length === this.data.length
  );

  skeletonRows = Array.from({ length: 5 }, (_, i) => i);

  ngAfterContentInit(): void {
    this.cellTemplates.forEach(t => this.cellTemplateMap.set(t.columnKey, t.templateRef));
    this.cellTemplates.changes.subscribe(() => {
      this.cellTemplateMap.clear();
      this.cellTemplates.forEach(t => this.cellTemplateMap.set(t.columnKey, t.templateRef));
    });

    if (this.headerActions.first) {
      this.headerActionsTemplate = this.headerActions.first.templateRef;
    }
    if (this.rowActions.first) {
      this.rowActionsTemplate = this.rowActions.first.templateRef;
    }
    if (this.filterMenus.first) {
      this.filterMenuTemplate = this.filterMenus.first.templateRef;
    }
  }

  getCellTemplate(key: string): TemplateRef<any> | undefined {
    return this.cellTemplateMap.get(key);
  }

  hasActiveFilters(): boolean {
    return this.filterChips.length > 0 || this.searchValue().length > 0;
  }

  onSearchChange(value: string): void {
    this.searchValue.set(value);
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.updateState({ search: value, page: 1 });
    }, 300);
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const sortField = Array.isArray(event.sortField) ? event.sortField[0] : (event.sortField || '');
    const sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    this.updateState({ sortField, sortOrder: sortOrder as 'asc' | 'desc' });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.updateState({ page });
  }

  onExport(): void {
    exportToCsv(this.columns, this.data, this.entityName);
  }

  toggleSelectAll(selected: boolean): void {
    this.selectedRows = selected ? [...this.data] : [];
  }

  isSelected(row: any): boolean {
    return this.selectedRows.some(r => r[this.dataKey] === row[this.dataKey]);
  }

  toggleRowSelection(row: any): void {
    if (this.isSelected(row)) {
      this.selectedRows = this.selectedRows.filter(r => r[this.dataKey] !== row[this.dataKey]);
    } else {
      this.selectedRows = [...this.selectedRows, row];
    }
  }

  private updateState(partial: Partial<DataTableState>): void {
    this.currentState.update(s => ({ ...s, ...partial }));
    this.stateChange.emit(this.currentState());
  }
}
