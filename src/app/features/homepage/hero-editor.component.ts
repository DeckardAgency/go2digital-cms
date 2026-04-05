import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinner } from 'primeng/progressspinner';

import { SingletonEditorComponent, SingletonTranslatableField } from './singleton-editor.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-hero-editor',
  standalone: true,
  imports: [CommonModule, ButtonModule, ToastModule, ProgressSpinner, SingletonEditorComponent],
  providers: [MessageService],
  template: `
    <div class="space-y-6">
      <!-- Singleton text fields editor -->
      <app-singleton-editor
        singletonType="homepage-hero"
        pageTitle="Homepage Hero"
        [translatableFields]="fields" />

      <!-- Video Upload Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- Desktop Video -->
        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0">Desktop Video</h2>
              <p class="text-sm text-surface-500 dark:text-surface-400 mt-0.5">Background video for desktop viewport</p>
            </div>
            @if (desktopVideoUrl()) {
              <p-button
                icon="pi pi-trash"
                severity="danger"
                [text]="true"
                [rounded]="true"
                pTooltip="Remove video"
                (onClick)="removeVideo('desktop')" />
            }
          </div>

          @if (uploadingDesktop()) {
            <div class="border rounded-lg p-8 text-center border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800">
              <div class="flex flex-col items-center gap-3">
                <p-progressSpinner [style]="{ width: '40px', height: '40px' }" strokeWidth="4" />
                <p class="text-sm text-surface-500">Uploading desktop video...</p>
              </div>
            </div>
          } @else if (desktopVideoUrl()) {
            <div class="space-y-3">
              <video
                class="w-full rounded-lg border border-surface-200 dark:border-surface-700"
                [src]="desktopVideoUrl()"
                controls
                muted
                [style.max-height.px]="200">
              </video>
              <p class="text-xs text-surface-500 truncate">{{ desktopFilename() }}</p>
              <p-button
                label="Replace Video"
                icon="pi pi-upload"
                severity="secondary"
                [outlined]="true"
                size="small"
                (onClick)="desktopInput.click()" />
            </div>
          } @else {
            <div
              class="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors border-surface-300 dark:border-surface-600 hover:border-primary hover:bg-surface-50 dark:hover:bg-surface-800"
              (click)="desktopInput.click()">
              <div class="flex flex-col items-center gap-3">
                <i class="pi pi-video text-3xl text-surface-400"></i>
                <div>
                  <p class="text-sm font-medium text-surface-700 dark:text-surface-300">Click to upload desktop video</p>
                  <p class="text-xs text-surface-500 mt-1">MP4, WebM — max 50MB</p>
                </div>
              </div>
            </div>
          }
          <input #desktopInput type="file" accept="video/*" class="hidden" (change)="onFileSelected($event, 'desktop')" />
        </div>

        <!-- Mobile Video -->
        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0">Mobile Video</h2>
              <p class="text-sm text-surface-500 dark:text-surface-400 mt-0.5">Background video for mobile viewport</p>
            </div>
            @if (mobileVideoUrl()) {
              <p-button
                icon="pi pi-trash"
                severity="danger"
                [text]="true"
                [rounded]="true"
                pTooltip="Remove video"
                (onClick)="removeVideo('mobile')" />
            }
          </div>

          @if (uploadingMobile()) {
            <div class="border rounded-lg p-8 text-center border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800">
              <div class="flex flex-col items-center gap-3">
                <p-progressSpinner [style]="{ width: '40px', height: '40px' }" strokeWidth="4" />
                <p class="text-sm text-surface-500">Uploading mobile video...</p>
              </div>
            </div>
          } @else if (mobileVideoUrl()) {
            <div class="space-y-3">
              <video
                class="w-full rounded-lg border border-surface-200 dark:border-surface-700"
                [src]="mobileVideoUrl()"
                controls
                muted
                [style.max-height.px]="200">
              </video>
              <p class="text-xs text-surface-500 truncate">{{ mobileFilename() }}</p>
              <p-button
                label="Replace Video"
                icon="pi pi-upload"
                severity="secondary"
                [outlined]="true"
                size="small"
                (onClick)="mobileInput.click()" />
            </div>
          } @else {
            <div
              class="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors border-surface-300 dark:border-surface-600 hover:border-primary hover:bg-surface-50 dark:hover:bg-surface-800"
              (click)="mobileInput.click()">
              <div class="flex flex-col items-center gap-3">
                <i class="pi pi-video text-3xl text-surface-400"></i>
                <div>
                  <p class="text-sm font-medium text-surface-700 dark:text-surface-300">Click to upload mobile video</p>
                  <p class="text-xs text-surface-500 mt-1">MP4, WebM — max 50MB</p>
                </div>
              </div>
            </div>
          }
          <input #mobileInput type="file" accept="video/*" class="hidden" (change)="onFileSelected($event, 'mobile')" />
        </div>
      </div>

      <p-toast></p-toast>
    </div>
  `,
})
export class HeroEditorComponent implements OnInit {
  private http = inject(HttpClient);
  private messageService = inject(MessageService);
  private apiUrl = environment.apiUrl;

