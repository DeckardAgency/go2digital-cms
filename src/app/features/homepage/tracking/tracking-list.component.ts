import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { SettingsService, Setting } from '../../../core/services/settings.service';

import {
  DataTableWrapperComponent,
  DataTableCellDirective,
  DataTableHeaderActionsDirective,
  DataTableRowActionsDirective,
  DataTableColumn,
  DataTableState,
} from '../../../shared/components/data-table-wrapper';
import { BlockTypographyCardComponent } from '../../../shared/components/block-typography-card/block-typography-card.component';
import { HomepageService } from '../../../core/services/homepage.service';

@Component({
  selector: 'app-tracking-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    DataTableWrapperComponent,
    DataTableCellDirective,
    DataTableHeaderActionsDirective,
    DataTableRowActionsDirective,
    MenuModule,
    BlockTypographyCardComponent,
  ],
  providers: [ConfirmationService],
  template: `
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <p-button icon="pi pi-arrow-left" severity="secondary" [text]="true" [rounded]="true" (onClick)="router.navigate(['/homepage'])" />
        <div>
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Tracking Features</h1>
          <p class="text-surface-500 dark:text-surface-400 text-sm mt-0.5">Features listed in the tracking & analytics section — Section #10</p>
        </div>
      </div>
      <p-button label="New Feature" icon="pi pi-plus" (onClick)="router.navigate(['/homepage/tracking/new'])" />
    </div>

    <!-- Section Text -->
    <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6 mb-6">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0">Section Text</h2>
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-0.5 bg-surface-100 dark:bg-surface-800 rounded-lg p-0.5">
            @for (loc of textLocales; track loc.code) {
              <button type="button"
                class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                [class]="activeTextLocale === loc.code
                  ? 'bg-surface-0 dark:bg-surface-700 text-surface-900 dark:text-surface-0 shadow-sm'
                  : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'"
                (click)="activeTextLocale = loc.code">
                {{ loc.code.toUpperCase() }}
              </button>
            }
          </div>
          <p-button label="Save Text" icon="pi pi-save" size="small" [loading]="savingText()" (onClick)="saveSectionText()" />
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Title</label>
          <input pInputText class="w-full" [(ngModel)]="sectionText[activeTextLocale].title" />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Button Text</label>
          <input pInputText class="w-full" [(ngModel)]="sectionText[activeTextLocale].buttonText" />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Button URL</label>
          <input pInputText class="w-full" [(ngModel)]="buttonUrl" placeholder="/kontakt" />
        </div>
      </div>
    </div>

    <app-block-typography-card blockId="tracking" />

    <app-data-table-wrapper
      title=""
      entityName="tracking features"
      [columns]="columns"
      [data]="items()"
      [totalRecords]="totalRecords()"
      [loading]="homepageService.isLoading()"
      (stateChange)="onStateChange($event)"
      (rowClick)="onRowClick($event)"
      (refresh)="loadItems()">

      <ng-template dtCell="title" let-row>
        <span class="font-medium text-surface-900 dark:text-surface-100">
          {{ row.translations?.hr?.title || '(no title)' }}
        </span>
      </ng-template>

      <ng-template dtRowActions let-row>
        <p-button
          icon="pi pi-ellipsis-v"
          [text]="true"
          [rounded]="true"
          severity="secondary"
          (onClick)="setCurrentRow(row); rowMenu.toggle($event)" />
        <p-menu #rowMenu [model]="rowMenuItems" [popup]="true" appendTo="body" />
      </ng-template>
    </app-data-table-wrapper>

    <p-confirmDialog />
  `,
})
export class TrackingListComponent implements OnInit {
  readonly homepageService = inject(HomepageService);
  readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly settingsService = inject(SettingsService);

  items = signal<any[]>([]);
  totalRecords = signal(0);

  // Section text
  activeTextLocale = 'hr';
  textLocales = [{ code: 'hr', label: 'Hrvatski' }, { code: 'en', label: 'English' }];
  sectionText: Record<string, { title: string; buttonText: string }> = {
    hr: { title: '', buttonText: '' },
    en: { title: '', buttonText: '' },
  };
  buttonUrl = '/kontakt';
  savingText = signal(false);
  private settingsMap: Record<string, Setting> = {};

  currentRow: any = null;
  rowMenuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-pencil',
      command: () => this.router.navigate(['/homepage/tracking', this.currentRow?.id])
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      styleClass: 'text-red-500',
      command: () => this.confirmDelete(this.currentRow)
    }
  ];

  columns: DataTableColumn[] = [
    { key: 'title', label: 'Title', defaultVisible: true },
    { key: 'icon', label: 'Icon', defaultVisible: true, width: '120px' },
    { key: 'sortOrder', label: 'Sort Order', defaultVisible: true, width: '110px' },
  ];

  ngOnInit(): void {
    this.loadItems();
    this.loadSectionText();
  }

  loadSectionText(): void {
    const keys = ['homepage.tracking.title', 'homepage.tracking.buttonText', 'homepage.tracking.buttonUrl'];
    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        for (const s of settings) {
          if (keys.includes(s.key)) {
            this.settingsMap[s.key] = s;
            if (s.key === 'homepage.tracking.buttonUrl') {
              this.buttonUrl = s.value?.value || '/kontakt';
            } else {
              const field = s.key === 'homepage.tracking.title' ? 'title' : 'buttonText';
              if (s.value?.hr !== undefined) this.sectionText['hr'][field] = s.value.hr;
              if (s.value?.en !== undefined) this.sectionText['en'][field] = s.value.en;
            }
          }
        }
      },
    });
  }

  saveSectionText(): void {
    this.savingText.set(true);
    const saves = [
      { key: 'homepage.tracking.title', value: { hr: this.sectionText['hr'].title, en: this.sectionText['en'].title } },
      { key: 'homepage.tracking.buttonText', value: { hr: this.sectionText['hr'].buttonText, en: this.sectionText['en'].buttonText } },
      { key: 'homepage.tracking.buttonUrl', value: { value: this.buttonUrl } },
    ];
    let completed = 0;
    for (const s of saves) {
      const existing = this.settingsMap[s.key];
      const req$ = existing
        ? this.settingsService.updateSetting(existing.id, { value: s.value })
        : this.settingsService.createSetting({ key: s.key, value: s.value, group: 'homepage' });
      req$.subscribe({
        next: () => { completed++; if (completed === saves.length) { this.savingText.set(false); this.messageService.add({ severity: 'success', summary: 'Section text saved' }); } },
        error: () => { completed++; if (completed === saves.length) this.savingText.set(false); },
      });
    }
  }

  loadItems(): void {
    this.homepageService.getTrackingFeatures().subscribe({
      next: (items) => {
        this.items.set(items);
        this.totalRecords.set(items.length);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load tracking features' });
      },
    });
  }

  onStateChange(state: DataTableState): void {
    this.loadItems();
  }

  onRowClick(row: any): void {
    this.router.navigate(['/homepage/tracking', row.id]);
  }

  setCurrentRow(row: any): void {
    this.currentRow = row;
  }

  confirmDelete(item: any): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${item.translations?.hr?.title || 'this feature'}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.homepageService.deleteTrackingFeature(item.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Tracking feature deleted successfully' });
            this.loadItems();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete tracking feature' });
          },
        });
      },
    });
  }
}
