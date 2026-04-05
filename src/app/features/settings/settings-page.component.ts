import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PasswordModule } from 'primeng/password';
import { ConfirmationService, MessageService } from 'primeng/api';

import { SettingsService, Setting, BackupInfo, SystemInfo } from '../../core/services/settings.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, ConfirmDialogModule, DialogModule,
    InputTextModule, TextareaModule, TableModule, TagModule, PasswordModule,
  ],
  providers: [ConfirmationService],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">{{ sectionTitle }}</h1>
          <p class="text-surface-500 text-sm mt-0.5">{{ sectionDescription }}</p>
        </div>
        @if (activeSection !== 'advanced' && activeSection !== 'maintenance') {
          <p-button label="Save" icon="pi pi-save" [loading]="saving()" (onClick)="saveGroup(activeSection === 'translations' ? 'all-translations' : activeSection)" />
        }
      </div>

      <!-- ═══ GENERAL ═══ -->
      @if (activeSection === 'general') {
        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
          <div class="divide-y divide-surface-200 dark:divide-surface-700">
            @for (field of generalFields; track field.key) {
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 p-5 items-start">
                <div>
                  <label class="text-sm font-medium text-surface-900 dark:text-surface-0">{{ field.label }}</label>
                  @if (field.hint) {
                    <p class="text-xs text-surface-400 mt-0.5">{{ field.hint }}</p>
                  }
                </div>
                <div class="lg:col-span-2">
                  <input pInputText class="w-full" [ngModel]="getSettingValue(field.key)" (ngModelChange)="setSettingValue(field.key, $event, 'general')" [placeholder]="field.placeholder || ''" />
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- ═══ INTEGRATIONS ═══ -->
      @if (activeSection === 'integrations') {
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <!-- AI -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <div class="flex items-center gap-2 mb-1">
              <i class="pi pi-sparkles text-purple-500"></i>
              <h3 class="text-base font-semibold text-surface-900 dark:text-surface-0">AI Integration</h3>
            </div>
            <p class="text-xs text-surface-400 mb-4">Powers AI-generated SEO metadata</p>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Anthropic API Key</label>
              <p-password
                [ngModel]="getSettingValue('integrations.anthropicApiKey')"
                (ngModelChange)="setSettingValue('integrations.anthropicApiKey', $event, 'integrations')"
                [feedback]="false"
                [toggleMask]="true"
                styleClass="w-full"
                inputStyleClass="w-full"
                placeholder="sk-ant-..." />
              <span class="text-xs text-surface-400">Get a key at console.anthropic.com</span>
            </div>
          </div>

          <!-- reCAPTCHA -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <div class="flex items-center gap-2 mb-1">
              <i class="pi pi-shield text-green-500"></i>
              <h3 class="text-base font-semibold text-surface-900 dark:text-surface-0">reCAPTCHA</h3>
            </div>
            <p class="text-xs text-surface-400 mb-4">Protects forms from spam</p>
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Site Key</label>
                <input pInputText class="w-full" [ngModel]="getSettingValue('integrations.recaptchaSiteKey')" (ngModelChange)="setSettingValue('integrations.recaptchaSiteKey', $event, 'integrations')" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Secret Key</label>
                <p-password
                  [ngModel]="getSettingValue('integrations.recaptchaSecretKey')"
                  (ngModelChange)="setSettingValue('integrations.recaptchaSecretKey', $event, 'integrations')"
                  [feedback]="false"
                  [toggleMask]="true"
                  styleClass="w-full"
                  inputStyleClass="w-full" />
              </div>
            </div>
          </div>

          <!-- Analytics — full width -->
          <div class="xl:col-span-2 bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <div class="flex items-center gap-2 mb-1">
              <i class="pi pi-chart-bar text-blue-500"></i>
              <h3 class="text-base font-semibold text-surface-900 dark:text-surface-0">Analytics & Tracking</h3>
            </div>
            <p class="text-xs text-surface-400 mb-4">Connect third-party analytics and tracking scripts</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Google Tag Manager ID</label>
                <input pInputText class="w-full" [ngModel]="getSettingValue('integrations.gtmId')" (ngModelChange)="setSettingValue('integrations.gtmId', $event, 'integrations')" placeholder="GTM-XXXXXXX" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Google Analytics ID</label>
                <input pInputText class="w-full" [ngModel]="getSettingValue('integrations.gaId')" (ngModelChange)="setSettingValue('integrations.gaId', $event, 'integrations')" placeholder="G-XXXXXXXXXX" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Facebook Pixel ID</label>
                <input pInputText class="w-full" [ngModel]="getSettingValue('integrations.fbPixelId')" (ngModelChange)="setSettingValue('integrations.fbPixelId', $event, 'integrations')" placeholder="XXXXXXXXXXXXXXX" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Hotjar Site ID</label>
                <input pInputText class="w-full" [ngModel]="getSettingValue('integrations.hotjarId')" (ngModelChange)="setSettingValue('integrations.hotjarId', $event, 'integrations')" placeholder="XXXXXXX" />
              </div>
            </div>
          </div>
        </div>
      }

      <!-- ═══ SEO ═══ -->
      @if (activeSection === 'seo') {
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <!-- Left: Core settings -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h3 class="text-base font-semibold text-surface-900 dark:text-surface-0 mb-4">Title & Meta</h3>
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Site Name</label>
                <input pInputText class="w-full" [ngModel]="getSettingValue('seo.siteName')" (ngModelChange)="setSettingValue('seo.siteName', $event, 'seo')" />
                <span class="text-xs text-surface-400">Appended to page titles</span>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Title Separator</label>
                <input pInputText class="w-full" style="max-width: 80px" [ngModel]="getSettingValue('seo.titleSeparator')" (ngModelChange)="setSettingValue('seo.titleSeparator', $event, 'seo')" />
                <span class="text-xs text-surface-400">e.g. "Page Title | Site Name"</span>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Twitter Handle</label>
                <input pInputText class="w-full" style="max-width: 200px" [ngModel]="getSettingValue('seo.twitterHandle')" (ngModelChange)="setSettingValue('seo.twitterHandle', $event, 'seo')" placeholder="@go2digital" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Default OG Image URL</label>
                <input pInputText class="w-full" [ngModel]="getSettingValue('seo.defaultOgImage')" (ngModelChange)="setSettingValue('seo.defaultOgImage', $event, 'seo')" placeholder="/storage/media/og-default.jpg" />
              </div>
            </div>
          </div>

          <!-- Right: Descriptions -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h3 class="text-base font-semibold text-surface-900 dark:text-surface-0 mb-4">Default Descriptions</h3>
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Croatian (HR)</label>
                <textarea pTextarea class="w-full" [rows]="3" [ngModel]="getTranslationValue('seo.defaultDescription', 'hr')" (ngModelChange)="setTranslationValue('seo.defaultDescription', 'hr', $event, 'seo')"></textarea>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">English (EN)</label>
                <textarea pTextarea class="w-full" [rows]="3" [ngModel]="getTranslationValue('seo.defaultDescription', 'en')" (ngModelChange)="setTranslationValue('seo.defaultDescription', 'en', $event, 'seo')"></textarea>
              </div>
            </div>
          </div>

          <!-- Full width: robots.txt -->
          <div class="xl:col-span-2 bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h3 class="text-base font-semibold text-surface-900 dark:text-surface-0 mb-4">robots.txt</h3>
            <textarea pTextarea class="w-full font-mono text-xs" [rows]="6" [ngModel]="getSettingValue('seo.robotsTxt')" (ngModelChange)="setSettingValue('seo.robotsTxt', $event, 'seo')"></textarea>
          </div>
        </div>
      }

      <!-- ═══ TRANSLATIONS ═══ -->
      @if (activeSection === 'translations') {
        <div class="space-y-6">
          <!-- Language selector -->
          <div class="flex items-center gap-1 bg-surface-100 dark:bg-surface-800 rounded-lg p-1 w-fit">
            @for (loc of translationLocales; track loc.code) {
              <button type="button"
                class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                [class]="activeTranslationLocale === loc.code
                  ? 'bg-surface-0 dark:bg-surface-700 text-surface-900 dark:text-surface-0 shadow-sm'
                  : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'"
                (click)="activeTranslationLocale = loc.code">
                {{ loc.label }}
              </button>
            }
          </div>

          @for (section of translationSections; track section.group) {
            <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
              <div class="p-5 border-b border-surface-200 dark:border-surface-700">
                <h3 class="text-base font-semibold text-surface-900 dark:text-surface-0 capitalize">{{ section.label }}</h3>
              </div>
              <div class="divide-y divide-surface-200 dark:divide-surface-700">
                @for (item of getTranslationSettings(section.group); track item.key) {
                  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 p-5 items-center">
                    <div>
                      <label class="text-sm font-medium text-surface-700 dark:text-surface-300 font-mono break-all">{{ item.key }}</label>
                    </div>
                    <div class="lg:col-span-2">
                      <input pInputText class="w-full" [ngModel]="getTranslationValue(item.key, activeTranslationLocale)" (ngModelChange)="setTranslationValue(item.key, activeTranslationLocale, $event, section.group)" />
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- ═══ MAINTENANCE ═══ -->
      @if (activeSection === 'maintenance') {
        <div class="space-y-6">
          <!-- System Info -->
          @if (systemInfo()) {
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
                <span class="text-xs text-surface-400 block mb-1">PHP Version</span>
                <span class="text-lg font-semibold text-surface-900 dark:text-surface-0">{{ systemInfo()!.php }}</span>
              </div>
              <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
                <span class="text-xs text-surface-400 block mb-1">Symfony</span>
                <span class="text-lg font-semibold text-surface-900 dark:text-surface-0">{{ systemInfo()!.symfony }}</span>
              </div>
              <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
                <span class="text-xs text-surface-400 block mb-1">Environment</span>
                <span class="text-lg font-semibold text-surface-900 dark:text-surface-0 capitalize">{{ systemInfo()!.environment }}</span>
              </div>
              <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
                <span class="text-xs text-surface-400 block mb-1">Debug Mode</span>
                <p-tag [value]="systemInfo()!.debug ? 'Enabled' : 'Disabled'" [severity]="systemInfo()!.debug ? 'warn' : 'success'" />
              </div>
            </div>
          }

          <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <!-- Cache -->
            <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
              <div class="flex items-center gap-2 mb-1">
                <i class="pi pi-bolt text-yellow-500"></i>
                <h3 class="text-base font-semibold text-surface-900 dark:text-surface-0">Cache</h3>
              </div>
              <p class="text-xs text-surface-400 mb-5">Clear after deploying or if you experience stale data</p>
              <div class="flex items-center gap-3">
                <p-button label="Clear Cache" icon="pi pi-trash" severity="warn" [outlined]="true" [loading]="clearingCache()" (onClick)="clearCache()" />
                <p-button label="Warmup Cache" icon="pi pi-sync" severity="secondary" [outlined]="true" [loading]="warmingCache()" (onClick)="warmupCache()" />
              </div>
              @if (cacheResult()) {
                <div class="mt-4 p-3 rounded-lg text-xs font-mono max-h-32 overflow-auto"
                  [class]="cacheResult()!.success
                    ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'">
                  {{ cacheResult()!.output }}
                </div>
              }
            </div>

            <!-- Database Backup -->
            <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
              <div class="flex items-center gap-2 mb-1">
                <i class="pi pi-database text-blue-500"></i>
                <h3 class="text-base font-semibold text-surface-900 dark:text-surface-0">Database Backup</h3>
              </div>
              <p class="text-xs text-surface-400 mb-5">mysqldump backups stored on the server</p>
              <p-button label="Create Backup" icon="pi pi-download" [outlined]="true" [loading]="creatingBackup()" (onClick)="createBackup()" />

              @if (backups().length > 0) {
                <div class="mt-4 flex flex-col gap-2">
                  @for (b of backups(); track b.filename) {
                    <div class="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                      <div class="flex items-center gap-3">
                        <i class="pi pi-file text-surface-400"></i>
                        <div>
                          <div class="text-sm font-medium text-surface-900 dark:text-surface-0">{{ b.filename }}</div>
                          <div class="text-xs text-surface-400">{{ b.date }}</div>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <p-tag [value]="b.size" severity="info" />
                        @if (authService.isSuperAdmin()) {
                          <p-button icon="pi pi-download" [text]="true" size="small" severity="secondary" (onClick)="openDownloadDialog(b.filename)" />
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Download Confirmation Dialog (GitHub-style) -->
      <p-dialog
        header="Confirm Download"
        [(visible)]="showDownloadDialog"
        [modal]="true"
        [style]="{ width: '480px' }"
        [closable]="true">
        <div class="flex flex-col gap-4">
          <div class="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div class="flex items-start gap-3">
              <i class="pi pi-exclamation-triangle text-yellow-600 dark:text-yellow-400 text-lg mt-0.5"></i>
              <div>
                <p class="text-sm font-medium text-yellow-800 dark:text-yellow-300">This action requires authentication</p>
                <p class="text-xs text-yellow-700 dark:text-yellow-400 mt-1">Database backups contain sensitive data. To confirm this download, please enter your password.</p>
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm text-surface-500">File</label>
            <span class="text-sm font-mono font-medium text-surface-900 dark:text-surface-0">{{ downloadFilename }}</span>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Password</label>
            <p-password
              [(ngModel)]="downloadPassword"
              [feedback]="false"
              [toggleMask]="true"
              styleClass="w-full"
              inputStyleClass="w-full"
              placeholder="Enter your account password"
              (keydown.enter)="confirmDownload()" />
            @if (downloadError()) {
              <span class="text-xs text-red-500">{{ downloadError() }}</span>
            }
          </div>
        </div>
        <ng-template #footer>
          <div class="flex justify-end gap-2">
            <p-button label="Cancel" severity="secondary" [outlined]="true" (onClick)="showDownloadDialog = false" />
            <p-button
              label="Confirm & Download"
              icon="pi pi-download"
              severity="danger"
              [loading]="downloading()"
              [disabled]="!downloadPassword"
              (onClick)="confirmDownload()" />
          </div>
        </ng-template>
      </p-dialog>

      <!-- ═══ ADVANCED (raw) ═══ -->
      @if (activeSection === 'advanced') {
        <div>
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm text-surface-500">Raw key-value store. For advanced use only.</p>
            <p-button label="New Setting" icon="pi pi-plus" size="small" [outlined]="true" (onClick)="openNewDialog()" />
          </div>
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
            <p-table
              [value]="allSettings()"
              [paginator]="allSettings().length > 20"
              [rows]="20"
              styleClass="p-datatable-sm">
              <ng-template pTemplate="header">
                <tr>
                  <th>Key</th>
                  <th>Group</th>
                  <th>Value</th>
                  <th class="w-24">Actions</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-item>
                <tr (click)="openEditDialog(item)" class="cursor-pointer">
                  <td><span class="font-medium text-surface-900 dark:text-surface-100">{{ item.key }}</span></td>
                  <td><span class="text-surface-600 dark:text-surface-400">{{ item.group }}</span></td>
                  <td><span class="text-surface-600 dark:text-surface-400 font-mono text-xs">{{ truncateJson(item.value) }}</span></td>
                  <td>
                    <p-button icon="pi pi-trash" severity="danger" [text]="true" size="small" (onClick)="confirmDelete($event, item)" />
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="4" class="text-center py-8 text-surface-400">
                    <i class="pi pi-cog text-3xl mb-2 block"></i>
                    No settings found
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        </div>
      }
    </div>

    <!-- Edit/Create Dialog -->
    <p-dialog
      [header]="isEditMode() ? 'Edit Setting' : 'New Setting'"
      [(visible)]="showDialog"
      [modal]="true"
      [style]="{ width: '560px' }">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Key</label>
          <input pInputText class="w-full" [(ngModel)]="dialogKey" [readonly]="isEditMode()" />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Group</label>
          <input pInputText class="w-full" [(ngModel)]="dialogGroup" />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Value (JSON)</label>
          <textarea pTextarea [(ngModel)]="dialogValue" rows="6" class="w-full font-mono text-sm"></textarea>
          @if (jsonError()) {
            <small class="text-red-500">{{ jsonError() }}</small>
          }
        </div>
      </div>
      <ng-template #footer>
        <div class="flex justify-end gap-2">
          <p-button label="Cancel" severity="secondary" [outlined]="true" (onClick)="showDialog = false" />
          <p-button label="Save" icon="pi pi-check" (onClick)="onDialogSave()" />
        </div>
      </ng-template>
    </p-dialog>

    <p-confirmDialog />
  `,
})
export class SettingsPageComponent implements OnInit, OnDestroy {
  readonly settingsService = inject(SettingsService);
  readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private routeSub!: Subscription;

  activeSection = 'general';
  sectionTitle = 'General';
  sectionDescription = '';

  allSettings = signal<Setting[]>([]);
  saving = signal(false);

  // Maintenance
  systemInfo = signal<SystemInfo | null>(null);
  clearingCache = signal(false);
  warmingCache = signal(false);
  creatingBackup = signal(false);
  cacheResult = signal<{ success: boolean; output: string } | null>(null);
  backups = signal<BackupInfo[]>([]);

  // Download dialog
  showDownloadDialog = false;
  downloadFilename = '';
  downloadPassword = '';
  downloadError = signal<string | null>(null);
  downloading = signal(false);

  // Dialog
  showDialog = false;
  isEditMode = signal(false);
  editId = signal<string | null>(null);
  dialogKey = '';
  dialogGroup = '';
  dialogValue = '';
  jsonError = signal<string | null>(null);

  private pendingChanges: Map<string, { value: any; group: string }> = new Map();

  private sectionMeta: Record<string, { title: string; description: string }> = {
    general: { title: 'General', description: 'Site name, URL, and core configuration' },
    integrations: { title: 'Integrations', description: 'API keys, analytics, and third-party services' },
    seo: { title: 'SEO', description: 'Global SEO defaults and search engine settings' },
    translations: { title: 'Translations', description: 'Manage UI translation strings for all languages' },
    maintenance: { title: 'Maintenance', description: 'Cache management, database backups, and system info' },
    advanced: { title: 'Advanced', description: 'Raw key-value settings for power users' },
  };

  generalFields = [
    { key: 'general.siteName', label: 'Site Name', placeholder: 'Go2Digital' },
    { key: 'general.siteUrl', label: 'Site URL', placeholder: 'https://go2digital.hr' },
    { key: 'general.contactEmail', label: 'Contact Email', placeholder: 'info@go2digital.hr' },
    { key: 'general.copyrightHolder', label: 'Copyright Holder', placeholder: 'Go2Digital d.o.o.' },
    { key: 'general.defaultLocale', label: 'Default Locale', placeholder: 'hr', hint: 'Primary language code' },
    { key: 'general.supportedLocales', label: 'Supported Locales', placeholder: 'hr,en', hint: 'Comma-separated language codes' },
  ];

  translationSections = [
    { group: 'homepage', label: 'Homepage' },
    { group: 'footer', label: 'Footer' },
  ];

  activeTranslationLocale = 'hr';

  get translationLocales(): { code: string; label: string }[] {
    // Detect locales from actual setting values
    const localeSet = new Set<string>();
    for (const s of this.allSettings()) {
      if (this.isTranslationSetting(s)) {
        for (const key of Object.keys(s.value)) {
          if (key.length === 2) localeSet.add(key);
        }
      }
    }
    if (localeSet.size === 0) return [{ code: 'hr', label: 'HR' }, { code: 'en', label: 'EN' }];
    const labelMap: Record<string, string> = { hr: 'Hrvatski', en: 'English', de: 'Deutsch', it: 'Italiano', fr: 'Fran\u00e7ais', es: 'Espa\u00f1ol' };
    return [...localeSet].sort().map(c => ({ code: c, label: labelMap[c] || c.toUpperCase() }));
  }

  ngOnInit(): void {
    this.loadSettings();
    this.routeSub = this.route.paramMap.subscribe(params => {
      const section = params.get('section') || 'general';
      this.activeSection = section;
      const meta = this.sectionMeta[section] || this.sectionMeta['general'];
      this.sectionTitle = meta.title;
      this.sectionDescription = meta.description;

      if (section === 'maintenance') {
        this.loadSystemInfo();
        this.loadBackups();
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  loadSettings(): void {
    this.settingsService.getSettings().subscribe({
      next: (items) => {
        this.allSettings.set(items);
        this.pendingChanges.clear();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load settings' });
      },
    });
  }

  // ─── VALUE HELPERS ─────────────────────────────────────

  getSettingValue(key: string): string {
    const pending = this.pendingChanges.get(key);
    if (pending) return pending.value?.value ?? '';
    const s = this.allSettings().find(s => s.key === key);
    return s?.value?.value ?? '';
  }

  setSettingValue(key: string, value: string, group: string): void {
    const s = this.allSettings().find(s => s.key === key);
    const current = s?.value || {};
    this.pendingChanges.set(key, { value: { ...current, value }, group });
  }

  getTranslationValue(key: string, locale: string): string {
    const pending = this.pendingChanges.get(key);
    if (pending) return pending.value?.[locale] ?? '';
    const s = this.allSettings().find(s => s.key === key);
    return s?.value?.[locale] ?? '';
  }

  setTranslationValue(key: string, locale: string, value: string, group: string): void {
    const s = this.allSettings().find(s => s.key === key);
    const current = this.pendingChanges.get(key)?.value || { ...(s?.value || {}) };
    current[locale] = value;
    this.pendingChanges.set(key, { value: current, group });
  }

  getTranslationSettings(group: string): Setting[] {
    return this.allSettings().filter(s => s.group === group && this.isTranslationSetting(s));
  }

  private isTranslationSetting(s: Setting): boolean {
    return s.value && typeof s.value === 'object' && ('hr' in s.value || 'en' in s.value);
  }

  // ─── SAVE BY GROUP ─────────────────────────────────────

  saveGroup(group: string): void {
    const keysToSave = group === 'all-translations'
      ? [...this.pendingChanges.entries()].filter(([, v]) => this.translationSections.some(s => s.group === v.group))
      : [...this.pendingChanges.entries()].filter(([, v]) => v.group === group);
    if (keysToSave.length === 0) {
      this.messageService.add({ severity: 'info', summary: 'No changes', detail: 'Nothing to save' });
      return;
    }

    this.saving.set(true);
    let completed = 0;
    let errors = 0;

    for (const [key, { value, group: g }] of keysToSave) {
      const existing = this.allSettings().find(s => s.key === key);
      const done = () => {
        completed++;
        if (completed === keysToSave.length) {
          this.saving.set(false);
          if (errors === 0) {
            this.messageService.add({ severity: 'success', summary: 'Saved', detail: `${completed} setting(s) updated` });
          }
          this.loadSettings();
        }
      };

      if (existing) {
        this.settingsService.updateSetting(existing.id, { value }).subscribe({ next: done, error: () => { errors++; done(); } });
      } else {
        this.settingsService.createSetting({ key, value, group: g }).subscribe({ next: done, error: () => { errors++; done(); } });
      }
    }
  }

  // ─── MAINTENANCE ───────────────────────────────────────

  loadSystemInfo(): void {
    this.settingsService.getSystemInfo().subscribe({
      next: (info) => this.systemInfo.set(info),
    });
  }

  loadBackups(): void {
    this.settingsService.listBackups().subscribe({
      next: (list) => this.backups.set(list),
    });
  }

  clearCache(): void {
    this.clearingCache.set(true);
    this.cacheResult.set(null);
    this.settingsService.clearCache().subscribe({
      next: (res) => {
        this.clearingCache.set(false);
        this.cacheResult.set(res);
        this.messageService.add({ severity: res.success ? 'success' : 'error', summary: res.success ? 'Cache cleared' : 'Failed' });
      },
      error: () => {
        this.clearingCache.set(false);
        this.messageService.add({ severity: 'error', summary: 'Failed to clear cache' });
      },
    });
  }

  warmupCache(): void {
    this.warmingCache.set(true);
    this.cacheResult.set(null);
    this.settingsService.warmupCache().subscribe({
      next: (res) => {
        this.warmingCache.set(false);
        this.cacheResult.set(res);
        this.messageService.add({ severity: res.success ? 'success' : 'error', summary: res.success ? 'Cache warmed up' : 'Failed' });
      },
      error: () => {
        this.warmingCache.set(false);
        this.messageService.add({ severity: 'error', summary: 'Failed to warm up cache' });
      },
    });
  }

  createBackup(): void {
    this.creatingBackup.set(true);
    this.settingsService.createBackup().subscribe({
      next: (res) => {
        this.creatingBackup.set(false);
        if (res.success) {
          this.messageService.add({ severity: 'success', summary: 'Backup created', detail: `${res.filename} (${res.size})` });
          this.loadBackups();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Backup failed' });
        }
      },
      error: (err) => {
        this.creatingBackup.set(false);
        this.messageService.add({ severity: 'error', summary: 'Backup failed', detail: err.error?.error || 'Unknown error' });
      },
    });
  }

  // ─── DOWNLOAD BACKUP ────────────────────────────────────

  openDownloadDialog(filename: string): void {
    this.downloadFilename = filename;
    this.downloadPassword = '';
    this.downloadError.set(null);
    this.showDownloadDialog = true;
  }

  confirmDownload(): void {
    if (!this.downloadPassword) return;

    this.downloading.set(true);
    this.downloadError.set(null);

    this.settingsService.downloadBackup(this.downloadFilename, this.downloadPassword).subscribe({
      next: (blob) => {
        this.downloading.set(false);
        this.showDownloadDialog = false;

        // Trigger browser download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.downloadFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.messageService.add({ severity: 'success', summary: 'Download started' });
      },
      error: (err) => {
        this.downloading.set(false);
        // Try to parse error from blob response
        if (err.error instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const json = JSON.parse(reader.result as string);
              this.downloadError.set(json.error || 'Download failed');
            } catch {
              this.downloadError.set('Download failed');
            }
          };
          reader.readAsText(err.error);
        } else {
          this.downloadError.set(err.error?.error || 'Invalid password or download failed');
        }
      },
    });
  }

  // ─── RAW DIALOG ────────────────────────────────────────

  openNewDialog(): void {
    this.isEditMode.set(false);
    this.editId.set(null);
    this.dialogKey = '';
    this.dialogGroup = '';
    this.dialogValue = '{}';
    this.jsonError.set(null);
    this.showDialog = true;
  }

  openEditDialog(item: Setting): void {
    this.isEditMode.set(true);
    this.editId.set(item.id);
    this.dialogKey = item.key;
    this.dialogGroup = item.group;
    this.dialogValue = JSON.stringify(item.value, null, 2);
    this.jsonError.set(null);
    this.showDialog = true;
  }

  onDialogSave(): void {
    let parsedValue: any;
    try {
      parsedValue = JSON.parse(this.dialogValue);
      this.jsonError.set(null);
    } catch {
      this.jsonError.set('Invalid JSON format');
      return;
    }

    const payload: Partial<Setting> = {
      key: this.dialogKey,
      group: this.dialogGroup,
      value: parsedValue,
    };

    const request$ = this.isEditMode()
      ? this.settingsService.updateSetting(this.editId()!, payload)
      : this.settingsService.createSetting(payload);

    request$.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Saved' });
        this.showDialog = false;
        this.loadSettings();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save setting' });
      },
    });
  }

  confirmDelete(event: Event, item: Setting): void {
    event.stopPropagation();
    this.confirmationService.confirm({
      message: `Delete "${item.key}"?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.settingsService.deleteSetting(item.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted' });
            this.loadSettings();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete' });
          },
        });
      },
    });
  }

  truncateJson(value: any): string {
    const str = JSON.stringify(value);
    return str.length > 80 ? str.substring(0, 80) + '...' : str;
  }
}
