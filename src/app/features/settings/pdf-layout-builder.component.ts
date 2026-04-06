import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SelectModule } from 'primeng/select';
import { ColorPickerModule } from 'primeng/colorpicker';
import { MessageService } from 'primeng/api';

import { SettingsService, Setting } from '../../core/services/settings.service';

interface PdfColumn {
  key: string;
  label: string;
  enabled: boolean;
}

interface PdfLayout {
  pageSize: string;
  orientation: string;
  margins: { top: number; right: number; bottom: number; left: number };
  header: {
    title: string;
    subtitle: string;
    logo: string;
    bgColor: string;
    textColor: string;
    accentColor: string;
  };
  columns: PdfColumn[];
  footer: {
    text: string;
    showPageNumbers: boolean;
    showDate: boolean;
  };
}

@Component({
  selector: 'app-pdf-layout-builder',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, InputTextModule,
    InputNumberModule, ToggleSwitchModule, SelectModule, ColorPickerModule,
  ],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">PDF Layout Builder</h1>
          <p class="text-surface-500 text-sm mt-0.5">Design the PDF export layout for location collections</p>
        </div>
        <div class="flex items-center gap-3">
          <p-button label="Preview" icon="pi pi-eye" [outlined]="true" (onClick)="previewPdf()" />
          <p-button label="Save" icon="pi pi-save" [loading]="saving()" (onClick)="save()" />
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <!-- Header Settings -->
        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
          <div class="flex items-center gap-2 mb-4">
            <i class="pi pi-bookmark text-blue-500"></i>
            <h3 class="text-base font-semibold text-surface-900 dark:text-surface-0">Header</h3>
          </div>
          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Title</label>
              <input pInputText class="w-full" [(ngModel)]="layout.header.title" />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Subtitle</label>
              <input pInputText class="w-full" [(ngModel)]="layout.header.subtitle" />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Logo URL</label>
              <input pInputText class="w-full" [(ngModel)]="layout.header.logo" placeholder="/storage/media/logo.png" />
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div class="flex flex-col gap-2">
                <label class="text-xs font-medium text-surface-500">Background</label>
                <div class="flex items-center gap-2">
                  <p-colorPicker [(ngModel)]="layout.header.bgColor" />
                  <span class="text-xs text-surface-400 font-mono">{{ layout.header.bgColor }}</span>
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-xs font-medium text-surface-500">Text</label>
                <div class="flex items-center gap-2">
                  <p-colorPicker [(ngModel)]="layout.header.textColor" />
                  <span class="text-xs text-surface-400 font-mono">{{ layout.header.textColor }}</span>
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-xs font-medium text-surface-500">Accent</label>
                <div class="flex items-center gap-2">
                  <p-colorPicker [(ngModel)]="layout.header.accentColor" />
                  <span class="text-xs text-surface-400 font-mono">{{ layout.header.accentColor }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Page Layout -->
        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
          <div class="flex items-center gap-2 mb-4">
            <i class="pi pi-file text-purple-500"></i>
            <h3 class="text-base font-semibold text-surface-900 dark:text-surface-0">Page Layout</h3>
          </div>
          <div class="flex flex-col gap-4">
            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Page Size</label>
                <p-select [options]="pageSizes" [(ngModel)]="layout.pageSize" optionLabel="label" optionValue="value" class="w-full" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Orientation</label>
                <p-select [options]="orientations" [(ngModel)]="layout.orientation" optionLabel="label" optionValue="value" class="w-full" />
              </div>
            </div>
            <div>
              <label class="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2 block">Margins (mm)</label>
              <div class="grid grid-cols-4 gap-3">
                <div class="flex flex-col gap-1">
                  <span class="text-xs text-surface-400">Top</span>
                  <p-inputNumber [(ngModel)]="layout.margins.top" [min]="0" [max]="50" suffix=" mm" class="w-full" inputStyleClass="w-full" />
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-xs text-surface-400">Right</span>
                  <p-inputNumber [(ngModel)]="layout.margins.right" [min]="0" [max]="50" suffix=" mm" class="w-full" inputStyleClass="w-full" />
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-xs text-surface-400">Bottom</span>
                  <p-inputNumber [(ngModel)]="layout.margins.bottom" [min]="0" [max]="50" suffix=" mm" class="w-full" inputStyleClass="w-full" />
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-xs text-surface-400">Left</span>
                  <p-inputNumber [(ngModel)]="layout.margins.left" [min]="0" [max]="50" suffix=" mm" class="w-full" inputStyleClass="w-full" />
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="border-t border-surface-200 dark:border-surface-700 pt-4 mt-2">
              <div class="flex items-center gap-2 mb-3">
                <i class="pi pi-align-left text-green-500"></i>
                <h4 class="text-sm font-semibold text-surface-900 dark:text-surface-0">Footer</h4>
              </div>
              <div class="flex flex-col gap-3">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Footer Text</label>
                  <input pInputText class="w-full" [(ngModel)]="layout.footer.text" />
                </div>
                <div class="flex items-center gap-6">
                  <label class="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300">
                    <p-toggleSwitch [(ngModel)]="layout.footer.showPageNumbers" />
                    Page numbers
                  </label>
                  <label class="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300">
                    <p-toggleSwitch [(ngModel)]="layout.footer.showDate" />
                    Date
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Columns -->
        <div class="xl:col-span-2 bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
          <div class="flex items-center gap-2 mb-4">
            <i class="pi pi-table text-orange-500"></i>
            <h3 class="text-base font-semibold text-surface-900 dark:text-surface-0">Table Columns</h3>
          </div>
          <p class="text-xs text-surface-400 mb-4">Enable/disable columns and customize their labels</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            @for (col of layout.columns; track col.key) {
              <div class="flex items-center gap-3 p-3 rounded-lg border transition-colors"
                [class]="col.enabled
                  ? 'border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10'
                  : 'border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800'">
                <p-toggleSwitch [(ngModel)]="col.enabled" />
                <div class="flex-1 min-w-0">
                  <input pInputText class="w-full text-sm" [(ngModel)]="col.label"
                    [style]="{ opacity: col.enabled ? 1 : 0.4 }" />
                  <span class="text-xs text-surface-400 font-mono mt-0.5 block">{{ col.key }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PdfLayoutBuilderComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private messageService = inject(MessageService);

  saving = signal(false);
  settingId: string | null = null;

  pageSizes = [
    { label: 'A4', value: 'A4' },
    { label: 'A3', value: 'A3' },
    { label: 'Letter', value: 'Letter' },
    { label: 'Legal', value: 'Legal' },
  ];

  orientations = [
    { label: 'Landscape', value: 'landscape' },
    { label: 'Portrait', value: 'portrait' },
  ];

  layout: PdfLayout = {
    pageSize: 'A4',
    orientation: 'landscape',
    margins: { top: 15, right: 15, bottom: 15, left: 15 },
    header: {
      title: 'Go2Digital',
      subtitle: 'Location Collection',
      logo: '',
      bgColor: '#03120F',
      textColor: '#ffffff',
      accentColor: '#0CD459',
    },
    columns: [
      { key: 'index', label: '#', enabled: true },
      { key: 'name', label: 'Location Name', enabled: true },
      { key: 'city', label: 'City', enabled: true },
      { key: 'environment', label: 'Environment', enabled: true },
      { key: 'screens', label: 'Screens', enabled: true },
      { key: 'coordinates', label: 'Coordinates', enabled: true },
      { key: 'image', label: 'Image', enabled: false },
    ],
    footer: {
      text: 'go2digital.hr',
      showPageNumbers: true,
      showDate: true,
    },
  };

  ngOnInit(): void {
    this.loadLayout();
  }

  async loadLayout(): Promise<void> {
    try {
      const settings = await this.settingsService.getSettings().toPromise();
      const setting = settings?.find((s: Setting) => s.key === 'pdf.locationExport');
      if (setting?.value) {
        this.settingId = (setting as any).id || (setting as any)['@id'] || null;
        // Deep merge with defaults to handle missing keys
        this.layout = {
          ...this.layout,
          ...setting.value,
          margins: { ...this.layout.margins, ...(setting.value as any).margins },
          header: { ...this.layout.header, ...(setting.value as any).header },
          footer: { ...this.layout.footer, ...(setting.value as any).footer },
          columns: (setting.value as any).columns?.length ? (setting.value as any).columns : this.layout.columns,
        };
      }
    } catch {
      // Use defaults
    }
  }

  async save(): Promise<void> {
    this.saving.set(true);
    try {
      if (this.settingId) {
        // Extract the UUID from @id if needed
        const id = typeof this.settingId === 'string' && this.settingId.includes('/')
          ? this.settingId.split('/').pop()!
          : this.settingId;
        await this.settingsService.updateSetting(id, {
          key: 'pdf.locationExport',
          group: 'pdf',
          value: this.layout as any,
        }).toPromise();
      } else {
        const result = await this.settingsService.createSetting({
          key: 'pdf.locationExport',
          group: 'pdf',
          value: this.layout as any,
        }).toPromise();
        this.settingId = (result as any)?.id || (result as any)?.['@id'] || null;
      }
      this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'PDF layout saved successfully' });
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save layout' });
    }
    this.saving.set(false);
  }

  previewPdf(): void {
    // Save first, then open preview
    this.save().then(() => {
      const apiBase = (window as any).__apiBase || 'https://127.0.0.1:8001';
      window.open(`${apiBase}/api/locations/preview-pdf`, '_blank');
    });
  }
}
