import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';

import { LocationService, SyncStatus, SyncReport } from '../../core/services/location.service';

@Component({
  selector: 'app-sync-page',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, ProgressSpinnerModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <p-button
          icon="pi pi-arrow-left"
          severity="secondary"
          [text]="true"
          [rounded]="true"
          (onClick)="router.navigate(['/dashboard'])" />
        <div>
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Locations</h1>
          <p class="text-surface-500 dark:text-surface-400 text-sm mt-0.5">
            Sync and manage cities & totems from CDN
          </p>
        </div>
      </div>

      <!-- Stats Cards -->
      @if (syncStatus()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
            <div class="text-surface-500 dark:text-surface-400 text-sm font-medium">Total Cities</div>
            <div class="text-2xl font-bold text-surface-900 dark:text-surface-0 mt-1">{{ syncStatus()!.totalCities }}</div>
          </div>
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
            <div class="text-surface-500 dark:text-surface-400 text-sm font-medium">Total Totems</div>
            <div class="text-2xl font-bold text-surface-900 dark:text-surface-0 mt-1">{{ syncStatus()!.totalTotems }}</div>
          </div>
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
            <div class="text-surface-500 dark:text-surface-400 text-sm font-medium">Published</div>
            <div class="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{{ syncStatus()!.publishedTotems }}</div>
          </div>
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
            <div class="text-surface-500 dark:text-surface-400 text-sm font-medium">Unpublished</div>
            <div class="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{{ syncStatus()!.unpublishedTotems }}</div>
          </div>
        </div>
      }

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Sync Card -->
        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
          <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">CDN Sync</h2>
          <div class="flex flex-col gap-4">
            @if (syncStatus()?.lastSyncedAt) {
              <div class="text-sm text-surface-500 dark:text-surface-400">
                Last synced: <span class="font-medium text-surface-900 dark:text-surface-0">{{ syncStatus()!.lastSyncedAt | date:'dd.MM.yyyy HH:mm' }}</span>
              </div>
            } @else {
              <div class="text-sm text-surface-500 dark:text-surface-400">Never synced</div>
            }

            <p-button
              label="Sync from CDN"
              icon="pi pi-sync"
              [loading]="isSyncing()"
              (onClick)="onSync()" />

            @if (lastReport()) {
              <div class="bg-surface-50 dark:bg-surface-800 rounded-lg p-4 text-sm space-y-1">
                <div class="font-semibold text-surface-900 dark:text-surface-0 mb-2">Sync Report</div>
                <div class="flex justify-between">
                  <span class="text-surface-500 dark:text-surface-400">Cities created</span>
                  <span class="font-medium text-surface-900 dark:text-surface-0">{{ lastReport()!.report.cities_created }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-surface-500 dark:text-surface-400">Cities updated</span>
                  <span class="font-medium text-surface-900 dark:text-surface-0">{{ lastReport()!.report.cities_updated }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-surface-500 dark:text-surface-400">Totems created</span>
                  <span class="font-medium text-surface-900 dark:text-surface-0">{{ lastReport()!.report.totems_created }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-surface-500 dark:text-surface-400">Totems updated</span>
                  <span class="font-medium text-surface-900 dark:text-surface-0">{{ lastReport()!.report.totems_updated }}</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Quick Links Card -->
        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
          <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Quick Links</h2>
          <div class="flex flex-col gap-3">
            <button
              class="flex items-center gap-3 p-4 rounded-lg border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors cursor-pointer text-left w-full"
              (click)="router.navigate(['/locations/cities'])">
              <i class="pi pi-building text-xl text-primary"></i>
              <div>
                <div class="font-medium text-surface-900 dark:text-surface-0">Manage Cities</div>
                <div class="text-sm text-surface-500 dark:text-surface-400">Toggle visibility and sort order</div>
              </div>
              <i class="pi pi-chevron-right ml-auto text-surface-400"></i>
            </button>
            <button
              class="flex items-center gap-3 p-4 rounded-lg border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors cursor-pointer text-left w-full"
              (click)="router.navigate(['/locations/totems'])">
              <i class="pi pi-map text-xl text-primary"></i>
              <div>
                <div class="font-medium text-surface-900 dark:text-surface-0">Manage Totems</div>
                <div class="text-sm text-surface-500 dark:text-surface-400">Edit totem details and publishing</div>
              </div>
              <i class="pi pi-chevron-right ml-auto text-surface-400"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SyncPageComponent implements OnInit {
  readonly locationService = inject(LocationService);
  readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  syncStatus = signal<SyncStatus | null>(null);
  lastReport = signal<SyncReport | null>(null);
  isSyncing = signal(false);

  ngOnInit(): void {
    this.loadSyncStatus();
  }

  loadSyncStatus(): void {
    this.locationService.getSyncStatus().subscribe({
      next: (status) => this.syncStatus.set(status),
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load sync status' });
      },
    });
  }

  onSync(): void {
    this.isSyncing.set(true);
    this.locationService.syncFromCdn().subscribe({
      next: (report) => {
        this.lastReport.set(report);
        this.isSyncing.set(false);
        this.loadSyncStatus();
        this.messageService.add({ severity: 'success', summary: 'Sync Complete', detail: 'Locations synced from CDN' });
      },
      error: () => {
        this.isSyncing.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Sync failed' });
      },
    });
  }
}
