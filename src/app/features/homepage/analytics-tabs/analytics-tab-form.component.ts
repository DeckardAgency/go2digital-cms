import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { TranslationEditorComponent } from '../../../shared/components/translation-editor/translation-editor.component';
import { HomepageService } from '../../../core/services/homepage.service';

@Component({
  selector: 'app-analytics-tab-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ButtonModule,
    TranslationEditorComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <p-button icon="pi pi-arrow-left" severity="secondary" [text]="true" [rounded]="true" (onClick)="router.navigate(['/homepage/analytics-tabs'])" />
          <div>
            <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">{{ isEditMode() ? 'Edit Analytics Tab' : 'New Analytics Tab' }}</h1>
            <p class="text-surface-500 dark:text-surface-400 text-sm mt-0.5">Graph tab for the analytics section</p>
          </div>
        </div>
        <p-button label="Save" icon="pi pi-save" [loading]="homepageService.isLoading()" (onClick)="onSave()" />
      </div>

      <!-- Two-column -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left 2/3: Content -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-5">Tab Label</h2>
            <app-translation-editor
              [translations]="translations()"
              [fields]="translationFields"
              (translationsChange)="translations.set($event)" />
          </div>

          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-5">Y-Axis Labels</h2>
            <p class="text-surface-500 text-sm mb-4">5 values from top to bottom (e.g. 120k, 90k, 60k, 30k, 0)</p>
            <div class="grid grid-cols-5 gap-3">
              @for (i of [0,1,2,3,4]; track i) {
                <div class="flex flex-col gap-1">
                  <label class="text-xs font-medium text-surface-500">Level {{ i + 1 }}</label>
                  <input pInputText class="w-full" [(ngModel)]="yLabels[i]" />
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Right 1/3: Settings + Info -->
        <div class="space-y-6">
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-5">Settings</h2>
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Curve Type</label>
                <p-select
                  [options]="curveTypeOptions"
                  [(ngModel)]="curveType"
                  optionLabel="label"
                  optionValue="value"
                  class="w-full" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Sort Order</label>
                <p-inputNumber class="w-full" [(ngModel)]="sortOrder" [useGrouping]="false" />
              </div>
            </div>
          </div>

          <!-- Info -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Info</h2>
            <div class="flex flex-col gap-3 text-sm">
              <div class="flex justify-between">
                <span class="text-surface-500">Section</span>
                <span class="font-medium text-surface-900 dark:text-surface-0">Analytics</span>
              </div>
              <div class="flex justify-between">
                <span class="text-surface-500">Type</span>
                <span class="font-medium text-surface-900 dark:text-surface-0">Graph tab</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AnalyticsTabFormComponent implements OnInit {
  readonly homepageService = inject(HomepageService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  isEditMode = signal(false);
  itemId = signal<string | null>(null);

  translations = signal<{ hr: Record<string, any>; en: Record<string, any> }>({
    hr: { label: '' },
    en: { label: '' },
  });

  curveType = 'rising';
  yLabels: string[] = ['', '', '', '', ''];
  sortOrder = 0;

  curveTypeOptions = [
    { label: 'Rising — steep growth curve', value: 'rising' },
    { label: 'Gradual — slow steady growth', value: 'gradual' },
    { label: 'Bell Curve — peak in the middle', value: 'bell' },
  ];

  translationFields = [
    { key: 'label', label: 'Tab Label', type: 'text' as const },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.itemId.set(id);
      this.loadItem(id);
    }
  }

  private loadItem(id: string): void {
    this.homepageService.getAnalyticsTab(id).subscribe({
      next: (item) => {
        this.curveType = item.curveType || 'rising';
        this.yLabels = Array.isArray(item.yLabels) ? [...item.yLabels] : ['', '', '', '', ''];
        while (this.yLabels.length < 5) this.yLabels.push('');
        this.sortOrder = item.sortOrder || 0;

        if (item.translations) {
          this.translations.set({
            hr: { label: item.translations.hr?.label || '' },
            en: { label: item.translations.en?.label || '' },
          });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load analytics tab' });
        this.router.navigate(['/homepage/analytics-tabs']);
      },
    });
  }

  onSave(): void {
    const payload: any = {
      curveType: this.curveType,
      yLabels: this.yLabels,
      sortOrder: this.sortOrder,
      translations: this.translations(),
    };

    const request$ = this.isEditMode()
      ? this.homepageService.updateAnalyticsTab(this.itemId()!, payload)
      : this.homepageService.createAnalyticsTab(payload);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode() ? 'Analytics tab updated' : 'Analytics tab created',
        });
        this.router.navigate(['/homepage/analytics-tabs']);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save analytics tab' });
      },
    });
  }
}
