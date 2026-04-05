import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinner } from 'primeng/progressspinner';
import { TranslationEditorComponent } from '../../shared/components/translation-editor/translation-editor.component';
import { HomepageService } from '../../core/services/homepage.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-hero-editor',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule,
    ToastModule, ProgressSpinner, TranslationEditorComponent
  ],
  providers: [MessageService],
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
            (onClick)="router.navigate(['/homepage'])" />
          <div>
            <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Homepage Hero</h1>
            <p class="text-surface-500 dark:text-surface-400 text-sm mt-0.5">
              Main hero section with title, heading, and background videos
            </p>
          </div>
        </div>
        <p-button
          label="Save"
          icon="pi pi-save"
          [loading]="saving()"
          (onClick)="save()" />
      </div>

      <!-- Two-column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- LEFT: Content + Videos (2/3) -->
        <div class="lg:col-span-2 space-y-6">

          <!-- Content Card -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-5">Content</h2>
            <app-translation-editor
              [translations]="translations()"
              [fields]="translationFields"
              (translationsChange)="translations.set($event)" />
          </div>

          <!-- Videos Card -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-5">Background Videos</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <!-- Desktop Video -->
              <div>
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <i class="pi pi-desktop text-surface-400"></i>
                    <span class="text-sm font-medium text-surface-700 dark:text-surface-300">Desktop</span>
                  </div>
                  @if (desktopVideoUrl()) {
                    <p-button icon="pi pi-trash" severity="danger" [text]="true" [rounded]="true" size="small" (onClick)="removeVideo('desktop')" />
                  }
                </div>

                @if (uploadingDesktop()) {
                  <div class="rounded-lg p-6 text-center bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                    <p-progressSpinner [style]="{ width: '32px', height: '32px' }" strokeWidth="4" />
                    <p class="text-xs text-surface-500 mt-2">Uploading...</p>
                  </div>
                } @else if (desktopVideoUrl()) {
                  <div>
                    <video class="w-full rounded-lg bg-black" [src]="desktopVideoUrl()" controls muted [style.max-height.px]="160"></video>
                    <div class="flex items-center justify-between mt-2">
                      <span class="text-xs text-surface-500 truncate flex-1">{{ desktopFilename() }}</span>
                      <p-button label="Replace" icon="pi pi-refresh" severity="secondary" [text]="true" size="small" (onClick)="desktopInput.click()" />
                    </div>
                  </div>
                } @else {
                  <div class="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors border-surface-300 dark:border-surface-600 hover:border-primary" (click)="desktopInput.click()">
                    <i class="pi pi-video text-2xl text-surface-400"></i>
                    <p class="text-xs text-surface-500 mt-2">Upload desktop video</p>
                  </div>
                }
                <input #desktopInput type="file" accept="video/*" class="hidden" (change)="onFileSelected($event, 'desktop')" />
              </div>

              <!-- Mobile Video -->
              <div>
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <i class="pi pi-mobile text-surface-400"></i>
                    <span class="text-sm font-medium text-surface-700 dark:text-surface-300">Mobile</span>
                  </div>
                  @if (mobileVideoUrl()) {
                    <p-button icon="pi pi-trash" severity="danger" [text]="true" [rounded]="true" size="small" (onClick)="removeVideo('mobile')" />
                  }
                </div>

                @if (uploadingMobile()) {
                  <div class="rounded-lg p-6 text-center bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                    <p-progressSpinner [style]="{ width: '32px', height: '32px' }" strokeWidth="4" />
                    <p class="text-xs text-surface-500 mt-2">Uploading...</p>
                  </div>
                } @else if (mobileVideoUrl()) {
                  <div>
                    <video class="w-full rounded-lg bg-black" [src]="mobileVideoUrl()" controls muted [style.max-height.px]="160"></video>
                    <div class="flex items-center justify-between mt-2">
                      <span class="text-xs text-surface-500 truncate flex-1">{{ mobileFilename() }}</span>
                      <p-button label="Replace" icon="pi pi-refresh" severity="secondary" [text]="true" size="small" (onClick)="mobileInput.click()" />
                    </div>
                  </div>
                } @else {
                  <div class="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors border-surface-300 dark:border-surface-600 hover:border-primary" (click)="mobileInput.click()">
                    <i class="pi pi-video text-2xl text-surface-400"></i>
                    <p class="text-xs text-surface-500 mt-2">Upload mobile video</p>
                  </div>
                }
                <input #mobileInput type="file" accept="video/*" class="hidden" (change)="onFileSelected($event, 'mobile')" />
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: Sidebar (1/3) -->
        <div class="space-y-6">

          <!-- Live Preview Card -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Preview</h2>
            <div class="rounded-lg bg-zinc-900 p-5 space-y-3">
              <p class="text-[10px] text-green-400 uppercase tracking-widest flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                {{ translations().hr['kicker'] || 'Kicker' }}
              </p>
              <h3 class="text-white text-xl font-light leading-tight tracking-tight">
                {{ translations().hr['titleLine1'] || 'Title Line 1' }}<br/>
                {{ translations().hr['titleLine2'] || 'Title Line 2' }}
              </h3>
              <p class="text-zinc-300 text-xs leading-relaxed mt-3">{{ translations().hr['heading'] || 'Heading text' }}</p>
              <p class="text-zinc-500 text-[10px] leading-relaxed">{{ translations().hr['description'] || 'Description text' }}</p>
              <p class="text-zinc-600 text-[9px] uppercase tracking-wider mt-4 pt-3 border-t border-zinc-800">
                {{ translations().hr['scrollDownLabel'] || 'Scroll Down' }} ↓
              </p>
            </div>
            <p class="text-[10px] text-surface-400 mt-3 text-center">Live preview — Croatian content</p>
          </div>

          <!-- Section Info -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Info</h2>
            <div class="flex flex-col gap-3 text-sm">
              <div class="flex justify-between">
                <span class="text-surface-500">Position</span>
                <span class="font-medium text-surface-900 dark:text-surface-0">#1 on homepage</span>
              </div>
              <div class="flex justify-between">
                <span class="text-surface-500">Type</span>
                <span class="font-medium text-surface-900 dark:text-surface-0">Singleton</span>
              </div>
              <div class="flex justify-between">
                <span class="text-surface-500">Desktop video</span>
                <span class="font-medium" [class]="desktopVideoUrl() ? 'text-green-600' : 'text-surface-400'">
                  {{ desktopVideoUrl() ? '✓ Uploaded' : '— Not set' }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-surface-500">Mobile video</span>
                <span class="font-medium" [class]="mobileVideoUrl() ? 'text-green-600' : 'text-surface-400'">
                  {{ mobileVideoUrl() ? '✓ Uploaded' : '— Not set' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p-toast></p-toast>
    </div>
  `,
})
export class HeroEditorComponent implements OnInit {
  private http = inject(HttpClient);
  private messageService = inject(MessageService);
  router = inject(Router);
  private apiUrl = environment.apiUrl;

  translationFields = [
    { key: 'titleLine1', label: 'Title Line 1', type: 'text' as const },
    { key: 'titleLine2', label: 'Title Line 2', type: 'text' as const },
    { key: 'kicker', label: 'Kicker', type: 'text' as const },
    { key: 'heading', label: 'Heading', type: 'text' as const },
    { key: 'description', label: 'Description', type: 'textarea' as const },
    { key: 'scrollDownLabel', label: 'Scroll Down Label', type: 'text' as const },
  ];

  translations = signal<{ hr: Record<string, any>; en: Record<string, any> }>({ hr: {}, en: {} });
  saving = signal(false);
  desktopVideoUrl = signal('');
  mobileVideoUrl = signal('');
  desktopFilename = signal('');
  mobileFilename = signal('');
  uploadingDesktop = signal(false);
  uploadingMobile = signal(false);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.http.get<any>(`${this.apiUrl}/singletons/homepage-hero?includeTranslations=true`).subscribe({
      next: (hero) => {
        if (hero.translations) {
          this.translations.set({ hr: hero.translations.hr || {}, en: hero.translations.en || {} });
        }
        this.resolveVideo(hero.video, 'desktop');
        this.resolveVideo(hero.mobileVideo, 'mobile');
      }
    });
  }

  save(): void {
    this.saving.set(true);
    this.http.put(`${this.apiUrl}/singletons/homepage-hero`, { translations: this.translations() }).subscribe({
      next: () => {
        this.saving.set(false);
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Hero content updated' });
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save' });
      }
    });
  }

  private resolveVideo(video: any, type: 'desktop' | 'mobile'): void {
    if (!video) return;
    if (typeof video === 'object' && video.path) {
      this.setVideo(type, this.getFullUrl('/storage/media/' + video.path), video.originalFilename || video.filename || '');
    } else if (typeof video === 'string' && video.startsWith('/api/media/')) {
      const mediaId = video.replace('/api/media/', '');
      this.http.get<any>(`${this.apiUrl}/media/${mediaId}`).subscribe({
        next: (media) => {
          if (media.path) this.setVideo(type, this.getFullUrl('/storage/media/' + media.path), media.originalFilename || '');
        }
      });
    }
  }

  private setVideo(type: 'desktop' | 'mobile', url: string, filename: string): void {
    if (type === 'desktop') { this.desktopVideoUrl.set(url); this.desktopFilename.set(filename); }
    else { this.mobileVideoUrl.set(url); this.mobileFilename.set(filename); }
  }

  onFileSelected(event: Event, type: 'desktop' | 'mobile'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    input.value = '';

    if (!file.type.startsWith('video/')) { this.messageService.add({ severity: 'error', summary: 'Please select a video' }); return; }
    if (file.size > 50 * 1024 * 1024) { this.messageService.add({ severity: 'error', summary: 'Max 50MB' }); return; }

    type === 'desktop' ? this.uploadingDesktop.set(true) : this.uploadingMobile.set(true);

    const formData = new FormData();
    formData.append('file', file);
    const field = type === 'desktop' ? 'video' : 'mobileVideo';

    this.http.post<any>(`${this.apiUrl}/singletons/homepage-hero/media/${field}`, formData).subscribe({
      next: (res) => {
        this.setVideo(type, this.getFullUrl(res.url), res.originalFilename || file.name);
        type === 'desktop' ? this.uploadingDesktop.set(false) : this.uploadingMobile.set(false);
        this.messageService.add({ severity: 'success', summary: `${type === 'desktop' ? 'Desktop' : 'Mobile'} video uploaded` });
      },
      error: () => {
        type === 'desktop' ? this.uploadingDesktop.set(false) : this.uploadingMobile.set(false);
        this.messageService.add({ severity: 'error', summary: 'Upload failed' });
      }
    });
  }

  removeVideo(type: 'desktop' | 'mobile'): void {
    const field = type === 'desktop' ? 'video' : 'mobileVideo';
    this.http.delete<any>(`${this.apiUrl}/singletons/homepage-hero/media/${field}`).subscribe({
      next: () => { this.setVideo(type, '', ''); this.messageService.add({ severity: 'info', summary: 'Video removed' }); },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Failed to remove' }); }
    });
  }

  private getFullUrl(path: string): string {
    if (!path || path.startsWith('http')) return path;
    return this.apiUrl.replace('/api', '') + path;
  }
}
