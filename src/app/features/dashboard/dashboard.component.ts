import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

interface DashboardData {
  counts: {
    blogPosts: { total: number; published: number; draft: number };
    labProjects: { total: number; published: number; draft: number };
    media: { total: number; totalSizeBytes: number };
    pages: number;
    team: number;
    totems: number;
    cities: number;
    settings: number;
  };
  recent: {
    posts: { id: string; slug: string; status: string; date: string; author: string; createdAt: string }[];
    projects: { id: string; slug: string; status: string; createdAt: string }[];
    media: { id: string; filename: string; path: string; mimeType: string; size: number; collection: string; createdAt: string }[];
  };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TagModule, ButtonModule, DatePipe],
  template: `
    <div>
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">
          Welcome back, {{ authService.user()?.firstName }}
        </h1>
        <p class="text-surface-500 text-sm mt-0.5">Here's what's happening with your site</p>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        @for (card of statCards; track card.label) {
          <div
            class="bg-surface-0 dark:bg-surface-900 rounded-xl p-5 border border-surface-200 dark:border-surface-700 cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 transition-all hover:shadow-sm"
            (click)="router.navigate([card.route])">
            @if (isLoading()) {
              <div class="h-4 w-20 bg-surface-200 dark:bg-surface-700 rounded animate-pulse mb-3"></div>
              <div class="h-8 w-12 bg-surface-200 dark:bg-surface-700 rounded animate-pulse"></div>
            } @else {
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-medium text-surface-400 uppercase tracking-wide">{{ card.label }}</span>
                <i [class]="card.icon + ' text-sm'" [style.color]="card.color"></i>
              </div>
              <div class="text-2xl font-bold text-surface-900 dark:text-surface-0">{{ card.count }}</div>
              @if (card.sub) {
                <div class="text-xs text-surface-400 mt-1">{{ card.sub }}</div>
              }
            }
          </div>
        }
      </div>

      <!-- Main Grid: Recent Content + Media -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

        <!-- Recent Blog Posts -->
        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
          <div class="flex items-center justify-between p-5 border-b border-surface-200 dark:border-surface-700">
            <div class="flex items-center gap-2">
              <i class="pi pi-file-edit text-indigo-500"></i>
              <h3 class="text-sm font-semibold text-surface-900 dark:text-surface-0">Recent Posts</h3>
            </div>
            <p-button label="View All" [text]="true" size="small" (onClick)="router.navigate(['/blog/posts'])" />
          </div>
          @if (isLoading()) {
            <div class="p-5 space-y-4">
              @for (i of [1,2,3,4,5]; track i) {
                <div class="flex items-center gap-3">
                  <div class="h-4 flex-1 bg-surface-200 dark:bg-surface-700 rounded animate-pulse"></div>
                  <div class="h-5 w-16 bg-surface-200 dark:bg-surface-700 rounded animate-pulse"></div>
                </div>
              }
            </div>
          } @else {
            <div class="divide-y divide-surface-100 dark:divide-surface-800">
              @for (post of data()?.recent?.posts || []; track post.id) {
                <div
                  class="flex items-center justify-between p-4 hover:bg-surface-50 dark:hover:bg-surface-800 cursor-pointer transition-colors"
                  (click)="router.navigate(['/blog/posts', post.id])">
                  <div class="min-w-0 flex-1">
                    <div class="text-sm font-medium text-surface-900 dark:text-surface-0 truncate">{{ post.slug }}</div>
                    <div class="text-xs text-surface-400 mt-0.5">{{ post.author }} · {{ post.createdAt | date:'MMM d, y' }}</div>
                  </div>
                  <p-tag [value]="post.status" [severity]="post.status === 'published' ? 'success' : 'warn'" />
                </div>
              }
              @if (!data()?.recent?.posts?.length) {
                <div class="p-8 text-center text-surface-400 text-sm">No posts yet</div>
              }
            </div>
          }
        </div>

        <!-- Recent Lab Projects -->
        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
          <div class="flex items-center justify-between p-5 border-b border-surface-200 dark:border-surface-700">
            <div class="flex items-center gap-2">
              <i class="pi pi-code text-violet-500"></i>
              <h3 class="text-sm font-semibold text-surface-900 dark:text-surface-0">Recent Projects</h3>
            </div>
            <p-button label="View All" [text]="true" size="small" (onClick)="router.navigate(['/lab/projects'])" />
          </div>
          @if (isLoading()) {
            <div class="p-5 space-y-4">
              @for (i of [1,2,3,4,5]; track i) {
                <div class="flex items-center gap-3">
                  <div class="h-4 flex-1 bg-surface-200 dark:bg-surface-700 rounded animate-pulse"></div>
                  <div class="h-5 w-16 bg-surface-200 dark:bg-surface-700 rounded animate-pulse"></div>
                </div>
              }
            </div>
          } @else {
            <div class="divide-y divide-surface-100 dark:divide-surface-800">
              @for (project of data()?.recent?.projects || []; track project.id) {
                <div
                  class="flex items-center justify-between p-4 hover:bg-surface-50 dark:hover:bg-surface-800 cursor-pointer transition-colors"
                  (click)="router.navigate(['/lab/projects', project.id])">
                  <div class="min-w-0 flex-1">
                    <div class="text-sm font-medium text-surface-900 dark:text-surface-0 truncate">{{ project.slug }}</div>
                    <div class="text-xs text-surface-400 mt-0.5">{{ project.createdAt | date:'MMM d, y' }}</div>
                  </div>
                  <p-tag [value]="project.status" [severity]="project.status === 'published' ? 'success' : 'warn'" />
                </div>
              }
              @if (!data()?.recent?.projects?.length) {
                <div class="p-8 text-center text-surface-400 text-sm">No projects yet</div>
              }
            </div>
          }
        </div>

        <!-- Recent Media -->
        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
          <div class="flex items-center justify-between p-5 border-b border-surface-200 dark:border-surface-700">
            <div class="flex items-center gap-2">
              <i class="pi pi-images text-cyan-500"></i>
              <h3 class="text-sm font-semibold text-surface-900 dark:text-surface-0">Recent Media</h3>
            </div>
            <p-button label="View All" [text]="true" size="small" (onClick)="router.navigate(['/media'])" />
          </div>
          @if (isLoading()) {
            <div class="p-5 grid grid-cols-4 gap-2">
              @for (i of [1,2,3,4,5,6,7,8]; track i) {
                <div class="aspect-square bg-surface-200 dark:bg-surface-700 rounded-lg animate-pulse"></div>
              }
            </div>
          } @else {
            <div class="p-4">
              <div class="grid grid-cols-4 gap-2">
                @for (media of data()?.recent?.media || []; track media.id) {
                  @if (media.mimeType?.startsWith('image/')) {
                    <div class="aspect-square rounded-lg overflow-hidden bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                      <img [src]="getMediaUrl(media.path)" [alt]="media.filename" class="w-full h-full object-cover" />
                    </div>
                  } @else {
                    <div class="aspect-square rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 flex flex-col items-center justify-center gap-1">
                      <i class="pi pi-file text-surface-400"></i>
                      <span class="text-[9px] text-surface-400 truncate max-w-full px-1">{{ media.filename }}</span>
                    </div>
                  }
                }
              </div>
              @if (!data()?.recent?.media?.length) {
                <div class="py-8 text-center text-surface-400 text-sm">No media yet</div>
              }
              @if (data()?.counts?.media) {
                <div class="mt-3 text-xs text-surface-400 text-center">
                  {{ data()!.counts.media.total }} files · {{ formatBytes(data()!.counts.media.totalSizeBytes) }}
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-6">
        <h3 class="text-sm font-semibold text-surface-900 dark:text-surface-0 mb-3">Quick Actions</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          @for (action of quickActions; track action.label) {
            <div class="group bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4 cursor-pointer transition-all hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-sm"
              (click)="router.navigate([action.route])">
              <div class="w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-colors"
                [style.background-color]="action.color + '15'" [style.color]="action.color">
                <i [class]="action.icon" class="text-base"></i>
              </div>
              <p class="text-sm font-medium text-surface-900 dark:text-surface-0 leading-tight">{{ action.label }}</p>
              <p class="text-[11px] text-surface-400 mt-1">{{ action.description }}</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly router = inject(Router);
  readonly authService = inject(AuthService);
  private readonly apiUrl = environment.apiUrl;

  isLoading = signal(true);
  data = signal<DashboardData | null>(null);

  quickActions = [
    { label: 'New Blog Post', description: 'Write an article', icon: 'pi pi-pen-to-square', route: '/blog/posts/new', color: '#6366f1' },
    { label: 'New Lab Project', description: 'Add a showcase', icon: 'pi pi-code', route: '/lab/projects/new', color: '#8b5cf6' },
    { label: 'New Page', description: 'Create a page', icon: 'pi pi-file', route: '/pages/new', color: '#0ea5e9' },
    { label: 'Upload Media', description: 'Add files & images', icon: 'pi pi-cloud-upload', route: '/media', color: '#10b981' },
    { label: 'Edit Homepage', description: 'Manage sections', icon: 'pi pi-desktop', route: '/homepage', color: '#f59e0b' },
    { label: 'Settings', description: 'Site configuration', icon: 'pi pi-cog', route: '/settings/general', color: '#64748b' },
  ];

  statCards: { label: string; icon: string; count: number; route: string; color: string; sub?: string }[] = [];

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.http.get<DashboardData>(`${this.apiUrl}/dashboard/stats`).subscribe({
      next: (data) => {
        this.data.set(data);
        const c = data.counts;
        this.statCards = [
          { label: 'Blog Posts', icon: 'pi pi-file-edit', count: c.blogPosts.total, route: '/blog/posts', color: '#6366f1', sub: `${c.blogPosts.published} published · ${c.blogPosts.draft} draft` },
          { label: 'Lab Projects', icon: 'pi pi-code', count: c.labProjects.total, route: '/lab/projects', color: '#8b5cf6', sub: `${c.labProjects.published} published · ${c.labProjects.draft} draft` },
          { label: 'Media', icon: 'pi pi-images', count: c.media.total, route: '/media', color: '#06b6d4', sub: this.formatBytes(c.media.totalSizeBytes) },
          { label: 'Pages', icon: 'pi pi-copy', count: c.pages, route: '/pages', color: '#10b981' },
          { label: 'Team', icon: 'pi pi-users', count: c.team, route: '/team', color: '#f59e0b' },
          { label: 'Locations', icon: 'pi pi-map-marker', count: c.totems, route: '/locations/totems', color: '#ef4444', sub: `${c.cities} cities · ${c.totems} totems` },
          { label: 'Settings', icon: 'pi pi-cog', count: c.settings, route: '/settings/general', color: '#64748b' },
        ];
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  getMediaUrl(path: string): string {
    if (!path) return '';
    const base = this.apiUrl.replace('/api', '');
    return `${base}/storage/media/${path}`;
  }

  formatBytes(bytes: number): string {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let val = bytes;
    while (val >= 1024 && i < units.length - 1) {
      val /= 1024;
      i++;
    }
    return `${val.toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
  }
}
