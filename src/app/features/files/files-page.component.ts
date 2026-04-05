import { Component, inject, signal, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DrawerModule } from 'primeng/drawer';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

import { FileService, FileItem } from '../../core/services/file.service';

@Component({
  selector: 'app-files-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, ConfirmDialogModule,
    SelectModule, InputTextModule, TagModule, DrawerModule, TooltipModule,
  ],
  providers: [ConfirmationService],
  template: `
    <div class="space-y-6">
      <!-- Header (outside card) -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Files</h1>
          <p class="text-surface-500 dark:text-surface-400 mt-1">{{ files().length }} files · {{ totalSize() }}</p>
        </div>
        <div class="flex items-center gap-2">
          <p-button label="Upload" icon="pi pi-upload" [loading]="uploading()" (onClick)="fileInput.click()" />
        </div>
        <input #fileInput type="file" class="hidden" multiple (change)="onFilesSelected($event)" />
      </div>

      <!-- Card container -->
      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">

        <!-- Toolbar -->
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-3 border-b border-surface-200 dark:border-surface-700">
          <!-- Left: Category filter chips -->
          <div class="flex items-center gap-2 flex-wrap">
            @if (selectedCategory) {
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 border border-surface-200 dark:border-surface-700">
                {{ selectedCategory }}
                <i class="pi pi-times text-[10px] cursor-pointer hover:text-red-500" (click)="selectedCategory = null; loadFiles()"></i>
              </span>
            }
          </div>

          <!-- Right: Search, Category, Refresh -->
          <div class="flex items-center gap-2">
            <input pInputText [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()" placeholder="Search..." class="w-48 lg:w-56 text-sm" />

            <p-select
              [options]="categoryOptions"
              [(ngModel)]="selectedCategory"
              optionLabel="label"
              optionValue="value"
              placeholder="Category"
              [showClear]="true"
              class="w-40"
              (onChange)="loadFiles()" />

            <div class="w-px h-6 bg-surface-200 dark:bg-surface-700"></div>

            <p-button icon="pi pi-refresh" [text]="true" [rounded]="true" severity="secondary" pTooltip="Refresh" tooltipPosition="bottom" (onClick)="loadFiles()" />
          </div>
        </div>

        <!-- Upload progress -->
        @if (uploading()) {
          <div class="flex items-center gap-3 p-3 border-b border-surface-200 dark:border-surface-700 bg-primary-50 dark:bg-primary-900/10">
            <i class="pi pi-spin pi-spinner text-primary"></i>
            <span class="text-sm text-surface-700 dark:text-surface-300">Uploading {{ uploadQueue() }} file(s)...</span>
          </div>
        }

        <!-- Content -->
        @if (fileService.isLoading() && files().length === 0) {
          <div class="p-4 space-y-3">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="h-12 bg-surface-100 dark:bg-surface-800 rounded-lg animate-pulse"></div>
            }
          </div>
        } @else if (filteredFiles().length === 0) {
          <div class="flex flex-col items-center justify-center py-20 text-surface-400">
            <i class="pi pi-file text-5xl mb-4"></i>
            @if (files().length === 0) {
              <p class="text-lg">No files yet</p>
              <p class="text-sm mt-1">Drag & drop files here or click Upload</p>
            } @else {
              <p class="text-lg">No files match your filters</p>
            }
          </div>
        } @else {
          <div class="divide-y divide-surface-100 dark:divide-surface-800">
            @for (item of filteredFiles(); track item.id) {
              <div class="flex items-center gap-4 px-4 py-3 hover:bg-surface-50 dark:hover:bg-surface-800 cursor-pointer transition-colors"
                (click)="openDetail(item)">
                <!-- Icon -->
                <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  [class]="getIconBg(item)">
                  <i [class]="getFileIcon(item)" class="text-lg"></i>
                </div>
                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-surface-900 dark:text-surface-0 truncate">{{ item.originalFilename }}</p>
                  <p class="text-xs text-surface-400">{{ item.category }} @if (item.description) { · {{ item.description }} }</p>
                </div>
                <!-- Meta -->
                <div class="flex items-center gap-3 flex-shrink-0">
                  <span class="text-xs text-surface-500 font-medium">{{ formatFileSize(item.size) }}</span>
                  <p-tag [value]="getExtension(item)" [severity]="getExtSeverity(item)" />
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Drag & Drop Zone -->
      @if (isDragging()) {
        <div class="fixed inset-0 bg-primary/5 border-2 border-dashed border-primary rounded-xl z-50 flex items-center justify-center"
          (drop)="onDrop($event)" (dragover)="$event.preventDefault()" (dragleave)="isDragging.set(false)">
          <div class="text-center">
            <i class="pi pi-cloud-upload text-5xl text-primary mb-3"></i>
            <p class="text-lg font-medium text-primary">Drop files here to upload</p>
          </div>
        </div>
      }
    </div>

    <!-- Detail Drawer -->
    <p-drawer [(visible)]="detailVisible" header="File Details" position="right" [style]="{ width: '480px' }">
      @if (selectedItem()) {
        <div class="flex flex-col gap-5">
          <!-- File icon -->
          <div class="flex items-center justify-center py-8 bg-surface-50 dark:bg-surface-800 rounded-xl">
            <div class="text-center">
              <i [class]="getFileIcon(selectedItem()!)" class="text-5xl mb-2 block" [style.color]="getIconColor(selectedItem()!)"></i>
              <span class="text-sm text-surface-400 uppercase font-medium">{{ getExtension(selectedItem()!) }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <a [href]="fileService.getDownloadUrl(selectedItem()!.id)" target="_blank" class="flex-1">
              <p-button label="Download" icon="pi pi-download" [outlined]="true" size="small" styleClass="w-full" />
            </a>
            <p-button icon="pi pi-trash" [outlined]="true" size="small" severity="danger" (onClick)="confirmDelete(selectedItem()!)" />
          </div>

          <!-- Info -->
          <div class="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
            <div class="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
              <div>
                <span class="text-xs text-surface-400 block">Filename</span>
                <span class="font-medium text-surface-900 dark:text-surface-0 break-all">{{ selectedItem()!.originalFilename }}</span>
              </div>
              <div>
                <span class="text-xs text-surface-400 block">Type</span>
                <span class="font-medium text-surface-900 dark:text-surface-0">{{ selectedItem()!.mimeType }}</span>
              </div>
              <div>
                <span class="text-xs text-surface-400 block">Size</span>
                <span class="font-medium text-surface-900 dark:text-surface-0">{{ formatFileSize(selectedItem()!.size) }}</span>
              </div>
              <div>
                <span class="text-xs text-surface-400 block">Category</span>
                <p-tag [value]="selectedItem()!.category" severity="info" />
              </div>
              @if (selectedItem()!.description) {
                <div class="col-span-2">
                  <span class="text-xs text-surface-400 block">Description</span>
                  <span class="font-medium text-surface-900 dark:text-surface-0">{{ selectedItem()!.description }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </p-drawer>

    <p-confirmDialog />
  `,
})
export class FilesPageComponent implements OnInit {
  readonly fileService = inject(FileService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  files = signal<FileItem[]>([]);
  selectedCategory: string | null = null;
  searchQuery = '';
  isDragging = signal(false);
  uploading = signal(false);
  uploadQueue = signal(0);

  // Detail drawer
  detailVisible = false;
  selectedItem = signal<FileItem | null>(null);

  categoryOptions = [
    { label: 'ESG Report', value: 'esg-report' },
    { label: 'Specs', value: 'specs' },
    { label: 'General', value: 'general' },
  ];

  ngOnInit(): void {
    this.loadFiles();
  }

  totalSize(): string {
    const bytes = this.files().reduce((sum, f) => sum + (f.size || 0), 0);
    return this.formatFileSize(bytes);
  }

  filteredFiles(): FileItem[] {
    let result = this.files();
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(f => f.originalFilename.toLowerCase().includes(q) || f.description?.toLowerCase().includes(q));
    }
    return result;
  }

