import { TemplateRef, Directive, Input } from '@angular/core';

export interface DataTableColumn {
  key: string;
  label: string;
  defaultVisible: boolean;
  sortField?: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  frozen?: boolean;
  csvHeader?: string;
  csvValue?: (row: any) => string;
}

export interface FilterChip { key: string; label: string; }
export interface BulkAction { label: string; value: string; icon?: string; }
export interface DataTableState { page: number; pageSize: number; sortField: string; sortOrder: 'asc' | 'desc'; search: string; }
export interface EmptyStateConfig { icon: string; title: string; messageFiltered: string; messageEmpty: string; createLabel?: string; }

@Directive({ selector: '[dtCell]', standalone: true })
export class DataTableCellDirective { @Input('dtCell') columnKey!: string; constructor(public templateRef: TemplateRef<any>) {} }

@Directive({ selector: '[dtHeaderActions]', standalone: true })
export class DataTableHeaderActionsDirective { constructor(public templateRef: TemplateRef<any>) {} }

@Directive({ selector: '[dtRowActions]', standalone: true })
export class DataTableRowActionsDirective { constructor(public templateRef: TemplateRef<any>) {} }

@Directive({ selector: '[dtFilterMenu]', standalone: true })
export class DataTableFilterMenuDirective { constructor(public templateRef: TemplateRef<any>) {} }
