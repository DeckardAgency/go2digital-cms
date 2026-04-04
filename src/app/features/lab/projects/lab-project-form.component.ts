import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { TranslationEditorComponent } from '../../../shared/components/translation-editor/translation-editor.component';
import { ImageUploadComponent } from '../../../shared/components/image-upload/image-upload.component';
import { LabService } from '../../../core/services/lab.service';
import { LabProject, LabCategory } from '../../../core/models/lab.model';

@Component({
  selector: 'app-lab-project-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    SelectModule,
    CheckboxModule,
    ButtonModule,
    TranslationEditorComponent,
    ImageUploadComponent,
  ],
  template: `
    <div class="max-w-4xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <p-button
            icon="pi pi-arrow-left"
            severity="secondary"
            [text]="true"
            (onClick)="router.navigate(['/lab/projects'])" />
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">
            {{ isEditMode() ? 'Edit Project' : 'New Project' }}
          </h1>
        </div>
        <p-button
          label="Save"
          icon="pi pi-check"
          [loading]="labService.isLoading()"
          (onClick)="onSave()" />
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
      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5 mb-5">
        <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Details</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Slug -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Slug</label>
            <input pInputText class="w-full" [(ngModel)]="slug" />
          </div>

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
          <div class="flex items-end gap-2 pb-2">
            <p-checkbox [(ngModel)]="featured" [binary]="true" inputId="featured" />
            <label for="featured" class="text-sm font-medium text-surface-700 dark:text-surface-300">Featured project</label>
          </div>
        </div>
      </div>

      <!-- Categories -->
      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5 mb-5">
        <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Categories</h2>
        <div class="flex flex-wrap gap-4">
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

      <!-- Image -->
      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5 mb-5">
        <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Image</h2>
        <app-image-upload
          [currentImageUrl]="imageUrl()"
          (onUpload)="onImageUpload($event)"
          (onRemove)="onImageRemove()" />
      </div>
    </div>
  `,
})
export class LabProjectFormComponent implements OnInit {
  readonly labService = inject(LabService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

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
  private imageFile: File | null = null;

  translationFields = [
    { key: 'title', label: 'Title', type: 'text' as const },
    { key: 'shortTitle', label: 'Short Title', type: 'text' as const },
    { key: 'subtitle', label: 'Subtitle', type: 'text' as const },
    { key: 'body', label: 'Body', type: 'richtext' as const },
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
      next: (categories) => {
        this.allCategories.set(categories);
      },
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
          this.imageUrl.set(typeof project.image === 'string' ? project.image : project.image.url || '');
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load project' });
        this.router.navigate(['/lab/projects']);
      },
    });
  }

  onImageUpload(file: File): void {
    this.imageFile = file;
    this.imageUrl.set(URL.createObjectURL(file));
  }

  onImageRemove(): void {
    this.imageFile = null;
    this.imageUrl.set('');
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
          detail: this.isEditMode() ? 'Project updated successfully' : 'Project created successfully',
        });
        this.router.navigate(['/lab/projects']);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save project' });
      },
    });
  }
}
