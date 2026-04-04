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
  DataTableState,
} from '../../shared/components/data-table-wrapper';
import { ContactService } from '../../core/services/contact.service';

@Component({
  selector: 'app-social-link-list',
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
      title="Social Links"
      entityName="links"
      [columns]="columns"
      [data]="items()"
      [totalRecords]="totalRecords()"
      [loading]="contactService.isLoading()"
      (stateChange)="onStateChange($event)"
      (rowClick)="onRowClick($event)"
      (refresh)="loadItems()">

      <ng-template dtHeaderActions>
        <p-button
          label="New Link"
          icon="pi pi-plus"
          (onClick)="router.navigate(['/contact/social/new'])" />
      </ng-template>

      <ng-template dtCell="isActive" let-row>
        <p-tag
          [value]="row.isActive ? 'Active' : 'Inactive'"
          [severity]="row.isActive ? 'success' : 'secondary'" />
      </ng-template>

      <ng-template dtRowActions let-row>
        <div class="flex items-center justify-end gap-1">
          <p-button
            icon="pi pi-pencil"
            severity="secondary"
            [text]="true"
            size="small"
            pTooltip="Edit"
            (onClick)="router.navigate(['/contact/social', row.id])" />
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
export class SocialLinkListComponent implements OnInit {
  readonly contactService = inject(ContactService);
  readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  items = signal<any[]>([]);
  totalRecords = signal(0);

  columns: DataTableColumn[] = [
    { key: 'platform', label: 'Platform', defaultVisible: true },
    { key: 'url', label: 'URL', defaultVisible: true },
    { key: 'sortOrder', label: 'Sort Order', defaultVisible: true, width: '120px' },
    { key: 'isActive', label: 'Active', defaultVisible: true, width: '100px' },
  ];

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.contactService.getSocialLinks().subscribe({
      next: (items) => {
        this.items.set(items);
        this.totalRecords.set(items.length);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load social links' });
      },
    });
  }

  onStateChange(state: DataTableState): void {
    this.loadItems();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/contact/social', row.id]);
  }

  confirmDelete(item: any): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${item.platform}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.contactService.deleteSocialLink(item.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Social link deleted successfully' });
            this.loadItems();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete social link' });
          },
        });
      },
    });
  }
}
