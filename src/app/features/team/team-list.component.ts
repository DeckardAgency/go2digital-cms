import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';

import {
  DataTableWrapperComponent,
  DataTableCellDirective,
  DataTableHeaderActionsDirective,
  DataTableRowActionsDirective,
  DataTableColumn,
  DataTableState,
} from '../../shared/components/data-table-wrapper';
import { TeamService } from '../../core/services/team.service';

@Component({
  selector: 'app-team-list',
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
    MenuModule,
  ],
  providers: [ConfirmationService],
  template: `
    <app-data-table-wrapper
      title="Team Members"
      entityName="members"
      [columns]="columns"
      [data]="items()"
      [totalRecords]="totalRecords()"
      [loading]="teamService.isLoading()"
      (stateChange)="onStateChange($event)"
      (rowClick)="onRowClick($event)"
      (refresh)="loadItems()">

      <ng-template dtHeaderActions>
        <p-button
          label="New Member"
          icon="pi pi-plus"
          (onClick)="router.navigate(['/team/new'])" />
      </ng-template>

      <ng-template dtCell="position" let-row>
        <span class="font-medium text-surface-900 dark:text-surface-100">
          {{ row.translations?.hr?.position || '(no position)' }}
        </span>
      </ng-template>

      <ng-template dtCell="isActive" let-row>
        <p-tag
          [value]="row.isActive ? 'Active' : 'Inactive'"
          [severity]="row.isActive ? 'success' : 'secondary'" />
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
export class TeamListComponent implements OnInit {
  readonly teamService = inject(TeamService);
  readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  currentRow: any = null;
  rowMenuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-pencil',
      command: () => this.router.navigate(['/team', this.currentRow?.id])
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
    { key: 'name', label: 'Name', defaultVisible: true },
    { key: 'position', label: 'Position', defaultVisible: true },
    { key: 'sortOrder', label: 'Sort Order', defaultVisible: true, width: '120px' },
    { key: 'isActive', label: 'Active', defaultVisible: true, width: '100px' },
  ];

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.teamService.getMembers().subscribe({
      next: (items) => {
        this.items.set(items);
        this.totalRecords.set(items.length);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load team members' });
      },
    });
  }

  onStateChange(state: DataTableState): void {
    this.loadItems();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/team', row.id]);
  }

  setCurrentRow(row: any): void {
    this.currentRow = row;
  }

  confirmDelete(item: any): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${item.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.teamService.deleteMember(item.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Member deleted successfully' });
            this.loadItems();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete member' });
          },
        });
      },
    });
  }
}
