import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    @if (currentImageUrl) {
      <!-- Preview -->
      <div class="relative group rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700">
        <img
          [src]="currentImageUrl"
          alt="Current image"
          class="w-full h-48 object-cover" />
        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <p-button
            icon="pi pi-upload"
            severity="secondary"
            [rounded]="true"
            pTooltip="Replace"
            (onClick)="fileInput.click()" />
          <p-button
            icon="pi pi-trash"
            severity="danger"
            [rounded]="true"
            pTooltip="Remove"
            (onClick)="onRemove.emit()" />
        </div>
      </div>
    } @else {
      <!-- Drop Zone -->
      <div
        class="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors"
        [class]="isDragging()
          ? 'border-primary bg-primary/5'
          : 'border-surface-300 dark:border-surface-600 hover:border-primary hover:bg-surface-50 dark:hover:bg-surface-800'"
        (click)="fileInput.click()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)">
        <div class="flex flex-col items-center gap-3">
          <i class="pi pi-cloud-upload text-3xl text-surface-400"></i>
          <div>
            <p class="text-sm font-medium text-surface-700 dark:text-surface-300">
              Click or drag to upload
            </p>
            <p class="text-xs text-surface-500 dark:text-surface-400 mt-1">
              Images only, max 10MB
            </p>
          </div>
        </div>
      </div>
    }

    @if (error()) {
      <p class="text-sm text-red-500 mt-2">{{ error() }}</p>
    }

    <!-- Hidden file input -->
    <input
      #fileInput
      type="file"
      accept="image/*"
      class="hidden"
      (change)="onFileSelected($event)" />
  `,
})
export class ImageUploadComponent {
  @Input() currentImageUrl = '';
  @Output() onUpload = new EventEmitter<File>();
  @Output() onRemove = new EventEmitter<void>();

  isDragging = signal(false);
  error = signal('');

  private readonly MAX_SIZE = 10 * 1024 * 1024; // 10MB

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
      input.value = ''; // reset so same file can be re-selected
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  private processFile(file: File): void {
    this.error.set('');

    if (!file.type.startsWith('image/')) {
      this.error.set('Please select an image file.');
      return;
    }

    if (file.size > this.MAX_SIZE) {
      this.error.set('File size must be under 10MB.');
      return;
    }

    this.onUpload.emit(file);
  }
}
