import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { TranslationEditorComponent } from '../../../shared/components/translation-editor/translation-editor.component';
import { BlogService } from '../../../core/services/blog.service';

@Component({
  selector: 'app-blog-category-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, InputTextModule, InputNumberModule,
    ToggleSwitchModule, ButtonModule, TranslationEditorComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <p-button icon="pi pi-arrow-left" severity="secondary" [text]="true" [rounded]="true" (onClick)="router.navigate(['/blog/categories'])" />
          <div>
            <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">{{ isEditMode() ? 'Edit Category' : 'New Category' }}</h1>
            <p class="text-surface-500 dark:text-surface-400 text-sm mt-0.5">{{ isEditMode() ? 'Update blog category' : 'Create a new blog category' }}</p>
          </div>
        </div>
        <p-button label="Save" icon="pi pi-save" [loading]="blogService.isLoading()" (onClick)="onSave()" />
      </div>

      <!-- Two-column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- LEFT: Content (2/3) -->
        <div class="lg:col-span-2">
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-5">Content</h2>
            <app-translation-editor
              [translations]="translations()"
              [fields]="translationFields"
              (translationsChange)="onTranslationsChange($event)" />
          </div>
        </div>

        <!-- RIGHT: Settings (1/3) -->
        <div class="space-y-6">
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-5">Settings</h2>
            <div class="flex flex-col gap-4">
              <div class="flex items-center gap-3">
                <div class="flex flex-col gap-2 flex-1">
                  <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Sort Order</label>
                  <p-inputNumber [(ngModel)]="sortOrder" [showButtons]="true" styleClass="w-full" inputStyleClass="w-full" />
                </div>
                <div class="flex flex-col items-end gap-2 pt-0">
                  <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Active</label>
                  <p-toggleswitch [(ngModel)]="isActive" />
                </div>
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
        </div>
      </div>
    </div>
  `,
})
export class BlogCategoryFormComponent implements OnInit {
  readonly blogService = inject(BlogService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  isEditMode = signal(false);
  categoryId = signal<string | null>(null);

  translations = signal<{ hr: Record<string, any>; en: Record<string, any> }>({ hr: { name: '' }, en: { name: '' } });
  slug = '';
  slugLocked = true;
  sortOrder = 0;
  isActive = true;

  translationFields = [{ key: 'name', label: 'Name', type: 'text' as const }];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) { this.isEditMode.set(true); this.categoryId.set(id); this.loadCategory(id); }
  }

  private loadCategory(id: string): void {
    this.blogService.getCategory(id).subscribe({
      next: (cat) => {
        this.slug = cat.slug; this.slugLocked = true; this.sortOrder = cat.sortOrder; this.isActive = cat.isActive;
        if (cat.translations) this.translations.set({ hr: { name: cat.translations.hr?.name || '' }, en: { name: cat.translations.en?.name || '' } });
      },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Failed to load category' }); this.router.navigate(['/blog/categories']); },
    });
  }

  onTranslationsChange(translations: any): void {
    this.translations.set(translations);
    if (this.slugLocked) {
      const name = translations.hr?.name || translations.en?.name || '';
      this.slug = this.generateSlug(name);
    }
  }

  private generateSlug(text: string): string {
    const m: Record<string, string> = { 'č': 'c', 'ć': 'c', 'đ': 'dj', 'š': 's', 'ž': 'z', 'Č': 'c', 'Ć': 'c', 'Đ': 'dj', 'Š': 's', 'Ž': 'z' };
    return text.split('').map(c => m[c] || c).join('').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  onSave(): void {
    const payload: any = { slug: this.slug, sortOrder: this.sortOrder, isActive: this.isActive, translations: this.translations() };
    const request$ = this.isEditMode() ? this.blogService.updateCategory(this.categoryId()!, payload) : this.blogService.createCategory(payload);
    request$.subscribe({
      next: () => { this.messageService.add({ severity: 'success', summary: this.isEditMode() ? 'Category updated' : 'Category created' }); this.router.navigate(['/blog/categories']); },
      error: () => this.messageService.add({ severity: 'error', summary: 'Failed to save category' }),
    });
  }
}
