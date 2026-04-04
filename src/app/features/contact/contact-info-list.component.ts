import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';

import {
  DataTableWrapperComponent,
  DataTableHeaderActionsDirective,
  DataTableRowActionsDirective,
  DataTableColumn,
  DataTableState,
} from '../../shared/components/data-table-wrapper';
import { ContactService } from '../../core/services/contact.service';

@Component({
  selector: 'app-contact-info-list',
  standalone: true,
  imports: [
    CommonModule,
    ConfirmDialogModule,
    ButtonModule,
    DataTableWrapperComponent,
    DataTableHeaderActionsDirective,
    DataTableRowActionsDirective,
    MenuModule,
  ],
  providers: [ConfirmationService],
  template: `
    <app-data-table-wrapper
      title="Contact Info"
      entityName="items"
      [columns]="columns"
      [data]="items()"
      [totalRecords]="totalRecords()"
      [loading]="contactService.isLoading()"
      (stateChange)="onStateChange($event)"
      (rowClick)="onRowClick($event)"
      (refresh)="loadItems()">

      <ng-template dtHeaderActions>
        <p-button
          label="New Info"
          icon="pi pi-plus"
          (onClick)="router.navigate(['/contact/info/new'])" />
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
export class ContactInfoListComponent implements OnInit {
  readonly contactService = inject(ContactService);
  readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  currentRow: any = null;
  rowMenuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-pencil',
      command: () => this.router.navigate(['/contact/info', this.currentRow?.id])
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      styleClass: 'text-red-500',
      command: () => this.confirmDelete(this.currentRow)
    }
  ];

  items = signal<any[]>([]);
  totalRecords = signal(0);

  columns: DataTableColumn[] = [
    { key: 'key', label: 'Key', defaultVisible: true },
    { key: 'value', label: 'Value', defaultVisible: true },
    { key: 'href', label: 'Href', defaultVisible: true },
    { key: 'sortOrder', label: 'Sort Order', defaultVisible: true, width: '120px' },
  ];

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.contactService.getContactInfos().subscribe({
      next: (items) => {
        this.items.set(items);
        this.totalRecords.set(items.length);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load contact info' });
      },
    });
  }

  onStateChange(state: DataTableState): void {
    this.loadItems();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/contact/info', row.id]);
  }

  setCurrentRow(row: any): void {
    this.currentRow = row;
  }

  confirmDelete(item: any): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${item.key}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.contactService.deleteContactInfo(item.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Contact info deleted successfully' });
            this.loadItems();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete contact info' });
          },
        });
      },
    });
  }
}
