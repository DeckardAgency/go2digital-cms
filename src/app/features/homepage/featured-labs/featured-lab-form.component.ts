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
  selector: 'app-featured-lab-form',
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
    <div class="max-w-4xl">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <p-button
            icon="pi pi-arrow-left"
            severity="secondary"
            [text]="true"
            (onClick)="router.navigate(['/homepage/featured-labs'])" />
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">
            {{ isEditMode() ? 'Edit Featured Lab Item' : 'New Featured Lab Item' }}
          </h1>
        </div>
        <p-button
          label="Save"
          icon="pi pi-check"
          [loading]="homepageService.isLoading()"
          (onClick)="onSave()" />
      </div>

      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5 mb-5">
        <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Content</h2>
        <app-translation-editor
          [translations]="translations()"
          [fields]="translationFields"
          (translationsChange)="translations.set($event)" />
      </div>

      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5 mb-5">
        <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Details</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Slug</label>
            <input pInputText class="w-full" [(ngModel)]="slug" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Sort Order</label>
            <p-inputNumber class="w-full" [(ngModel)]="sortOrder" [useGrouping]="false" />
          </div>
          <div class="flex flex-col gap-2 md:col-span-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Categories (JSON array of strings)</label>
            <textarea pTextarea class="w-full" [rows]="3" [(ngModel)]="categoriesJson"></textarea>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class FeaturedLabFormComponent implements OnInit {
  readonly homepageService = inject(HomepageService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  isEditMode = signal(false);
  itemId = signal<string | null>(null);

  translations = signal<{ hr: Record<string, any>; en: Record<string, any> }>({
    hr: { title: '', subtitle: '' },
    en: { title: '', subtitle: '' },
  });

  slug = '';
  sortOrder = 0;
  categoriesJson = '[]';

  translationFields = [
    { key: 'title', label: 'Title', type: 'text' as const },
    { key: 'subtitle', label: 'Subtitle', type: 'text' as const },
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
    this.homepageService.getFeaturedLabItem(id).subscribe({
      next: (item) => {
        this.slug = item.slug || '';
        this.sortOrder = item.sortOrder || 0;
        this.categoriesJson = item.categories ? JSON.stringify(item.categories) : '[]';

        if (item.translations) {
          this.translations.set({
            hr: { title: item.translations.hr?.title || '', subtitle: item.translations.hr?.subtitle || '' },
            en: { title: item.translations.en?.title || '', subtitle: item.translations.en?.subtitle || '' },
          });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load featured lab item' });
        this.router.navigate(['/homepage/featured-labs']);
      },
    });
  }

  onSave(): void {
    let categories: string[] = [];
    try {
      categories = JSON.parse(this.categoriesJson);
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid JSON for categories' });
      return;
    }

    const payload: any = {
      slug: this.slug,
      sortOrder: this.sortOrder,
      categories,
      translations: this.translations(),
    };

    const request$ = this.isEditMode()
      ? this.homepageService.updateFeaturedLabItem(this.itemId()!, payload)
      : this.homepageService.createFeaturedLabItem(payload);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode() ? 'Featured lab item updated successfully' : 'Featured lab item created successfully',
        });
        this.router.navigate(['/homepage/featured-labs']);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save featured lab item' });
      },
    });
  }
}
