import { Component, inject, signal, computed, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { DrawerModule } from 'primeng/drawer';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { ConfirmationService, MessageService } from 'primeng/api';

import { MediaService, MediaItem } from '../../core/services/media.service';

@Component({
  selector: 'app-media-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, ConfirmDialogModule,
    SelectModule, TooltipModule, DrawerModule, TagModule,
    InputTextModule, ProgressBarModule,
  ],
  providers: [ConfirmationService],
  template: `
    <div class="space-y-6">
      <!-- Header (outside card, like DataTableWrapper) -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Media Library</h1>
          <p class="text-surface-500 dark:text-surface-400 mt-1">{{ media().length }} files · {{ totalSize() }}</p>
        </div>
        <div class="flex items-center gap-2">
          <p-button label="Upload" icon="pi pi-upload" [loading]="uploading()" (onClick)="fileInput.click()" />
        </div>
        <input #fileInput type="file" class="hidden" accept="image/*,video/*,application/pdf" multiple (change)="onFilesSelected($event)" />
      </div>

      <!-- Card container -->
      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">

        <!-- Toolbar (matching DataTableWrapper toolbar) -->
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-3 border-b border-surface-200 dark:border-surface-700">

          <!-- Left: Type pills + filter chips -->
          <div class="flex items-center gap-2 flex-wrap">
            <div class="flex items-center gap-1 bg-surface-100 dark:bg-surface-800 rounded-lg p-0.5">
              @for (opt of typeOptions; track opt.value) {
                <button type="button"
                  class="px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                  [class]="filterType === opt.value
                    ? 'bg-surface-0 dark:bg-surface-700 text-surface-900 dark:text-surface-0 shadow-sm'
                    : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'"
                  (click)="filterType = opt.value; applyFilters()">
                  {{ opt.label }} ({{ opt.count }})
                </button>
              }
            </div>

            @if (selectedCollection) {
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 border border-surface-200 dark:border-surface-700">
                {{ selectedCollection }}
                <i class="pi pi-times text-[10px] cursor-pointer hover:text-red-500" (click)="selectedCollection = null; loadMedia()"></i>
              </span>
            }
          </div>

          <!-- Right: Search, Collection, View, Refresh -->
          <div class="flex items-center gap-2">
            <input pInputText [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()" placeholder="Search..." class="w-48 lg:w-56 text-sm" />

            <p-select
              [options]="collectionOptions"
              [(ngModel)]="selectedCollection"
              optionLabel="label"
              optionValue="value"
              placeholder="Collection"
              [showClear]="true"
              class="w-40"
              (onChange)="loadMedia()" />

            <!-- View toggle -->
            <div class="flex items-center gap-0.5 bg-surface-100 dark:bg-surface-800 rounded-lg p-0.5">
              <button type="button" class="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
                [class]="viewMode === 'grid' ? 'bg-surface-0 dark:bg-surface-700 shadow-sm text-surface-900 dark:text-surface-0' : 'text-surface-400'"
                (click)="viewMode = 'grid'" pTooltip="Grid view" tooltipPosition="bottom">
                <i class="pi pi-th-large text-sm"></i>
              </button>
              <button type="button" class="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
                [class]="viewMode === 'list' ? 'bg-surface-0 dark:bg-surface-700 shadow-sm text-surface-900 dark:text-surface-0' : 'text-surface-400'"
                (click)="viewMode = 'list'" pTooltip="List view" tooltipPosition="bottom">
                <i class="pi pi-list text-sm"></i>
              </button>
            </div>

            <div class="w-px h-6 bg-surface-200 dark:bg-surface-700"></div>

            <p-button icon="pi pi-refresh" [text]="true" [rounded]="true" severity="secondary" pTooltip="Refresh" tooltipPosition="bottom" (onClick)="loadMedia()" />
          </div>
        </div>

        <!-- Upload progress -->
        @if (uploading()) {
          <div class="flex items-center gap-3 p-3 border-b border-surface-200 dark:border-surface-700 bg-primary-50 dark:bg-primary-900/10">
            <i class="pi pi-spin pi-spinner text-primary"></i>
            <span class="text-sm text-surface-700 dark:text-surface-300">Uploading {{ uploadQueue() }} file(s)...</span>
          </div>
        }

        <!-- Content area -->
        @if (mediaService.isLoading() && media().length === 0) {
          <!-- Loading skeleton -->
          <div class="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            @for (i of [1,2,3,4,5,6,7,8,9,10,11,12]; track i) {
              <div class="bg-surface-100 dark:bg-surface-800 rounded-lg aspect-square animate-pulse"></div>
            }
          </div>
        } @else if (filteredMedia().length === 0) {
          <!-- Empty state -->
          <div class="flex flex-col items-center justify-center py-20 text-surface-400">
            <i class="pi pi-images text-5xl mb-4"></i>
            @if (media().length === 0) {
              <p class="text-lg">No media files yet</p>
              <p class="text-sm mt-1">Drag & drop files here or click Upload</p>
            } @else {
              <p class="text-lg">No files match your filters</p>
            }
          </div>
        } @else if (viewMode === 'grid') {
          <!-- Grid View -->
          <div class="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            @for (item of filteredMedia(); track item.id) {
              <div class="group relative rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary-300 dark:hover:ring-primary-700 transition-all"
                (click)="openDetail(item)">
                <div class="aspect-square bg-surface-100 dark:bg-surface-800 flex items-center justify-center overflow-hidden relative">
                  @if (isImage(item)) {
                    <img [src]="mediaService.getMediaUrl(item.path)" [alt]="item.originalFilename" class="w-full h-full object-cover" loading="lazy" />
                  } @else if (isVideo(item)) {
                    <video [src]="mediaService.getMediaUrl(item.path)" class="w-full h-full object-cover" muted preload="metadata"></video>
                    <div class="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div class="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                        <i class="pi pi-play text-white text-sm ml-0.5"></i>
                      </div>
                    </div>
                  } @else {
                    <div class="flex flex-col items-center gap-2">
                      <i class="pi pi-file-pdf text-4xl text-red-400"></i>
                      <span class="text-xs text-surface-400 uppercase font-medium">{{ getExtension(item) }}</span>
                    </div>
                  }
                  @if (isVideo(item)) {
                    <div class="absolute top-2 left-2">
                      <span class="text-[10px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded">VIDEO</span>
                    </div>
                  }
                  <!-- Hover info -->
                  <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p class="text-[11px] text-white truncate">{{ item.originalFilename }}</p>
                    <p class="text-[10px] text-white/70">{{ formatFileSize(item.size) }}</p>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <!-- List View -->
          <div class="divide-y divide-surface-100 dark:divide-surface-800">
            @for (item of filteredMedia(); track item.id) {
              <div class="flex items-center gap-4 px-4 py-3 hover:bg-surface-50 dark:hover:bg-surface-800 cursor-pointer transition-colors"
                (click)="openDetail(item)">
                <div class="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                  @if (isImage(item)) {
                    <img [src]="mediaService.getMediaUrl(item.path)" class="w-full h-full object-cover" loading="lazy" />
                  } @else if (isVideo(item)) {
                    <i class="pi pi-video text-lg text-purple-400"></i>
                  } @else {
                    <i class="pi pi-file text-lg text-surface-400"></i>
                  }
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-surface-900 dark:text-surface-0 truncate">{{ item.originalFilename }}</p>
                  <p class="text-xs text-surface-400">{{ item.collection }} · {{ item.createdAt | date:'MMM d, y' }}</p>
                </div>
                <div class="flex items-center gap-4 flex-shrink-0">
                  @if (isImage(item) && item.width) {
                    <span class="text-xs text-surface-400 hidden md:inline">{{ item.width }}×{{ item.height }}</span>
                  }
                  <span class="text-xs text-surface-500 font-medium">{{ formatFileSize(item.size) }}</span>
                  <p-tag [value]="getTypeLabel(item)" [severity]="getTypeSeverity(item)" />
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
    <p-drawer [(visible)]="detailVisible" header="Media Details" position="right" [style]="{ width: '520px' }">
      @if (selectedItem()) {
        <div class="flex flex-col gap-5">
          <!-- Preview -->
          <div class="rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
            @if (isImage(selectedItem()!)) {
              <img [src]="mediaService.getMediaUrl(selectedItem()!.path)" [alt]="selectedItem()!.originalFilename" class="w-full" />
            } @else if (isVideo(selectedItem()!)) {
              <video [src]="mediaService.getMediaUrl(selectedItem()!.path)" controls class="w-full" style="max-height: 320px;"></video>
            } @else {
              <div class="flex flex-col items-center justify-center py-12">
                <i class="pi pi-file text-5xl text-surface-400 mb-2"></i>
                <span class="text-sm text-surface-400">{{ getExtension(selectedItem()!) }}</span>
              </div>
            }
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <p-button label="Download" icon="pi pi-download" [outlined]="true" size="small" class="flex-1" (onClick)="downloadItem(selectedItem()!)" />
            <p-button label="Copy URL" icon="pi pi-link" [outlined]="true" size="small" severity="secondary" class="flex-1" (onClick)="copyUrl(selectedItem()!)" />
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
                <span class="text-xs text-surface-400 block">Collection</span>
                <p-tag [value]="selectedItem()!.collection" severity="info" />
              </div>
              @if (isImage(selectedItem()!) && selectedItem()!.width) {
                <div>
                  <span class="text-xs text-surface-400 block">Dimensions</span>
                  <span class="font-medium text-surface-900 dark:text-surface-0">{{ selectedItem()!.width }} × {{ selectedItem()!.height }}px</span>
                </div>
              }
              @if (selectedItem()!.duration) {
                <div>
                  <span class="text-xs text-surface-400 block">Duration</span>
                  <span class="font-medium text-surface-900 dark:text-surface-0">{{ formatDuration(selectedItem()!.duration!) }}s</span>
                </div>
              }
              @if (selectedItem()!.createdAt) {
                <div>
                  <span class="text-xs text-surface-400 block">Uploaded</span>
                  <span class="font-medium text-surface-900 dark:text-surface-0">{{ selectedItem()!.createdAt | date:'MMM d, y HH:mm' }}</span>
                </div>
              }
            </div>
          </div>

          <!-- URL -->
          <div class="flex flex-col gap-2">
            <label class="text-xs text-surface-400">Public URL</label>
            <div class="flex gap-2">
              <input pInputText class="w-full font-mono text-xs" [value]="mediaService.getMediaUrl(selectedItem()!.path)" readonly />
              <p-button icon="pi pi-copy" [outlined]="true" size="small" severity="secondary" (onClick)="copyUrl(selectedItem()!)" />
            </div>
          </div>
        </div>
      }
    </p-drawer>

    <p-confirmDialog />
  `,
})
export class MediaPageComponent implements OnInit {
  readonly mediaService = inject(MediaService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  media = signal<MediaItem[]>([]);
  selectedCollection: string | null = null;
  searchQuery = '';
  filterType = 'all';
  viewMode: 'grid' | 'list' = 'grid';
  isDragging = signal(false);
  uploading = signal(false);
  uploadQueue = signal(0);

  // Detail drawer
  detailVisible = false;
  selectedItem = signal<MediaItem | null>(null);

  collectionOptions = [
    { label: 'Blog', value: 'blog' },
    { label: 'Labs', value: 'labs' },
    { label: 'ESG', value: 'esg' },
    { label: 'Team', value: 'team' },
    { label: 'Homepage', value: 'homepage' },
    { label: 'General', value: 'general' },
  ];

  get typeOptions() {
    const all = this.media();
    const images = all.filter(i => this.isImage(i)).length;
    const videos = all.filter(i => this.isVideo(i)).length;
    const other = all.length - images - videos;
    return [
      { label: 'All', value: 'all', count: all.length },
      { label: 'Images', value: 'image', count: images },
      { label: 'Videos', value: 'video', count: videos },
      { label: 'Other', value: 'other', count: other },
    ];
  }

  totalSize(): string {
    const bytes = this.media().reduce((sum, i) => sum + (i.size || 0), 0);
    return this.formatFileSize(bytes);
  }

  filteredMedia(): MediaItem[] {
    let result = this.media();

    if (this.filterType === 'image') result = result.filter(i => this.isImage(i));
    else if (this.filterType === 'video') result = result.filter(i => this.isVideo(i));
    else if (this.filterType === 'other') result = result.filter(i => !this.isImage(i) && !this.isVideo(i));

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(i => i.originalFilename.toLowerCase().includes(q));
    }

    return result;
  }

