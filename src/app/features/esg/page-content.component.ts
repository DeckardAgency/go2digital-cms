import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { TranslationEditorComponent } from '../../shared/components/translation-editor/translation-editor.component';
import { SeoEditorComponent } from '../../shared/components/seo-editor/seo-editor.component';
import { EsgService } from '../../core/services/esg.service';

@Component({
  selector: 'app-esg-page-content',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    TranslationEditorComponent,
    SeoEditorComponent,
  ],
  template: `
    <div class="max-w-4xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">
          ESG Page Content
        </h1>
        <p-button
          label="Save"
          icon="pi pi-check"
          [loading]="esgService.isLoading()"
          (onClick)="onSave()" />
      </div>

      <!-- Translations -->
      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5 mb-5">
        <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Content</h2>
        <app-translation-editor
          [translations]="translations()"
          [fields]="translationFields"
          (translationsChange)="translations.set($event)" />
      </div>

      <app-seo-editor singletonType="esg-page" />
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

  onSave(): void {
    const payload: any = {
      translations: this.translations(),
    };

    this.esgService.updateSingleton(payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved successfully' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save' });
      },
    });
  }
}
