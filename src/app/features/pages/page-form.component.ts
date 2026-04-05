import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { TranslationEditorComponent } from '../../shared/components/translation-editor/translation-editor.component';
import { SeoEditorComponent, SeoContentContext } from '../../shared/components/seo-editor/seo-editor.component';
import { PageService } from '../../core/services/page.service';

@Component({
  selector: 'app-page-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, InputTextModule, SelectModule, ButtonModule,
    TranslationEditorComponent, SeoEditorComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <p-button icon="pi pi-arrow-left" severity="secondary" [text]="true" [rounded]="true" (onClick)="router.navigate(['/pages'])" />
          <div>
            <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">{{ isEditMode() ? 'Edit Page' : 'New Page' }}</h1>
            <p class="text-surface-500 dark:text-surface-400 text-sm mt-0.5">{{ isEditMode() ? 'Update page content' : 'Create a new page' }}</p>
          </div>
        </div>
        <p-button label="Save" icon="pi pi-save" [loading]="pageService.isLoading()" (onClick)="onSave()" />
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
              (translationsChange)="onTranslationsChange($event)" />
          </div>

          @if (isEditMode()) {
            <div class="mt-6">
              <app-seo-editor entityType="pages" [entityId]="itemId()!" [contentContext]="getSeoContentContext()" />
            </div>
          }
        </div>

        <!-- RIGHT: Settings (1/3) -->
        <div class="space-y-6">
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-5">Settings</h2>
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Status</label>
                <p-select [options]="statusOptions" [(ngModel)]="status" optionLabel="label" optionValue="value" class="w-full" />
              </div>
              <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Slug</label>
                  <button type="button" class="flex items-center gap-1.5 text-xs font-medium transition-colors"
                    [class]="slugLocked ? 'text-surface-400 hover:text-surface-600' : 'text-primary'"
                    (click)="slugLocked = !slugLocked">
                    <i [class]="slugLocked ? 'pi pi-lock' : 'pi pi-lock-open'" class="text-xs"></i>
                    {{ slugLocked ? 'Auto' : 'Manual' }}
                  </button>
                </div>
                <input pInputText class="w-full" [(ngModel)]="slug" [readonly]="slugLocked" [class.opacity-60]="slugLocked" />
              </div>
            </div>
          </div>

          <!-- Info Card -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Info</h2>
            <div class="flex flex-col gap-3 text-sm">
              <div class="flex justify-between">
                <span class="text-surface-500 dark:text-surface-400">Status</span>
                <span class="font-medium text-surface-900 dark:text-surface-0 capitalize">{{ status }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-surface-500 dark:text-surface-400">Slug</span>
                <span class="font-medium text-surface-900 dark:text-surface-0">/{{ slug }}</span>
              </div>
            </div>
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

  translations = signal<{ hr: Record<string, any>; en: Record<string, any> }>({ hr: { title: '', body: '' }, en: { title: '', body: '' } });
  slug = '';
  slugLocked = true;
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
    if (id) { this.isEditMode.set(true); this.itemId.set(id); this.loadItem(id); }
  }

  private loadItem(id: string): void {
    this.pageService.getPage(id).subscribe({
      next: (item) => {
        this.slug = item.slug || ''; this.slugLocked = true; this.status = item.status || 'draft';
        if (item.translations) this.translations.set({
          hr: { title: item.translations.hr?.title || '', body: item.translations.hr?.body || '' },
          en: { title: item.translations.en?.title || '', body: item.translations.en?.body || '' },
        });
      },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Failed to load page' }); this.router.navigate(['/pages']); },
    });
  }

  onTranslationsChange(translations: any): void {
    this.translations.set(translations);
    if (this.slugLocked) {
      const title = translations.hr?.title || translations.en?.title || '';
      this.slug = this.generateSlug(title);
    }
  }

  private generateSlug(text: string): string {
    const m: Record<string, string> = { 'č': 'c', 'ć': 'c', 'đ': 'dj', 'š': 's', 'ž': 'z', 'Č': 'c', 'Ć': 'c', 'Đ': 'dj', 'Š': 's', 'Ž': 'z' };
    return text.split('').map(c => m[c] || c).join('').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  getSeoContentContext(): SeoContentContext {
    const t = this.translations();
    return { entityType: 'page', content: { hr: { title: t.hr['title'] || '', body: t.hr['body'] || '' }, en: { title: t.en['title'] || '', body: t.en['body'] || '' } } };
  }

  onSave(): void {
    const payload: any = { slug: this.slug, status: this.status, translations: this.translations() };
    const request$ = this.isEditMode() ? this.pageService.updatePage(this.itemId()!, payload) : this.pageService.createPage(payload);
    request$.subscribe({
      next: () => { this.messageService.add({ severity: 'success', summary: this.isEditMode() ? 'Page updated' : 'Page created' }); this.router.navigate(['/pages']); },
      error: () => this.messageService.add({ severity: 'error', summary: 'Failed to save page' }),
    });
  }
}
