import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { TranslationEditorComponent } from '../../../shared/components/translation-editor/translation-editor.component';
import { EsgService } from '../../../core/services/esg.service';

@Component({
  selector: 'app-badge-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    InputNumberModule,
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
            (onClick)="router.navigate(['/esg/badges'])" />
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">
            {{ isEditMode() ? 'Edit Badge' : 'New Badge' }}
          </h1>
        </div>
        <div class="flex items-center gap-2">
          <p-button
            label="Cancel"
            severity="secondary"
            [outlined]="true"
            (onClick)="router.navigate(['/esg/badges'])" />
          <p-button
            label="Save"
            icon="pi pi-check"
            [loading]="esgService.isLoading()"
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

      <!-- Meta Fields -->
      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
        <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Details</h2>
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Sort Order</label>
            <p-inputNumber [(ngModel)]="sortOrder" [showButtons]="true" class="w-full" />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class BadgeFormComponent implements OnInit {
  readonly esgService = inject(EsgService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  isEditMode = signal(false);
  itemId = signal<string | null>(null);

  translations = signal<{ hr: Record<string, any>; en: Record<string, any> }>({
    hr: { title: '', description: '' },
    en: { title: '', description: '' },
  });

  sortOrder = 0;

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
    this.esgService.getBadge(id).subscribe({
      next: (item) => {
        this.sortOrder = item.sortOrder || 0;

        if (item.translations) {
          this.translations.set({
            hr: { title: item.translations.hr?.title || '', description: item.translations.hr?.description || '' },
            en: { title: item.translations.en?.title || '', description: item.translations.en?.description || '' },
          });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load badge' });
        this.router.navigate(['/esg/badges']);
      },
    });
  }

  onSave(): void {
    const payload: any = {
      sortOrder: this.sortOrder,
      translations: this.translations(),
    };

    const request$ = this.isEditMode()
      ? this.esgService.updateBadge(this.itemId()!, payload)
      : this.esgService.createBadge(payload);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode() ? 'Badge updated successfully' : 'Badge created successfully',
        });
        this.router.navigate(['/esg/badges']);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save badge' });
      },
    });
  }
}
