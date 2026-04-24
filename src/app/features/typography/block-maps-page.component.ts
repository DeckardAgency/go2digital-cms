import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import { TypographyService } from '../../core/services/typography.service';
import { TypographyPresetFieldComponent } from '../../shared/components/typography-preset-field/typography-preset-field.component';
import { BLOCK_SCHEMAS, BlockSchema } from '../../core/typography-block-schemas';


@Component({
  selector: 'app-typography-block-maps-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    ButtonModule, TableModule, DialogModule, TooltipModule,
    TypographyPresetFieldComponent,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Block Typography Maps</h1>
          <p class="text-surface-500 dark:text-surface-400 mt-1">
            Each collection block type (panels, tracking, featured-labs, etc.) uses one shared typography map.
            Every row in that collection renders with these presets.
          </p>
        </div>
        <a
          class="text-xs text-primary-600 hover:underline"
          routerLink="/typography/presets"
        >Manage presets →</a>
      </div>

      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
        <p-table [value]="schemas" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Block</th>
              <th>Block ID</th>
              <th class="text-center">Elements</th>
              <th>Current overrides</th>
              <th style="width: 6rem"></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-schema>
            <tr>
              <td>
                <div class="font-medium text-surface-900 dark:text-surface-0">{{ schema.label }}</div>
              </td>
              <td>
                <code class="text-xs text-surface-500">{{ schema.id }}</code>
              </td>
              <td class="text-center text-sm">{{ schema.elements.length }}</td>
              <td>
                <div class="flex flex-wrap gap-1">
                  @for (chip of overrideChips(schema); track chip.key) {
                    <span
                      class="px-2 py-0.5 rounded-full text-[11px] bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                      [pTooltip]="chip.key + ' → ' + chip.value"
                    >{{ chip.key }}</span>
                  }
                  @if (overrideChips(schema).length === 0) {
                    <span class="text-xs text-surface-400">— All defaults</span>
                  }
                </div>
              </td>
              <td class="text-right">
                <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" severity="secondary" (onClick)="openEdit(schema)" pTooltip="Edit map" />
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog
      [visible]="dialogOpen()"
      (visibleChange)="dialogOpen.set($event)"
      [modal]="true"
      [header]="editingSchema()?.label ?? ''"
      [style]="{ width: '640px' }"
      [dismissableMask]="true"
    >
      @if (editingSchema(); as schema) {
        <p class="text-xs text-surface-400 mb-4">
          Block ID: <code>{{ schema.id }}</code> · applies to every row of this collection
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (el of schema.elements; track el.key) {
            <app-typography-preset-field
              [label]="el.label"
              [value]="workingMap()[el.key]"
              [defaultSlug]="el.defaultSlug"
              (valueChange)="setElement(el.key, $event)"
            />
          }
        </div>
        <p class="text-[11px] text-surface-400 mt-4">
          Leave a field blank to fall back to its default preset. Applies after the next frontend page load.
        </p>
      }

      <ng-template pTemplate="footer">
        <p-button label="Cancel" severity="secondary" [outlined]="true" (onClick)="dialogOpen.set(false)" />
        <p-button label="Save" icon="pi pi-check" [loading]="saving()" (onClick)="save()" />
      </ng-template>
    </p-dialog>
  `,
})
export class TypographyBlockMapsPageComponent implements OnInit {
  private typography = inject(TypographyService);
  private messageService = inject(MessageService);

  schemas = BLOCK_SCHEMAS;
  dialogOpen = signal(false);
  editingSchema = signal<BlockSchema | null>(null);
  workingMap = signal<Record<string, string | null>>({});
  saving = signal(false);

  ngOnInit(): void {
    this.typography.loadAll().subscribe();
  }

  overrideChips(schema: BlockSchema): { key: string; value: string }[] {
    const saved = this.typography.blockMaps()[schema.id] || {};
    return schema.elements
      .filter(el => saved[el.key] && saved[el.key] !== el.defaultSlug)
      .map(el => ({ key: el.key, value: saved[el.key] }));
  }

  openEdit(schema: BlockSchema): void {
    const saved = this.typography.blockMaps()[schema.id] || {};
    const working: Record<string, string | null> = {};
    for (const el of schema.elements) {
      working[el.key] = saved[el.key] && saved[el.key] !== el.defaultSlug ? saved[el.key] : null;
    }
    this.workingMap.set(working);
    this.editingSchema.set(schema);
    this.dialogOpen.set(true);
  }

  setElement(key: string, slug: string | null): void {
    this.workingMap.update(m => ({ ...m, [key]: slug }));
  }

  save(): void {
    const schema = this.editingSchema();
    if (!schema) return;

    this.saving.set(true);
    const working = this.workingMap();
    const finalMap: Record<string, string> = {};
    for (const el of schema.elements) {
      const chosen = working[el.key] || el.defaultSlug;
      finalMap[el.key] = chosen;
    }

    this.typography.saveBlockMap(schema.id, finalMap).subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogOpen.set(false);
        this.messageService.add({ severity: 'success', summary: 'Block map saved' });
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({ severity: 'error', summary: 'Save failed' });
      },
    });
  }
}
