import { Component, Input, inject, signal, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { Tabs } from 'primeng/tabs';
import { TabList } from 'primeng/tabs';
import { Tab } from 'primeng/tabs';
import { TabPanels } from 'primeng/tabs';
import { TabPanel } from 'primeng/tabs';
import { environment } from '../../../../environments/environment';

interface SeoLocale {
  code: string;
  label: string;
}

@Component({
  selector: 'app-seo-editor',
  standalone: true,
  imports: [
    CommonModule, FormsModule, InputTextModule, TextareaModule,
    SelectModule, ToggleSwitchModule, ButtonModule, TagModule,
    Tabs, TabList, Tab, TabPanels, TabPanel,
  ],
  template: `
    <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 pb-0">
        <div class="flex items-center gap-2">
          <i class="pi pi-search text-surface-400"></i>
          <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0">SEO</h2>
        </div>
        <div class="flex items-center gap-2">
          @if (hasData()) {
            <p-tag value="Configured" severity="success" />
          } @else {
            <p-tag value="Not set" severity="secondary" />
          }
          <p-button label="Save SEO" icon="pi pi-save" size="small" [loading]="saving()" (onClick)="save()" />
        </div>
      </div>

      <div class="p-6">
        <!-- Google Preview -->
        <div class="mb-6 p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
          <div class="text-xs text-surface-400 mb-1">Google Preview ({{ activeLocale.label }})</div>
          <div class="text-blue-700 dark:text-blue-400 text-base font-medium truncate">
            {{ getTranslation(activeLocale.code).title || 'Page Title' }}{{ siteName ? ' | ' + siteName : '' }}
          </div>
          <div class="text-green-700 dark:text-green-500 text-xs truncate">
            {{ seo.canonicalUrl || 'https://go2digital.hr/...' }}
          </div>
          <div class="text-surface-600 dark:text-surface-400 text-xs mt-1 line-clamp-2">
            {{ getTranslation(activeLocale.code).description || 'Meta description will appear here...' }}
          </div>
        </div>

        <!-- Main tabs: Content sections -->
        <p-tabs [value]="0">
          <p-tablist>
            <p-tab [value]="0"><span class="text-sm">Meta Tags</span></p-tab>
            <p-tab [value]="1"><span class="text-sm">Open Graph</span></p-tab>
            <p-tab [value]="2"><span class="text-sm">Twitter</span></p-tab>
            <p-tab [value]="3"><span class="text-sm">Advanced</span></p-tab>
          </p-tablist>

          <p-tabpanels>
            <!-- Meta Tags -->
            <p-tabpanel [value]="0">
              <div class="pt-4">
                <!-- Language selector -->
                <div class="flex items-center gap-1 mb-4 bg-surface-100 dark:bg-surface-800 rounded-lg p-1 w-fit">
                  @for (loc of locales; track loc.code) {
                    <button
                      type="button"
                      class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                      [class]="activeLocale.code === loc.code
                        ? 'bg-surface-0 dark:bg-surface-700 text-surface-900 dark:text-surface-0 shadow-sm'
                        : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'"
                      (click)="activeLocale = loc">
                      {{ loc.code.toUpperCase() }}
                    </button>
                  }
                </div>

                <div class="flex flex-col gap-4">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Title</label>
                    <input pInputText class="w-full" [(ngModel)]="getTranslation(activeLocale.code).title" [placeholder]="activeLocale.code === 'hr' ? 'Naslov stranice' : 'Page title'" />
                    <span class="text-xs text-surface-400">{{ (getTranslation(activeLocale.code).title || '').length }}/60 characters</span>
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Description</label>
                    <textarea pTextarea class="w-full" [rows]="3" [(ngModel)]="getTranslation(activeLocale.code).description" [placeholder]="activeLocale.code === 'hr' ? 'Opis stranice' : 'Page description'"></textarea>
                    <span class="text-xs" [class]="(getTranslation(activeLocale.code).description || '').length > 160 ? 'text-red-500' : 'text-surface-400'">
                      {{ (getTranslation(activeLocale.code).description || '').length }}/160 characters
                    </span>
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Keywords</label>
                    <input pInputText class="w-full" [(ngModel)]="getTranslation(activeLocale.code).keywords" [placeholder]="activeLocale.code === 'hr' ? 'ključna, riječ' : 'keyword, example'" />
                  </div>
                </div>
              </div>
            </p-tabpanel>

            <!-- Open Graph -->
            <p-tabpanel [value]="1">
              <div class="pt-4">
                <div class="flex flex-col gap-4">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">OG Type</label>
                    <p-select [options]="ogTypeOptions" [(ngModel)]="seo.ogType" optionLabel="label" optionValue="value" class="w-full" />
                  </div>

                  <!-- Language selector -->
                  <div class="flex items-center gap-1 bg-surface-100 dark:bg-surface-800 rounded-lg p-1 w-fit">
                    @for (loc of locales; track loc.code) {
                      <button type="button"
                        class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                        [class]="activeLocale.code === loc.code
                          ? 'bg-surface-0 dark:bg-surface-700 text-surface-900 dark:text-surface-0 shadow-sm'
                          : 'text-surface-500 hover:text-surface-700'"
                        (click)="activeLocale = loc">
                        {{ loc.code.toUpperCase() }}
                      </button>
                    }
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">OG Title</label>
                    <input pInputText class="w-full" [(ngModel)]="getTranslation(activeLocale.code).ogTitle" placeholder="Falls back to Meta Title" />
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">OG Description</label>
                    <textarea pTextarea class="w-full" [rows]="2" [(ngModel)]="getTranslation(activeLocale.code).ogDescription" placeholder="Falls back to Meta Description"></textarea>
                  </div>
                  <p class="text-xs text-surface-400">OG Image: uses the Featured Image. Set a global default in Settings.</p>
                </div>
              </div>
            </p-tabpanel>

            <!-- Twitter -->
            <p-tabpanel [value]="2">
              <div class="pt-4">
                <div class="flex flex-col gap-4">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Card Type</label>
                    <p-select [options]="twitterCardOptions" [(ngModel)]="seo.twitterCard" optionLabel="label" optionValue="value" class="w-full" />
                  </div>

                  <div class="flex items-center gap-1 bg-surface-100 dark:bg-surface-800 rounded-lg p-1 w-fit">
                    @for (loc of locales; track loc.code) {
                      <button type="button"
                        class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                        [class]="activeLocale.code === loc.code
                          ? 'bg-surface-0 dark:bg-surface-700 text-surface-900 dark:text-surface-0 shadow-sm'
                          : 'text-surface-500 hover:text-surface-700'"
                        (click)="activeLocale = loc">
                        {{ loc.code.toUpperCase() }}
                      </button>
                    }
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Twitter Title</label>
                    <input pInputText class="w-full" [(ngModel)]="getTranslation(activeLocale.code).twitterTitle" placeholder="Falls back to OG Title" />
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Twitter Description</label>
                    <textarea pTextarea class="w-full" [rows]="2" [(ngModel)]="getTranslation(activeLocale.code).twitterDescription" placeholder="Falls back to OG Description"></textarea>
                  </div>
                </div>
              </div>
            </p-tabpanel>

            <!-- Advanced -->
            <p-tabpanel [value]="3">
              <div class="flex flex-col gap-4 pt-4">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Canonical URL</label>
                  <input pInputText class="w-full" [(ngModel)]="seo.canonicalUrl" placeholder="https://go2digital.hr/..." />
                  <span class="text-xs text-surface-400">Leave empty to use the default page URL</span>
                </div>
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">No Index</label>
                    <p class="text-xs text-surface-400 mt-0.5">Prevent search engines from indexing</p>
                  </div>
                  <p-toggleswitch [(ngModel)]="seo.noIndex" />
                </div>
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">No Follow</label>
                    <p class="text-xs text-surface-400 mt-0.5">Prevent search engines from following links</p>
                  </div>
                  <p-toggleswitch [(ngModel)]="seo.noFollow" />
                </div>
              </div>
            </p-tabpanel>
          </p-tabpanels>
        </p-tabs>
      </div>
    </div>
  `,
})
export class SeoEditorComponent implements OnInit, OnChanges {
  @Input() entityType = '';
  @Input() entityId = '';
  @Input() singletonType = '';
  @Input() siteName = 'Go2Digital';

  /** Supported locales — add more here when needed */
  @Input() locales: SeoLocale[] = [
    { code: 'hr', label: 'Hrvatski' },
    { code: 'en', label: 'English' },
  ];

  private http = inject(HttpClient);
  private messageService = inject(MessageService);
  private apiUrl = environment.apiUrl;

  hasData = signal(false);
  saving = signal(false);
  activeLocale: SeoLocale = { code: 'hr', label: 'Hrvatski' };

  seo: any = {
    translations: {} as Record<string, any>,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    canonicalUrl: '',
    noIndex: false,
    noFollow: false,
  };

  ogTypeOptions = [
    { label: 'Website', value: 'website' },
    { label: 'Article', value: 'article' },
    { label: 'Product', value: 'product' },
    { label: 'Profile', value: 'profile' },
  ];

  twitterCardOptions = [
    { label: 'Summary Large Image', value: 'summary_large_image' },
    { label: 'Summary', value: 'summary' },
    { label: 'App', value: 'app' },
    { label: 'Player', value: 'player' },
  ];

  ngOnInit(): void {
    this.initLocales();
    this.loadSeo();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['entityId'] && !changes['entityId'].firstChange) ||
        (changes['singletonType'] && !changes['singletonType'].firstChange)) {
      this.loadSeo();
    }
  }

  private initLocales(): void {
    for (const loc of this.locales) {
      if (!this.seo.translations[loc.code]) {
        this.seo.translations[loc.code] = this.emptyTranslation();
      }
    }
    this.activeLocale = this.locales[0];
  }

  getTranslation(code: string): any {
    if (!this.seo.translations[code]) {
      this.seo.translations[code] = this.emptyTranslation();
    }
    return this.seo.translations[code];
  }

  private getEndpoint(): string {
    if (this.singletonType) return `${this.apiUrl}/seo/singleton/${this.singletonType}`;
    return `${this.apiUrl}/seo/${this.entityType}/${this.entityId}`;
  }

  private loadSeo(): void {
    if (!this.entityId && !this.singletonType) return;

    this.http.get<any>(this.getEndpoint()).subscribe({
      next: (data) => {
        this.hasData.set(data.exists !== false);
        if (data.translations) {
          for (const loc of this.locales) {
            this.seo.translations[loc.code] = {
              ...this.emptyTranslation(),
              ...(data.translations[loc.code] || {}),
            };
          }
        }
        this.seo.ogType = data.ogType || 'website';
        this.seo.twitterCard = data.twitterCard || 'summary_large_image';
        this.seo.canonicalUrl = data.canonicalUrl || '';
        this.seo.noIndex = data.noIndex || false;
        this.seo.noFollow = data.noFollow || false;
      }
    });
  }

  save(): void {
    if (!this.entityId && !this.singletonType) return;

    this.saving.set(true);
    this.http.put<any>(this.getEndpoint(), this.seo).subscribe({
      next: () => {
        this.saving.set(false);
        this.hasData.set(true);
        this.messageService.add({ severity: 'success', summary: 'SEO saved' });
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({ severity: 'error', summary: 'Failed to save SEO' });
      }
    });
  }

  private emptyTranslation(): any {
    return { title: '', description: '', keywords: '', ogTitle: '', ogDescription: '', twitterTitle: '', twitterDescription: '' };
  }
}
