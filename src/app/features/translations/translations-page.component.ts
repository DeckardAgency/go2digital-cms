import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';

import { Translation, TranslationsService } from '../../core/services/translations.service';

interface Row {
  key: string;
  namespace: string;
  hr: string;
  en: string;
  hrId: string | null;
  enId: string | null;
}

const LOCALES = ['hr', 'en'] as const;
type LocaleCode = typeof LOCALES[number];

@Component({
  selector: 'app-translations-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, ConfirmDialogModule, DialogModule,
    InputTextModule, TextareaModule, TableModule, TagModule,
  ],
  providers: [ConfirmationService],
  template: `
    <div>
      <div class="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Translations</h1>
          <p class="text-surface-500 text-sm mt-0.5">UI strings served to the Nuxt frontend ({{ rows().length }} keys, {{ LOCALES.length }} locales)</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="p-input-icon-left">
            <input pInputText class="w-72" placeholder="Search key or value…" [ngModel]="search()" (ngModelChange)="search.set($event)" />
          </span>
          <p-button label="Add key" icon="pi pi-plus" (onClick)="openAddDialog()" />
        </div>
      </div>

      @if (loading()) {
        <div class="text-surface-500 text-sm">Loading…</div>
      } @else {
        @for (group of filteredGroups(); track group.namespace) {
          <div class="mb-8 bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
            <div class="px-5 py-3 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
              <h2 class="text-base font-semibold text-surface-900 dark:text-surface-0">
                <i class="pi pi-folder-open text-surface-400 mr-2"></i>{{ group.namespace }}
                <span class="text-surface-400 font-normal text-sm ml-2">({{ group.rows.length }})</span>
              </h2>
            </div>
            <div class="divide-y divide-surface-200 dark:divide-surface-700">
              @for (row of group.rows; track row.key) {
                <div class="grid grid-cols-12 gap-3 p-4 items-start">
                  <div class="col-span-12 md:col-span-3 flex items-start gap-2">
                    <code class="text-xs text-surface-700 dark:text-surface-300 break-all">{{ row.key }}</code>
                  </div>
                  <div class="col-span-12 md:col-span-4">
                    <div class="text-[10px] uppercase tracking-wide text-surface-400 mb-1">HR</div>
                    <textarea pTextarea class="w-full text-sm" rows="1" autoResize="true"
                      [ngModel]="row.hr"
                      (ngModelChange)="onValueChange(row, 'hr', $event)"
                      (blur)="saveCell(row, 'hr')"></textarea>
                  </div>
                  <div class="col-span-12 md:col-span-4">
                    <div class="text-[10px] uppercase tracking-wide text-surface-400 mb-1">EN</div>
                    <textarea pTextarea class="w-full text-sm" rows="1" autoResize="true"
                      [ngModel]="row.en"
                      (ngModelChange)="onValueChange(row, 'en', $event)"
                      (blur)="saveCell(row, 'en')"></textarea>
                  </div>
                  <div class="col-span-12 md:col-span-1 flex justify-end">
                    <p-button icon="pi pi-trash" severity="danger" [text]="true" size="small"
                      pTooltip="Delete this key in both locales"
                      (onClick)="confirmDelete(row)" />
                  </div>
                </div>
              }
            </div>
          </div>
        } @empty {
          <div class="text-surface-500 text-sm py-12 text-center">No translations match your search.</div>
        }
      }

      <p-dialog header="Add translation key" [(visible)]="addDialogOpen" [modal]="true" [style]="{ width: '36rem' }" [closable]="!savingNew()">
        <div class="flex flex-col gap-4 py-2">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-surface-900 dark:text-surface-0">Key</label>
            <input pInputText class="w-full" [(ngModel)]="newKey" placeholder="namespace.subKey.name" />
            <span class="text-xs text-surface-400">Use dot-notation. Numeric segments rebuild as array indices on the frontend.</span>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-surface-900 dark:text-surface-0">HR</label>
            <textarea pTextarea class="w-full" rows="2" [(ngModel)]="newHr"></textarea>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-surface-900 dark:text-surface-0">EN</label>
            <textarea pTextarea class="w-full" rows="2" [(ngModel)]="newEn"></textarea>
          </div>
        </div>
        <ng-template pTemplate="footer">
          <p-button label="Cancel" [text]="true" (onClick)="addDialogOpen = false" [disabled]="savingNew()" />
          <p-button label="Create" icon="pi pi-check" [loading]="savingNew()" (onClick)="createKey()" />
        </ng-template>
      </p-dialog>

      <p-confirmDialog />
    </div>
  `,
})
export class TranslationsPageComponent implements OnInit {
  private readonly api = inject(TranslationsService);
  private readonly toast = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);

  readonly LOCALES = LOCALES;
  readonly loading = signal(true);
  readonly rows = signal<Row[]>([]);
  readonly search = signal('');

  // Dialog state
  addDialogOpen = false;
  savingNew = signal(false);
  newKey = '';
  newHr = '';
  newEn = '';

  readonly filteredGroups = computed(() => {
    const q = this.search().trim().toLowerCase();
    const filtered = q
      ? this.rows().filter(r =>
          r.key.toLowerCase().includes(q) ||
          r.hr.toLowerCase().includes(q) ||
          r.en.toLowerCase().includes(q),
        )
      : this.rows();

    const grouped = new Map<string, Row[]>();
    for (const row of filtered) {
      const arr = grouped.get(row.namespace) ?? [];
      arr.push(row);
      grouped.set(row.namespace, arr);
    }
    return [...grouped.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([namespace, rows]) => ({ namespace, rows: rows.sort((a, b) => a.key.localeCompare(b.key)) }));
  });

  ngOnInit(): void {
    this.reload();
  }

  private reload(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: list => {
        this.rows.set(this.toRows(list));
        this.loading.set(false);
      },
      error: () => {
        this.toast.add({ severity: 'error', summary: 'Failed to load translations' });
        this.loading.set(false);
      },
    });
  }

  private toRows(list: Translation[]): Row[] {
    const byKey = new Map<string, Row>();
    for (const t of list) {
      let row = byKey.get(t.key);
      if (!row) {
        row = {
          key: t.key,
          namespace: t.key.split('.')[0] || '(root)',
          hr: '', en: '', hrId: null, enId: null,
        };
        byKey.set(t.key, row);
      }
      if (t.locale === 'hr') { row.hr = t.value; row.hrId = t.id; }
      else if (t.locale === 'en') { row.en = t.value; row.enId = t.id; }
    }
    return [...byKey.values()];
  }

  onValueChange(row: Row, locale: LocaleCode, value: string): void {
    const next = this.rows().map(r => r.key === row.key ? { ...r, [locale]: value } : r);
    this.rows.set(next);
  }

  saveCell(row: Row, locale: LocaleCode): void {
    const current = this.rows().find(r => r.key === row.key);
    if (!current) return;
    const value = current[locale];
    const id = locale === 'hr' ? current.hrId : current.enId;

    const onSuccess = (saved: Translation) => {
      const next = this.rows().map(r => r.key === row.key
        ? { ...r, [locale === 'hr' ? 'hrId' : 'enId']: saved.id }
        : r);
      this.rows.set(next);
    };
    const onError = () => this.toast.add({ severity: 'error', summary: `Save failed for ${row.key} (${locale})` });

    if (id) {
      this.api.update(id, { value }).subscribe({ next: onSuccess, error: onError });
    } else {
      this.api.create({ key: row.key, locale, value }).subscribe({ next: onSuccess, error: onError });
    }
  }

  openAddDialog(): void {
    this.newKey = '';
    this.newHr = '';
    this.newEn = '';
    this.addDialogOpen = true;
  }

  createKey(): void {
    const key = this.newKey.trim();
    if (!key) {
      this.toast.add({ severity: 'warn', summary: 'Key is required' });
      return;
    }
    if (this.rows().some(r => r.key === key)) {
      this.toast.add({ severity: 'warn', summary: 'Key already exists' });
      return;
    }

    this.savingNew.set(true);
    forkJoin({
      hr: this.api.create({ key, locale: 'hr', value: this.newHr }),
      en: this.api.create({ key, locale: 'en', value: this.newEn }),
    }).subscribe({
      next: ({ hr, en }) => {
        this.rows.set([
          ...this.rows(),
          {
            key,
            namespace: key.split('.')[0] || '(root)',
            hr: this.newHr, en: this.newEn,
            hrId: hr.id, enId: en.id,
          },
        ]);
        this.addDialogOpen = false;
        this.savingNew.set(false);
        this.toast.add({ severity: 'success', summary: 'Key created' });
      },
      error: () => {
        this.savingNew.set(false);
        this.toast.add({ severity: 'error', summary: 'Create failed' });
      },
    });
  }

  confirmDelete(row: Row): void {
    this.confirm.confirm({
      message: `Delete "${row.key}" in both locales? This cannot be undone.`,
      header: 'Delete translation key',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteRow(row),
    });
  }

  private deleteRow(row: Row): void {
    const calls = [];
    if (row.hrId) calls.push(this.api.delete(row.hrId));
    if (row.enId) calls.push(this.api.delete(row.enId));
    if (!calls.length) {
      this.rows.set(this.rows().filter(r => r.key !== row.key));
      return;
    }
    forkJoin(calls).subscribe({
      next: () => {
        this.rows.set(this.rows().filter(r => r.key !== row.key));
        this.toast.add({ severity: 'success', summary: 'Deleted' });
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Delete failed' }),
    });
  }
}
