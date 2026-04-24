import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
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
import { HomepageService } from '../../../core/services/homepage.service';

@Component({
  selector: 'app-why-card-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    ConfirmDialogModule,
    DataTableWrapperComponent,
    DataTableCellDirective,
    DataTableHeaderActionsDirective,
    DataTableRowActionsDirective,
    MenuModule,
  ],
  providers: [ConfirmationService],
  template: `
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <p-button icon="pi pi-arrow-left" severity="secondary" [text]="true" [rounded]="true" (onClick)="router.navigate(['/homepage'])" />
        <div>
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Why Cards</h1>
          <p class="text-surface-500 dark:text-surface-400 text-sm mt-0.5">3 info cards in the Why Go2Digital section — Section #3</p>
        </div>
      </div>
      <p-button label="New Card" icon="pi pi-plus" (onClick)="router.navigate(['/homepage/why-cards/new'])" />
    </div>

    <div class="bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded-xl p-4 mb-6 flex items-center gap-3">
      <i class="pi pi-info-circle text-primary-500"></i>
      <div class="flex-1 text-sm text-surface-600 dark:text-surface-300">
        Typography for slide numbers, titles, and body text is managed on the
        <a routerLink="/homepage/why-section" class="text-primary-600 hover:underline font-medium">Why Section editor</a>
        — all cards share the section's typography settings.
      </div>
    </div>

    <app-data-table-wrapper
      title=""
      entityName="why cards"
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
export class WhyCardListComponent implements OnInit {
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
      command: () => this.router.navigate(['/homepage/why-cards', this.currentRow?.id])
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
    { key: 'icon', label: 'Icon', defaultVisible: true, width: '120px' },
    { key: 'sortOrder', label: 'Sort Order', defaultVisible: true, width: '110px' },
  ];

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.homepageService.getWhyCards().subscribe({
      next: (items) => {
        this.items.set(items);
        this.totalRecords.set(items.length);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load why cards' });
      },
    });
  }

  onStateChange(state: DataTableState): void {
    this.loadItems();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/homepage/why-cards', row.id]);
  }

  setCurrentRow(row: any): void {
    this.currentRow = row;
  }

  confirmDelete(item: any): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${item.translations?.hr?.title || 'this card'}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.homepageService.deleteWhyCard(item.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Why card deleted successfully' });
            this.loadItems();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete why card' });
          },
        });
      },
    });
  }
}
