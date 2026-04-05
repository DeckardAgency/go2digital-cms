import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { TranslationEditorComponent } from '../../shared/components/translation-editor/translation-editor.component';
import { SeoEditorComponent } from '../../shared/components/seo-editor/seo-editor.component';
import { PageService } from '../../core/services/page.service';

@Component({
  selector: 'app-page-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
    TranslationEditorComponent,
    SeoEditorComponent,
  ],
  template: `
    <div class="max-w-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <p-button
            icon="pi pi-arrow-left"
            severity="secondary"
            [text]="true"
            (onClick)="router.navigate(['/pages'])" />
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">
            {{ isEditMode() ? 'Edit Page' : 'New Page' }}
          </h1>
        </div>
        <div class="flex items-center gap-2">
          <p-button
            label="Cancel"
            severity="secondary"
            [outlined]="true"
            (onClick)="router.navigate(['/pages'])" />
          <p-button
            label="Save"
            icon="pi pi-check"
            [loading]="pageService.isLoading()"
            (onClick)="onSave()" />
        </div>
      </div>

      <!-- Translations -->
      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5 mb-5">
        <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Content</h2>
        <app-translation-editor
          [translations]="translations()"
          [fields]="translationFields"
          (translationsChange)="translations.set($event)" />
      </div>

      @if (isEditMode()) {
        <app-seo-editor entityType="pages" [entityId]="itemId()!" />
      }

      <!-- Meta Fields -->
      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
        <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Details</h2>
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Slug</label>
            <input pInputText class="w-full" [(ngModel)]="slug" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Status</label>
            <p-select
              [options]="statusOptions"
              [(ngModel)]="status"
              optionLabel="label"
              optionValue="value"
              class="w-full" />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PageFormComponent implements OnInit {
  readonly pageService = inject(PageService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  isEditMode = signal(false);
  itemId = signal<string | null>(null);

  translations = signal<{ hr: Record<string, any>; en: Record<string, any> }>({
    hr: { title: '', body: '' },
    en: { title: '', body: '' },
  });

  slug = '';
  status = 'draft';

  translationFields = [
    { key: 'title', label: 'Title', type: 'text' as const },
    { key: 'body', label: 'Body', type: 'richtext' as const },
  ];

  statusOptions = [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
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
    this.pageService.getPage(id).subscribe({
      next: (item) => {
        this.slug = item.slug || '';
        this.status = item.status || 'draft';

        if (item.translations) {
          this.translations.set({
            hr: { title: item.translations.hr?.title || '', body: item.translations.hr?.body || '' },
            en: { title: item.translations.en?.title || '', body: item.translations.en?.body || '' },
          });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load page' });
        this.router.navigate(['/pages']);
      },
    });
  }

  onSave(): void {
    const payload: any = {
      slug: this.slug,
      status: this.status,
      translations: this.translations(),
    };

    const request$ = this.isEditMode()
      ? this.pageService.updatePage(this.itemId()!, payload)
      : this.pageService.createPage(payload);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode() ? 'Page updated successfully' : 'Page created successfully',
        });
        this.router.navigate(['/pages']);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save page' });
      },
    });
  }
}
