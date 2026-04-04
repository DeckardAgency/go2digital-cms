import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { TranslationEditorComponent } from '../../../shared/components/translation-editor/translation-editor.component';
import { BlogService } from '../../../core/services/blog.service';

@Component({
  selector: 'app-blog-category-form',
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
    <div class="max-w-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <p-button
            icon="pi pi-arrow-left"
            severity="secondary"
            [text]="true"
            (onClick)="router.navigate(['/blog/categories'])" />
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">
            {{ isEditMode() ? 'Edit Category' : 'New Category' }}
          </h1>
        </div>
        <div class="flex items-center gap-2">
          <p-button
            label="Cancel"
            severity="secondary"
            [outlined]="true"
            (onClick)="router.navigate(['/blog/categories'])" />
          <p-button
            label="Save"
            icon="pi pi-check"
            [loading]="blogService.isLoading()"
            (onClick)="onSave()" />
        </div>
      </div>

      <!-- Translations -->
      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5 mb-5">
        <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Name</h2>
        <app-translation-editor
          [translations]="translations()"
          [fields]="translationFields"
          (translationsChange)="translations.set($event)" />
      </div>

      <!-- Meta Fields -->
      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
        <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Details</h2>
        <div class="flex flex-col gap-4">
          <!-- Slug -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Slug</label>
            <input pInputText class="w-full" [(ngModel)]="slug" />
          </div>

          <!-- Sort Order -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Sort Order</label>
            <p-inputNumber [(ngModel)]="sortOrder" [showButtons]="true" class="w-full" />
          </div>

          <!-- Active -->
          <div class="flex items-center gap-2">
            <p-checkbox [(ngModel)]="isActive" [binary]="true" inputId="isActive" />
            <label for="isActive" class="text-sm font-medium text-surface-700 dark:text-surface-300">Active</label>
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

  translations = signal<{ hr: Record<string, any>; en: Record<string, any> }>({
    hr: { name: '' },
    en: { name: '' },
  });

  slug = '';
  sortOrder = 0;
  isActive = true;

  translationFields = [
    { key: 'name', label: 'Name', type: 'text' as const },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.categoryId.set(id);
      this.loadCategory(id);
    }
  }

  private loadCategory(id: string): void {
    this.blogService.getCategory(id).subscribe({
      next: (category) => {
        this.slug = category.slug;
        this.sortOrder = category.sortOrder;
        this.isActive = category.isActive;

        if (category.translations) {
          this.translations.set({
            hr: { name: category.translations.hr?.name || '' },
            en: { name: category.translations.en?.name || '' },
          });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load category' });
        this.router.navigate(['/blog/categories']);
      },
    });
  }

  onSave(): void {
    const payload: any = {
      slug: this.slug,
      sortOrder: this.sortOrder,
      isActive: this.isActive,
      translations: this.translations(),
    };

    const request$ = this.isEditMode()
      ? this.blogService.updateCategory(this.categoryId()!, payload)
      : this.blogService.createCategory(payload);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode() ? 'Category updated successfully' : 'Category created successfully',
        });
        this.router.navigate(['/blog/categories']);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save category' });
      },
    });
  }
}
