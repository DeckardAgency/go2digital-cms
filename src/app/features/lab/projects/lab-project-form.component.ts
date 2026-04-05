import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';
import { EditorModule } from 'primeng/editor';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import { TranslationEditorComponent } from '../../../shared/components/translation-editor/translation-editor.component';
import { ImageUploadComponent } from '../../../shared/components/image-upload/image-upload.component';
import { FocalPointPickerComponent } from '../../../shared/components/focal-point-picker/focal-point-picker.component';
import { SeoEditorComponent, SeoContentContext } from '../../../shared/components/seo-editor/seo-editor.component';
import { LabService } from '../../../core/services/lab.service';
import { MediaService } from '../../../core/services/media.service';
import { LabCategory } from '../../../core/models/lab.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-lab-project-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, InputTextModule, TextareaModule, SelectModule,
    CheckboxModule, ButtonModule, EditorModule, TooltipModule, ToggleSwitchModule,
    TranslationEditorComponent, ImageUploadComponent, FocalPointPickerComponent,
    SeoEditorComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <p-button icon="pi pi-arrow-left" severity="secondary" [text]="true" [rounded]="true" (onClick)="router.navigate(['/lab/projects'])" />
          <div>
            <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">
              {{ isEditMode() ? 'Edit Project' : 'New Project' }}
            </h1>
            <p class="text-surface-500 dark:text-surface-400 text-sm mt-0.5">
              {{ isEditMode() ? 'Update lab project details' : 'Create a new lab project' }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          @if (isEditMode() && status === 'published') {
            <p-button label="Unpublish" icon="pi pi-eye-slash" severity="secondary" [outlined]="true" (onClick)="status = 'draft'; onSave()" />
          }
          <p-button label="Save" icon="pi pi-save" [loading]="labService.isLoading()" (onClick)="onSave()" />
        </div>
      </div>

      <!-- Two-column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- LEFT: Content (2/3 width) -->
        <div class="lg:col-span-2 space-y-6">

          <!-- Basic Content -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-5">Content</h2>
            <app-translation-editor
              [translations]="translations()"
              [fields]="translationFields"
              (translationsChange)="onTranslationsChange($event)" />
          </div>

          <!-- ═══ SECTIONS EDITOR ═══ -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
            <div class="flex items-center justify-between p-6 pb-0">
              <div class="flex items-center gap-2">
                <i class="pi pi-list text-surface-400"></i>
                <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0">Sections</h2>
              </div>
              <div class="flex items-center gap-2">
                <!-- Language selector -->
                <div class="flex items-center gap-0.5 bg-surface-100 dark:bg-surface-800 rounded-lg p-0.5">
                  @for (loc of sectionLocales; track loc.code) {
                    <button type="button"
                      class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                      [class]="activeSectionLocale === loc.code
                        ? 'bg-surface-0 dark:bg-surface-700 text-surface-900 dark:text-surface-0 shadow-sm'
                        : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'"
                      (click)="activeSectionLocale = loc.code">
                      {{ loc.code.toUpperCase() }}
                    </button>
                  }
                </div>
                <p-button label="Add Section" icon="pi pi-plus" size="small" [outlined]="true" (onClick)="addSection()" />
              </div>
            </div>

            <div class="p-6">
              @if (getSections().length === 0) {
                <div class="text-center py-10 border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-xl">
                  <i class="pi pi-list text-3xl text-surface-300 dark:text-surface-600 mb-3 block"></i>
                  <p class="text-sm text-surface-500">No sections yet</p>
                  <p class="text-xs text-surface-400 mt-1 mb-4">Add sections to structure your case study content</p>
                  <p-button label="Add First Section" icon="pi pi-plus" size="small" (onClick)="addSection()" />
                </div>
              } @else {
                <div class="flex flex-col gap-5">
                  @for (section of getSections(); track $index; let i = $index; let first = $first; let last = $last) {
                    <div class="border border-surface-200 dark:border-surface-700 rounded-xl overflow-hidden">
                      <!-- Section header -->
                      <div class="flex items-center gap-3 px-4 py-3 bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
                        <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                          {{ i + 1 }}
                        </div>
                        <input pInputText class="flex-1" [(ngModel)]="section.label" placeholder="Section label (e.g. Why this case?)" />
                        <div class="flex items-center gap-0.5">
                          <p-button icon="pi pi-arrow-up" [text]="true" [rounded]="true" size="small" severity="secondary" [disabled]="first" pTooltip="Move up" (onClick)="moveSection(i, -1)" />
                          <p-button icon="pi pi-arrow-down" [text]="true" [rounded]="true" size="small" severity="secondary" [disabled]="last" pTooltip="Move down" (onClick)="moveSection(i, 1)" />
                          <p-button icon="pi pi-trash" [text]="true" [rounded]="true" size="small" severity="danger" pTooltip="Remove" (onClick)="removeSection(i)" />
                        </div>
                      </div>

                      <!-- Section content (richtext) -->
                      <div class="p-4">
                        <p-editor [(ngModel)]="section.content" [style]="{ height: '200px' }" placeholder="Write section content..."></p-editor>
                      </div>

                      <!-- Section image -->
                      <div class="px-4 pb-4">
                        @if (section.imagePath) {
                          <div class="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                            <img [src]="getMediaFullUrl(section.imagePath)" class="w-16 h-16 rounded-lg object-cover" />
                            <div class="flex-1 min-w-0">
                              <p class="text-sm font-medium text-surface-900 dark:text-surface-0 truncate">{{ section.imagePath.split('/').pop() }}</p>
                              <p class="text-xs text-surface-400">Section image</p>
                            </div>
                            <p-button icon="pi pi-trash" [text]="true" severity="danger" size="small" (onClick)="removeSectionImage(i)" />
                          </div>
                        } @else {
                          <div class="flex items-center gap-2">
                            <p-button label="Upload Image" icon="pi pi-upload" size="small" severity="secondary" [outlined]="true" (onClick)="sectionFileInput.click()" />
                            <input #sectionFileInput type="file" class="hidden" accept="image/*" (change)="onSectionImageUpload($event, i)" />
                            <span class="text-xs text-surface-400">Optional image for this section</span>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          @if (isEditMode()) {
            <div class="mt-6">
              <app-seo-editor entityType="lab-projects" [entityId]="projectId()!" [contentContext]="getSeoContentContext()" />
            </div>
          }
        </div>

        <!-- RIGHT: Sidebar (1/3 width) -->
        <div class="space-y-6">

          <!-- Settings Card -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-5">Settings</h2>
            <div class="flex flex-col gap-4">
              <div class="flex items-center gap-3">
                <div class="flex flex-col gap-2 flex-1">
                  <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Status</label>
                  <p-select [options]="statusOptions" [(ngModel)]="status" optionLabel="label" optionValue="value" class="w-full" />
                </div>
                <div class="flex flex-col gap-2 pt-0">
                  <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Featured</label>
                  <p-toggleswitch [(ngModel)]="featured" />
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Slug</label>
                  <button type="button"
                    class="flex items-center gap-1.5 text-xs font-medium transition-colors"
                    [class]="slugLocked
                      ? 'text-surface-400 hover:text-surface-600'
                      : 'text-primary'"
                    (click)="slugLocked = !slugLocked">
                    <i [class]="slugLocked ? 'pi pi-lock' : 'pi pi-lock-open'" class="text-xs"></i>
                    {{ slugLocked ? 'Auto' : 'Manual' }}
                  </button>
                </div>
                <input pInputText class="w-full" [(ngModel)]="slug" [readonly]="slugLocked" [class.opacity-60]="slugLocked" />
              </div>
            </div>
          </div>

          <!-- Categories Card -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Categories</h2>
            <div class="flex flex-col gap-3">
              @for (cat of allCategories(); track cat.id) {
                <div class="flex items-center gap-2">
                  <p-checkbox [value]="cat.id" [(ngModel)]="selectedCategoryIds" [inputId]="'cat-' + cat.id" />
                  <label [for]="'cat-' + cat.id" class="text-sm font-medium text-surface-700 dark:text-surface-300">
                    {{ cat.translations?.hr?.name || cat.slug }}
                  </label>
                </div>
              }
              @if (!allCategories().length) {
                <span class="text-surface-400 text-sm">No categories available</span>
              }
            </div>
          </div>

          <!-- Featured Image Card -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Featured Image</h2>
            @if (isEditMode()) {
              <app-image-upload
                [currentImageUrl]="imageUrl()"
                [uploading]="isUploadingImage()"
                (onUpload)="uploadImage($event)"
                (onRemove)="removeImage()" />
            } @else {
              <div class="flex flex-col items-center justify-center py-6 border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-xl">
                <i class="pi pi-image text-2xl text-surface-300 dark:text-surface-600 mb-2"></i>
                <p class="text-xs text-surface-400">Save the project first to upload an image</p>
              </div>
            }
            @if (imageUrl()) {
              <div class="mt-3">
                <app-focal-point-picker
                  [imageUrl]="imageUrl()"
                  [focalX]="focalX"
                  [focalY]="focalY"
                  (focalPointChange)="onFocalPointChange($event)" />
              </div>
            }

            <!-- Image Details -->
            @if (imageData()) {
              <div class="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
                <div class="grid grid-cols-2 gap-y-2.5 gap-x-4 text-sm">
                  <div>
                    <span class="text-xs text-surface-400 block">Filename</span>
                    <span class="font-medium text-surface-900 dark:text-surface-0 text-xs break-all">{{ imageData()!.originalFilename || imageData()!.filename }}</span>
                  </div>
                  <div>
                    <span class="text-xs text-surface-400 block">Type</span>
                    <span class="font-medium text-surface-900 dark:text-surface-0 text-xs">{{ imageData()!.mimeType }}</span>
                  </div>
                  <div>
                    <span class="text-xs text-surface-400 block">Size</span>
                    <span class="font-medium text-surface-900 dark:text-surface-0 text-xs">{{ formatFileSize(imageData()!.size) }}</span>
                  </div>
                  @if (imageData()!.width) {
                    <div>
                      <span class="text-xs text-surface-400 block">Dimensions</span>
                      <span class="font-medium text-surface-900 dark:text-surface-0 text-xs">{{ imageData()!.width }} × {{ imageData()!.height }}px</span>
                    </div>
                  }
                </div>

                <!-- Optimize button -->
                @if (imageData()!.mimeType !== 'image/webp') {
                  <div class="mt-3">
                    <p-button
                      label="Optimize for Web"
                      icon="pi pi-bolt"
                      severity="secondary"
                      [outlined]="true"
                      size="small"
                      styleClass="w-full"
                      [loading]="optimizing()"
                      (onClick)="optimizeImage()" />
                    <p class="text-[10px] text-surface-400 mt-1.5 text-center">Convert to WebP for smaller file size</p>
                  </div>
                } @else {
                  <div class="mt-3 flex items-center gap-2 justify-center">
                    <i class="pi pi-check-circle text-green-500 text-xs"></i>
                    <span class="text-xs text-green-600 dark:text-green-400 font-medium">Already optimized (WebP)</span>
                  </div>
                }

                <!-- Optimization result -->
                @if (optimizeResult()) {
                  <div class="mt-3 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                    <div class="flex items-center gap-1.5 text-green-700 dark:text-green-400 text-xs font-medium mb-1">
                      <i class="pi pi-check-circle text-xs"></i> Optimized
                    </div>
                    <div class="text-xs text-surface-600 dark:text-surface-400">
                      {{ formatFileSize(optimizeResult()!.originalSize) }} → {{ formatFileSize(optimizeResult()!.optimizedSize) }}
                      <span class="font-medium text-green-600 dark:text-green-400">({{ optimizeResult()!.savingsPercent }}% smaller)</span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Info Card -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Info</h2>
            <div class="flex flex-col gap-3 text-sm">
              <div class="flex justify-between">
                <span class="text-surface-500 dark:text-surface-400">Status</span>
                <span class="font-medium text-surface-900 dark:text-surface-0 capitalize">{{ status }}</span>
              </div>
              @if (createdAt()) {
                <div class="flex justify-between">
                  <span class="text-surface-500 dark:text-surface-400">Created</span>
                  <span class="font-medium text-surface-900 dark:text-surface-0">{{ createdAt() }}</span>
                </div>
              }
              @if (updatedAt()) {
                <div class="flex justify-between">
                  <span class="text-surface-500 dark:text-surface-400">Updated</span>
                  <span class="font-medium text-surface-900 dark:text-surface-0">{{ updatedAt() }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LabProjectFormComponent implements OnInit {
  readonly labService = inject(LabService);
  readonly mediaService = inject(MediaService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly http = inject(HttpClient);

  isEditMode = signal(false);
  projectId = signal<string | null>(null);

  translations = signal<{ hr: Record<string, any>; en: Record<string, any> }>({
    hr: { title: '', subtitle: '', body: '', sections: [] },
    en: { title: '', subtitle: '', body: '', sections: [] },
  });

  activeSectionLocale = 'hr';
  sectionLocales = [
    { code: 'hr', label: 'Hrvatski' },
    { code: 'en', label: 'English' },
  ];

  slug = '';
  slugLocked = true;
  status = 'draft';
  featured = false;
  selectedCategoryIds: string[] = [];
  allCategories = signal<LabCategory[]>([]);
  imageUrl = signal('');
  imageData = signal<any>(null);
  isUploadingImage = signal(false);
  optimizing = signal(false);
  optimizeResult = signal<{ originalSize: number; optimizedSize: number; savingsPercent: number } | null>(null);
  focalX = 50;
  focalY = 50;
  createdAt = signal('');
  updatedAt = signal('');

  translationFields = [
    { key: 'title', label: 'Title', type: 'text' as const },
    { key: 'subtitle', label: 'Subtitle', type: 'text' as const },
    { key: 'body', label: 'Intro Text', type: 'textarea' as const },
  ];

  statusOptions = [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
  ];

  ngOnInit(): void {
    this.loadCategories();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.projectId.set(id);
      this.loadProject(id);
    }
  }

  private loadCategories(): void {
    this.labService.getCategories().subscribe({
      next: (categories) => this.allCategories.set(categories),
    });
  }

  private loadProject(id: string): void {
    this.labService.getProject(id).subscribe({
      next: (project) => {
        this.slug = project.slug;
        this.slugLocked = true;
        this.status = project.status;
        this.featured = project.featured;
        this.selectedCategoryIds = (project.categories || []).map((c: any) =>
          typeof c === 'string' ? c.split('/').pop() || '' : c.id || ''
        ).filter((id: string) => id.length > 0);

        if (project.translations) {
          this.translations.set({
            hr: {
              title: project.translations.hr?.title || '',
              subtitle: project.translations.hr?.subtitle || '',
              body: project.translations.hr?.body || '',
              sections: (project.translations.hr as any)?.sections || [],
            },
            en: {
              title: project.translations.en?.title || '',
              subtitle: project.translations.en?.subtitle || '',
              body: project.translations.en?.body || '',
              sections: (project.translations.en as any)?.sections || [],
            },
          });
        }

        if (project.image) this.resolveImageUrl(project.image);
        if ((project as any).createdAt) this.createdAt.set(new Date((project as any).createdAt).toLocaleString());
        if ((project as any).updatedAt) this.updatedAt.set(new Date((project as any).updatedAt).toLocaleString());
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load project' });
        this.router.navigate(['/lab/projects']);
      },
    });
  }

  onTranslationsChange(translations: any): void {
    this.translations.set(translations);
    if (this.slugLocked) {
      const title = translations.hr?.title || translations.en?.title || '';
      this.slug = this.generateSlug(title);
    }
  }

  private generateSlug(text: string): string {
    const charMap: Record<string, string> = {
      'č': 'c', 'ć': 'c', 'đ': 'dj', 'š': 's', 'ž': 'z',
      'Č': 'c', 'Ć': 'c', 'Đ': 'dj', 'Š': 's', 'Ž': 'z',
      'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss',
    };
    return text
      .split('').map(c => charMap[c] || c).join('')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // ─── Sections ──────────────────────────────────────────

  getSections(): { label: string; content: string; imagePath?: string }[] {
    const t = this.translations();
    const locale = this.activeSectionLocale as 'hr' | 'en';
    if (!t[locale]['sections']) t[locale]['sections'] = [];
    return t[locale]['sections'];
  }

  addSection(): void {
    const t = this.translations();
    for (const locale of ['hr', 'en']) {
      if (!t[locale as 'hr' | 'en']['sections']) t[locale as 'hr' | 'en']['sections'] = [];
      t[locale as 'hr' | 'en']['sections'].push({ label: '', content: '', imagePath: '' });
    }
    this.translations.set({ ...t });
  }

  removeSection(index: number): void {
    const t = this.translations();
    for (const locale of ['hr', 'en']) {
      t[locale as 'hr' | 'en']['sections']?.splice(index, 1);
    }
    this.translations.set({ ...t });
  }

  moveSection(index: number, direction: number): void {
    const t = this.translations();
    const newIndex = index + direction;
    for (const locale of ['hr', 'en']) {
      const arr = t[locale as 'hr' | 'en']['sections'];
      if (arr && newIndex >= 0 && newIndex < arr.length) {
        [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
      }
    }
    this.translations.set({ ...t });
  }

  onSectionImageUpload(event: Event, sectionIndex: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';

    this.mediaService.uploadMedia(file, 'labs').subscribe({
      next: (media) => {
        // Set image on ALL locales for this section index
        const t = this.translations();
        for (const locale of ['hr', 'en']) {
          const sections = t[locale as 'hr' | 'en']['sections'];
          if (sections && sections[sectionIndex]) {
            sections[sectionIndex].imagePath = media.path;
          }
        }
        this.translations.set({ ...t });
        this.messageService.add({ severity: 'success', summary: 'Image uploaded' });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Failed to upload image' }),
    });
  }

  removeSectionImage(sectionIndex: number): void {
    const t = this.translations();
    for (const locale of ['hr', 'en']) {
      const sections = t[locale as 'hr' | 'en']['sections'];
      if (sections && sections[sectionIndex]) {
        sections[sectionIndex].imagePath = '';
      }
    }
    this.translations.set({ ...t });
  }

  getMediaFullUrl(path: string): string {
    return this.mediaService.getMediaUrl(path);
  }

  // ─── Image ─────────────────────────────────────────────

  uploadImage(file: File): void {
    const id = this.projectId();
    if (!id) return;
    this.isUploadingImage.set(true);
    this.labService.uploadImage(id, file).subscribe({
      next: (res) => { this.imageUrl.set(this.getFullImageUrl(res.imageUrl)); this.isUploadingImage.set(false); this.messageService.add({ severity: 'success', summary: 'Image uploaded' }); },
      error: () => { this.isUploadingImage.set(false); this.messageService.add({ severity: 'error', summary: 'Failed to upload image' }); }
    });
  }

  removeImage(): void {
    const id = this.projectId();
    if (!id) return;
    this.labService.removeImage(id).subscribe({
      next: () => { this.imageUrl.set(''); this.messageService.add({ severity: 'info', summary: 'Image removed' }); },
      error: () => this.messageService.add({ severity: 'error', summary: 'Failed to remove image' }),
    });
  }

  onFocalPointChange(point: { x: number; y: number }): void {
    this.focalX = point.x;
    this.focalY = point.y;
    const id = this.projectId();
    if (!id) return;
    this.http.put(`${environment.apiUrl}/lab-projects/${id}/focal-point`, point).subscribe({
      next: () => this.messageService.add({ severity: 'success', summary: 'Focal point saved' }),
      error: () => this.messageService.add({ severity: 'error', summary: 'Failed to save focal point' }),
    });
  }

  private resolveImageUrl(image: any): void {
    if (typeof image === 'object' && image.path) {
      this.imageUrl.set(this.getFullImageUrl('/storage/media/' + image.path));
      this.imageData.set(image);
      this.focalX = image.focalX ?? 50;
      this.focalY = image.focalY ?? 50;
    } else if (typeof image === 'string' && image.startsWith('/api/media/')) {
      const mediaId = image.replace('/api/media/', '');
      this.http.get<any>(`${environment.apiUrl}/media/${mediaId}`).subscribe({
        next: (media: any) => {
          if (media.path) this.imageUrl.set(this.getFullImageUrl('/storage/media/' + media.path));
          this.imageData.set(media);
          this.focalX = media.focalX ?? 50;
          this.focalY = media.focalY ?? 50;
        }
      });
    } else if (typeof image === 'string' && image) {
      this.imageUrl.set(this.getFullImageUrl(image));
    }
  }

  private getFullImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return environment.apiUrl.replace('/api', '') + path;
  }

  optimizeImage(): void {
    const img = this.imageData();
    if (!img?.id) return;
    this.optimizing.set(true);
    this.optimizeResult.set(null);
    this.http.post<any>(`${environment.apiUrl}/media/${img.id}/optimize`, { quality: 80 }).subscribe({
      next: (res) => {
        this.optimizing.set(false);
        this.optimizeResult.set(res);
        // Update image data with new values
        this.imageData.set({ ...img, mimeType: res.mimeType, size: res.optimizedSize, path: res.path, width: res.width, height: res.height });
        this.imageUrl.set(this.getFullImageUrl('/storage/media/' + res.path));
        this.messageService.add({ severity: 'success', summary: 'Image optimized', detail: `${res.savingsPercent}% smaller` });
      },
      error: (err) => {
        this.optimizing.set(false);
        this.messageService.add({ severity: 'error', summary: 'Optimization failed', detail: err.error?.error || 'Unknown error' });
      },
    });
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // ─── SEO ───────────────────────────────────────────────

  getSeoContentContext(): SeoContentContext {
    const t = this.translations();
    return {
      entityType: 'lab-project',
      content: {
        hr: { title: t.hr['title'] || '', subtitle: t.hr['subtitle'] || '', body: t.hr['body'] || '' },
        en: { title: t.en['title'] || '', subtitle: t.en['subtitle'] || '', body: t.en['body'] || '' },
      },
    };
  }

  // ─── Save ──────────────────────────────────────────────

  onSave(): void {
    const payload: any = {
      slug: this.slug,
      status: this.status,
      featured: this.featured,
      categories: this.selectedCategoryIds.map(id => `/api/lab_categories/${id}`),
      translations: this.translations(),
    };

    const request$ = this.isEditMode()
      ? this.labService.updateProject(this.projectId()!, payload)
      : this.labService.createProject(payload);

    request$.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: this.isEditMode() ? 'Project updated' : 'Project created' });
        this.router.navigate(['/lab/projects']);
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Failed to save project' }),
    });
  }
}
