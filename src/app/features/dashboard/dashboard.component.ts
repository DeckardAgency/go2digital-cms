import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';

interface StatCard {
  label: string;
  icon: string;
  count: number | null;
  route: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0 mb-6">Dashboard</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (card of stats(); track card.label) {
          <div
            class="bg-surface-0 dark:bg-surface-900 rounded-xl p-6 border border-surface-200 dark:border-surface-700 cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
            (click)="router.navigate([card.route])">
            <div class="flex items-center justify-between mb-3">
              <span class="text-surface-500 dark:text-surface-400 text-sm font-medium">{{ card.label }}</span>
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center"
                [style.background-color]="card.color + '20'">
                <i [class]="card.icon + ' text-lg'" [style.color]="card.color"></i>
              </div>
            </div>
            @if (isLoading()) {
              <div class="h-9 w-16 bg-surface-200 dark:bg-surface-700 rounded animate-pulse"></div>
            } @else {
              <div class="text-3xl font-semibold text-surface-900 dark:text-surface-100">
                {{ card.count ?? 0 }}
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly router = inject(Router);
  private readonly apiUrl = environment.apiUrl;

  isLoading = signal(true);

  stats = signal<StatCard[]>([
    { label: 'Blog Posts', icon: 'pi pi-file-edit', count: null, route: '/blog/posts', color: '#6366f1' },
    { label: 'Lab Projects', icon: 'pi pi-code', count: null, route: '/lab/projects', color: '#8b5cf6' },
    { label: 'Media Files', icon: 'pi pi-images', count: null, route: '/media', color: '#06b6d4' },
    { label: 'Pages', icon: 'pi pi-copy', count: null, route: '/pages', color: '#10b981' },
    { label: 'Team Members', icon: 'pi pi-users', count: null, route: '/team', color: '#f59e0b' },
    { label: 'Settings', icon: 'pi pi-cog', count: null, route: '/settings', color: '#64748b' },
  ]);

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    forkJoin({
      blogPosts: this.http.get<any[]>(`${this.apiUrl}/blog_posts`),
      labProjects: this.http.get<any[]>(`${this.apiUrl}/lab_projects`),
      media: this.http.get<any[]>(`${this.apiUrl}/media`),
      pages: this.http.get<any[]>(`${this.apiUrl}/pages`),
      team: this.http.get<any[]>(`${this.apiUrl}/team_members`),
      settings: this.http.get<any[]>(`${this.apiUrl}/settings`),
    }).subscribe({
      next: (results) => {
        this.stats.update(cards => cards.map(card => {
          switch (card.label) {
            case 'Blog Posts': return { ...card, count: results.blogPosts.length };
            case 'Lab Projects': return { ...card, count: results.labProjects.length };
            case 'Media Files': return { ...card, count: results.media.length };
            case 'Pages': return { ...card, count: results.pages.length };
            case 'Team Members': return { ...card, count: results.team.length };
            case 'Settings': return { ...card, count: results.settings.length };
            default: return card;
          }
        }));
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
