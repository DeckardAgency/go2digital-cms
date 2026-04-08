import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';

import { SettingsService, Setting } from '../../core/services/settings.service';

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
  imports: [CommonModule, ButtonModule, TooltipModule, TableModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Homepage</h1>
          <p class="text-surface-500 dark:text-surface-400 mt-1">
            Drag sections to reorder, then save. Click to edit.
          </p>
        </div>
        <div class="flex items-center gap-2">
          @if (orderChanged()) {
            <p-button label="Reset" severity="secondary" [outlined]="true" size="small" (onClick)="resetOrder()" />
          }
          <p-button label="Save Order" icon="pi pi-save" [loading]="saving()" [disabled]="!orderChanged()" (onClick)="saveOrder()" />
        </div>
      </div>

      <!-- Draggable sections list -->
      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
        <p-table [value]="orderedSections()" styleClass="p-datatable-sm" (onRowReorder)="onRowReorder()">
          <ng-template pTemplate="body" let-section let-index="rowIndex">
            <tr [pReorderableRow]="index" class="group">
              <td style="width: 3rem">
                <span class="pi pi-bars cursor-grab text-surface-400" pReorderableRowHandle></span>
              </td>
              <td style="width: 3rem">
                <div class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold bg-surface-100 dark:bg-surface-800 text-surface-400">
                  {{ index + 1 }}
                </div>
              </td>
              <td style="width: 3rem">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center" [style.background-color]="section.color + '15'" [style.color]="section.color">
                  <i [class]="section.icon" class="text-base"></i>
                </div>
              </td>
              <td>
                <div class="flex items-center gap-2">
                  <span class="font-medium text-surface-900 dark:text-surface-0 text-sm">{{ section.label }}</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide"
                    [class]="section.type === 'singleton'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'">
                    {{ section.type === 'singleton' ? 'Single' : 'Collection' }}
                  </span>
                </div>
                <p class="text-xs text-surface-400 mt-0.5">{{ section.description }}</p>
              </td>
              <td style="width: 3rem">
                <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" severity="secondary"
                  class="opacity-0 group-hover:opacity-100 transition-opacity"
                  (onClick)="navigate(section.editRoute); $event.stopPropagation()" />
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `
})
export class HomepageOverviewComponent implements OnInit {
  private router = inject(Router);
  private settingsService = inject(SettingsService);
  private messageService = inject(MessageService);

  saving = signal(false);
  orderChanged = signal(false);
  private orderSetting: Setting | null = null;
  private originalOrder: string[] = [];

  allSections: HomepageSection[] = [
    { id: 'hero', label: 'Hero Section', description: 'Main hero with title, kicker, heading, description, and background video', icon: 'pi pi-star', editRoute: '/homepage/hero', type: 'singleton', color: '#6366f1' },
    { id: 'horizontal-scroll', label: 'Horizontal Scroll Panels', description: '4 panels with stat values and descriptions', icon: 'pi pi-arrows-h', editRoute: '/homepage/panels', type: 'collection', color: '#8b5cf6' },
    { id: 'why-section', label: 'Why Go2Digital', description: 'Section header with info cards and dot patterns', icon: 'pi pi-question-circle', editRoute: '/homepage/why-section', type: 'singleton', color: '#ec4899' },
    { id: 'custom-image', label: 'Custom Image', description: 'Full-width parallax image', icon: 'pi pi-image', editRoute: '/homepage/custom-image', type: 'singleton', color: '#14b8a6' },
    { id: 'custom-solution', label: 'Custom Solutions', description: 'Indicator text, title, and content blocks', icon: 'pi pi-cog', editRoute: '/homepage/custom-solution', type: 'singleton', color: '#f97316' },
    { id: 'featured-labs', label: 'Featured Labs', description: 'Featured lab projects with auto/manual mode', icon: 'pi pi-bolt', editRoute: '/homepage/featured-labs', type: 'collection', color: '#10b981' },
    { id: 'human-focused', label: 'Human Focused', description: 'Indicator, title, left and right text blocks', icon: 'pi pi-users', editRoute: '/homepage/human-focused', type: 'singleton', color: '#3b82f6' },
    { id: 'text-animation', label: 'Text Animation', description: 'Animated words: Visibility, Innovation, Results', icon: 'pi pi-align-center', editRoute: '/homepage/text-animation', type: 'singleton', color: '#6366f1' },
    { id: 'billboard', label: 'Billboard CTA', description: 'Title, subtitle, description, and call-to-action button', icon: 'pi pi-megaphone', editRoute: '/homepage/billboard', type: 'singleton', color: '#ef4444' },
    { id: 'analytics', label: 'Analytics', description: 'Impressions section with dot grid graph', icon: 'pi pi-chart-bar', editRoute: '/homepage/analytics', type: 'singleton', color: '#22c55e' },
    { id: 'tracking', label: 'Tracking Features', description: 'Real-time tracking and analytics features', icon: 'pi pi-chart-line', editRoute: '/homepage/tracking', type: 'collection', color: '#0ea5e9' },
    { id: 'rentals-image', label: 'Rentals Image', description: 'Full-width section with text overlay', icon: 'pi pi-image', editRoute: '/homepage/rentals-image', type: 'singleton', color: '#64748b' },
    { id: 'possibilities', label: 'Possibilities', description: 'Scroll-through list of digital screen possibilities', icon: 'pi pi-list', editRoute: '/homepage/possibilities', type: 'collection', color: '#f59e0b' },
    { id: 'products', label: 'Products', description: 'Digital Citylight and Digital Screens products', icon: 'pi pi-box', editRoute: '/homepage/products', type: 'collection', color: '#a855f7' },
  ];

  orderedSections = signal<HomepageSection[]>([]);

  ngOnInit(): void {
    this.orderedSections.set([...this.allSections]);
    this.originalOrder = this.allSections.map(s => s.id);
    this.loadOrder();
  }

  loadOrder(): void {
    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        const s = settings.find(s => s.key === 'homepage.sectionOrder');
        if (s) {
          this.orderSetting = s;
          const order: string[] = s.value?.value || [];
          if (order.length > 0) {
            const sorted = order
              .map(id => this.allSections.find(sec => sec.id === id))
              .filter(Boolean) as HomepageSection[];
            // Add any sections not in the saved order (new sections)
            const missing = this.allSections.filter(sec => !order.includes(sec.id));
            this.orderedSections.set([...sorted, ...missing]);
            this.originalOrder = this.orderedSections().map(s => s.id);
          }
        }
      },
    });
  }

  onRowReorder(): void {
    const currentOrder = this.orderedSections().map(s => s.id);
    this.orderChanged.set(JSON.stringify(currentOrder) !== JSON.stringify(this.originalOrder));
  }

  resetOrder(): void {
    const sorted = this.originalOrder
      .map(id => this.allSections.find(s => s.id === id))
      .filter(Boolean) as HomepageSection[];
    this.orderedSections.set(sorted);
    this.orderChanged.set(false);
  }

  saveOrder(): void {
    this.saving.set(true);
    const order = this.orderedSections().map(s => s.id);

    const save$ = this.orderSetting
      ? this.settingsService.updateSetting(this.orderSetting.id, { value: { value: order } })
      : this.settingsService.createSetting({ key: 'homepage.sectionOrder', value: { value: order }, group: 'homepage' });

    save$.subscribe({
      next: (res) => {
        this.saving.set(false);
        this.orderChanged.set(false);
        this.originalOrder = order;
        if (!this.orderSetting) this.orderSetting = res as Setting;
        this.messageService.add({ severity: 'success', summary: 'Section order saved' });
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({ severity: 'error', summary: 'Failed to save order' });
      },
    });
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }
}
