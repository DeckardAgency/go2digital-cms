import { Component, inject, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

import { MediaService, MediaItem } from '../../core/services/media.service';

@Component({
  selector: 'app-media-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ConfirmDialogModule,
    SelectModule,
    TooltipModule,
  ],
  providers: [ConfirmationService],
  template: `
    <div>
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Media Library</h1>
        <p-button
          label="Upload"
          icon="pi pi-upload"
          [loading]="mediaService.isLoading()"
          (onClick)="fileInput.click()" />
        <input
          #fileInput
          type="file"
          class="hidden"
          accept="image/*,video/*,application/pdf"
          (change)="onFileSelected($event)" />
      </div>

      <!-- Filter Bar -->
      <div class="flex items-center gap-4 mb-6">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Collection</label>
          <p-select
            [options]="collectionOptions"
            [(ngModel)]="selectedCollection"
            optionLabel="label"
            optionValue="value"
            placeholder="All collections"
            [showClear]="true"
            class="w-48"
            (onChange)="loadMedia()" />
        </div>
      </div>

      <!-- Grid -->
      @if (mediaService.isLoading() && media().length === 0) {
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <div class="bg-surface-100 dark:bg-surface-800 rounded-xl aspect-square animate-pulse"></div>
          }
        </div>
      } @else if (media().length === 0) {
        <div class="flex flex-col items-center justify-center py-20 text-surface-400">
          <i class="pi pi-images text-5xl mb-4"></i>
          <p class="text-lg">No media files found</p>
          <p class="text-sm mt-1">Upload files to get started</p>
        </div>
      } @else {
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          @for (item of media(); track item.id) {
            <div class="group relative bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
              <!-- Image Preview -->
              <div class="aspect-square bg-surface-100 dark:bg-surface-800 flex items-center justify-center overflow-hidden">
                @if (item.mimeType.startsWith('image/')) {
                  <img
                    [src]="mediaService.getMediaUrl(item.path)"
                    [alt]="item.originalFilename"
                    class="w-full h-full object-cover" />
                } @else {
                  <i class="pi pi-file text-4xl text-surface-400"></i>
                }
              </div>

              <!-- Info -->
              <div class="p-3">
                <p class="text-sm font-medium text-surface-900 dark:text-surface-100 truncate" [pTooltip]="item.originalFilename">
                  {{ item.originalFilename }}
                </p>
                <div class="flex items-center justify-between mt-1">
                  <span class="text-xs text-surface-500">{{ formatFileSize(item.size) }}</span>
                  <span class="text-xs text-surface-400">{{ item.mimeType }}</span>
                </div>
              </div>

              <!-- Hover Overlay -->
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p-button
                  icon="pi pi-trash"
                  severity="danger"
                  [rounded]="true"
                  pTooltip="Delete"
                  (onClick)="confirmDelete(item)" />
              </div>
            </div>
          }
        </div>
      }
    </div>

    <p-confirmDialog />
  `,
})
export class MediaPageComponent implements OnInit {
  readonly mediaService = inject(MediaService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  media = signal<MediaItem[]>([]);
  selectedCollection: string | null = null;

  collectionOptions = [
    { label: 'Blog', value: 'blog' },
    { label: 'Labs', value: 'labs' },
    { label: 'ESG', value: 'esg' },
    { label: 'Team', value: 'team' },
    { label: 'General', value: 'general' },
  ];

  ngOnInit(): void {
    this.loadMedia();
  }

  loadMedia(): void {
    this.mediaService.getMedia(this.selectedCollection || undefined).subscribe({
      next: (items) => this.media.set(items),
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load media' });
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const collection = this.selectedCollection || 'general';
    this.mediaService.uploadMedia(file, collection).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Uploaded', detail: 'File uploaded successfully' });
        this.loadMedia();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to upload file' });
      },
    });

    // Reset input so same file can be re-uploaded
    input.value = '';
  }

  confirmDelete(item: MediaItem): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${item.originalFilename}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.mediaService.deleteMedia(item.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Media deleted successfully' });
            this.loadMedia();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete media' });
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
}
