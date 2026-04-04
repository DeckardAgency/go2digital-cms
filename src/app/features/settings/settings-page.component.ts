import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TableModule } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';

import { SettingsService, Setting } from '../../core/services/settings.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    TableModule,
  ],
  providers: [ConfirmationService],
  template: `
    <div>
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Site Settings</h1>
        <p-button
          label="New Setting"
          icon="pi pi-plus"
          (onClick)="openNewDialog()" />
      </div>

      <!-- Table -->
      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
        <p-table
          [value]="settings()"
          [loading]="settingsService.isLoading()"
          [paginator]="settings().length > 20"
          [rows]="20"
          styleClass="p-datatable-sm"
          selectionMode="single"
          (onRowSelect)="onRowSelect($event)">
          <ng-template #header>
            <tr>
              <th>Key</th>
              <th>Group</th>
              <th>Value</th>
              <th class="w-24">Actions</th>
            </tr>
          </ng-template>
          <ng-template #body let-item>
            <tr (click)="openEditDialog(item)" class="cursor-pointer">
              <td>
                <span class="font-medium text-surface-900 dark:text-surface-100">{{ item.key }}</span>
              </td>
              <td>
                <span class="text-surface-600 dark:text-surface-400">{{ item.group }}</span>
              </td>
              <td>
                <span class="text-surface-600 dark:text-surface-400 font-mono text-xs">
                  {{ truncateJson(item.value) }}
                </span>
              </td>
              <td>
                <p-button
                  icon="pi pi-trash"
                  severity="danger"
                  [text]="true"
                  size="small"
                  (onClick)="confirmDelete($event, item)" />
              </td>
            </tr>
          </ng-template>
          <ng-template #emptymessage>
            <tr>
              <td colspan="4" class="text-center py-8 text-surface-400">
                <i class="pi pi-cog text-3xl mb-2 block"></i>
                No settings found
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Edit/Create Dialog -->
    <p-dialog
      [header]="isEditMode() ? 'Edit Setting' : 'New Setting'"
      [(visible)]="showDialog"
      [modal]="true"
      [style]="{ width: '560px' }">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Key</label>
          <input
            pInputText
            class="w-full"
            [(ngModel)]="dialogKey"
            [readonly]="isEditMode()" />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Group</label>
          <input pInputText class="w-full" [(ngModel)]="dialogGroup" />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Value (JSON)</label>
          <textarea
            pTextarea
            [(ngModel)]="dialogValue"
            rows="6"
            class="w-full font-mono text-sm"></textarea>
          @if (jsonError()) {
            <small class="text-red-500">{{ jsonError() }}</small>
          }
        </div>
      </div>
      <ng-template #footer>
        <div class="flex justify-end gap-2">
          <p-button
            label="Cancel"
            severity="secondary"
            [outlined]="true"
            (onClick)="showDialog = false" />
          <p-button
            label="Save"
            icon="pi pi-check"
            [loading]="settingsService.isLoading()"
            (onClick)="onSave()" />
        </div>
      </ng-template>
    </p-dialog>

    <p-confirmDialog />
  `,
})
export class SettingsPageComponent implements OnInit {
  readonly settingsService = inject(SettingsService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  settings = signal<Setting[]>([]);

  showDialog = false;
  isEditMode = signal(false);
  editId = signal<string | null>(null);
  dialogKey = '';
  dialogGroup = '';
  dialogValue = '';
  jsonError = signal<string | null>(null);

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.settingsService.getSettings().subscribe({
      next: (items) => this.settings.set(items),
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load settings' });
      },
    });
  }

  openNewDialog(): void {
    this.isEditMode.set(false);
    this.editId.set(null);
    this.dialogKey = '';
    this.dialogGroup = '';
    this.dialogValue = '{}';
    this.jsonError.set(null);
    this.showDialog = true;
  }

  openEditDialog(item: Setting): void {
    this.isEditMode.set(true);
    this.editId.set(item.id);
    this.dialogKey = item.key;
    this.dialogGroup = item.group;
    this.dialogValue = JSON.stringify(item.value, null, 2);
    this.jsonError.set(null);
    this.showDialog = true;
  }

  onRowSelect(event: any): void {
    this.openEditDialog(event.data);
  }

  onSave(): void {
    let parsedValue: any;
    try {
      parsedValue = JSON.parse(this.dialogValue);
      this.jsonError.set(null);
    } catch (e) {
      this.jsonError.set('Invalid JSON format');
      return;
    }

    const payload: Partial<Setting> = {
      key: this.dialogKey,
      group: this.dialogGroup,
      value: parsedValue,
    };

    const request$ = this.isEditMode()
      ? this.settingsService.updateSetting(this.editId()!, payload)
      : this.settingsService.createSetting(payload);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode() ? 'Setting updated successfully' : 'Setting created successfully',
        });
        this.showDialog = false;
        this.loadSettings();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save setting' });
      },
    });
  }

  confirmDelete(event: Event, item: Setting): void {
    event.stopPropagation();
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${item.key}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.settingsService.deleteSetting(item.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Setting deleted successfully' });
            this.loadSettings();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete setting' });
          },
        });
      },
    });
  }

  truncateJson(value: any): string {
    const str = JSON.stringify(value);
    return str.length > 80 ? str.substring(0, 80) + '...' : str;
  }
}
