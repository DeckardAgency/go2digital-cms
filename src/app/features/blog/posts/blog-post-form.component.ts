import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { TranslationEditorComponent } from '../../../shared/components/translation-editor/translation-editor.component';
import { ImageUploadComponent } from '../../../shared/components/image-upload/image-upload.component';
import { BlogService } from '../../../core/services/blog.service';
import { BlogPost, BlogCategory } from '../../../core/models/blog.model';

@Component({
  selector: 'app-blog-post-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
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
            (onClick)="router.navigate(['/blog/posts'])" />
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">
            {{ isEditMode() ? 'Edit Post' : 'New Post' }}
          </h1>
        </div>
        <p-button
          label="Save"
          icon="pi pi-check"
          [loading]="blogService.isLoading()"
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

          <!-- Author -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Author</label>
            <input pInputText class="w-full" [(ngModel)]="author" />
          </div>

          <!-- Date -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Date</label>
            <p-datepicker [(ngModel)]="date" dateFormat="yy-mm-dd" [showIcon]="true" class="w-full" />
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

          <!-- Category -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Category</label>
            <p-select
              [options]="categoryOptions()"
              [(ngModel)]="categoryId"
              optionLabel="label"
              optionValue="value"
              placeholder="Select category"
              [showClear]="true"
              class="w-full" />
          </div>

          <!-- Featured -->
          <div class="flex items-end gap-2 pb-2">
            <p-checkbox [(ngModel)]="featured" [binary]="true" inputId="featured" />
            <label for="featured" class="text-sm font-medium text-surface-700 dark:text-surface-300">Featured post</label>
          </div>
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
export class BlogPostFormComponent implements OnInit {
  readonly blogService = inject(BlogService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  isEditMode = signal(false);
  postId = signal<string | null>(null);

  translations = signal<{ hr: Record<string, any>; en: Record<string, any> }>({
    hr: { title: '', excerpt: '', body: '' },
    en: { title: '', excerpt: '', body: '' },
  });

  slug = '';
  author = 'Go2Digital';
  date: Date | null = new Date();
  status = 'draft';
  featured = false;
  categoryId: string | null = null;
  imageUrl = signal('');
  private imageFile: File | null = null;

  translationFields = [
    { key: 'title', label: 'Title', type: 'text' as const },
    { key: 'excerpt', label: 'Excerpt', type: 'textarea' as const },
    { key: 'body', label: 'Body', type: 'richtext' as const },
  ];

  statusOptions = [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
  ];

  categoryOptions = signal<{ label: string; value: string }[]>([]);

  ngOnInit(): void {
    this.loadCategories();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.postId.set(id);
      this.loadPost(id);
    }
  }

  private loadCategories(): void {
    this.blogService.getCategories().subscribe({
      next: (categories) => {
        this.categoryOptions.set(
          categories.map(c => ({
            label: c.translations?.hr?.name || c.slug,
            value: c.id,
          }))
        );
      },
    });
  }

  private loadPost(id: string): void {
    this.blogService.getPost(id).subscribe({
      next: (post) => {
        this.slug = post.slug;
        this.author = post.author;
        this.date = post.date ? new Date(post.date) : null;
        this.status = post.status;
        this.featured = post.featured;
        this.categoryId = post.category?.id || null;

        if (post.translations) {
          this.translations.set({
            hr: { title: post.translations.hr?.title || '', excerpt: post.translations.hr?.excerpt || '', body: post.translations.hr?.body || '' },
            en: { title: post.translations.en?.title || '', excerpt: post.translations.en?.excerpt || '', body: post.translations.en?.body || '' },
          });
        }

        if (post.image) {
          this.imageUrl.set(typeof post.image === 'string' ? post.image : post.image.url || '');
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load post' });
        this.router.navigate(['/blog/posts']);
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
    const formattedDate = this.date
      ? this.date.toISOString().split('T')[0]
      : null;

    const payload: any = {
      slug: this.slug,
      author: this.author,
      date: formattedDate,
      status: this.status,
      featured: this.featured,
      category: this.categoryId ? `/api/blog_categories/${this.categoryId}` : null,
      translations: this.translations(),
    };

    const request$ = this.isEditMode()
      ? this.blogService.updatePost(this.postId()!, payload)
      : this.blogService.createPost(payload);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode() ? 'Post updated successfully' : 'Post created successfully',
        });
        this.router.navigate(['/blog/posts']);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save post' });
      },
    });
  }
}