  fields: SingletonTranslatableField[] = [
    { key: 'titleLine1', label: 'Title Line 1', type: 'text' },
    { key: 'titleLine2', label: 'Title Line 2', type: 'text' },
    { key: 'kicker', label: 'Kicker', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'scrollDownLabel', label: 'Scroll Down Label', type: 'text' },
  ];

  desktopVideoUrl = signal('');
  mobileVideoUrl = signal('');
  desktopFilename = signal('');
  mobileFilename = signal('');
  uploadingDesktop = signal(false);
  uploadingMobile = signal(false);

  ngOnInit(): void {
    this.loadHeroData();
  }

  private loadHeroData(): void {
    this.http.get<any>(`${this.apiUrl}/singletons/homepage-hero`).subscribe({
      next: (hero) => {
        this.resolveVideo(hero.video, 'desktop');
        this.resolveVideo(hero.mobileVideo, 'mobile');
      }
    });
  }

  private resolveVideo(video: any, type: 'desktop' | 'mobile'): void {
    if (!video) return;

    if (typeof video === 'object' && video.path) {
      const url = this.getFullUrl('/storage/media/' + video.path);
      if (type === 'desktop') {
        this.desktopVideoUrl.set(url);
        this.desktopFilename.set(video.originalFilename || video.filename || '');
      } else {
        this.mobileVideoUrl.set(url);
        this.mobileFilename.set(video.originalFilename || video.filename || '');
      }
    } else if (typeof video === 'string' && video.startsWith('/api/media/')) {
      const mediaId = video.replace('/api/media/', '');
      this.http.get<any>(`${this.apiUrl}/media/${mediaId}`).subscribe({
        next: (media) => {
          if (media.path) {
            const url = this.getFullUrl('/storage/media/' + media.path);
            if (type === 'desktop') {
              this.desktopVideoUrl.set(url);
              this.desktopFilename.set(media.originalFilename || media.filename || '');
            } else {
              this.mobileVideoUrl.set(url);
              this.mobileFilename.set(media.originalFilename || media.filename || '');
            }
          }
        }
      });
    }
  }

  onFileSelected(event: Event, type: 'desktop' | 'mobile'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    input.value = '';

    if (!file.type.startsWith('video/')) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select a video file' });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'File size must be under 50MB' });
      return;
    }

    if (type === 'desktop') {
      this.uploadingDesktop.set(true);
    } else {
      this.uploadingMobile.set(true);
    }

    const formData = new FormData();
    formData.append('file', file);

    const field = type === 'desktop' ? 'video' : 'mobileVideo';
    this.http.post<any>(`${this.apiUrl}/singletons/homepage-hero/media/${field}`, formData).subscribe({
      next: (res) => {
        const url = this.getFullUrl(res.url);
        if (type === 'desktop') {
          this.desktopVideoUrl.set(url);
          this.desktopFilename.set(res.originalFilename || file.name);
          this.uploadingDesktop.set(false);
        } else {
          this.mobileVideoUrl.set(url);
          this.mobileFilename.set(res.originalFilename || file.name);
          this.uploadingMobile.set(false);
        }
        this.messageService.add({ severity: 'success', summary: `${type} video uploaded` });
      },
      error: () => {
        if (type === 'desktop') this.uploadingDesktop.set(false);
        else this.uploadingMobile.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to upload video' });
      }
    });
  }

  removeVideo(type: 'desktop' | 'mobile'): void {
    const field = type === 'desktop' ? 'video' : 'mobileVideo';
    this.http.delete<any>(`${this.apiUrl}/singletons/homepage-hero/media/${field}`).subscribe({
      next: () => {
        if (type === 'desktop') {
          this.desktopVideoUrl.set('');
          this.desktopFilename.set('');
        } else {
          this.mobileVideoUrl.set('');
          this.mobileFilename.set('');
        }
        this.messageService.add({ severity: 'info', summary: `${type} video removed` });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove video' });
      }
    });
  }

  private getFullUrl(path: string): string {
    if (!path || path.startsWith('http')) return path;
    return this.apiUrl.replace('/api', '') + path;
  }
}
