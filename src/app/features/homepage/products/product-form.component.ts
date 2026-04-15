import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { TranslationEditorComponent } from '../../../shared/components/translation-editor/translation-editor.component';
import { HomepageService } from '../../../core/services/homepage.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    ButtonModule,
    TranslationEditorComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <p-button icon="pi pi-arrow-left" severity="secondary" [text]="true" [rounded]="true" (onClick)="router.navigate(['/homepage/products'])" />
          <div>
            <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">{{ isEditMode() ? 'Edit Product' : 'New Product' }}</h1>
            <p class="text-surface-500 dark:text-surface-400 text-sm mt-0.5">Digital Screens (Display) or Digital Citylight (Cube)</p>
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
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Product Type</label>
                <p-select
                  [options]="productTypeOptions"
                  [(ngModel)]="productType"
                  optionLabel="label"
                  optionValue="value"
                  class="w-full" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Specs (JSON array of {{'{'}}label, value{{'}'}})</label>
                <textarea pTextarea class="w-full" [rows]="5" [(ngModel)]="specsJson"></textarea>
              </div>
            </div>
          </div>

          <!-- Features -->
          @if (isEditMode()) {
            <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0">Features</h2>
                <p-button label="Add" icon="pi pi-plus" severity="secondary" [outlined]="true" size="small" (onClick)="router.navigate(['/homepage/product-features/new'], { queryParams: { productId: itemId() } })" />
              </div>
              @if (productFeatures().length === 0) {
                <p class="text-sm text-surface-400">No features yet. Add features that appear below this product section.</p>
              } @else {
                <div class="flex flex-col gap-2">
                  @for (f of productFeatures(); track f.id) {
                    <div class="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800 cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors" (click)="router.navigate(['/homepage/product-features', f.id])">
                      <div>
                        <span class="text-sm font-medium text-surface-900 dark:text-surface-0">{{ f.translations?.hr?.title || '(no title)' }}</span>
                        <span class="text-xs text-surface-400 ml-2">#{{ f.sortOrder }}</span>
                      </div>
                      <i class="pi pi-chevron-right text-xs text-surface-400"></i>
                    </div>
                  }
                </div>
              }
            </div>
          }

          <!-- Info -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Info</h2>
            <div class="flex flex-col gap-3 text-sm">
              <div class="flex justify-between">
                <span class="text-surface-500">Section</span>
                <span class="font-medium text-surface-900 dark:text-surface-0">#12-13 Products</span>
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
export class ProductFormComponent implements OnInit {
  readonly homepageService = inject(HomepageService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  isEditMode = signal(false);
  itemId = signal<string | null>(null);

  translations = signal<{ hr: Record<string, any>; en: Record<string, any> }>({
    hr: { title: '', badge: '', description: '', specsTitle: '', downloadLabel: '', indicatorText: '' },
    en: { title: '', badge: '', description: '', specsTitle: '', downloadLabel: '', indicatorText: '' },
  });

  productType = 'display';
  specsJson = '[]';
  productFeatures = signal<any[]>([]);

  translationFields = [
    { key: 'title', label: 'Title', type: 'text' as const },
    { key: 'badge', label: 'Badge', type: 'text' as const },
    { key: 'description', label: 'Description', type: 'textarea' as const },
    { key: 'specsTitle', label: 'Specs Title', type: 'text' as const },
    { key: 'downloadLabel', label: 'Download Label', type: 'text' as const },
    { key: 'indicatorText', label: 'Indicator Text', type: 'text' as const },
  ];

  productTypeOptions = [
    { label: 'Display', value: 'display' },
    { label: 'Cube', value: 'cube' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.itemId.set(id);
      this.loadItem(id);
      this.loadFeatures(id);
    }
  }

  private loadFeatures(productId: string): void {
    this.homepageService.getProductFeatures().subscribe({
      next: (features) => {
        const productIri = `/api/homepage_products/${productId}`;
        const filtered = features.filter((f: any) => f.product === productIri || f.product?.['@id'] === productIri);
        this.productFeatures.set(filtered);
      },
      error: () => {},
    });
  }

  private loadItem(id: string): void {
    this.homepageService.getProduct(id).subscribe({
      next: (item) => {
        this.productType = item.productType || 'display';
        this.specsJson = item.specs ? JSON.stringify(item.specs, null, 2) : '[]';

        if (item.translations) {
          this.translations.set({
            hr: {
              title: item.translations.hr?.title || '',
              badge: item.translations.hr?.badge || '',
              description: item.translations.hr?.description || '',
              specsTitle: item.translations.hr?.specsTitle || '',
              downloadLabel: item.translations.hr?.downloadLabel || '',
              indicatorText: item.translations.hr?.indicatorText || '',
            },
            en: {
              title: item.translations.en?.title || '',
              badge: item.translations.en?.badge || '',
              description: item.translations.en?.description || '',
              specsTitle: item.translations.en?.specsTitle || '',
              downloadLabel: item.translations.en?.downloadLabel || '',
              indicatorText: item.translations.en?.indicatorText || '',
            },
          });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load product' });
        this.router.navigate(['/homepage/products']);
      },
    });
  }

  onSave(): void {
    let specs: any[] = [];
    try {
      specs = JSON.parse(this.specsJson);
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid JSON for specs' });
      return;
    }

    const payload: any = {
      productType: this.productType,
      specs,
      translations: this.translations(),
    };

    const request$ = this.isEditMode()
      ? this.homepageService.updateProduct(this.itemId()!, payload)
      : this.homepageService.createProduct(payload);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode() ? 'Product updated successfully' : 'Product created successfully',
        });
        this.router.navigate(['/homepage/products']);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save product' });
      },
    });
  }
}
