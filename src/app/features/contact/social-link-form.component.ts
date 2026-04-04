import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { ContactService } from '../../core/services/contact.service';

@Component({
  selector: 'app-social-link-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    ButtonModule,
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
            (onClick)="router.navigate(['/contact/social'])" />
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">
            {{ isEditMode() ? 'Edit Social Link' : 'New Social Link' }}
          </h1>
        </div>
        <div class="flex items-center gap-2">
          <p-button
            label="Cancel"
            severity="secondary"
            [outlined]="true"
            (onClick)="router.navigate(['/contact/social'])" />
          <p-button
            label="Save"
            icon="pi pi-check"
            [loading]="contactService.isLoading()"
            (onClick)="onSave()" />
        </div>
      </div>

      <!-- Fields -->
      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
        <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Details</h2>
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Platform</label>
            <input pInputText class="w-full" [(ngModel)]="platform" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">URL</label>
            <input pInputText class="w-full" [(ngModel)]="url" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Icon</label>
            <input pInputText class="w-full" [(ngModel)]="icon" />
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
    </div>
  `,
})
export class SocialLinkFormComponent implements OnInit {
  readonly contactService = inject(ContactService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  isEditMode = signal(false);
  itemId = signal<string | null>(null);

  platform = '';
  url = '';
  icon = '';
  sortOrder = 0;
  isActive = true;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.itemId.set(id);
      this.loadItem(id);
    }
  }

  private loadItem(id: string): void {
    this.contactService.getSocialLink(id).subscribe({
      next: (item) => {
        this.platform = item.platform || '';
        this.url = item.url || '';
        this.icon = item.icon || '';
        this.sortOrder = item.sortOrder || 0;
        this.isActive = item.isActive ?? true;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load social link' });
        this.router.navigate(['/contact/social']);
      },
    });
  }

  onSave(): void {
    const payload: any = {
      platform: this.platform,
      url: this.url,
      icon: this.icon,
      sortOrder: this.sortOrder,
      isActive: this.isActive,
    };

    const request$ = this.isEditMode()
      ? this.contactService.updateSocialLink(this.itemId()!, payload)
      : this.contactService.createSocialLink(payload);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode() ? 'Social link updated successfully' : 'Social link created successfully',
        });
        this.router.navigate(['/contact/social']);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save social link' });
      },
    });
  }
}
