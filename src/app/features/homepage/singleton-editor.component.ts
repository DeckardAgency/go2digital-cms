import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { TranslationEditorComponent } from '../../shared/components/translation-editor/translation-editor.component';
import { ImageUploadComponent } from '../../shared/components/image-upload/image-upload.component';
import { HomepageService } from '../../core/services/homepage.service';
import { environment } from '../../../environments/environment';

export interface SingletonTranslatableField {
  key: string;
  label: string;
  type: 'text' | 'textarea';
}

export interface SingletonNonTranslatableField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'checkbox';
}

@Component({
  selector: 'app-singleton-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    ButtonModule,
    TranslationEditorComponent,
    ImageUploadComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <p-button
            icon="pi pi-arrow-left"
            severity="secondary"
            [text]="true"
            [rounded]="true"
            (onClick)="navigateBack()" />
          <div>
            <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">{{ pageTitle }}</h1>
            @if (subtitle) {
              <p class="text-surface-500 dark:text-surface-400 text-sm mt-0.5">{{ subtitle }}</p>
            }
          </div>
        </div>
        <p-button
          label="Save"
          icon="pi pi-save"
          [loading]="homepageService.isLoading()"
          (onClick)="onSave()" />
      </div>

      <!-- Two-column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left 2/3 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Content Card -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-5">Content</h2>
            <app-translation-editor
              [translations]="translations()"
              [fields]="translatableFields"
              (translationsChange)="translations.set($event)" />
          </div>

          <!-- Non-translatable Fields -->
          @if (nonTranslatableFields?.length) {
            <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
              <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-5">Settings</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @for (field of nonTranslatableFields; track field.key) {
                  @switch (field.type) {
                    @case ('text') {
                      <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-surface-700 dark:text-surface-300">{{ field.label }}</label>
                        <input pInputText class="w-full" [(ngModel)]="nonTranslatableValues[field.key]" />
                      </div>
                    }
                    @case ('number') {
                      <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-surface-700 dark:text-surface-300">{{ field.label }}</label>
                        <p-inputNumber class="w-full" [(ngModel)]="nonTranslatableValues[field.key]" [useGrouping]="false" />
                      </div>
                    }
                    @case ('checkbox') {
                      <div class="flex items-end gap-2 pb-2">
                        <p-checkbox [(ngModel)]="nonTranslatableValues[field.key]" [binary]="true" [inputId]="field.key" />
                        <label [for]="field.key" class="text-sm font-medium text-surface-700 dark:text-surface-300">{{ field.label }}</label>
                      </div>
                    }
                  }
                }
              </div>
            </div>
          }
        </div>

        <!-- Right 1/3 -->
        <div class="space-y-6">
          <!-- Preview (projected content) -->
          <ng-content select="[preview]"></ng-content>

          <!-- Image upload (if imageField is set) -->
          @if (imageField) {
            <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
              <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Image</h2>
              <app-image-upload
                [currentImageUrl]="imageUrl()"
                [uploading]="uploadingImage()"
                (onUpload)="onImageUpload($event)"
                (onRemove)="onImageRemove()" />

              @if (imageData()) {
                <div class="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
                  <div class="grid grid-cols-2 gap-y-2.5 gap-x-4 text-sm">
                    <div>
                      <span class="text-xs text-surface-400 block">Filename</span>
                      <span class="font-medium text-surface-900 dark:text-surface-0 text-xs break-all">{{ imageData()!.originalFilename || imageData()!.filename }}</span>
                    </div>
                    <div>
                      <span class="text-xs text-surface-400 block">Type</span>
                      <span class="font-medium text-surface-900 dark:text-surface-0 text-xs">{{ imageData()!.mimeType }}</span>
                    </div>
                    <div>
                      <span class="text-xs text-surface-400 block">Size</span>
                      <span class="font-medium text-surface-900 dark:text-surface-0 text-xs">{{ formatFileSize(imageData()!.size) }}</span>
                    </div>
                    @if (imageData()!.width) {
                      <div>
                        <span class="text-xs text-surface-400 block">Dimensions</span>
                        <span class="font-medium text-surface-900 dark:text-surface-0 text-xs">{{ imageData()!.width }} × {{ imageData()!.height }}px</span>
                      </div>
                    }
                  </div>
                  @if (imageData()!.mimeType !== 'image/webp') {
                    <div class="mt-3">
                      <p-button label="Optimize for Web" icon="pi pi-bolt" severity="secondary" [outlined]="true" size="small" styleClass="w-full" [loading]="optimizing()" (onClick)="optimizeImage()" />
                      <p class="text-[10px] text-surface-400 mt-1.5 text-center">Convert to WebP for smaller file size</p>
                    </div>
                  } @else {
                    <div class="mt-3 flex items-center gap-2 justify-center">
                      <i class="pi pi-check-circle text-green-500 text-xs"></i>
                      <span class="text-xs text-green-600 dark:text-green-400 font-medium">Already optimized (WebP)</span>
                    </div>
                  }
                  @if (optimizeResult()) {
                    <div class="mt-3 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                      <div class="flex items-center gap-1.5 text-green-700 dark:text-green-400 text-xs font-medium mb-1">
                        <i class="pi pi-check-circle text-xs"></i> Optimized
                      </div>
                      <div class="text-xs text-surface-600 dark:text-surface-400">
                        {{ formatFileSize(optimizeResult()!.originalSize) }} → {{ formatFileSize(optimizeResult()!.optimizedSize) }}
                        <span class="font-medium text-green-600 dark:text-green-400">({{ optimizeResult()!.savingsPercent }}% smaller)</span>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }

          <!-- Section Info -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Info</h2>
            <div class="flex flex-col gap-3 text-sm">
              @if (sectionPosition > 0) {
                <div class="flex justify-between">
                  <span class="text-surface-500">Position</span>
                  <span class="font-medium text-surface-900 dark:text-surface-0">#{{ sectionPosition }} on homepage</span>
                </div>
              }
              <div class="flex justify-between">
                <span class="text-surface-500">Type</span>
                <span class="font-medium text-surface-900 dark:text-surface-0">Singleton</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SingletonEditorComponent implements OnInit {
  @Input({ required: true }) singletonType!: string;
  @Input({ required: true }) pageTitle!: string;
  @Input({ required: true }) translatableFields!: SingletonTranslatableField[];
  @Input() nonTranslatableFields?: SingletonNonTranslatableField[];
  @Input() subtitle: string = '';
  @Input() sectionPosition: number = 0;
  @Input() backRoute: string = '/homepage';
  @Input() imageField: string = '';

  readonly homepageService = inject(HomepageService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  imageUrl = signal('');
  imageData = signal<any>(null);
  uploadingImage = signal(false);
  optimizing = signal(false);
  optimizeResult = signal<{ originalSize: number; optimizedSize: number; savingsPercent: number } | null>(null);

  translations = signal<{ hr: Record<string, any>; en: Record<string, any> }>({
    hr: {},
    en: {},
  });

  nonTranslatableValues: Record<string, any> = {};

  navigateBack(): void {
    this.router.navigate([this.backRoute]);
  }

  ngOnInit(): void {
    this.initEmptyTranslations();
    this.loadData();
  }

  private initEmptyTranslations(): void {
    const hr: Record<string, any> = {};
    const en: Record<string, any> = {};
    for (const field of this.translatableFields) {
      hr[field.key] = '';
      en[field.key] = '';
    }
    this.translations.set({ hr, en });
  }

  private loadData(): void {
    this.homepageService.getSingleton(this.singletonType).subscribe({
      next: (data) => {
        if (data.translations) {
          const hr: Record<string, any> = {};
          const en: Record<string, any> = {};
          for (const field of this.translatableFields) {
            hr[field.key] = data.translations.hr?.[field.key] || '';
            en[field.key] = data.translations.en?.[field.key] || '';
          }
          this.translations.set({ hr, en });
        }

        if (this.nonTranslatableFields) {
          for (const field of this.nonTranslatableFields) {
            this.nonTranslatableValues[field.key] = data[field.key] ?? '';
          }
        }

        // Resolve image
        if (this.imageField && data[this.imageField]) {
          const img = data[this.imageField];
          if (typeof img === 'object' && img.path) {
            this.imageUrl.set(environment.apiUrl.replace('/api', '') + '/storage/media/' + img.path);
            this.imageData.set(img);
          }
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data' });
      },
    });
  }

  onImageUpload(file: File): void {
    this.uploadingImage.set(true);
    const formData = new FormData();
    formData.append('file', file);
    this.http.post<any>(`${environment.apiUrl}/singletons/${this.singletonType}/media/${this.imageField}`, formData).subscribe({
      next: (res) => {
        this.uploadingImage.set(false);
        this.imageUrl.set(environment.apiUrl.replace('/api', '') + res.url);
        this.messageService.add({ severity: 'success', summary: 'Image uploaded' });
      },
      error: () => {
        this.uploadingImage.set(false);
        this.messageService.add({ severity: 'error', summary: 'Failed to upload image' });
      },
    });
  }

  optimizeImage(): void {
    const img = this.imageData();
    if (!img?.id) return;
    this.optimizing.set(true);
    this.optimizeResult.set(null);
    this.http.post<any>(`${environment.apiUrl}/media/${img.id}/optimize`, { quality: 80 }).subscribe({
      next: (res) => {
        this.optimizing.set(false);
        this.optimizeResult.set(res);
        this.imageData.set({ ...img, mimeType: res.mimeType, size: res.optimizedSize, path: res.path, width: res.width, height: res.height });
        this.imageUrl.set(environment.apiUrl.replace('/api', '') + '/storage/media/' + res.path);
        this.messageService.add({ severity: 'success', summary: 'Image optimized', detail: `${res.savingsPercent}% smaller` });
      },
      error: (err) => {
        this.optimizing.set(false);
        this.messageService.add({ severity: 'error', summary: 'Optimization failed', detail: err.error?.error || 'Unknown error' });
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

  onImageRemove(): void {
    this.http.delete(`${environment.apiUrl}/singletons/${this.singletonType}/media/${this.imageField}`).subscribe({
      next: () => {
        this.imageUrl.set('');
        this.messageService.add({ severity: 'info', summary: 'Image removed' });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Failed to remove image' }),
    });
  }

  onSave(): void {
    const payload: any = {
      translations: this.translations(),
    };

    if (this.nonTranslatableFields) {
      for (const field of this.nonTranslatableFields) {
        payload[field.key] = this.nonTranslatableValues[field.key];
      }
    }

    this.homepageService.updateSingleton(this.singletonType, payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved successfully' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save' });
      },
    });
  }
}
