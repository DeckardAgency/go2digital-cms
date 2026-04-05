import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';

import { TranslationEditorComponent } from '../../../shared/components/translation-editor/translation-editor.component';
import { ImageUploadComponent } from '../../../shared/components/image-upload/image-upload.component';
import { BlogService } from '../../../core/services/blog.service';
import { FocalPointPickerComponent } from '../../../shared/components/focal-point-picker/focal-point-picker.component';
import { SeoEditorComponent, SeoContentContext } from '../../../shared/components/seo-editor/seo-editor.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-blog-post-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, InputTextModule, SelectModule,
    DatePickerModule, ButtonModule, ToggleSwitchModule,
    TranslationEditorComponent, ImageUploadComponent, FocalPointPickerComponent,
    SeoEditorComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <p-button icon="pi pi-arrow-left" severity="secondary" [text]="true" [rounded]="true" (onClick)="router.navigate(['/blog/posts'])" />
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
            <p-button label="Unpublish" icon="pi pi-eye-slash" severity="secondary" [outlined]="true" (onClick)="status = 'draft'; onSave()" />
          }
          <p-button label="Save" icon="pi pi-save" [loading]="blogService.isLoading()" (onClick)="onSave()" />
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
              (translationsChange)="onTranslationsChange($event)" />
          </div>

          @if (isEditMode()) {
            <div class="mt-6">
              <app-seo-editor entityType="blog-posts" [entityId]="postId()!" [contentContext]="getSeoContentContext()" />
            </div>
          }
        </div>

        <!-- RIGHT: Sidebar (1/3 width) -->
        <div class="space-y-6">

          <!-- Settings Card -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-5">Settings</h2>
            <div class="flex flex-col gap-4">
              <!-- Status + Featured -->
              <div class="flex items-center gap-3">
                <div class="flex flex-col gap-2 flex-1">
                  <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Status</label>
                  <p-select [options]="statusOptions" [(ngModel)]="status" optionLabel="label" optionValue="value" class="w-full" />
                </div>
                <div class="flex flex-col items-end gap-2 pt-0">
                  <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Featured</label>
                  <p-toggleswitch [(ngModel)]="featured" />
                </div>
              </div>

              <!-- Slug -->
              <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Slug</label>
                  <button type="button"
                    class="flex items-center gap-1.5 text-xs font-medium transition-colors"
                    [class]="slugLocked ? 'text-surface-400 hover:text-surface-600' : 'text-primary'"
                    (click)="slugLocked = !slugLocked">
                    <i [class]="slugLocked ? 'pi pi-lock' : 'pi pi-lock-open'" class="text-xs"></i>
                    {{ slugLocked ? 'Auto' : 'Manual' }}
                  </button>
                </div>
                <input pInputText class="w-full" [(ngModel)]="slug" [readonly]="slugLocked" [class.opacity-60]="slugLocked" />
              </div>

              <!-- Category -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Category</label>
                <p-select [options]="categoryOptions()" [(ngModel)]="categoryId" optionLabel="label" optionValue="value" placeholder="Select category" [showClear]="true" class="w-full" />
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
            </div>
          </div>

          <!-- Featured Image Card -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Featured Image</h2>
            @if (isEditMode()) {
              <app-image-upload [currentImageUrl]="imageUrl()" [uploading]="isUploadingImage()" (onUpload)="uploadImage($event)" (onRemove)="removeImage()" />
            } @else {
              <div class="flex flex-col items-center justify-center py-6 border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-xl">
                <i class="pi pi-image text-2xl text-surface-300 dark:text-surface-600 mb-2"></i>
                <p class="text-xs text-surface-400">Save the post first to upload an image</p>
              </div>
            }
            @if (imageUrl()) {
              <div class="mt-3">
                <app-focal-point-picker [imageUrl]="imageUrl()" [focalX]="focalX" [focalY]="focalY" (focalPointChange)="onFocalPointChange($event)" />
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
                @if (imageData()!.mimeType !== 'image/webp') {
                  <div class="mt-3">
                    <p-button label="Optimize for Web" icon="pi pi-bolt" severity="secondary" [outlined]="true" size="small" styleClass="w-full" [loading]="optimizing()" (onClick)="optimizeImage()" />
                    <p class="text-[10px] text-surface-400 mt-1.5 text-center">Convert to WebP for smaller file size</p>
                  </div>
                } @else {
                  <div class="mt-3 flex items-center gap-2 justify-center">
                    <i class="pi pi-check-circle text-green-500 text-xs"></i>
                    <span class="text-xs text-green-600 dark:text-green-400 font-medium">Already optimized (WebP)</span>
                  </div>
                }
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
  slugLocked = true;
  author = 'Go2Digital';
  date: Date | null = new Date();
  status = 'draft';
  featured = false;
  categoryId: string | null = null;
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
        this.categoryOptions.set(categories.map(c => ({ label: c.translations?.hr?.name || c.slug, value: c.id })));
      },
    });
  }

  private loadPost(id: string): void {
    this.blogService.getPost(id).subscribe({
      next: (post) => {
        this.slug = post.slug;
        this.slugLocked = true;
        this.author = post.author;
        this.date = post.date ? new Date(post.date) : null;
        this.status = post.status;
        this.featured = post.featured;

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

        if (post.image) this.resolveImageUrl(post.image);
        if ((post as any).createdAt) this.createdAt.set(new Date((post as any).createdAt).toLocaleString());
        if ((post as any).updatedAt) this.updatedAt.set(new Date((post as any).updatedAt).toLocaleString());
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load post' });
        this.router.navigate(['/blog/posts']);
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
    };
    return text
      .split('').map(c => charMap[c] || c).join('')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // ─── Image ─────────────────────────────────────────────

  uploadImage(file: File): void {
    const id = this.postId();
    if (!id) return;
    this.isUploadingImage.set(true);
    this.blogService.uploadImage(id, file).subscribe({
      next: (res) => { this.imageUrl.set(this.getFullImageUrl(res.imageUrl)); this.isUploadingImage.set(false); this.messageService.add({ severity: 'success', summary: 'Image uploaded' }); },
      error: () => { this.isUploadingImage.set(false); this.messageService.add({ severity: 'error', summary: 'Failed to upload image' }); },
    });
  }

  removeImage(): void {
    const id = this.postId();
    if (!id) return;
    this.blogService.removeImage(id).subscribe({
      next: () => { this.imageUrl.set(''); this.imageData.set(null); this.messageService.add({ severity: 'info', summary: 'Image removed' }); },
      error: () => this.messageService.add({ severity: 'error', summary: 'Failed to remove image' }),
    });
  }

  onFocalPointChange(point: { x: number; y: number }): void {
    this.focalX = point.x;
    this.focalY = point.y;
    const id = this.postId();
    if (!id) return;
    this.http.put(`${environment.apiUrl}/blog-posts/${id}/focal-point`, point).subscribe({
      next: () => this.messageService.add({ severity: 'success', summary: 'Focal point saved' }),
      error: () => this.messageService.add({ severity: 'error', summary: 'Failed to save focal point' }),
    });
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
        this.imageData.set({ ...img, mimeType: res.mimeType, size: res.optimizedSize, path: res.path, width: res.width, height: res.height });
        this.imageUrl.set(this.getFullImageUrl('/storage/media/' + res.path));
        this.messageService.add({ severity: 'success', summary: 'Image optimized', detail: `${res.savingsPercent}% smaller` });
      },
      error: (err) => { this.optimizing.set(false); this.messageService.add({ severity: 'error', summary: 'Optimization failed', detail: err.error?.error || 'Unknown error' }); },
    });
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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

  // ─── SEO ───────────────────────────────────────────────

  getSeoContentContext(): SeoContentContext {
    const t = this.translations();
    return {
      entityType: 'blog-post',
      content: {
        hr: { title: t.hr['title'] || '', excerpt: t.hr['excerpt'] || '', body: t.hr['body'] || '' },
        en: { title: t.en['title'] || '', excerpt: t.en['excerpt'] || '', body: t.en['body'] || '' },
      },
    };
  }

  // ─── Save ──────────────────────────────────────────────

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
        this.messageService.add({ severity: 'success', summary: this.isEditMode() ? 'Post updated' : 'Post created' });
        this.router.navigate(['/blog/posts']);
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Failed to save post' }),
    });
  }
}
