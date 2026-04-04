import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tabs } from 'primeng/tabs';
import { TabList } from 'primeng/tabs';
import { Tab } from 'primeng/tabs';
import { TabPanels } from 'primeng/tabs';
import { TabPanel } from 'primeng/tabs';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

interface TranslationField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'richtext';
}

interface Translations {
  hr: Record<string, any>;
  en: Record<string, any>;
}

@Component({
  selector: 'app-translation-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    InputTextModule,
    TextareaModule,
  ],
  template: `
    <p-tabs [value]="0">
      <p-tablist>
        <p-tab [value]="0">
          <span class="flex items-center gap-2">
            <span class="text-sm font-semibold">HR</span>
            <span class="text-xs text-surface-400">Hrvatski</span>
          </span>
        </p-tab>
        <p-tab [value]="1">
          <span class="flex items-center gap-2">
            <span class="text-sm font-semibold">EN</span>
            <span class="text-xs text-surface-400">English</span>
          </span>
        </p-tab>
      </p-tablist>

      <p-tabpanels>
        <!-- HR Tab -->
        <p-tabpanel [value]="0">
          <div class="flex flex-col gap-4 pt-4">
            @for (field of fields; track field.key) {
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">
                  {{ field.label }}
                </label>
                @switch (field.type) {
                  @case ('text') {
                    <input
                      pInputText
                      class="w-full"
                      [ngModel]="translations.hr[field.key]"
                      (ngModelChange)="onFieldChange('hr', field.key, $event)" />
                  }
                  @case ('textarea') {
                    <textarea
                      pTextarea
                      class="w-full"
                      [rows]="4"
                      [ngModel]="translations.hr[field.key]"
                      (ngModelChange)="onFieldChange('hr', field.key, $event)">
                    </textarea>
                  }
                  @case ('richtext') {
                    <textarea
                      pTextarea
                      class="w-full"
                      [rows]="8"
                      [ngModel]="translations.hr[field.key]"
                      (ngModelChange)="onFieldChange('hr', field.key, $event)"
                      placeholder="Rich text editor (Quill) will be added here">
                    </textarea>
                  }
                }
              </div>
            }
          </div>
        </p-tabpanel>

        <!-- EN Tab -->
        <p-tabpanel [value]="1">
          <div class="flex flex-col gap-4 pt-4">
            @for (field of fields; track field.key) {
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">
                  {{ field.label }}
                </label>
                @switch (field.type) {
                  @case ('text') {
                    <input
                      pInputText
                      class="w-full"
                      [ngModel]="translations.en[field.key]"
                      (ngModelChange)="onFieldChange('en', field.key, $event)" />
                  }
                  @case ('textarea') {
                    <textarea
                      pTextarea
                      class="w-full"
                      [rows]="4"
                      [ngModel]="translations.en[field.key]"
                      (ngModelChange)="onFieldChange('en', field.key, $event)">
                    </textarea>
                  }
                  @case ('richtext') {
                    <textarea
                      pTextarea
                      class="w-full"
                      [rows]="8"
                      [ngModel]="translations.en[field.key]"
                      (ngModelChange)="onFieldChange('en', field.key, $event)"
                      placeholder="Rich text editor (Quill) will be added here">
                    </textarea>
                  }
                }
              </div>
            }
          </div>
        </p-tabpanel>
      </p-tabpanels>
    </p-tabs>
  `,
})
export class TranslationEditorComponent {
  @Input() translations: Translations = { hr: {}, en: {} };
  @Input() fields: TranslationField[] = [];
  @Output() translationsChange = new EventEmitter<Translations>();

  onFieldChange(locale: 'hr' | 'en', key: string, value: any): void {
    this.translations = {
      ...this.translations,
      [locale]: {
        ...this.translations[locale],
        [key]: value,
      },
    };
    this.translationsChange.emit(this.translations);
  }
}
