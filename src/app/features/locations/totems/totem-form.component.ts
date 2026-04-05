import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { LocationService, TotemDetail } from '../../../core/services/location.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-totem-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, InputTextModule, TextareaModule,
    ToggleSwitchModule, InputNumberModule, ButtonModule,
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
            (onClick)="router.navigate(['/locations/totems'])" />
          <div>
            <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">
              Edit Totem
            </h1>
            <p class="text-surface-500 dark:text-surface-400 text-sm mt-0.5">
              Update totem details and settings
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <p-button
            label="Save"
            icon="pi pi-save"
            [loading]="locationService.isLoading()"
            (onClick)="onSave()" />
        </div>
      </div>

      <!-- Two-column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- LEFT: Content (2/3 width) -->
        <div class="lg:col-span-2 space-y-6">

          <!-- Content Card -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-5">Content</h2>
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Name (HR)</label>
                <input pInputText class="w-full" [(ngModel)]="name" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Name (EN)</label>
                <input pInputText class="w-full" [(ngModel)]="nameEn" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Description (HR)</label>
                <textarea pTextarea class="w-full" [(ngModel)]="description" rows="4"></textarea>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Description (EN)</label>
                <textarea pTextarea class="w-full" [(ngModel)]="descriptionEn" rows="4"></textarea>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Totem Type</label>
                  <input pInputText class="w-full" [(ngModel)]="totemType" />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Postbuy Category</label>
                  <input pInputText class="w-full" [(ngModel)]="postbuyCategory" />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Totem Motion</label>
                  <input pInputText class="w-full" [(ngModel)]="totemMotion" />
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Video URL</label>
                <input pInputText class="w-full" [(ngModel)]="videoUrl" (ngModelChange)="updateYoutubeEmbed()" placeholder="https://www.youtube.com/watch?v=..." />
              </div>
              @if (youtubeEmbedUrl()) {
                <div class="mt-1">
                  <label class="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2 block">Preview</label>
                  <div class="rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700" style="aspect-ratio: 16/9;">
                    <iframe
                      [src]="youtubeEmbedUrl()"
                      class="w-full h-full"
                      frameborder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen>
                    </iframe>
                  </div>
                </div>
              }
            </div>
          </div>

        </div>

        <!-- RIGHT: Sidebar (1/3 width) -->
        <div class="space-y-6">

          <!-- Settings Card -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-5">Settings</h2>
            <div class="flex flex-col gap-4">
              <div class="flex items-center justify-between">
                <label for="isPublished" class="text-sm font-medium text-surface-700 dark:text-surface-300">Published</label>
                <p-toggleswitch [(ngModel)]="isPublished" inputId="isPublished" />
              </div>
              <div class="flex items-center justify-between">
                <label for="isInstalled" class="text-sm font-medium text-surface-700 dark:text-surface-300">Installed</label>
                <p-toggleswitch [(ngModel)]="isInstalled" inputId="isInstalled" />
              </div>
              <div class="flex items-center justify-between">
                <label for="isBigScreen" class="text-sm font-medium text-surface-700 dark:text-surface-300">Big Screen</label>
                <p-toggleswitch [(ngModel)]="isBigScreen" inputId="isBigScreen" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Reach</label>
                <p-inputNumber [(ngModel)]="reach" [useGrouping]="true" styleClass="w-full" inputStyleClass="w-full" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Ad Duration (sec)</label>
                <p-inputNumber [(ngModel)]="adDuration" styleClass="w-full" inputStyleClass="w-full" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Screen Size</label>
                <div class="flex items-center gap-2">
                  <p-inputNumber [(ngModel)]="screenWidth" placeholder="Width" styleClass="flex-1" inputStyleClass="w-full" />
                  <span class="text-surface-400 text-sm">×</span>
                  <p-inputNumber [(ngModel)]="screenHeight" placeholder="Height" styleClass="flex-1" inputStyleClass="w-full" />
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Sort Order</label>
                <p-inputNumber [(ngModel)]="sortOrder" styleClass="w-full" inputStyleClass="w-full" />
              </div>
            </div>
          </div>

          <!-- Info Card -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Info</h2>
            <div class="flex flex-col gap-3 text-sm">
              <div class="flex justify-between">
                <span class="text-surface-500 dark:text-surface-400">City</span>
                <span class="font-medium text-surface-900 dark:text-surface-0">{{ cityName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-surface-500 dark:text-surface-400">CDN ID</span>
                <span class="font-medium text-surface-900 dark:text-surface-0">{{ cdnTotemId }}</span>
              </div>
              @if (lastSyncedAt) {
                <div class="flex justify-between">
                  <span class="text-surface-500 dark:text-surface-400">Last Synced</span>
                  <span class="font-medium text-surface-900 dark:text-surface-0">{{ lastSyncedAt | date:'dd.MM.yyyy HH:mm' }}</span>
                </div>
              }
              @if (manualOverrides.length > 0) {
                <div class="flex justify-between">
                  <span class="text-surface-500 dark:text-surface-400">Manual Overrides</span>
                  <span class="font-medium text-surface-900 dark:text-surface-0">{{ manualOverrides.length }}</span>
                </div>
              }
            </div>
            <div class="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
              <p-button
                label="Sync this totem from CDN"
                icon="pi pi-sync"
                severity="secondary"
                [outlined]="true"
                size="small"
                styleClass="w-full"
                [loading]="isSyncingTotem()"
                (onClick)="syncTotem()" />
              @if (syncResult()) {
                <div class="mt-3 text-xs bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <div class="flex items-center gap-1.5 text-green-700 dark:text-green-400 font-medium mb-1">
                    <i class="pi pi-check-circle text-xs"></i> Synced
                  </div>
                  <div class="text-surface-500">
                    {{ syncResult()!.updatedFields.length }} fields updated, {{ syncResult()!.skippedFields.length }} skipped (manual)
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TotemFormComponent implements OnInit {
  readonly locationService = inject(LocationService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly http = inject(HttpClient);

  youtubeEmbedUrl = signal<SafeResourceUrl | null>(null);

  updateYoutubeEmbed(): void {
    const url = this.videoUrl;
    if (!url) { this.youtubeEmbedUrl.set(null); return; }

    let videoId = '';
    const m1 = url.match(/[?&]v=([^&]+)/);
    if (m1) videoId = m1[1];
    const m2 = url.match(/youtu\.be\/([^?&]+)/);
    if (m2) videoId = m2[1];
    const m3 = url.match(/embed\/([^?&]+)/);
    if (m3) videoId = m3[1];

    if (!videoId) { this.youtubeEmbedUrl.set(null); return; }
    this.youtubeEmbedUrl.set(
      this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`)
    );
  }

  totemId = signal<string | null>(null);

  // Content fields
  name = '';
  nameEn = '';
  description = '';
  descriptionEn = '';
  totemType = '';
  postbuyCategory = '';
  totemMotion = '';
  videoUrl = '';

  // Settings fields
  isPublished = false;
  isInstalled = false;
  isBigScreen = false;
  reach = 0;
  adDuration = 0;
  screenWidth = 0;
  screenHeight = 0;
  sortOrder = 0;

  // Info fields (read-only)
  cityName = '';
  cdnTotemId = 0;
  lastSyncedAt: string | null = null;
  manualOverrides: string[] = [];
  isSyncingTotem = signal(false);
  syncResult = signal<{ updatedFields: string[]; skippedFields: string[] } | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.totemId.set(id);
      this.loadTotem(id);
    }
  }

  private loadTotem(id: string): void {
    this.locationService.getTotem(id).subscribe({
      next: (totem) => {
        this.name = totem.name;
        this.nameEn = totem.nameEn;
        this.description = totem.description || '';
        this.descriptionEn = totem.descriptionEn || '';
        this.totemType = totem.totemType || '';
        this.postbuyCategory = totem.postbuyCategory || '';
        this.totemMotion = totem.totemMotion || '';
        this.videoUrl = totem.videoUrl || '';
        this.updateYoutubeEmbed();

        this.isPublished = totem.isPublished;
        this.isInstalled = totem.isInstalled;
        this.isBigScreen = totem.isBigScreen || false;
        this.reach = totem.reach;
        this.adDuration = totem.adDuration || 0;
        this.screenWidth = totem.screenWidth;
        this.screenHeight = totem.screenHeight;
        this.sortOrder = totem.sortOrder;

        this.cityName = totem.cityName;
        this.cdnTotemId = totem.cdnTotemId;
        this.lastSyncedAt = totem.lastSyncedAt;
        this.manualOverrides = totem.manualOverrides || [];
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load totem' });
        this.router.navigate(['/locations/totems']);
      },
    });
  }

  onSave(): void {
    const id = this.totemId();
    if (!id) return;

    const payload = {
      name: this.name,
      nameEn: this.nameEn,
      description: this.description,
      descriptionEn: this.descriptionEn,
      totemType: this.totemType,
      postbuyCategory: this.postbuyCategory,
      totemMotion: this.totemMotion,
      videoUrl: this.videoUrl,
      isPublished: this.isPublished,
      isInstalled: this.isInstalled,
      isBigScreen: this.isBigScreen,
      reach: this.reach,
      adDuration: this.adDuration,
      screenWidth: this.screenWidth,
      screenHeight: this.screenHeight,
      sortOrder: this.sortOrder,
    };

    this.locationService.updateTotem(id, payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Totem updated' });
        this.router.navigate(['/locations/totems']);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save totem' });
      },
    });
  }

  syncTotem(): void {
    const id = this.totemId();
    if (!id) return;

    this.isSyncingTotem.set(true);
    this.syncResult.set(null);

    this.http.post<any>(`${environment.apiUrl}/locations/totems/${id}/sync`, {}).subscribe({
      next: (res) => {
        this.isSyncingTotem.set(false);
        this.syncResult.set({ updatedFields: res.updatedFields || [], skippedFields: res.skippedFields || [] });
        this.lastSyncedAt = res.syncedAt;
        this.messageService.add({ severity: 'success', summary: 'Totem synced from CDN' });
        // Reload data to show updated values
        this.loadTotem(id);
      },
      error: (err) => {
        this.isSyncingTotem.set(false);
        this.messageService.add({ severity: 'error', summary: 'Sync failed', detail: err.error?.error || 'Unknown error' });
      },
    });
  }
}
