import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { TranslationEditorComponent } from '../../../shared/components/translation-editor/translation-editor.component';
import { ImageUploadComponent } from '../../../shared/components/image-upload/image-upload.component';
import { LabService } from '../../../core/services/lab.service';
import { LabCategory } from '../../../core/models/lab.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-lab-project-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, InputTextModule, SelectModule,
    CheckboxModule, ButtonModule, TranslationEditorComponent, ImageUploadComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <p-button
            icon="pi pi-arrow-left"
            severity="secondary"
            [text]="true"
            [rounded]="true"
            (onClick)="router.navigate(['/lab/projects'])" />
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
            <p-button
              label="Unpublish"
              icon="pi pi-eye-slash"
              severity="secondary"
              [outlined]="true"
              (onClick)="status = 'draft'; onSave()" />
          }
          <p-button
            label="Save"
            icon="pi pi-save"
            [loading]="labService.isLoading()"
            (onClick)="onSave()" />
        </div>
      </div>

      <!-- Two-column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- LEFT: Content (2/3 width) -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-5">Content</h2>
            <app-translation-editor
              [translations]="translations()"
              [fields]="translationFields"
              (translationsChange)="translations.set($event)" />
          </div>
        </div>

        <!-- RIGHT: Sidebar (1/3 width) -->
        <div class="space-y-6">

          <!-- Settings Card -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-5">Settings</h2>
            <div class="flex flex-col gap-4">
              <!-- Status -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Status</label>
                <p-select
                  [options]="statusOptions"
                  [(ngModel)]="status"
                  optionLabel="label"
                  optionValue="value"
                  class="w-full" />
              </div>

              <!-- Featured -->
              <div class="flex items-center gap-2 pt-1">
                <p-checkbox [(ngModel)]="featured" [binary]="true" inputId="featured" />
                <label for="featured" class="text-sm font-medium text-surface-700 dark:text-surface-300">Featured project</label>
              </div>

              <!-- Slug -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Slug</label>
                <input pInputText class="w-full" [(ngModel)]="slug" />
              </div>
            </div>
          </div>

          <!-- Categories Card -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Categories</h2>
            <div class="flex flex-col gap-3">
              @for (cat of allCategories(); track cat.id) {
                <div class="flex items-center gap-2">
                  <p-checkbox
                    [value]="cat.id"
                    [(ngModel)]="selectedCategoryIds"
                    [inputId]="'cat-' + cat.id" />
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
              <p class="text-sm text-surface-500 dark:text-surface-400">
                Save the project first, then you can upload an image.
              </p>
            }
          </div>

          <!-- Info Card (edit mode only) -->
          @if (isEditMode()) {
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
          }
        </div>
      </div>
    </div>
  `,
})
export class LabProjectFormComponent implements OnInit {
  readonly labService = inject(LabService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly http = inject(HttpClient);

  isEditMode = signal(false);
  projectId = signal<string | null>(null);

  translations = signal<{ hr: Record<string, any>; en: Record<string, any> }>({
    hr: { title: '', shortTitle: '', subtitle: '', body: '' },
    en: { title: '', shortTitle: '', subtitle: '', body: '' },
  });

  slug = '';
  status = 'draft';
  featured = false;
  selectedCategoryIds: string[] = [];
  allCategories = signal<LabCategory[]>([]);
  imageUrl = signal('');
  isUploadingImage = signal(false);
  createdAt = signal('');
  updatedAt = signal('');

  translationFields = [
    { key: 'title', label: 'Title', type: 'text' as const },
    { key: 'shortTitle', label: 'Short Title', type: 'text' as const },
    { key: 'subtitle', label: 'Subtitle', type: 'text' as const },
    { key: 'body', label: 'Content', type: 'richtext' as const },
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
        this.status = project.status;
        this.featured = project.featured;
        this.selectedCategoryIds = (project.categories || []).map(c => c.id);

        if (project.translations) {
          this.translations.set({
            hr: {
              title: project.translations.hr?.title || '',
              shortTitle: project.translations.hr?.shortTitle || '',
              subtitle: project.translations.hr?.subtitle || '',
              body: project.translations.hr?.body || '',
            },
            en: {
              title: project.translations.en?.title || '',
              shortTitle: project.translations.en?.shortTitle || '',
              subtitle: project.translations.en?.subtitle || '',
              body: project.translations.en?.body || '',
            },
          });
        }

        if (project.image) {
          this.resolveImageUrl(project.image);
        }

        if ((project as any).createdAt) {
          this.createdAt.set(new Date((project as any).createdAt).toLocaleString());
        }
        if ((project as any).updatedAt) {
          this.updatedAt.set(new Date((project as any).updatedAt).toLocaleString());
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load project' });
        this.router.navigate(['/lab/projects']);
      },
    });
  }

  uploadImage(file: File): void {
    const id = this.projectId();
    if (!id) return;

    this.isUploadingImage.set(true);
    this.labService.uploadImage(id, file).subscribe({
      next: (res) => {
        this.imageUrl.set(this.getFullImageUrl(res.imageUrl));
        this.isUploadingImage.set(false);
        this.messageService.add({ severity: 'success', summary: 'Image uploaded' });
      },
      error: () => {
        this.isUploadingImage.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to upload image' });
      }
    });
  }

  removeImage(): void {
    const id = this.projectId();
    if (!id) return;

    this.labService.removeImage(id).subscribe({
      next: () => {
        this.imageUrl.set('');
        this.messageService.add({ severity: 'info', summary: 'Image removed' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove image' });
      }
    });
  }

  private resolveImageUrl(image: any): void {
    if (typeof image === 'object' && image.path) {
      this.imageUrl.set(this.getFullImageUrl('/storage/media/' + image.path));
    } else if (typeof image === 'string' && image.startsWith('/api/media/')) {
      const mediaId = image.replace('/api/media/', '');
      this.http.get<any>(`${environment.apiUrl}/media/${mediaId}`).subscribe({
        next: (media: any) => {
          if (media.path) {
            this.imageUrl.set(this.getFullImageUrl('/storage/media/' + media.path));
          }
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
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode() ? 'Project updated' : 'Project created',
        });
        this.router.navigate(['/lab/projects']);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save project' });
      },
    });
  }
}
