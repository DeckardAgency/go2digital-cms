import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SingletonEditorComponent, SingletonTranslatableField } from './singleton-editor.component';

@Component({
  selector: 'app-analytics-editor',
  standalone: true,
  imports: [SingletonEditorComponent, ButtonModule],
  template: `
    <app-singleton-editor
      singletonType="homepage-analytics"
      pageTitle="Analytics"
      subtitle="Impressions section with indicator, title, and description"
      [sectionPosition]="10"
      [translatableFields]="fields">
      <div preview>
        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0">Graph Tabs</h2>
            <p-button label="Manage Tabs" icon="pi pi-chart-bar" severity="secondary" [outlined]="true" size="small" (onClick)="router.navigate(['/homepage/analytics-tabs'])" />
          </div>
          <p class="text-sm text-surface-500">Configure the tab names, Y-axis labels, and curve types for the analytics graph.</p>
        </div>

        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6 mt-6">
          <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Preview</h2>
          <div class="rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700 p-5" style="background: #0a1a14; min-height: 120px;">
            <div class="flex items-center gap-2 mb-3">
              <span class="w-2 h-2 rounded-full bg-white"></span>
              <span class="text-[10px] text-white/60">Indicator Text</span>
            </div>
            <p class="text-lg font-light text-white mb-3">Title</p>
            <p class="text-[10px] text-white/50">Description text</p>
          </div>
          <p class="text-[10px] text-surface-400 mt-3 text-center">Dark section between Billboard and Tracking</p>
        </div>
      </div>
    </app-singleton-editor>
  `,
})
export class AnalyticsEditorComponent {
  readonly router = inject(Router);
  fields: SingletonTranslatableField[] = [
    { key: 'indicator', label: 'Indicator Text', type: 'text' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
  ];
}
