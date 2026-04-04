import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

interface HomepageSection {
  id: string;
  label: string;
  description: string;
  icon: string;
  editRoute: string;
  type: 'singleton' | 'collection';
  color: string;
}

@Component({
  selector: 'app-homepage-overview',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Homepage</h1>
          <p class="text-surface-500 dark:text-surface-400 mt-1">
            Manage all homepage sections in their display order
          </p>
        </div>
      </div>

      <!-- Sections in real order -->
      <div class="flex flex-col gap-3">
        @for (section of sections; track section.id; let i = $index) {
          <div
            class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600 transition-all cursor-pointer group"
            (click)="navigate(section.editRoute)">
            <div class="flex items-center gap-4 px-5 py-4">
              <!-- Order number -->
              <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 flex-shrink-0">
                {{ i + 1 }}
              </div>

              <!-- Icon -->
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                [style.background-color]="section.color + '15'"
                [style.color]="section.color">
                <i [class]="section.icon" class="text-lg"></i>
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="font-medium text-surface-900 dark:text-surface-0 text-sm">
                    {{ section.label }}
                  </h3>
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide"
                    [class]="section.type === 'singleton'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'">
                    {{ section.type === 'singleton' ? 'Single' : 'Collection' }}
                  </span>
                </div>
                <p class="text-xs text-surface-500 dark:text-surface-400 mt-0.5 truncate">
                  {{ section.description }}
                </p>
              </div>

              <!-- Edit button -->
              <p-button
                icon="pi pi-pencil"
                [text]="true"
                [rounded]="true"
                severity="secondary"
                pTooltip="Edit section"
                tooltipPosition="left"
                class="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class HomepageOverviewComponent {
  private router = inject(Router);

  sections: HomepageSection[] = [
    {
      id: 'hero',
      label: 'Hero Section',
      description: 'Main hero with title, kicker, heading, description, and background video',
      icon: 'pi pi-star',
      editRoute: '/homepage/hero',
      type: 'singleton',
      color: '#6366f1'
    },
    {
      id: 'horizontal-scroll',
      label: 'Horizontal Scroll Panels',
      description: '4 panels with stat values (2.5M, 460, 50, 28) and descriptions',
      icon: 'pi pi-arrows-h',
      editRoute: '/homepage/panels',
      type: 'collection',
      color: '#8b5cf6'
    },
    {
      id: 'why-section',
      label: 'Why Go2Digital',
      description: 'Section header (label + headline) with 3 info cards and dot patterns',
      icon: 'pi pi-question-circle',
      editRoute: '/homepage/why-section',
      type: 'singleton',
      color: '#ec4899'
    },
    {
      id: 'why-cards',
      label: 'Why Cards',
      description: '3 cards: Measurable Impact, Center Stage, Limitless Reach',
      icon: 'pi pi-th-large',
      editRoute: '/homepage/why-cards',
      type: 'collection',
      color: '#ec4899'
    },
    {
      id: 'custom-image',
      label: 'Custom Image Section',
      description: 'Full-width parallax image (Slavonska Avenue billboard)',
      icon: 'pi pi-image',
      editRoute: '/homepage/custom-image',
      type: 'singleton',
      color: '#14b8a6'
    },
    {
      id: 'custom-solution',
      label: 'Custom Solutions',
      description: 'Indicator text, title, and two content blocks',
      icon: 'pi pi-cog',
      editRoute: '/homepage/custom-solution',
      type: 'singleton',
      color: '#f97316'
    },
    {
      id: 'featured-labs',
      label: 'Featured Labs',
      description: '3 featured lab items with titles, subtitles, and categories',
      icon: 'pi pi-bolt',
      editRoute: '/homepage/featured-labs',
      type: 'collection',
      color: '#10b981'
    },
    {
      id: 'human-focused',
      label: 'Human Focused',
      description: 'Indicator, title, left and right text blocks',
      icon: 'pi pi-users',
      editRoute: '/homepage/human-focused',
      type: 'singleton',
      color: '#3b82f6'
    },
    {
      id: 'text-animation',
      label: 'Text Animation',
      description: '3 animated words: Visibility, Innovation, Results',
      icon: 'pi pi-align-center',
      editRoute: '/homepage/text-animation',
      type: 'singleton',
      color: '#6366f1'
    },
    {
      id: 'billboard',
      label: 'Billboard CTA',
      description: 'Title, subtitle, description, and call-to-action button',
      icon: 'pi pi-megaphone',
      editRoute: '/homepage/billboard',
      type: 'singleton',
      color: '#ef4444'
    },
    {
      id: 'tracking',
      label: 'Tracking Features',
      description: '5 features: Real-time Displays, Proof of Display, Audience Analysis, Campaign Optimization, ROI Reports',
      icon: 'pi pi-chart-line',
      editRoute: '/homepage/tracking',
      type: 'collection',
      color: '#0ea5e9'
    },
    {
      id: 'rentals-image',
      label: 'Rentals Image',
      description: 'Full-width section with "RENTALS" text overlay',
      icon: 'pi pi-image',
      editRoute: '/homepage/rentals-image',
      type: 'singleton',
      color: '#64748b'
    },
    {
      id: 'cube-product',
      label: 'Product: Digital Citylight',
      description: 'Cube product with specs, badge, description, and 2 features',
      icon: 'pi pi-box',
      editRoute: '/homepage/products',
      type: 'collection',
      color: '#a855f7'
    },
    {
      id: 'display-product',
      label: 'Product: Digital Screens',
      description: 'Display product with specs, indicator text, description, and 4 features',
      icon: 'pi pi-desktop',
      editRoute: '/homepage/products',
      type: 'collection',
      color: '#a855f7'
    },
  ];

  navigate(route: string): void {
    this.router.navigate([route]);
  }
}
