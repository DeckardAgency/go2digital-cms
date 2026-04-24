import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import { TypographyFont, TypographyService } from '../../core/services/typography.service';

function blankFont(): TypographyFont {
  return {
    slug: '',
    name: '',
    stack: "'Your Font', -apple-system, BlinkMacSystemFont, sans-serif",
    weights: [],
  };
}

function cloneDeep<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

@Component({
  selector: 'app-typography-fonts-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    ButtonModule, TableModule, DialogModule, SelectModule, InputTextModule, TooltipModule,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Fonts</h1>
          <p class="text-surface-500 dark:text-surface-400 mt-1">
            Registered font families. Each font has one or more weight files served from the API.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <a class="text-xs text-primary-600 hover:underline" routerLink="/typography/presets">Manage presets →</a>
          <p-button label="Add Font" icon="pi pi-plus" (onClick)="openNew()" />
        </div>
      </div>

      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
        <p-table [value]="typography.fonts()" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Stack</th>
              <th class="text-center">Weights</th>
              <th style="width: 6rem"></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-font>
            <tr>
              <td>
                <div class="font-medium text-surface-900 dark:text-surface-0" [style.font-family]="font.stack">{{ font.name }}</div>
              </td>
              <td>
                <code class="text-xs text-surface-500">{{ font.slug }}</code>
              </td>
              <td>
                <code class="text-[11px] text-surface-400 truncate block" style="max-width: 32rem">{{ font.stack }}</code>
              </td>
              <td class="text-center text-sm">
                <div class="flex flex-wrap gap-1 justify-center">
                  @for (w of font.weights; track w.src) {
                    <span class="px-2 py-0.5 rounded-full text-[11px] bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">{{ w.weight }}</span>
                  }
                  @if (!font.weights?.length) {
                    <span class="text-xs text-surface-400">—</span>
                  }
                </div>
              </td>
              <td class="text-right">
                <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" severity="secondary" (onClick)="openEdit(font)" pTooltip="Edit" />
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="5" class="text-center py-8 text-surface-400">No fonts yet. Run <code>php bin/console app:seed-typography</code> or click "Add Font".</td></tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog
      [visible]="dialogOpen()"
      (visibleChange)="dialogOpen.set($event)"
      [modal]="true"
      [header]="isCreating() ? 'New Font' : 'Edit Font'"
      [style]="{ width: '720px' }"
      [dismissableMask]="true"
    >
      @if (editing(); as font) {
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-surface-600 dark:text-surface-300 mb-1">Slug</label>
            <input pInputText class="w-full font-mono text-sm" [(ngModel)]="font.slug"
              [readonly]="!isCreating()"
              placeholder="pp-neue-montreal" />
            @if (!isCreating()) {
              <p class="text-[11px] text-surface-400 mt-1">Locked on existing fonts.</p>
            }
          </div>

          <div>
            <label class="block text-xs font-medium text-surface-600 dark:text-surface-300 mb-1">Display Name</label>
            <input pInputText class="w-full" [(ngModel)]="font.name" placeholder="PP Neue Montreal" />
          </div>

          <div class="col-span-2">
            <label class="block text-xs font-medium text-surface-600 dark:text-surface-300 mb-1">Font Stack (CSS value)</label>
            <input pInputText class="w-full font-mono text-sm" [(ngModel)]="font.stack"
              placeholder="'PP Neue Montreal', -apple-system, BlinkMacSystemFont, sans-serif" />
            <p class="text-[11px] text-surface-400 mt-1">Include fallback system fonts — comma-separated.</p>
          </div>

          <div class="col-span-2 border-t border-surface-200 dark:border-surface-700 pt-4 mt-2">
            <div class="flex items-center justify-between mb-3">
              <div class="text-xs font-medium text-surface-600 dark:text-surface-300">
                Weights <span class="text-surface-400 font-normal">({{ font.weights.length }})</span>
              </div>
              <p-button label="Upload Weight" icon="pi pi-upload" size="small" severity="secondary" [outlined]="true"
                [loading]="uploading()"
                (onClick)="fileInput.click()" />
              <input #fileInput type="file" accept=".woff2,.woff,.ttf,.otf" class="hidden" (change)="onFileSelected($event)" />
            </div>

            @if (font.weights.length === 0) {
              <p class="text-sm text-surface-400 text-center py-6">No weights yet. Click "Upload Weight" to add a font file.</p>
            } @else {
              <div class="flex flex-col gap-2">
                @for (w of font.weights; track $index; let i = $index) {
                  <div class="flex items-center gap-3 p-3 border border-surface-200 dark:border-surface-700 rounded">
                    <div class="flex-shrink-0 w-28">
                      <label class="block text-[11px] text-surface-400 mb-0.5">Weight</label>
                      <p-select [options]="weightOptions" [(ngModel)]="w.weight" optionLabel="label" optionValue="value" styleClass="w-full" appendTo="body" />
                    </div>
                    <div class="flex-shrink-0 w-24">
                      <label class="block text-[11px] text-surface-400 mb-0.5">Format</label>
                      <code class="text-xs font-mono px-2 py-1.5 bg-surface-50 dark:bg-surface-800 rounded block">{{ w.format }}</code>
                    </div>
                    <div class="flex-1 min-w-0">
                      <label class="block text-[11px] text-surface-400 mb-0.5">Source</label>
                      <code class="text-xs font-mono truncate block text-surface-500" [pTooltip]="w.src">{{ w.src }}</code>
                    </div>
                    <p-button icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" size="small" (onClick)="removeWeight(i)" pTooltip="Remove weight" />
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }

      <ng-template pTemplate="footer">
        <p-button label="Cancel" severity="secondary" [outlined]="true" (onClick)="dialogOpen.set(false)" />
        <p-button label="Save" icon="pi pi-check" [loading]="saving()" [disabled]="!canSave()" (onClick)="save()" />
      </ng-template>
    </p-dialog>
  `,
})
export class TypographyFontsPageComponent implements OnInit {
  typography = inject(TypographyService);
  private messageService = inject(MessageService);

  dialogOpen = signal(false);
  isCreating = signal(false);
  editing = signal<TypographyFont | null>(null);
  saving = signal(false);
  uploading = signal(false);

  weightOptions = [
    { label: '100 — Thin', value: 100 },
    { label: '200 — Extra Light', value: 200 },
    { label: '300 — Light', value: 300 },
    { label: '400 — Regular', value: 400 },
    { label: '500 — Medium', value: 500 },
    { label: '600 — Semibold', value: 600 },
    { label: '700 — Bold', value: 700 },
    { label: '800 — Extra Bold', value: 800 },
    { label: '900 — Black', value: 900 },
  ];

  ngOnInit(): void {
    this.typography.loadAll().subscribe();
  }

  canSave(): boolean {
    const f = this.editing();
    if (!f) return false;
    return !!(f.slug.trim() && f.name.trim() && f.stack.trim());
  }

  openNew(): void {
    this.editing.set(blankFont());
    this.isCreating.set(true);
    this.dialogOpen.set(true);
  }

  openEdit(font: TypographyFont): void {
    this.editing.set(cloneDeep(font));
    this.isCreating.set(false);
    this.dialogOpen.set(true);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    const f = this.editing();
    if (!f) return;

    this.uploading.set(true);
    this.typography.uploadFontFile(file).subscribe({
      next: (res) => {
        this.uploading.set(false);
        this.editing.update(cur => cur ? ({
          ...cur,
          weights: [...cur.weights, { weight: 400, src: res.src, format: res.format }],
        }) : cur);
        this.messageService.add({ severity: 'success', summary: 'Font file uploaded', detail: res.originalFilename });
      },
      error: (err) => {
        this.uploading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Upload failed', detail: err.error?.error || 'Unknown error' });
      },
    });
  }

  removeWeight(index: number): void {
    this.editing.update(cur => cur ? ({
      ...cur,
      weights: cur.weights.filter((_, i) => i !== index),
    }) : cur);
  }

  save(): void {
    const edited = this.editing();
    if (!edited) return;

    this.saving.set(true);
    const current = this.typography.fonts();
    let next: TypographyFont[];
    if (this.isCreating()) {
      if (current.find(f => f.slug === edited.slug)) {
        this.saving.set(false);
        this.messageService.add({ severity: 'error', summary: 'Slug already exists' });
        return;
      }
      next = [...current, edited];
    } else {
      next = current.map(f => f.slug === edited.slug ? edited : f);
    }

    this.typography.saveFonts(next).subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogOpen.set(false);
        this.messageService.add({ severity: 'success', summary: this.isCreating() ? 'Font created' : 'Font saved' });
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({ severity: 'error', summary: 'Save failed' });
      },
    });
  }
}