  ngOnInit(): void {
    this.loadMedia();
  }

  @HostListener('window:dragenter', ['$event'])
  onDragEnter(e: DragEvent): void {
    if (e.dataTransfer?.types?.includes('Files')) {
      this.isDragging.set(true);
    }
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragging.set(false);
    const files = e.dataTransfer?.files;
    if (files) this.uploadFiles(Array.from(files));
  }

  loadMedia(): void {
    this.mediaService.getMedia(this.selectedCollection || undefined).subscribe({
      next: (items) => this.media.set(items),
      error: () => this.messageService.add({ severity: 'error', summary: 'Failed to load media' }),
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
    const collection = this.selectedCollection || 'general';
    this.uploading.set(true);
    this.uploadQueue.set(files.length);
    let completed = 0;

    for (const file of files) {
      this.mediaService.uploadMedia(file, collection).subscribe({
        next: () => {
          completed++;
          this.uploadQueue.set(files.length - completed);
          if (completed === files.length) {
            this.uploading.set(false);
            this.messageService.add({ severity: 'success', summary: `${files.length} file(s) uploaded` });
            this.loadMedia();
          }
        },
        error: () => {
          completed++;
          if (completed === files.length) {
            this.uploading.set(false);
            this.loadMedia();
          }
          this.messageService.add({ severity: 'error', summary: 'Failed to upload ' + file.name });
        },
      });
    }
  }

  applyFilters(): void {
    // triggers filteredMedia() recompute
  }

  openDetail(item: MediaItem): void {
    this.selectedItem.set(item);
    this.detailVisible = true;
  }

  downloadItem(item: MediaItem): void {
    const url = this.mediaService.getMediaUrl(item.path);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.originalFilename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  copyUrl(item: MediaItem): void {
    navigator.clipboard.writeText(this.mediaService.getMediaUrl(item.path));
    this.messageService.add({ severity: 'info', summary: 'URL copied to clipboard' });
  }

  confirmDelete(item: MediaItem): void {
    this.confirmationService.confirm({
      message: `Delete "${item.originalFilename}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.mediaService.deleteMedia(item.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted' });
            this.detailVisible = false;
            this.loadMedia();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Failed to delete' }),
        });
      },
    });
  }

  // ─── Helpers ───────────────────────────────────────────

  isImage(item: MediaItem): boolean { return item.mimeType?.startsWith('image/'); }
  isVideo(item: MediaItem): boolean { return item.mimeType?.startsWith('video/'); }

  getExtension(item: MediaItem): string {
    return item.originalFilename?.split('.').pop()?.toUpperCase() || '';
  }

  getTypeLabel(item: MediaItem): string {
    if (this.isImage(item)) return 'Image';
    if (this.isVideo(item)) return 'Video';
    return this.getExtension(item);
  }

  getTypeSeverity(item: MediaItem): 'success' | 'info' | 'warn' {
    if (this.isImage(item)) return 'success';
    if (this.isVideo(item)) return 'info';
    return 'warn';
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}`;
  }
}
