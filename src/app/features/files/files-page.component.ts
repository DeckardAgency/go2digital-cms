import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

import { FileService, FileItem } from '../../core/services/file.service';

@Component({
  selector: 'app-files-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ConfirmDialogModule,
    SelectModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    TableModule,
    TooltipModule,
  ],
  providers: [ConfirmationService],
  template: `
    <div>
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Files</h1>
        <p-button
          label="Upload"
          icon="pi pi-upload"
          (onClick)="showUploadDialog = true" />
      </div>

      <!-- Filter Bar -->
      <div class="flex items-center gap-4 mb-6">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Category</label>
          <p-select
            [options]="categoryOptions"
            [(ngModel)]="selectedCategory"
            optionLabel="label"
            optionValue="value"
            placeholder="All categories"
            [showClear]="true"
            class="w-48"
            (onChange)="loadFiles()" />
        </div>
      </div>

      <!-- Table -->
      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
        <p-table
          [value]="files()"
          [loading]="fileService.isLoading()"
          [paginator]="files().length > 20"
          [rows]="20"
          styleClass="p-datatable-sm">
          <ng-template #header>
            <tr>
              <th>Filename</th>
              <th>Type</th>
              <th>Category</th>
              <th>Size</th>
              <th class="w-32">Actions</th>
            </tr>
          </ng-template>
          <ng-template #body let-item>
            <tr>
              <td>
                <span class="font-medium text-surface-900 dark:text-surface-100">{{ item.originalFilename }}</span>
              </td>
              <td>
                <span class="text-surface-600 dark:text-surface-400">{{ item.mimeType }}</span>
              </td>
              <td>
                <span class="text-surface-600 dark:text-surface-400">{{ item.category }}</span>
              </td>
              <td>
                <span class="text-surface-600 dark:text-surface-400">{{ formatFileSize(item.size) }}</span>
              </td>
              <td>
                <div class="flex items-center gap-1">
                  <a
                    [href]="fileService.getDownloadUrl(item.id)"
                    target="_blank"
                    class="p-button p-button-text p-button-sm p-button-secondary"
                    pTooltip="Download">
                    <i class="pi pi-download"></i>
                  </a>
                  <p-button
                    icon="pi pi-trash"
                    severity="danger"
                    [text]="true"
                    size="small"
                    pTooltip="Delete"
                    (onClick)="confirmDelete(item)" />
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template #emptymessage>
            <tr>
              <td colspan="5" class="text-center py-8 text-surface-400">
                <i class="pi pi-file text-3xl mb-2 block"></i>
                No files found
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Upload Dialog -->
    <p-dialog
      header="Upload File"
      [(visible)]="showUploadDialog"
      [modal]="true"
      [style]="{ width: '480px' }">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-surface-700 dark:text-surface-300">File</label>
          <input
            type="file"
            class="w-full text-sm text-surface-700 dark:text-surface-300"
            (change)="onUploadFileSelected($event)" />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Category</label>
          <p-select
            [options]="categoryOptions"
            [(ngModel)]="uploadCategory"
            optionLabel="label"
            optionValue="value"
            placeholder="Select category"
            class="w-full" />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Description</label>
          <textarea pTextarea [(ngModel)]="uploadDescription" rows="3" class="w-full"></textarea>
        </div>
      </div>
      <ng-template #footer>
        <div class="flex justify-end gap-2">
          <p-button
            label="Cancel"
            severity="secondary"
            [outlined]="true"
            (onClick)="showUploadDialog = false" />
          <p-button
            label="Upload"
            icon="pi pi-upload"
            [loading]="fileService.isLoading()"
            [disabled]="!uploadFile || !uploadCategory"
            (onClick)="onUpload()" />
        </div>
      </ng-template>
    </p-dialog>

    <p-confirmDialog />
  `,
})
export class FilesPageComponent implements OnInit {
  readonly fileService = inject(FileService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  files = signal<FileItem[]>([]);
  selectedCategory: string | null = null;

  showUploadDialog = false;
  uploadFile: File | null = null;
  uploadCategory: string | null = null;
  uploadDescription = '';

  categoryOptions = [
    { label: 'ESG Report', value: 'esg-report' },
    { label: 'Specs', value: 'specs' },
    { label: 'General', value: 'general' },
  ];

  ngOnInit(): void {
    this.loadFiles();
  }

  loadFiles(): void {
    this.fileService.getFiles(this.selectedCategory || undefined).subscribe({
      next: (items) => this.files.set(items),
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load files' });
      },
    });
  }

  onUploadFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.uploadFile = input.files?.[0] || null;
  }

  onUpload(): void {
    if (!this.uploadFile || !this.uploadCategory) return;

    this.fileService.uploadFile(this.uploadFile, this.uploadCategory, this.uploadDescription || undefined).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Uploaded', detail: 'File uploaded successfully' });
        this.showUploadDialog = false;
        this.resetUploadForm();
        this.loadFiles();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to upload file' });
      },
    });
  }

  confirmDelete(item: FileItem): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${item.originalFilename}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.fileService.deleteFile(item.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'File deleted successfully' });
            this.loadFiles();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete file' });
          },
        });
      },
    });
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  private resetUploadForm(): void {
    this.uploadFile = null;
    this.uploadCategory = null;
    this.uploadDescription = '';
  }
}
