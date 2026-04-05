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

/**
 * Reusable SEO editor component.
 * Handles loading, editing, and saving SEO metadata for any entity.
 *
 * Usage:
 *   <app-seo-editor entityType="blog-posts" [entityId]="postId" />
 *   <app-seo-editor entityType="singleton" singletonType="esg-page" />
 */
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
          <p-button
            label="Save SEO"
            icon="pi pi-save"
            size="small"
            [loading]="saving()"
            (onClick)="save()" />
        </div>
      </div>

      <div class="p-6">
        <!-- Preview -->
        <div class="mb-6 p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
          <div class="text-xs text-surface-400 mb-1">Google Preview</div>
          <div class="text-blue-700 dark:text-blue-400 text-base font-medium truncate">
            {{ seo.translations.hr.title || 'Page Title' }}{{ siteName ? ' | ' + siteName : '' }}
          </div>
          <div class="text-green-700 dark:text-green-500 text-xs truncate">
            {{ seo.canonicalUrl || 'https://go2digital.hr/...' }}
          </div>
          <div class="text-surface-600 dark:text-surface-400 text-xs mt-1 line-clamp-2">
            {{ seo.translations.hr.description || 'Meta description will appear here...' }}
          </div>
        </div>

        <p-tabs [value]="0">
          <p-tablist>
            <p-tab [value]="0"><span class="text-sm">Meta Tags</span></p-tab>
            <p-tab [value]="1"><span class="text-sm">Open Graph</span></p-tab>
            <p-tab [value]="2"><span class="text-sm">Twitter</span></p-tab>
            <p-tab [value]="3"><span class="text-sm">Advanced</span></p-tab>
          </p-tablist>

          <p-tabpanels>
            <!-- Meta Tags Tab -->
            <p-tabpanel [value]="0">
              <div class="flex flex-col gap-4 pt-4">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Title (HR)</label>
                    <input pInputText class="w-full" [(ngModel)]="seo.translations.hr.title" placeholder="Naslov stranice" />
                    <span class="text-xs text-surface-400">{{ (seo.translations.hr.title || '').length }}/60 characters</span>
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Title (EN)</label>
                    <input pInputText class="w-full" [(ngModel)]="seo.translations.en.title" placeholder="Page title" />
                    <span class="text-xs text-surface-400">{{ (seo.translations.en.title || '').length }}/60 characters</span>
                  </div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Description (HR)</label>
                    <textarea pTextarea class="w-full" [rows]="3" [(ngModel)]="seo.translations.hr.description" placeholder="Opis stranice za trazilice"></textarea>
                    <span class="text-xs" [class]="(seo.translations.hr.description || '').length > 160 ? 'text-red-500' : 'text-surface-400'">
                      {{ (seo.translations.hr.description || '').length }}/160 characters
                    </span>
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Description (EN)</label>
                    <textarea pTextarea class="w-full" [rows]="3" [(ngModel)]="seo.translations.en.description" placeholder="Page description for search engines"></textarea>
                    <span class="text-xs" [class]="(seo.translations.en.description || '').length > 160 ? 'text-red-500' : 'text-surface-400'">
                      {{ (seo.translations.en.description || '').length }}/160 characters
                    </span>
                  </div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Keywords (HR)</label>
                    <input pInputText class="w-full" [(ngModel)]="seo.translations.hr.keywords" placeholder="ključna, riječ, primjer" />
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Keywords (EN)</label>
                    <input pInputText class="w-full" [(ngModel)]="seo.translations.en.keywords" placeholder="keyword, example, seo" />
                  </div>
                </div>
              </div>
            </p-tabpanel>

            <!-- Open Graph Tab -->
            <p-tabpanel [value]="1">
              <div class="flex flex-col gap-4 pt-4">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-surface-700 dark:text-surface-300">OG Type</label>
                  <p-select [options]="ogTypeOptions" [(ngModel)]="seo.ogType" optionLabel="label" optionValue="value" class="w-full" />
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">OG Title (HR)</label>
                    <input pInputText class="w-full" [(ngModel)]="seo.translations.hr.ogTitle" placeholder="Falls back to Meta Title" />
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">OG Title (EN)</label>
                    <input pInputText class="w-full" [(ngModel)]="seo.translations.en.ogTitle" />
                  </div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">OG Description (HR)</label>
                    <textarea pTextarea class="w-full" [rows]="2" [(ngModel)]="seo.translations.hr.ogDescription" placeholder="Falls back to Meta Description"></textarea>
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">OG Description (EN)</label>
                    <textarea pTextarea class="w-full" [rows]="2" [(ngModel)]="seo.translations.en.ogDescription"></textarea>
                  </div>
                </div>
                <p class="text-xs text-surface-400">OG Image: use the Featured Image of the content. For global default, configure in Settings.</p>
              </div>
            </p-tabpanel>

            <!-- Twitter Tab -->
            <p-tabpanel [value]="2">
              <div class="flex flex-col gap-4 pt-4">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Twitter Card Type</label>
                  <p-select [options]="twitterCardOptions" [(ngModel)]="seo.twitterCard" optionLabel="label" optionValue="value" class="w-full" />
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Twitter Title (HR)</label>
                    <input pInputText class="w-full" [(ngModel)]="seo.translations.hr.twitterTitle" placeholder="Falls back to OG Title" />
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Twitter Title (EN)</label>
                    <input pInputText class="w-full" [(ngModel)]="seo.translations.en.twitterTitle" />
                  </div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Twitter Description (HR)</label>
                    <textarea pTextarea class="w-full" [rows]="2" [(ngModel)]="seo.translations.hr.twitterDescription" placeholder="Falls back to OG Description"></textarea>
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Twitter Description (EN)</label>
                    <textarea pTextarea class="w-full" [rows]="2" [(ngModel)]="seo.translations.en.twitterDescription"></textarea>
                  </div>
                </div>
              </div>
            </p-tabpanel>

            <!-- Advanced Tab -->
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
                    <p class="text-xs text-surface-400 mt-0.5">Prevent search engines from indexing this page</p>
                  </div>
                  <p-toggleswitch [(ngModel)]="seo.noIndex" />
                </div>
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-surface-700 dark:text-surface-300">No Follow</label>
                    <p class="text-xs text-surface-400 mt-0.5">Prevent search engines from following links on this page</p>
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
  /** For content entities: 'blog-posts', 'lab-projects', 'pages', 'totems' */
  @Input() entityType: string = '';
  @Input() entityId: string = '';

  /** For singleton pages: 'blog-page', 'lab-page', 'esg-page', 'contact-page', 'team-page' */
  @Input() singletonType: string = '';

  /** Site name for Google preview */
  @Input() siteName: string = 'Go2Digital';

  private http = inject(HttpClient);
  private messageService = inject(MessageService);
  private apiUrl = environment.apiUrl;

  hasData = signal(false);
  saving = signal(false);

  seo: any = {
    translations: {
      hr: { title: '', description: '', keywords: '', ogTitle: '', ogDescription: '', twitterTitle: '', twitterDescription: '' },
      en: { title: '', description: '', keywords: '', ogTitle: '', ogDescription: '', twitterTitle: '', twitterDescription: '' },
    },
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
    this.loadSeo();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['entityId'] && !changes['entityId'].firstChange) ||
        (changes['singletonType'] && !changes['singletonType'].firstChange)) {
      this.loadSeo();
    }
  }

  private getEndpoint(): string {
    if (this.singletonType) {
      return `${this.apiUrl}/seo/singleton/${this.singletonType}`;
    }
    return `${this.apiUrl}/seo/${this.entityType}/${this.entityId}`;
  }

  private loadSeo(): void {
    if (!this.entityId && !this.singletonType) return;

    this.http.get<any>(this.getEndpoint()).subscribe({
      next: (data) => {
        this.hasData.set(data.exists !== false);
        if (data.translations) {
          this.seo.translations.hr = { ...this.seo.translations.hr, ...data.translations.hr };
          this.seo.translations.en = { ...this.seo.translations.en, ...data.translations.en };
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
}
