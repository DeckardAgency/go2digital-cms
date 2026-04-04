import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { TranslationEditorComponent } from '../../shared/components/translation-editor/translation-editor.component';
import { HomepageService } from '../../core/services/homepage.service';

export interface SingletonTranslatableField {
  key: string;
  label: string;
  type: 'text' | 'textarea';
}

export interface SingletonNonTranslatableField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'checkbox';
}

@Component({
  selector: 'app-singleton-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    ButtonModule,
    TranslationEditorComponent,
  ],
  template: `
    <div class="max-w-4xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">
          {{ pageTitle }}
        </h1>
        <p-button
          label="Save"
          icon="pi pi-check"
          [loading]="homepageService.isLoading()"
          (onClick)="onSave()" />
      </div>

      <!-- Translations -->
      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5 mb-5">
        <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Content</h2>
        <app-translation-editor
          [translations]="translations()"
          [fields]="translatableFields"
          (translationsChange)="translations.set($event)" />
      </div>

      <!-- Non-translatable Fields -->
      @if (nonTranslatableFields?.length) {
        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5 mb-5">
          <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Settings</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (field of nonTranslatableFields; track field.key) {
              @switch (field.type) {
                @case ('text') {
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">{{ field.label }}</label>
                    <input pInputText class="w-full" [(ngModel)]="nonTranslatableValues[field.key]" />
                  </div>
                }
                @case ('number') {
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">{{ field.label }}</label>
                    <p-inputNumber class="w-full" [(ngModel)]="nonTranslatableValues[field.key]" [useGrouping]="false" />
                  </div>
                }
                @case ('checkbox') {
                  <div class="flex items-end gap-2 pb-2">
                    <p-checkbox [(ngModel)]="nonTranslatableValues[field.key]" [binary]="true" [inputId]="field.key" />
                    <label [for]="field.key" class="text-sm font-medium text-surface-700 dark:text-surface-300">{{ field.label }}</label>
                  </div>
                }
              }
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class SingletonEditorComponent implements OnInit {
  @Input({ required: true }) singletonType!: string;
  @Input({ required: true }) pageTitle!: string;
  @Input({ required: true }) translatableFields!: SingletonTranslatableField[];
  @Input() nonTranslatableFields?: SingletonNonTranslatableField[];

  readonly homepageService = inject(HomepageService);
  private readonly messageService = inject(MessageService);

  translations = signal<{ hr: Record<string, any>; en: Record<string, any> }>({
    hr: {},
    en: {},
  });

  nonTranslatableValues: Record<string, any> = {};

  ngOnInit(): void {
    this.initEmptyTranslations();
    this.loadData();
  }

  private initEmptyTranslations(): void {
    const hr: Record<string, any> = {};
    const en: Record<string, any> = {};
    for (const field of this.translatableFields) {
      hr[field.key] = '';
      en[field.key] = '';
    }
    this.translations.set({ hr, en });
  }

  private loadData(): void {
    this.homepageService.getSingleton(this.singletonType).subscribe({
      next: (data) => {
        if (data.translations) {
          const hr: Record<string, any> = {};
          const en: Record<string, any> = {};
          for (const field of this.translatableFields) {
            hr[field.key] = data.translations.hr?.[field.key] || '';
            en[field.key] = data.translations.en?.[field.key] || '';
          }
          this.translations.set({ hr, en });
        }

        if (this.nonTranslatableFields) {
          for (const field of this.nonTranslatableFields) {
            this.nonTranslatableValues[field.key] = data[field.key] ?? '';
          }
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

    if (this.nonTranslatableFields) {
      for (const field of this.nonTranslatableFields) {
        payload[field.key] = this.nonTranslatableValues[field.key];
      }
    }

    this.homepageService.updateSingleton(this.singletonType, payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved successfully' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save' });
      },
    });
  }
}
