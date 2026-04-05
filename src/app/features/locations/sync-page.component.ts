import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DrawerModule } from 'primeng/drawer';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { LocationService, SyncStatus, SyncReport, SyncLogEntry } from '../../core/services/location.service';

@Component({
  selector: 'app-sync-page',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, DrawerModule, ProgressSpinnerModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <p-button icon="pi pi-arrow-left" severity="secondary" [text]="true" [rounded]="true" (onClick)="router.navigate(['/dashboard'])" />
          <div>
            <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Locations</h1>
            <p class="text-surface-500 dark:text-surface-400 text-sm mt-0.5">Sync and manage cities & totems from CDN</p>
          </div>
        </div>
        <p-button label="Sync Logs" icon="pi pi-history" severity="secondary" [outlined]="true" (onClick)="openLogs()" />
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
        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
          <!-- Sync header with status indicator -->
          <div class="flex items-center justify-between p-6 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                [class]="syncStatus()?.lastSyncedAt ? 'bg-green-100 dark:bg-green-900/20' : 'bg-surface-100 dark:bg-surface-800'">
                <i class="pi pi-sync" [class]="syncStatus()?.lastSyncedAt ? 'text-green-600' : 'text-surface-400'"></i>
              </div>
              <div>
                <h2 class="font-semibold text-surface-900 dark:text-surface-0">CDN Sync</h2>
                <p class="text-xs text-surface-500 mt-0.5">cdn.go2digital.hr/loc.json</p>
              </div>
            </div>
            <p-button
              label="Sync Now"
              icon="pi pi-sync"
              size="small"
              [loading]="isSyncing()"
              (onClick)="onSync()" />
          </div>

          <!-- Last sync info -->
          <div class="px-6 pb-4">
            @if (syncStatus()?.lastSyncedAt) {
              <div class="flex items-center gap-2 text-sm">
                <span class="w-2 h-2 rounded-full bg-green-500"></span>
                <span class="text-surface-500">Last synced</span>
                <span class="font-medium text-surface-900 dark:text-surface-0">{{ syncStatus()!.lastSyncedAt | date:'dd.MM.yyyy HH:mm' }}</span>
              </div>
            } @else {
              <div class="flex items-center gap-2 text-sm">
                <span class="w-2 h-2 rounded-full bg-orange-400"></span>
                <span class="text-surface-500">Never synced — click Sync Now to import locations</span>
              </div>
            }
          </div>

          <!-- Last report (if just synced) -->
          @if (lastReport()) {
            <div class="border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 p-4">
              <div class="flex items-center gap-2 mb-3">
                <i class="pi pi-check-circle text-green-600 text-sm"></i>
                <span class="text-sm font-medium text-surface-900 dark:text-surface-0">Sync completed</span>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="flex items-center gap-2 text-xs">
                  <span class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 font-bold text-sm">{{ lastReport()!.report.cities_created }}</span>
                  <span class="text-surface-500">cities created</span>
                </div>
                <div class="flex items-center gap-2 text-xs">
                  <span class="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center text-surface-600 font-bold text-sm">{{ lastReport()!.report.cities_updated }}</span>
                  <span class="text-surface-500">cities updated</span>
                </div>
                <div class="flex items-center gap-2 text-xs">
                  <span class="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 font-bold text-sm">{{ lastReport()!.report.totems_created }}</span>
                  <span class="text-surface-500">totems created</span>
                </div>
                <div class="flex items-center gap-2 text-xs">
                  <span class="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center text-surface-600 font-bold text-sm">{{ lastReport()!.report.totems_updated }}</span>
                  <span class="text-surface-500">totems updated</span>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Quick Links -->
        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
          <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Quick Links</h2>
          <div class="flex flex-col gap-3">
            <button class="flex items-center gap-3 p-4 rounded-lg border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors cursor-pointer text-left w-full" (click)="router.navigate(['/locations/cities'])">
              <i class="pi pi-building text-xl text-primary"></i>
              <div><div class="font-medium text-surface-900 dark:text-surface-0">Manage Cities</div><div class="text-sm text-surface-500">Toggle visibility and sort order</div></div>
              <i class="pi pi-chevron-right ml-auto text-surface-400"></i>
            </button>
            <button class="flex items-center gap-3 p-4 rounded-lg border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors cursor-pointer text-left w-full" (click)="router.navigate(['/locations/totems'])">
              <i class="pi pi-map text-xl text-primary"></i>
              <div><div class="font-medium text-surface-900 dark:text-surface-0">Manage Totems</div><div class="text-sm text-surface-500">Edit totem details and publishing</div></div>
              <i class="pi pi-chevron-right ml-auto text-surface-400"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Sync Logs Drawer -->
      <p-drawer [(visible)]="logsVisible" header="Sync History" position="right" [style]="{ width: '480px' }">
        @if (logsLoading()) {
          <div class="flex items-center justify-center py-8">
            <p-progressSpinner [style]="{ width: '32px', height: '32px' }" strokeWidth="4"></p-progressSpinner>
          </div>
        } @else if (syncLogs().length === 0) {
          <div class="text-center py-8 text-surface-500">
            <i class="pi pi-history text-3xl mb-2 block"></i>
            <p class="text-sm">No sync logs yet</p>
          </div>
        } @else {
          <div class="flex flex-col gap-3">
            @for (log of syncLogs(); track log.id) {
              <div class="rounded-lg border p-4 text-sm"
                [class]="log.success
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                  : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <i [class]="log.success ? 'pi pi-check-circle text-green-600' : 'pi pi-times-circle text-red-600'"></i>
                    <span class="font-medium text-surface-900 dark:text-surface-0">
                      {{ log.success ? 'Sync successful' : 'Sync failed' }}
                    </span>
                  </div>
                  <span class="text-xs text-surface-500 font-mono">{{ log.durationMs | number:'1.0-0' }}ms</span>
                </div>
                <div class="text-xs text-surface-500 mb-2">
                  {{ log.createdAt | date:'dd.MM.yyyy HH:mm:ss' }}
                  @if (log.triggeredBy) { <span> &middot; {{ log.triggeredBy }}</span> }
                </div>
                @if (log.success && log.report) {
                  <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div class="flex justify-between"><span class="text-surface-500">Cities new</span><span class="font-medium">{{ log.report.cities_created }}</span></div>
                    <div class="flex justify-between"><span class="text-surface-500">Cities updated</span><span class="font-medium">{{ log.report.cities_updated }}</span></div>
                    <div class="flex justify-between"><span class="text-surface-500">Totems new</span><span class="font-medium">{{ log.report.totems_created }}</span></div>
                    <div class="flex justify-between"><span class="text-surface-500">Totems updated</span><span class="font-medium">{{ log.report.totems_updated }}</span></div>
                    <div class="flex justify-between"><span class="text-surface-500">Total cities</span><span class="font-medium">{{ log.report.total_cities }}</span></div>
                    <div class="flex justify-between"><span class="text-surface-500">Total totems</span><span class="font-medium">{{ log.report.total_totems }}</span></div>
                  </div>
                }
                @if (!log.success && log.error) {
                  <div class="text-xs text-red-600 dark:text-red-400 mt-1 font-mono bg-red-100 dark:bg-red-900/20 rounded p-2">{{ log.error }}</div>
                }
              </div>
            }
          </div>
        }
      </p-drawer>

      <p-toast></p-toast>
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

  logsVisible = false;
  syncLogs = signal<SyncLogEntry[]>([]);
  logsLoading = signal(false);

  ngOnInit(): void {
    this.loadSyncStatus();
  }

  loadSyncStatus(): void {
    this.locationService.getSyncStatus().subscribe({
      next: (status) => this.syncStatus.set(status),
      error: () => this.messageService.add({ severity: 'error', summary: 'Failed to load sync status' }),
    });
  }

  onSync(): void {
    this.isSyncing.set(true);
    this.locationService.syncFromCdn().subscribe({
      next: (report) => {
        this.lastReport.set(report);
        this.isSyncing.set(false);
        this.loadSyncStatus();
        this.messageService.add({ severity: 'success', summary: 'Sync Complete' });
      },
      error: () => {
        this.isSyncing.set(false);
        this.messageService.add({ severity: 'error', summary: 'Sync failed' });
      },
    });
  }

  openLogs(): void {
    this.logsVisible = true;
    this.logsLoading.set(true);
    this.locationService.getSyncLogs().subscribe({
      next: (logs) => { this.syncLogs.set(logs); this.logsLoading.set(false); },
      error: () => { this.syncLogs.set([]); this.logsLoading.set(false); },
    });
  }
}
