import { Component, Input, Output, EventEmitter, inject, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { environment } from '../../../../environments/environment';

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

// API returns plain array with Accept: application/json

@Component({
  selector: 'app-media-library',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, Skeleton],
  template: `
    <p-dialog
      header="Media Library"
      [visible]="visible"
      (visibleChange)="visibleChange.emit($event)"
      [modal]="true"
      [style]="{ width: '70vw', maxWidth: '1000px' }"
      [contentStyle]="{ 'min-height': '400px' }">

      @if (loading()) {
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          @for (i of skeletonItems; track i) {
            <div class="flex flex-col gap-2">
              <p-skeleton height="120px" styleClass="rounded-lg"></p-skeleton>
              <p-skeleton height="1rem" width="80%"></p-skeleton>
            </div>
          }
        </div>
      } @else if (items().length === 0) {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <i class="pi pi-images text-4xl text-surface-300 dark:text-surface-600"></i>
          <p class="text-surface-500 dark:text-surface-400">No media files found</p>
        </div>
      } @else {
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          @for (item of items(); track item.id) {
            <div
              class="group cursor-pointer rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden hover:border-primary hover:ring-2 hover:ring-primary/20 transition-all"
              (click)="selectItem(item)">
              <div class="aspect-square bg-surface-100 dark:bg-surface-800 flex items-center justify-center overflow-hidden">
                @if (isImage(item.mimeType)) {
                  <img
                    [src]="item.url"
                    [alt]="item.filename"
                    class="w-full h-full object-cover" />
                } @else {
                  <i class="pi pi-file text-3xl text-surface-400"></i>
                }
              </div>
              <div class="p-2">
                <p class="text-xs text-surface-700 dark:text-surface-300 truncate" [title]="item.filename">
                  {{ item.filename }}
                </p>
                <p class="text-[10px] text-surface-400 mt-0.5">
                  {{ formatSize(item.size) }}
                </p>
              </div>
            </div>
          }
        </div>
      }
    </p-dialog>
  `,
})
export class MediaLibraryComponent implements OnChanges {
  private http = inject(HttpClient);

  @Input() visible = false;
  @Input() collection = '';
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSelect = new EventEmitter<{ id: string; url: string; filename: string }>();

  items = signal<MediaItem[]>([]);
  loading = signal(false);
  skeletonItems = Array.from({ length: 10 }, (_, i) => i);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.fetchMedia();
    }
  }

  fetchMedia(): void {
    this.loading.set(true);
    const params: Record<string, string> = { itemsPerPage: '30' };
    if (this.collection) {
      params['collection'] = this.collection;
    }

    this.http
      .get<MediaItem[]>(`${environment.apiUrl}/media`, { params })
      .subscribe({
        next: (items) => {
          this.items.set(Array.isArray(items) ? items : []);
          this.loading.set(false);
        },
        error: () => {
          this.items.set([]);
          this.loading.set(false);
        },
      });
  }

  selectItem(item: MediaItem): void {
    this.onSelect.emit({
      id: item.id,
      url: item.url,
      filename: item.filename,
    });
    this.visibleChange.emit(false);
  }

  isImage(mimeType: string): boolean {
    return mimeType?.startsWith('image/') ?? false;
  }

  formatSize(bytes: number): string {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
  }
}
