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
  selector: 'app-contact-info-form',
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
            (onClick)="router.navigate(['/contact/info'])" />
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">
            {{ isEditMode() ? 'Edit Contact Info' : 'New Contact Info' }}
          </h1>
        </div>
        <div class="flex items-center gap-2">
          <p-button
            label="Cancel"
            severity="secondary"
            [outlined]="true"
            (onClick)="router.navigate(['/contact/info'])" />
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
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Key</label>
            <input pInputText class="w-full" [(ngModel)]="key" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Value</label>
            <input pInputText class="w-full" [(ngModel)]="value" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Href</label>
            <input pInputText class="w-full" [(ngModel)]="href" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Sort Order</label>
            <p-inputNumber [(ngModel)]="sortOrder" [showButtons]="true" class="w-full" />
          </div>
          <div class="flex items-center gap-2">
            <p-checkbox [(ngModel)]="isExternal" [binary]="true" inputId="isExternal" />
            <label for="isExternal" class="text-sm font-medium text-surface-700 dark:text-surface-300">External Link</label>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ContactInfoFormComponent implements OnInit {
  readonly contactService = inject(ContactService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  isEditMode = signal(false);
  itemId = signal<string | null>(null);

  key = '';
  value = '';
  href = '';
  sortOrder = 0;
  isExternal = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.itemId.set(id);
      this.loadItem(id);
    }
  }

  private loadItem(id: string): void {
    this.contactService.getContactInfo(id).subscribe({
      next: (item) => {
        this.key = item.key || '';
        this.value = item.value || '';
        this.href = item.href || '';
        this.sortOrder = item.sortOrder || 0;
        this.isExternal = item.isExternal ?? false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load contact info' });
        this.router.navigate(['/contact/info']);
      },
    });
  }

  onSave(): void {
    const payload: any = {
      key: this.key,
      value: this.value,
      href: this.href,
      sortOrder: this.sortOrder,
      isExternal: this.isExternal,
    };

    const request$ = this.isEditMode()
      ? this.contactService.updateContactInfo(this.itemId()!, payload)
      : this.contactService.createContactInfo(payload);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode() ? 'Contact info updated successfully' : 'Contact info created successfully',
        });
        this.router.navigate(['/contact/info']);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save contact info' });
      },
    });
  }
}
