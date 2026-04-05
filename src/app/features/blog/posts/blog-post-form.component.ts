import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-blog-post-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, InputTextModule, SelectModule,
    DatePickerModule, CheckboxModule, ButtonModule,
    TranslationEditorComponent, ImageUploadComponent,
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
            (onClick)="router.navigate(['/blog/posts'])" />
          <div>
            <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">
              {{ isEditMode() ? 'Edit Post' : 'New Post' }}
            </h1>
            <p class="text-surface-500 dark:text-surface-400 text-sm mt-0.5">
              {{ isEditMode() ? 'Update blog post details' : 'Create a new blog post' }}
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
            [loading]="blogService.isLoading()"
            (onClick)="onSave()" />
        </div>
      </div>

      <!-- Two-column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- LEFT: Content (2/3 width) -->
        <div class="lg:col-span-2 space-y-6">

          <!-- Content Card -->
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
                <label for="featured" class="text-sm font-medium text-surface-700 dark:text-surface-300">Featured post</label>
              </div>

              <!-- Date -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Date</label>
                <p-datepicker [(ngModel)]="date" dateFormat="yy-mm-dd" [showIcon]="true" class="w-full" />
              </div>

              <!-- Author -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Author</label>
                <input pInputText class="w-full" [(ngModel)]="author" />
              </div>

              <!-- Slug -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Slug</label>
                <input pInputText class="w-full" [(ngModel)]="slug" />
              </div>
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
                Save the post first, then you can upload an image.
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
                <div class="flex justify-between">
                  <span class="text-surface-500 dark:text-surface-400">Author</span>
                  <span class="font-medium text-surface-900 dark:text-surface-0">{{ author }}</span>
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
export class BlogPostFormComponent implements OnInit {
  readonly blogService = inject(BlogService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly http = inject(HttpClient);

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
  isUploadingImage = signal(false);
  createdAt = signal('');
  updatedAt = signal('');
  private pendingImageFile: File | null = null;

  translationFields = [
    { key: 'title', label: 'Title', type: 'text' as const },
    { key: 'excerpt', label: 'Excerpt', type: 'textarea' as const },
    { key: 'body', label: 'Content', type: 'richtext' as const },
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
        // category can be object with .id, IRI string, or null
        const cat = post.category as any;
        if (typeof cat === 'string' && cat.includes('/')) {
          this.categoryId = cat.split('/').pop() || null;
        } else if (cat && typeof cat === 'object') {
          this.categoryId = cat.id || null;
        } else {
          this.categoryId = null;
        }

        if (post.translations) {
          this.translations.set({
            hr: { title: post.translations.hr?.title || '', excerpt: post.translations.hr?.excerpt || '', body: post.translations.hr?.body || '' },
            en: { title: post.translations.en?.title || '', excerpt: post.translations.en?.excerpt || '', body: post.translations.en?.body || '' },
          });
        }

        if (post.image) {
          this.resolveImageUrl(post.image);
        }

        if ((post as any).createdAt) {
          this.createdAt.set(new Date((post as any).createdAt).toLocaleString());
        }
        if ((post as any).updatedAt) {
          this.updatedAt.set(new Date((post as any).updatedAt).toLocaleString());
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load post' });
        this.router.navigate(['/blog/posts']);
      },
    });
  }

  uploadImage(file: File): void {
    const id = this.postId();
    if (!id) return;

    this.isUploadingImage.set(true);
    this.blogService.uploadImage(id, file).subscribe({
      next: (res) => {
        this.imageUrl.set(this.getFullImageUrl(res.imageUrl));
        this.isUploadingImage.set(false);
        this.messageService.add({ severity: 'success', summary: 'Image uploaded', detail: 'Featured image updated' });
      },
      error: () => {
        this.isUploadingImage.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to upload image' });
      }
    });
  }

  removeImage(): void {
    const id = this.postId();
    if (!id) return;

    this.blogService.removeImage(id).subscribe({
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
      // IRI string — fetch the media object to get the real path
      const mediaId = image.replace('/api/media/', '');
      this.http.get<any>(`${environment.apiUrl}/media/${mediaId}`).subscribe({
        next: (media) => {
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
    const formattedDate = this.date ? this.date.toISOString().split('T')[0] : null;

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
          detail: this.isEditMode() ? 'Post updated' : 'Post created',
        });
        this.router.navigate(['/blog/posts']);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save post' });
      },
    });
  }
}