  @HostListener('window:dragenter', ['$event'])
  onDragEnter(e: DragEvent): void {
    if (e.dataTransfer?.types?.includes('Files')) this.isDragging.set(true);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragging.set(false);
    const files = e.dataTransfer?.files;
    if (files) this.uploadFiles(Array.from(files));
  }

  loadFiles(): void {
    this.fileService.getFiles(this.selectedCategory || undefined).subscribe({
      next: (items) => this.files.set(items),
      error: () => this.messageService.add({ severity: 'error', summary: 'Failed to load files' }),
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files) this.uploadFiles(Array.from(files));
    input.value = '';
  }

  private uploadFiles(files: File[]): void {
    if (!files.length) return;
    const category = this.selectedCategory || 'general';
    this.uploading.set(true);
    this.uploadQueue.set(files.length);
    let completed = 0;

    for (const file of files) {
      this.fileService.uploadFile(file, category).subscribe({
        next: () => {
          completed++;
          this.uploadQueue.set(files.length - completed);
          if (completed === files.length) {
            this.uploading.set(false);
            this.messageService.add({ severity: 'success', summary: `${files.length} file(s) uploaded` });
            this.loadFiles();
          }
        },
        error: () => {
          completed++;
          if (completed === files.length) { this.uploading.set(false); this.loadFiles(); }
          this.messageService.add({ severity: 'error', summary: 'Failed to upload ' + file.name });
        },
      });
    }
  }

  applyFilters(): void {}

  openDetail(item: FileItem): void {
    this.selectedItem.set(item);
    this.detailVisible = true;
  }

  confirmDelete(item: FileItem): void {
    this.confirmationService.confirm({
      message: `Delete "${item.originalFilename}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.fileService.deleteFile(item.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted' });
            this.detailVisible = false;
            this.loadFiles();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Failed to delete' }),
        });
      },
    });
  }

  // ─── Helpers ───────────────────────────────────────────

  getExtension(item: FileItem): string {
    return item.originalFilename?.split('.').pop()?.toUpperCase() || '';
  }

  getFileIcon(item: FileItem): string {
    const ext = this.getExtension(item).toLowerCase();
    if (['pdf'].includes(ext)) return 'pi pi-file-pdf text-red-500';
    if (['doc', 'docx'].includes(ext)) return 'pi pi-file-word text-blue-500';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'pi pi-file-excel text-green-500';
    if (['zip', 'rar', '7z'].includes(ext)) return 'pi pi-box text-yellow-600';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'pi pi-image text-purple-500';
    return 'pi pi-file text-surface-400';
  }

  getIconBg(item: FileItem): string {
    const ext = this.getExtension(item).toLowerCase();
    if (['pdf'].includes(ext)) return 'bg-red-50 dark:bg-red-900/20';
    if (['doc', 'docx'].includes(ext)) return 'bg-blue-50 dark:bg-blue-900/20';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'bg-green-50 dark:bg-green-900/20';
    if (['zip', 'rar', '7z'].includes(ext)) return 'bg-yellow-50 dark:bg-yellow-900/20';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'bg-purple-50 dark:bg-purple-900/20';
    return 'bg-surface-100 dark:bg-surface-800';
  }

  getIconColor(item: FileItem): string {
    const ext = this.getExtension(item).toLowerCase();
    if (['pdf'].includes(ext)) return '#ef4444';
    if (['doc', 'docx'].includes(ext)) return '#3b82f6';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return '#22c55e';
    return '#94a3b8';
  }

  getExtSeverity(item: FileItem): 'danger' | 'info' | 'success' | 'warn' | 'secondary' {
    const ext = this.getExtension(item).toLowerCase();
    if (['pdf'].includes(ext)) return 'danger';
    if (['doc', 'docx'].includes(ext)) return 'info';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'success';
    if (['zip', 'rar', '7z'].includes(ext)) return 'warn';
    return 'secondary';
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
