import { Component, Input, Output, EventEmitter, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-focal-point-picker',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule],
  template: `
    <!-- Trigger Button -->
    <p-button
      icon="pi pi-crosshairs"
      label="Set Focal Point"
      severity="secondary"
      [outlined]="true"
      size="small"
      (onClick)="openEditor()" />

    <span class="text-xs text-surface-500 ml-2">
      {{ focalX.toFixed(1) }}% / {{ focalY.toFixed(1) }}%
    </span>

    <!-- Editor Dialog -->
    <p-dialog
      header="Focal Point Editor"
      [visible]="editorOpen()"
      (visibleChange)="editorOpen.set($event)"
      [modal]="true"
      [style]="{ width: '700px' }"
      [contentStyle]="{ padding: '0', overflow: 'hidden' }">

      <div class="flex flex-col">
        <!-- Image with clickable area -->
        <div
          class="relative cursor-crosshair select-none bg-black"
          #imageContainer
          (click)="onImageClick($event)">
          <img
            [src]="imageUrl"
            class="w-full h-auto max-h-[500px] object-contain"
            draggable="false"
            (load)="onImageLoad()" />

          <!-- Focal point marker -->
          <div
            class="absolute pointer-events-none"
            [style.left.%]="tempX()"
            [style.top.%]="tempY()"
            style="transform: translate(-50%, -50%)">
            <!-- Crosshair -->
            <div class="relative">
              <div class="absolute -top-4 left-1/2 w-px h-9 bg-green-500 -translate-x-1/2"></div>
              <div class="absolute top-1/2 -left-4 w-9 h-px bg-green-500 -translate-y-1/2"></div>
              <div class="w-3 h-3 rounded-full border-2 border-green-500 bg-green-500/30"></div>
            </div>
          </div>

          <!-- Grid lines -->
          <div class="absolute inset-0 pointer-events-none">
            <div class="absolute left-1/3 top-0 w-px h-full bg-white/10"></div>
            <div class="absolute left-2/3 top-0 w-px h-full bg-white/10"></div>
            <div class="absolute top-1/3 left-0 h-px w-full bg-white/10"></div>
            <div class="absolute top-2/3 left-0 h-px w-full bg-white/10"></div>
          </div>
        </div>

        <!-- Controls -->
        <div class="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700">
          <div class="text-sm text-surface-600 dark:text-surface-400">
            Position: <span class="font-mono font-medium">{{ tempX().toFixed(1) }}% / {{ tempY().toFixed(1) }}%</span>
          </div>
          <div class="flex items-center gap-2">
            <p-button
              label="Reset to Center"
              severity="secondary"
              [text]="true"
              size="small"
              (onClick)="resetToCenter()" />
            <p-button
              label="Cancel"
              severity="secondary"
              [outlined]="true"
              size="small"
              (onClick)="editorOpen.set(false)" />
            <p-button
              label="Save"
              icon="pi pi-check"
              size="small"
              (onClick)="saveFocalPoint()" />
          </div>
        </div>
      </div>
    </p-dialog>
  `,
})
export class FocalPointPickerComponent {
  @Input() imageUrl: string = '';
  @Input() focalX: number = 50;
  @Input() focalY: number = 50;
  @Output() focalPointChange = new EventEmitter<{ x: number; y: number }>();

  @ViewChild('imageContainer') imageContainer!: ElementRef<HTMLElement>;

  editorOpen = signal(false);
  tempX = signal(50);
  tempY = signal(50);

  openEditor(): void {
    this.tempX.set(this.focalX);
    this.tempY.set(this.focalY);
    this.editorOpen.set(true);
  }

  onImageLoad(): void {
    // Image loaded, ready for interaction
  }

  onImageClick(event: MouseEvent): void {
    const container = this.imageContainer?.nativeElement;
    if (!container) return;

    const img = container.querySelector('img');
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    this.tempX.set(Math.max(0, Math.min(100, Math.round(x * 10) / 10)));
    this.tempY.set(Math.max(0, Math.min(100, Math.round(y * 10) / 10)));
  }

  resetToCenter(): void {
    this.tempX.set(50);
    this.tempY.set(50);
  }

  saveFocalPoint(): void {
    this.focalX = this.tempX();
    this.focalY = this.tempY();
    this.focalPointChange.emit({ x: this.focalX, y: this.focalY });
    this.editorOpen.set(false);
  }
}
