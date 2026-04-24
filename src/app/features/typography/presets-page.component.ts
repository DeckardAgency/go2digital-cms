import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { TypographyPreset, TypographyService } from '../../core/services/typography.service';

function blankPreset(): TypographyPreset {
  return {
    slug: '',
    label: '',
    fontSlug: 'pp-neue-montreal',
    weight: 400,
    lineHeight: 1.4,
    letterSpacing: null,
    sizes: { mobile: '1rem', tablet: '1rem', desktop: '1rem' },
  };
}

function cloneDeep<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

@Component({
  selector: 'app-typography-presets-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    ButtonModule, TableModule, DialogModule, SelectModule, InputTextModule, TooltipModule, ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Typography Presets</h1>
          <p class="text-surface-500 dark:text-surface-400 mt-1">
            Named text styles used across the site. Edit once, applies everywhere.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <a
            class="text-xs text-primary-600 hover:underline"
            routerLink="/typography/block-maps"
          >Block typography →</a>
          <p-button label="New Preset" icon="pi pi-plus" (onClick)="openNew()" />
        </div>
      </div>

      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
        <p-table [value]="typography.presets()" styleClass="p-datatable-sm" [loading]="typography.loading()">
          <ng-template pTemplate="header">
            <tr>
              <th>Label</th>
              <th>Slug</th>
              <th>Font</th>
              <th class="text-center">Weight</th>
              <th>Desktop</th>
              <th>Tablet</th>
              <th>Mobile</th>
              <th class="text-center">Used</th>
              <th style="width: 8rem"></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-preset>
            <tr>
              <td>
                <div class="font-medium text-surface-900 dark:text-surface-0">{{ preset.label }}</div>
              </td>
              <td>
                <code class="text-xs text-surface-500">{{ preset.slug }}</code>
              </td>
              <td class="text-sm">{{ fontLabel(preset.fontSlug) }}</td>
              <td class="text-center text-sm">{{ preset.weight }}</td>
              <td class="text-sm font-mono">{{ preset.sizes.desktop }}</td>
              <td class="text-sm font-mono">{{ preset.sizes.tablet }}</td>
              <td class="text-sm font-mono">{{ preset.sizes.mobile }}</td>
              <td class="text-center">
                @if (usageCount(preset.slug) > 0) {
                  <span
                    class="px-2 py-0.5 rounded-full text-[11px] bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                    [pTooltip]="usageTooltip(preset.slug)"
                  >{{ usageCount(preset.slug) }}</span>
                } @else {
                  <span class="text-xs text-surface-400">—</span>
                }
              </td>
              <td class="text-right">
                <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" severity="secondary" (onClick)="openEdit(preset)" pTooltip="Edit" />
                <p-button icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" (onClick)="confirmDelete(preset)" pTooltip="Delete" />
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="9" class="text-center py-8 text-surface-400">No presets yet. Run <code>php bin/console app:seed-typography</code> or click "New Preset".</td></tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog
      [visible]="dialogOpen()"
      (visibleChange)="dialogOpen.set($event)"
      [modal]="true"
      [header]="isCreating() ? 'New Preset' : 'Edit Preset'"
      [style]="{ width: '720px' }"
      [dismissableMask]="true"
    >
      @if (editing()) {
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block text-xs font-medium text-surface-600 dark:text-surface-300 mb-1">Label</label>
            <input pInputText class="w-full" [(ngModel)]="editing()!.label" placeholder="Hero — Main Title" />
          </div>

          <div>
            <label class="block text-xs font-medium text-surface-600 dark:text-surface-300 mb-1">Slug</label>
            <input pInputText class="w-full font-mono text-sm" [(ngModel)]="editing()!.slug"
              [readonly]="!isCreating()"
              placeholder="hero-title" />
            @if (!isCreating()) {
              <p class="text-[11px] text-surface-400 mt-1">Slug is locked on existing presets. Delete and recreate to rename.</p>
            }
          </div>

          <div>
            <label class="block text-xs font-medium text-surface-600 dark:text-surface-300 mb-1">Font</label>
            <p-select [options]="fontOptions()" [(ngModel)]="editing()!.fontSlug" optionLabel="name" optionValue="slug" styleClass="w-full" />
          </div>

          <div>
            <label class="block text-xs font-medium text-surface-600 dark:text-surface-300 mb-1">Weight</label>
            <p-select [options]="weightOptions" [(ngModel)]="editing()!.weight" optionLabel="label" optionValue="value" styleClass="w-full" />
          </div>

          <div>
            <label class="block text-xs font-medium text-surface-600 dark:text-surface-300 mb-1">Line Height</label>
            <input pInputText class="w-full" [ngModel]="editing()!.lineHeight" (ngModelChange)="setLineHeight($event)" placeholder="1.4" />
          </div>

          <div class="col-span-2">
            <label class="block text-xs font-medium text-surface-600 dark:text-surface-300 mb-1">
              Letter Spacing <span class="text-surface-400 font-normal">(optional, e.g. -0.02em)</span>
            </label>
            <input pInputText class="w-full font-mono text-sm" [ngModel]="editing()!.letterSpacing || ''" (ngModelChange)="setLetterSpacing($event)" placeholder="-0.02em" />
          </div>

          <div class="col-span-2 border-t border-surface-200 dark:border-surface-700 pt-4 mt-2">
            <div class="text-xs font-medium text-surface-600 dark:text-surface-300 mb-2">
              Sizes <span class="text-surface-400 font-normal">(CSS length — 3.125rem, 50px, clamp(2rem, 4vw, 3rem))</span>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-[11px] text-surface-400 mb-1">Desktop</label>
                <input pInputText class="w-full font-mono text-sm" [(ngModel)]="editing()!.sizes.desktop" placeholder="3.125rem" />
              </div>
              <div>
                <label class="block text-[11px] text-surface-400 mb-1">Tablet (≤1023px)</label>
                <input pInputText class="w-full font-mono text-sm" [(ngModel)]="editing()!.sizes.tablet" placeholder="2.5rem" />
              </div>
              <div>
                <label class="block text-[11px] text-surface-400 mb-1">Mobile (≤767px)</label>
                <input pInputText class="w-full font-mono text-sm" [(ngModel)]="editing()!.sizes.mobile" placeholder="2rem" />
              </div>
            </div>
          </div>

          <div class="col-span-2 border-t border-surface-200 dark:border-surface-700 pt-4 mt-2">
            <div class="text-xs font-medium text-surface-600 dark:text-surface-300 mb-2">Preview</div>
            <div class="grid grid-cols-3 gap-3">
              <div class="p-4 bg-surface-50 dark:bg-surface-800 rounded border border-surface-200 dark:border-surface-700">
                <div class="text-[10px] uppercase tracking-wide text-surface-400 mb-2">Desktop</div>
                <div [style]="previewStyle('desktop')">The quick brown fox</div>
              </div>
              <div class="p-4 bg-surface-50 dark:bg-surface-800 rounded border border-surface-200 dark:border-surface-700">
                <div class="text-[10px] uppercase tracking-wide text-surface-400 mb-2">Tablet</div>
                <div [style]="previewStyle('tablet')">The quick brown fox</div>
              </div>
              <div class="p-4 bg-surface-50 dark:bg-surface-800 rounded border border-surface-200 dark:border-surface-700">
                <div class="text-[10px] uppercase tracking-wide text-surface-400 mb-2">Mobile</div>
                <div [style]="previewStyle('mobile')">The quick brown fox</div>
              </div>
            </div>
          </div>
        </div>
      }

      <ng-template pTemplate="footer">
        <p-button label="Cancel" severity="secondary" [outlined]="true" (onClick)="dialogOpen.set(false)" />
        <p-button label="Save" icon="pi pi-check" [loading]="saving()" [disabled]="!canSave()" (onClick)="save()" />
      </ng-template>
    </p-dialog>

    <p-confirmDialog />
  `,
})
export class TypographyPresetsPageComponent implements OnInit {
  typography = inject(TypographyService);
  private messageService = inject(MessageService);
  private confirmService = inject(ConfirmationService);

  dialogOpen = signal(false);
  isCreating = signal(false);
  editing = signal<TypographyPreset | null>(null);
  saving = signal(false);

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

  fontOptions = computed(() => this.typography.fonts());

  canSave = computed(() => {
    const e = this.editing();
    if (!e) return false;
    if (!e.slug.trim() || !e.label.trim()) return false;
    if (!e.sizes.desktop || !e.sizes.tablet || !e.sizes.mobile) return false;
    return true;
  });

  ngOnInit(): void {
    this.typography.loadAll().subscribe();
    this.typography.loadUsage().subscribe();
  }

  fontLabel(slug: string): string {
    return this.typography.fonts().find(f => f.slug === slug)?.name || slug;
  }

  usageCount(slug: string): number {
    return this.typography.usage()[slug]?.count ?? 0;
  }

  usageTooltip(slug: string): string {
    const u = this.typography.usage()[slug];
    if (!u || u.count === 0) return '';
    const parts: string[] = [];
    if (u.singletons.length) parts.push('Sections: ' + u.singletons.join(', '));
    if (u.blockMaps.length) parts.push('Collections: ' + u.blockMaps.join(', '));
    return parts.join('\n');
  }

  openNew(): void {
    this.editing.set(blankPreset());
    this.isCreating.set(true);
    this.dialogOpen.set(true);
  }

  openEdit(preset: TypographyPreset): void {
    this.editing.set(cloneDeep(preset));
    this.isCreating.set(false);
    this.dialogOpen.set(true);
  }

  setLineHeight(raw: string | number): void {
    const e = this.editing();
    if (!e) return;
    const num = typeof raw === 'number' ? raw : parseFloat(raw);
    this.editing.set({ ...e, lineHeight: Number.isFinite(num) ? num : raw });
  }

  setLetterSpacing(raw: string): void {
    const e = this.editing();
    if (!e) return;
    this.editing.set({ ...e, letterSpacing: raw.trim() || null });
  }

  previewStyle(breakpoint: keyof TypographyPreset['sizes']): Record<string, string> {
    const e = this.editing();
    if (!e) return {};
    const font = this.typography.fonts().find(f => f.slug === e.fontSlug);
    const style: Record<string, string> = {
      'font-family': font?.stack || 'inherit',
      'font-weight': String(e.weight),
      'line-height': String(e.lineHeight),
      'font-size': e.sizes[breakpoint] || e.sizes.desktop,
    };
    if (e.letterSpacing) style['letter-spacing'] = e.letterSpacing;
    return style;
  }

  save(): void {
    const e = this.editing();
    if (!e) return;
    this.saving.set(true);
    this.typography.savePreset(e).subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogOpen.set(false);
        this.messageService.add({ severity: 'success', summary: this.isCreating() ? 'Preset created' : 'Preset saved' });
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({ severity: 'error', summary: 'Save failed' });
      },
    });
  }

  confirmDelete(preset: TypographyPreset): void {
    const u = this.typography.usage()[preset.slug];
    const inUse = u && u.count > 0;
    const usageMsg = inUse
      ? ` It is currently referenced by ${u.count} place${u.count === 1 ? '' : 's'} (${this.usageTooltip(preset.slug).replace(/\n/g, '; ')}). Those will fall back to their hardcoded defaults.`
      : '';
    this.confirmService.confirm({
      message: `Delete preset "${preset.label}"?${usageMsg}`,
      header: inUse ? 'Preset in use — confirm delete' : 'Delete Preset',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.typography.deletePreset(preset.slug).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Preset deleted' });
            this.typography.loadUsage().subscribe();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Delete failed' }),
        });
      },
    });
  }
}
