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
  selector: 'app-pillar-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, InputTextModule, InputNumberModule,
    ButtonModule, TranslationEditorComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <p-button icon="pi pi-arrow-left" severity="secondary" [text]="true" [rounded]="true" (onClick)="router.navigate(['/esg/pillars'])" />
          <div>
            <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">
              {{ isEditMode() ? 'Edit Pillar' : 'New Pillar' }}
            </h1>
            <p class="text-surface-500 dark:text-surface-400 text-sm mt-0.5">
              {{ isEditMode() ? 'Update ESG pillar details' : 'Create a new ESG pillar' }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <p-button label="Save" icon="pi pi-save" [loading]="esgService.isLoading()" (onClick)="onSave()" />
        </div>
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
              (translationsChange)="translations.set($event)" />
          </div>
        </div>

        <!-- RIGHT: Settings (1/3) -->
        <div class="space-y-6">
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-5">Settings</h2>
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Icon</label>
                <input pInputText class="w-full" [(ngModel)]="icon" placeholder="pi pi-globe" />
                <span class="text-xs text-surface-400">PrimeIcons class name</span>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Sort Order</label>
                <p-inputNumber [(ngModel)]="sortOrder" [showButtons]="true" styleClass="w-full" inputStyleClass="w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PillarFormComponent implements OnInit {
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

  icon = '';
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
    this.esgService.getPillar(id).subscribe({
      next: (item) => {
        this.icon = item.icon || '';
        this.sortOrder = item.sortOrder || 0;
        if (item.translations) {
          this.translations.set({
            hr: { title: item.translations.hr?.title || '', description: item.translations.hr?.description || '' },
            en: { title: item.translations.en?.title || '', description: item.translations.en?.description || '' },
          });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load pillar' });
        this.router.navigate(['/esg/pillars']);
      },
    });
  }

  onSave(): void {
    const payload: any = { icon: this.icon, sortOrder: this.sortOrder, translations: this.translations() };
    const request$ = this.isEditMode()
      ? this.esgService.updatePillar(this.itemId()!, payload)
      : this.esgService.createPillar(payload);

    request$.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: this.isEditMode() ? 'Pillar updated' : 'Pillar created' });
        this.router.navigate(['/esg/pillars']);
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save pillar' }),
    });
  }
}
