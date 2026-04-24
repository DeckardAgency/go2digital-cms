import { Component, OnChanges, OnInit, computed, inject, input, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { TypographyService } from '../../../core/services/typography.service';
import { BLOCK_SCHEMAS, BlockSchema, getBlockSchema } from '../../../core/typography-block-schemas';
import { TypographyPresetFieldComponent } from '../typography-preset-field/typography-preset-field.component';

@Component({
  selector: 'app-block-typography-card',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    ButtonModule,
    TypographyPresetFieldComponent,
  ],
  template: `
    @if (schema(); as s) {
      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0">{{ title() || 'Typography' }}</h2>
            <p class="text-[11px] text-surface-400 mt-0.5">
              {{ subtitle() || defaultSubtitle() }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <a class="text-xs text-primary-600 hover:underline" routerLink="/typography/presets">Manage presets →</a>
            <p-button
              label="Save typography"
              icon="pi pi-save"
              size="small"
              [loading]="saving()"
              [disabled]="!dirty()"
              (onClick)="save()" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (el of visibleElements(); track el.key) {
            <app-typography-preset-field
              [label]="el.label"
              [value]="workingMap()[el.key]"
              [defaultSlug]="el.defaultSlug"
              (valueChange)="setElement(el.key, $event)"
            />
          }
        </div>
      </div>
    }
  `,
})
export class BlockTypographyCardComponent implements OnInit, OnChanges {
  private typography = inject(TypographyService);
  private messageService = inject(MessageService);

  blockId = input.required<string>();
  elementKeys = input<string[] | undefined>();
  title = input<string | undefined>();
  subtitle = input<string | undefined>();

  schema = computed<BlockSchema | undefined>(() => getBlockSchema(this.blockId()));

  visibleElements = computed(() => {
    const s = this.schema();
    if (!s) return [];
    const keys = this.elementKeys();
    if (!keys || keys.length === 0) return s.elements;
    const set = new Set(keys);
    return s.elements.filter(el => set.has(el.key));
  });

  defaultSubtitle = computed(() => {
    const keys = this.elementKeys();
    if (keys && keys.length > 0) {
      return 'A subset of this block\'s typography. Changes save the full block map.';
    }
    return 'Shared across every row of this collection. Blank = use default preset.';
  });
  workingMap = signal<Record<string, string | null>>({});
  saving = signal(false);
  dirty = signal(false);

  ngOnInit(): void {
    this.typography.loadAll().subscribe(() => this.resetFromStore());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['blockId'] && !changes['blockId'].firstChange) {
      this.resetFromStore();
    }
  }

  private resetFromStore(): void {
    const s = this.schema();
    if (!s) return;
    const saved = this.typography.blockMaps()[s.id] || {};
    const working: Record<string, string | null> = {};
    for (const el of s.elements) {
      working[el.key] = saved[el.key] && saved[el.key] !== el.defaultSlug ? saved[el.key] : null;
    }
    this.workingMap.set(working);
    this.dirty.set(false);
  }

  setElement(key: string, slug: string | null): void {
    this.workingMap.update(m => ({ ...m, [key]: slug }));
    this.dirty.set(true);
  }

  save(): void {
    const s = this.schema();
    if (!s) return;
    this.saving.set(true);
    const working = this.workingMap();
    const finalMap: Record<string, string> = {};
    for (const el of s.elements) {
      finalMap[el.key] = working[el.key] || el.defaultSlug;
    }
    this.typography.saveBlockMap(s.id, finalMap).subscribe({
      next: () => {
        this.saving.set(false);
        this.dirty.set(false);
        this.messageService.add({ severity: 'success', summary: 'Typography saved' });
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({ severity: 'error', summary: 'Save failed' });
      },
    });
  }
}
