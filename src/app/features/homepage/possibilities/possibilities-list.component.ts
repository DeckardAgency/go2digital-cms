import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
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
import { BlockTypographyCardComponent } from '../../../shared/components/block-typography-card/block-typography-card.component';
import { HomepageService } from '../../../core/services/homepage.service';

@Component({
  selector: 'app-possibilities-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    DataTableWrapperComponent,
    DataTableCellDirective,
    DataTableHeaderActionsDirective,
    DataTableRowActionsDirective,
    MenuModule,
    BlockTypographyCardComponent,
  ],
  providers: [ConfirmationService],
  template: `
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <p-button icon="pi pi-arrow-left" severity="secondary" [text]="true" [rounded]="true" (onClick)="router.navigate(['/homepage'])" />
        <div>
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Possibilities</h1>
          <p class="text-surface-500 dark:text-surface-400 text-sm mt-0.5">Items shown in the possibilities scroll section</p>
        </div>
      </div>
      <p-button label="New Possibility" icon="pi pi-plus" (onClick)="router.navigate(['/homepage/possibilities/new'])" />
    </div>

    <app-block-typography-card blockId="possibilities" />

    <app-data-table-wrapper
      title=""
      entityName="possibilities"
      [columns]="columns"
      [data]="items()"
      [totalRecords]="totalRecords()"
      [loading]="homepageService.isLoading()"
      (stateChange)="onStateChange($event)"
      (rowClick)="onRowClick($event)"
      (refresh)="loadItems()">

      <ng-template dtCell="title" let-row>
        <span class="font-medium text-surface-900 dark:text-surface-100">
          {{ row.translations?.hr?.title || '(no title)' }}
        </span>
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
export class PossibilitiesListComponent implements OnInit {
  readonly homepageService = inject(HomepageService);
  readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  items = signal<any[]>([]);
  totalRecords = signal(0);

  currentRow: any = null;
  rowMenuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-pencil',
      command: () => this.router.navigate(['/homepage/possibilities', this.currentRow?.id])
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      styleClass: 'text-red-500',
      command: () => this.confirmDelete(this.currentRow)
    }
  ];

  columns: DataTableColumn[] = [
    { key: 'title', label: 'Title', defaultVisible: true },
    { key: 'sortOrder', label: 'Sort Order', defaultVisible: true, width: '110px' },
  ];

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.homepageService.getPossibilities().subscribe({
      next: (items) => {
        this.items.set(items);
        this.totalRecords.set(items.length);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load possibilities' });
      },
    });
  }

  onStateChange(state: DataTableState): void {
    this.loadItems();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/homepage/possibilities', row.id]);
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
        this.homepageService.deletePossibility(item.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Possibility deleted successfully' });
            this.loadItems();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete possibility' });
          },
        });
      },
    });
  }
}
