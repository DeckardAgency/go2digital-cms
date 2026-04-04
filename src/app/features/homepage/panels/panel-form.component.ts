import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { TranslationEditorComponent } from '../../../shared/components/translation-editor/translation-editor.component';
import { HomepageService } from '../../../core/services/homepage.service';

@Component({
  selector: 'app-panel-form',
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
    <div class="max-w-4xl">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <p-button
            icon="pi pi-arrow-left"
            severity="secondary"
            [text]="true"
            (onClick)="router.navigate(['/homepage/panels'])" />
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">
            {{ isEditMode() ? 'Edit Panel' : 'New Panel' }}
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
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Stat Value</label>
            <input pInputText class="w-full" [(ngModel)]="statValue" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Sort Order</label>
            <p-inputNumber class="w-full" [(ngModel)]="sortOrder" [useGrouping]="false" />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PanelFormComponent implements OnInit {
  readonly homepageService = inject(HomepageService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  isEditMode = signal(false);
  itemId = signal<string | null>(null);

  translations = signal<{ hr: Record<string, any>; en: Record<string, any> }>({
    hr: { title: '', tag: '', description: '' },
    en: { title: '', tag: '', description: '' },
  });

  statValue = '';
  sortOrder = 0;

  translationFields = [
    { key: 'title', label: 'Title', type: 'text' as const },
    { key: 'tag', label: 'Tag', type: 'text' as const },
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
    this.homepageService.getPanel(id).subscribe({
      next: (item) => {
        this.statValue = item.statValue || '';
        this.sortOrder = item.sortOrder || 0;

        if (item.translations) {
          this.translations.set({
            hr: { title: item.translations.hr?.title || '', tag: item.translations.hr?.tag || '', description: item.translations.hr?.description || '' },
            en: { title: item.translations.en?.title || '', tag: item.translations.en?.tag || '', description: item.translations.en?.description || '' },
          });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load panel' });
        this.router.navigate(['/homepage/panels']);
      },
    });
  }

  onSave(): void {
    const payload: any = {
      statValue: this.statValue,
      sortOrder: this.sortOrder,
      translations: this.translations(),
    };

    const request$ = this.isEditMode()
      ? this.homepageService.updatePanel(this.itemId()!, payload)
      : this.homepageService.createPanel(payload);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode() ? 'Panel updated successfully' : 'Panel created successfully',
        });
        this.router.navigate(['/homepage/panels']);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save panel' });
      },
    });
  }
}
