import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { TranslationEditorComponent } from '../../shared/components/translation-editor/translation-editor.component';
import { SeoEditorComponent, SeoContentContext } from '../../shared/components/seo-editor/seo-editor.component';
import { EsgService } from '../../core/services/esg.service';

@Component({
  selector: 'app-esg-page-content',
  standalone: true,
  imports: [
    CommonModule, FormsModule, InputTextModule, ButtonModule,
    TranslationEditorComponent, SeoEditorComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">ESG Page Content</h1>
          <p class="text-surface-500 dark:text-surface-400 text-sm mt-0.5">Manage the ESG landing page content</p>
        </div>
        <p-button label="Save" icon="pi pi-save" [loading]="esgService.isLoading()" (onClick)="onSave()" />
      </div>

      <!-- Two-column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- LEFT: Content (2/3) -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-5">Content</h2>
            <app-translation-editor
              [translations]="translations()"
              [fields]="translationFields"
              (translationsChange)="translations.set($event)" />
          </div>

          <app-seo-editor singletonType="esg-page" [contentContext]="getSeoContentContext()" />
        </div>

        <!-- RIGHT: Info (1/3) -->
        <div class="space-y-6">
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Page Info</h2>
            <div class="flex flex-col gap-3 text-sm">
              <div class="flex justify-between">
                <span class="text-surface-500 dark:text-surface-400">Type</span>
                <span class="font-medium text-surface-900 dark:text-surface-0">Singleton</span>
              </div>
              <div class="flex justify-between">
                <span class="text-surface-500 dark:text-surface-400">Route</span>
                <span class="font-medium text-surface-900 dark:text-surface-0">/esg</span>
              </div>
              <div class="flex justify-between">
                <span class="text-surface-500 dark:text-surface-400">Languages</span>
                <span class="font-medium text-surface-900 dark:text-surface-0">HR, EN</span>
              </div>
            </div>
          </div>

          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Related Sections</h2>
            <div class="flex flex-col gap-2">
              <a routerLink="/esg/pillars" class="flex items-center gap-2 p-2.5 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors no-underline text-surface-700 dark:text-surface-300">
                <i class="pi pi-building text-sm text-surface-400"></i>
                <span class="text-sm font-medium">Pillars</span>
                <i class="pi pi-chevron-right text-xs text-surface-400 ml-auto"></i>
              </a>
              <a routerLink="/esg/cards" class="flex items-center gap-2 p-2.5 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors no-underline text-surface-700 dark:text-surface-300">
                <i class="pi pi-id-card text-sm text-surface-400"></i>
                <span class="text-sm font-medium">Cards</span>
                <i class="pi pi-chevron-right text-xs text-surface-400 ml-auto"></i>
              </a>
              <a routerLink="/esg/badges" class="flex items-center gap-2 p-2.5 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors no-underline text-surface-700 dark:text-surface-300">
                <i class="pi pi-eye text-sm text-surface-400"></i>
                <span class="text-sm font-medium">Vision Badges</span>
                <i class="pi pi-chevron-right text-xs text-surface-400 ml-auto"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class EsgPageContentComponent implements OnInit {
  readonly esgService = inject(EsgService);
  private readonly messageService = inject(MessageService);

  translations = signal<{ hr: Record<string, any>; en: Record<string, any> }>({
    hr: { heroLabel: '', introSmall: '', introLarge: '', downloadReportLabel: '' },
    en: { heroLabel: '', introSmall: '', introLarge: '', downloadReportLabel: '' },
  });

  translationFields = [
    { key: 'heroLabel', label: 'Hero Label', type: 'text' as const },
    { key: 'introSmall', label: 'Intro Small', type: 'textarea' as const },
    { key: 'introLarge', label: 'Intro Large', type: 'textarea' as const },
    { key: 'downloadReportLabel', label: 'Download Report Label', type: 'text' as const },
  ];

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.esgService.getSingleton().subscribe({
      next: (data) => {
        if (data.translations) {
          const hr: Record<string, any> = {};
          const en: Record<string, any> = {};
          for (const field of this.translationFields) {
            hr[field.key] = data.translations.hr?.[field.key] || '';
            en[field.key] = data.translations.en?.[field.key] || '';
          }
          this.translations.set({ hr, en });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data' });
      },
    });
  }

  getSeoContentContext(): SeoContentContext {
    const t = this.translations();
    return {
      entityType: 'esg-page',
      content: {
        hr: { heroLabel: t.hr['heroLabel'] || '', introSmall: t.hr['introSmall'] || '', introLarge: t.hr['introLarge'] || '' },
        en: { heroLabel: t.en['heroLabel'] || '', introSmall: t.en['introSmall'] || '', introLarge: t.en['introLarge'] || '' },
      },
    };
  }

  onSave(): void {
    this.esgService.updateSingleton({ translations: this.translations() }).subscribe({
      next: () => this.messageService.add({ severity: 'success', summary: 'Saved' }),
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save' }),
    });
  }
}
