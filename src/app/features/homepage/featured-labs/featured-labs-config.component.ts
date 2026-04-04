import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { environment } from '../../../../environments/environment';

interface LabProject {
  id: string;
  slug: string;
  title?: string;
  shortTitle?: string;
  subtitle?: string;
  featured: boolean;
  status: string;
  locale?: string;
}

interface FeaturedLabsConfig {
  mode: string;
  selectedProjectIds: string[];
}

@Component({
  selector: 'app-featured-labs-config',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, ToggleSwitchModule,
    TableModule, TagModule, CheckboxModule, ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Featured Labs</h1>
          <p class="text-surface-500 dark:text-surface-400 mt-1">
            Configure which lab projects appear in the Featured Labs section on the homepage
          </p>
        </div>
        <p-button
          label="Save"
          icon="pi pi-check"
          [loading]="saving()"
          (onClick)="save()" />
      </div>

      <!-- Mode Toggle -->
      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium text-surface-900 dark:text-surface-0">Automatic Mode</h3>
            <p class="text-sm text-surface-500 dark:text-surface-400 mt-1">
              @if (autoMode()) {
                Automatically shows the last 3 featured lab projects (or latest 3 if none are featured)
              } @else {
                Manually select which lab projects to display on the homepage
              }
            </p>
          </div>
          <p-toggleswitch [(ngModel)]="autoModeValue" (ngModelChange)="onModeChange($event)" />
        </div>
      </div>

      <!-- Manual Selection (only shown when auto mode is OFF) -->
      @if (!autoMode()) {
        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
          <div class="p-5 border-b border-surface-200 dark:border-surface-700">
            <h3 class="font-medium text-surface-900 dark:text-surface-0">Select Projects</h3>
            <p class="text-sm text-surface-500 dark:text-surface-400 mt-1">
              Choose up to 3 lab projects to feature on the homepage.
              Selected: {{ selectedIds().length }}/3
            </p>
          </div>

          <p-table
            [value]="allProjects()"
            [rowHover]="true"
            styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr>
                <th style="width: 3rem"></th>
                <th>Title</th>
                <th>Slug</th>
                <th>Status</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-project>
              <tr
                class="cursor-pointer"
                [ngClass]="isSelected(project.id) ? 'bg-primary-50 dark:bg-primary-900/10' : ''"
                (click)="toggleProject(project.id)">
                <td>
                  <p-checkbox
                    [ngModel]="isSelected(project.id)"
                    [binary]="true"
                    [disabled]="!isSelected(project.id) && selectedIds().length >= 3"
                    (ngModelChange)="toggleProject(project.id)" />
                </td>
                <td>
                  <span class="font-medium text-surface-900 dark:text-surface-0">
                    {{ project.title || project.shortTitle || project.slug }}
                  </span>
                </td>
                <td class="text-surface-500">{{ project.slug }}</td>
                <td>
                  <p-tag
                    [value]="project.status"
                    [severity]="project.status === 'published' ? 'success' : 'secondary'" />
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      }

      <!-- Auto Mode: Preview of what will be shown -->
      @if (autoMode()) {
        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
          <div class="p-5 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <div>
              <h3 class="font-medium text-surface-900 dark:text-surface-0">Auto Preview</h3>
              <p class="text-sm text-surface-500 dark:text-surface-400 mt-1">
                These projects will appear on the homepage. Mark projects as "featured" in Lab Projects to control the selection.
              </p>
            </div>
            <p-button
              label="Manage Lab Projects"
              icon="pi pi-external-link"
              severity="secondary"
              [outlined]="true"
              size="small"
              (onClick)="router.navigate(['/lab/projects'])" />
          </div>

          @if (previewProjects().length > 0) {
            <div class="divide-y divide-surface-200 dark:divide-surface-700">
              @for (project of previewProjects(); track project.id; let i = $index) {
                <div class="flex items-center gap-4 px-5 py-4">
                  <div class="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-xs font-semibold text-surface-500">
                    {{ i + 1 }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-surface-900 dark:text-surface-0 text-sm">
                      {{ project.title || project.shortTitle || project.slug }}
                    </p>
                    <p class="text-xs text-surface-500 mt-0.5">{{ project.slug }}</p>
                  </div>
                  <p-tag
                    [value]="project.featured ? 'featured' : 'latest'"
                    [severity]="project.featured ? 'success' : 'secondary'" />
                </div>
              }
            </div>
          } @else {
            <div class="p-8 text-center text-surface-500 dark:text-surface-400">
              <i class="pi pi-inbox text-3xl mb-2"></i>
              <p class="text-sm">No lab projects found. Create some in Lab Projects first.</p>
            </div>
          }
        </div>
      }

      <p-toast></p-toast>
    </div>
  `
})
export class FeaturedLabsConfigComponent implements OnInit {
  private http = inject(HttpClient);
  private messageService = inject(MessageService);
  router = inject(Router);
  private apiUrl = environment.apiUrl;

  autoMode = signal(true);
  autoModeValue = true;
  selectedIds = signal<string[]>([]);
  allProjects = signal<LabProject[]>([]);
  previewProjects = signal<LabProject[]>([]);
  saving = signal(false);
  loading = signal(true);

  ngOnInit(): void {
    this.loadConfig();
    this.loadProjects();
    this.loadPreview();
  }

  loadConfig(): void {
    this.http.get<FeaturedLabsConfig>(`${this.apiUrl}/homepage/featured-labs/config`).subscribe({
      next: (config) => {
        const isAuto = config.mode === 'auto';
        this.autoMode.set(isAuto);
        this.autoModeValue = isAuto;
        this.selectedIds.set(config.selectedProjectIds || []);
      }
    });
  }

  loadProjects(): void {
    this.http.get<LabProject[]>(`${this.apiUrl}/lab_projects`, {
      params: { status: 'published', itemsPerPage: '50' }
    }).subscribe({
      next: (projects) => {
        this.allProjects.set(Array.isArray(projects) ? projects : []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load lab projects:', err);
        this.allProjects.set([]);
        this.loading.set(false);
      }
    });
  }

  loadPreview(): void {
    this.http.get<{ mode: string; projects: LabProject[] }>(`${this.apiUrl}/homepage/featured-labs`).subscribe({
      next: (data) => {
        this.previewProjects.set(data.projects ?? []);
      },
      error: () => {
        this.previewProjects.set([]);
      }
    });
  }

  onModeChange(autoMode: boolean): void {
    this.autoMode.set(autoMode);
  }

  isSelected(id: string): boolean {
    return this.selectedIds().includes(id);
  }

  toggleProject(id: string): void {
    const current = this.selectedIds();
    if (current.includes(id)) {
      this.selectedIds.set(current.filter(i => i !== id));
    } else if (current.length < 3) {
      this.selectedIds.set([...current, id]);
    }
  }

  save(): void {
    this.saving.set(true);

    const payload = {
      mode: this.autoMode() ? 'auto' : 'manual',
      selectedProjectIds: this.selectedIds(),
    };

    this.http.put<FeaturedLabsConfig>(`${this.apiUrl}/homepage/featured-labs/config`, payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Featured Labs configuration updated' });
        this.saving.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save configuration' });
        this.saving.set(false);
      }
    });
  }
}
