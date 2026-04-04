import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { TranslationEditorComponent } from '../../shared/components/translation-editor/translation-editor.component';
import { NavigationAdminService } from '../../core/services/navigation-admin.service';

@Component({
  selector: 'app-nav-item-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    SelectModule,
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
            (onClick)="router.navigate(['/navigation'])" />
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">
            {{ isEditMode() ? 'Edit Navigation Item' : 'New Navigation Item' }}
          </h1>
        </div>
        <div class="flex items-center gap-2">
          <p-button
            label="Cancel"
            severity="secondary"
            [outlined]="true"
            (onClick)="router.navigate(['/navigation'])" />
          <p-button
            label="Save"
            icon="pi pi-check"
            [loading]="navService.isLoading()"
            (onClick)="onSave()" />
        </div>
      </div>

      <!-- Translations -->
      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5 mb-5">
        <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Label</h2>
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
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">URL</label>
            <input pInputText class="w-full" [(ngModel)]="url" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Sort Order</label>
            <p-inputNumber [(ngModel)]="sortOrder" [showButtons]="true" class="w-full" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Group</label>
            <p-select
              [options]="groupOptions"
              [(ngModel)]="group"
              optionLabel="label"
              optionValue="value"
              class="w-full" />
          </div>
          <div class="flex items-center gap-2">
            <p-checkbox [(ngModel)]="isActive" [binary]="true" inputId="isActive" />
            <label for="isActive" class="text-sm font-medium text-surface-700 dark:text-surface-300">Active</label>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NavItemFormComponent implements OnInit {
  readonly navService = inject(NavigationAdminService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  isEditMode = signal(false);
  itemId = signal<string | null>(null);

  translations = signal<{ hr: Record<string, any>; en: Record<string, any> }>({
    hr: { label: '' },
    en: { label: '' },
  });

  url = '';
  sortOrder = 0;
  isActive = true;
  group = 'main';

  translationFields = [
    { key: 'label', label: 'Label', type: 'text' as const },
  ];

  groupOptions = [
    { label: 'Main', value: 'main' },
    { label: 'Footer', value: 'footer' },
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
    this.navService.getItem(id).subscribe({
      next: (item) => {
        this.url = item.url || '';
        this.sortOrder = item.sortOrder || 0;
        this.isActive = item.isActive ?? true;
        this.group = item.group || 'main';

        if (item.translations) {
          this.translations.set({
            hr: { label: item.translations.hr?.label || '' },
            en: { label: item.translations.en?.label || '' },
          });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load navigation item' });
        this.router.navigate(['/navigation']);
      },
    });
  }

  onSave(): void {
    const payload: any = {
      url: this.url,
      sortOrder: this.sortOrder,
      isActive: this.isActive,
      group: this.group,
      translations: this.translations(),
    };

    const request$ = this.isEditMode()
      ? this.navService.updateItem(this.itemId()!, payload)
      : this.navService.createItem(payload);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode() ? 'Navigation item updated successfully' : 'Navigation item created successfully',
        });
        this.router.navigate(['/navigation']);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save navigation item' });
      },
    });
  }
}
