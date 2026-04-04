import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { TranslationEditorComponent } from '../../shared/components/translation-editor/translation-editor.component';
import { ImageUploadComponent } from '../../shared/components/image-upload/image-upload.component';
import { TeamService } from '../../core/services/team.service';

@Component({
  selector: 'app-team-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    ButtonModule,
    TranslationEditorComponent,
    ImageUploadComponent,
  ],
  template: `
    <div class="max-w-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <p-button
            icon="pi pi-arrow-left"
            severity="secondary"
            [text]="true"
            (onClick)="router.navigate(['/team'])" />
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">
            {{ isEditMode() ? 'Edit Team Member' : 'New Team Member' }}
          </h1>
        </div>
        <div class="flex items-center gap-2">
          <p-button
            label="Cancel"
            severity="secondary"
            [outlined]="true"
            (onClick)="router.navigate(['/team'])" />
          <p-button
            label="Save"
            icon="pi pi-check"
            [loading]="teamService.isLoading()"
            (onClick)="onSave()" />
        </div>
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
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Name</label>
            <input pInputText class="w-full" [(ngModel)]="name" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Sort Order</label>
            <p-inputNumber [(ngModel)]="sortOrder" [showButtons]="true" class="w-full" />
          </div>
          <div class="flex items-center gap-2">
            <p-checkbox [(ngModel)]="isActive" [binary]="true" inputId="isActive" />
            <label for="isActive" class="text-sm font-medium text-surface-700 dark:text-surface-300">Active</label>
          </div>
        </div>
      </div>

      <!-- Photo -->
      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
        <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Photo</h2>
        <app-image-upload
          [currentImageUrl]="photoUrl()"
          (onUpload)="onImageUpload($event)"
          (onRemove)="onImageRemove()" />
      </div>
    </div>
  `,
})
export class TeamFormComponent implements OnInit {
  readonly teamService = inject(TeamService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  isEditMode = signal(false);
  itemId = signal<string | null>(null);

  translations = signal<{ hr: Record<string, any>; en: Record<string, any> }>({
    hr: { position: '', bio: '' },
    en: { position: '', bio: '' },
  });

  name = '';
  sortOrder = 0;
  isActive = true;
  photoUrl = signal('');
  private photoFile: File | null = null;

  translationFields = [
    { key: 'position', label: 'Position', type: 'text' as const },
    { key: 'bio', label: 'Bio', type: 'textarea' as const },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.itemId.set(id);
      this.loadItem(id);
    }
  }

  private loadItem(id: string): void {
    this.teamService.getMember(id).subscribe({
      next: (item) => {
        this.name = item.name || '';
        this.sortOrder = item.sortOrder || 0;
        this.isActive = item.isActive ?? true;

        if (item.translations) {
          this.translations.set({
            hr: { position: item.translations.hr?.position || '', bio: item.translations.hr?.bio || '' },
            en: { position: item.translations.en?.position || '', bio: item.translations.en?.bio || '' },
          });
        }

        if (item.photo) {
          this.photoUrl.set(typeof item.photo === 'string' ? item.photo : item.photo.url || '');
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load team member' });
        this.router.navigate(['/team']);
      },
    });
  }

  onImageUpload(file: File): void {
    this.photoFile = file;
    this.photoUrl.set(URL.createObjectURL(file));
  }

  onImageRemove(): void {
    this.photoFile = null;
    this.photoUrl.set('');
  }

  onSave(): void {
    const payload: any = {
      name: this.name,
      sortOrder: this.sortOrder,
      isActive: this.isActive,
      translations: this.translations(),
    };

    const request$ = this.isEditMode()
      ? this.teamService.updateMember(this.itemId()!, payload)
      : this.teamService.createMember(payload);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode() ? 'Member updated successfully' : 'Member created successfully',
        });
        this.router.navigate(['/team']);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save team member' });
      },
    });
  }
}
