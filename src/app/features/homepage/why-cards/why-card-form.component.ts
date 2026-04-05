import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { TranslationEditorComponent } from '../../../shared/components/translation-editor/translation-editor.component';
import { HomepageService } from '../../../core/services/homepage.service';

@Component({
  selector: 'app-why-card-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    ButtonModule,
    TranslationEditorComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <p-button icon="pi pi-arrow-left" severity="secondary" [text]="true" [rounded]="true" (onClick)="router.navigate(['/homepage/why-cards'])" />
          <div>
            <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">{{ isEditMode() ? 'Edit Why Card' : 'New Why Card' }}</h1>
            <p class="text-surface-500 dark:text-surface-400 text-sm mt-0.5">Info card in the Why Go2Digital section</p>
          </div>
        </div>
        <p-button label="Save" icon="pi pi-save" [loading]="homepageService.isLoading()" (onClick)="onSave()" />
      </div>

      <!-- Two-column -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left 2/3: Content -->
        <div class="lg:col-span-2">
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-5">Content</h2>
            <app-translation-editor
              [translations]="translations()"
              [fields]="translationFields"
              (translationsChange)="translations.set($event)" />
          </div>
        </div>

        <!-- Right 1/3: Settings + Info -->
        <div class="space-y-6">
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-5">Settings</h2>
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Icon</label>
                <input pInputText class="w-full" [(ngModel)]="icon" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Sort Order</label>
                <p-inputNumber class="w-full" [(ngModel)]="sortOrder" [useGrouping]="false" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Dot Pattern (JSON array)</label>
                <textarea pTextarea class="w-full" [rows]="3" [(ngModel)]="dotPatternJson"></textarea>
              </div>
            </div>
          </div>

          <!-- Info -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Info</h2>
            <div class="flex flex-col gap-3 text-sm">
              <div class="flex justify-between">
                <span class="text-surface-500">Section</span>
                <span class="font-medium text-surface-900 dark:text-surface-0">#3 Why Go2Digital</span>
              </div>
              <div class="flex justify-between">
                <span class="text-surface-500">Type</span>
                <span class="font-medium text-surface-900 dark:text-surface-0">Collection item</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class WhyCardFormComponent implements OnInit {
  readonly homepageService = inject(HomepageService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  isEditMode = signal(false);
  itemId = signal<string | null>(null);

  translations = signal<{ hr: Record<string, any>; en: Record<string, any> }>({
    hr: { title: '', description: '' },
    en: { title: '', description: '' },
  });

  icon = '';
  sortOrder = 0;
  dotPatternJson = '[]';

  translationFields = [
    { key: 'title', label: 'Title', type: 'text' as const },
    { key: 'description', label: 'Description', type: 'textarea' as const },
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
    this.homepageService.getWhyCard(id).subscribe({
      next: (item) => {
        this.icon = item.icon || '';
        this.sortOrder = item.sortOrder || 0;
        this.dotPatternJson = item.dotPattern ? JSON.stringify(item.dotPattern) : '[]';

        if (item.translations) {
          this.translations.set({
            hr: { title: item.translations.hr?.title || '', description: item.translations.hr?.description || '' },
            en: { title: item.translations.en?.title || '', description: item.translations.en?.description || '' },
          });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load why card' });
        this.router.navigate(['/homepage/why-cards']);
      },
    });
  }

  onSave(): void {
    let dotPattern: any[] = [];
    try {
      dotPattern = JSON.parse(this.dotPatternJson);
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid JSON for dot pattern' });
      return;
    }

    const payload: any = {
      icon: this.icon,
      sortOrder: this.sortOrder,
      dotPattern,
      translations: this.translations(),
    };

    const request$ = this.isEditMode()
      ? this.homepageService.updateWhyCard(this.itemId()!, payload)
      : this.homepageService.createWhyCard(payload);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode() ? 'Why card updated successfully' : 'Why card created successfully',
        });
        this.router.navigate(['/homepage/why-cards']);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save why card' });
      },
    });
  }
}
