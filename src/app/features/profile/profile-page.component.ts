import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';

import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, InputTextModule, PasswordModule,
    ButtonModule, TagModule,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Profile</h1>
          <p class="text-surface-500 text-sm mt-0.5">Manage your account settings</p>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

        <!-- Left: Profile card -->
        <div class="xl:col-span-2 space-y-6">

          <!-- Profile info -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0">Personal Information</h2>
              <p-button label="Save" icon="pi pi-save" size="small" [loading]="savingProfile()" (onClick)="saveProfile()" />
            </div>
            <div class="flex flex-col gap-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-surface-700 dark:text-surface-300">First Name</label>
                  <input pInputText class="w-full" [(ngModel)]="firstName" />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Last Name</label>
                  <input pInputText class="w-full" [(ngModel)]="lastName" />
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Email</label>
                <input pInputText class="w-full" [(ngModel)]="email" type="email" />
              </div>
            </div>
          </div>

          <!-- Change password -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0">Change Password</h2>
              <p-button label="Update Password" icon="pi pi-lock" size="small" severity="secondary" [loading]="savingPassword()" (onClick)="changePassword()" />
            </div>
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Current Password</label>
                <p-password [(ngModel)]="currentPassword" [feedback]="false" [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full" placeholder="Enter current password" />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-surface-700 dark:text-surface-300">New Password</label>
                  <p-password [(ngModel)]="newPassword" [feedback]="true" [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full" placeholder="Enter new password" />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Confirm New Password</label>
                  <p-password [(ngModel)]="confirmPassword" [feedback]="false" [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full" placeholder="Repeat new password" />
                </div>
              </div>
              @if (confirmPassword && newPassword !== confirmPassword) {
                <span class="text-xs text-red-500">Passwords do not match</span>
              }
              @if (passwordError()) {
                <span class="text-xs text-red-500">{{ passwordError() }}</span>
              }
            </div>
          </div>
        </div>

        <!-- Right: Account info -->
        <div class="space-y-6">
          <!-- Avatar + role -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <div class="flex flex-col items-center text-center">
              <div class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary mb-4">
                {{ initials() }}
              </div>
              <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0">{{ authService.user()?.firstName }} {{ authService.user()?.lastName }}</h3>
              <p class="text-sm text-surface-500 mt-0.5">{{ authService.user()?.email }}</p>
              <div class="mt-3">
                <p-tag [value]="roleLabel()" [severity]="roleSeverity()" />
              </div>
            </div>
          </div>

          <!-- Account details -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Account</h2>
            <div class="flex flex-col gap-3 text-sm">
              <div class="flex justify-between">
                <span class="text-surface-500 dark:text-surface-400">Status</span>
                <p-tag [value]="authService.user()?.isActive ? 'Active' : 'Inactive'" [severity]="authService.user()?.isActive ? 'success' : 'danger'" />
              </div>
              <div class="flex justify-between">
                <span class="text-surface-500 dark:text-surface-400">Role</span>
                <span class="font-medium text-surface-900 dark:text-surface-0">{{ roleLabel() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-surface-500 dark:text-surface-400">User ID</span>
                <span class="font-mono text-xs text-surface-400">{{ authService.user()?.id?.substring(0, 8) }}...</span>
              </div>
            </div>
          </div>

          <!-- Danger zone -->
          <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-red-200 dark:border-red-800 p-6">
            <h2 class="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h2>
            <p class="text-xs text-surface-500 mb-4">Sign out of your account on this device.</p>
            <p-button label="Sign Out" icon="pi pi-sign-out" severity="danger" [outlined]="true" size="small" styleClass="w-full" (onClick)="authService.logout()" />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProfilePageComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  firstName = '';
  lastName = '';
  email = '';

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  savingProfile = signal(false);
  savingPassword = signal(false);
  passwordError = signal<string | null>(null);

  ngOnInit(): void {
    const user = this.authService.user();
    if (user) {
      this.firstName = user.firstName;
      this.lastName = user.lastName;
      this.email = user.email;
    }
  }

  initials(): string {
    const u = this.authService.user();
    return (u?.firstName?.[0] || '') + (u?.lastName?.[0] || '');
  }

  roleLabel(): string {
    const roles = this.authService.user()?.roles || [];
    if (roles.includes('ROLE_SUPER_ADMIN')) return 'Super Admin';
    if (roles.includes('ROLE_ADMIN')) return 'Admin';
    if (roles.includes('ROLE_EDITOR')) return 'Editor';
    return 'User';
  }

  roleSeverity(): 'danger' | 'warn' | 'info' | 'secondary' {
    const roles = this.authService.user()?.roles || [];
    if (roles.includes('ROLE_SUPER_ADMIN')) return 'danger';
    if (roles.includes('ROLE_ADMIN')) return 'warn';
    if (roles.includes('ROLE_EDITOR')) return 'info';
    return 'secondary';
  }

  saveProfile(): void {
    this.savingProfile.set(true);
    this.http.put<any>(`${environment.apiUrl}/auth/profile`, {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
    }).subscribe({
      next: () => {
        this.savingProfile.set(false);
        this.authService.fetchUser().subscribe();
        this.messageService.add({ severity: 'success', summary: 'Profile updated' });
      },
      error: (err) => {
        this.savingProfile.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'Failed to update profile' });
      },
    });
  }

  changePassword(): void {
    this.passwordError.set(null);

    if (!this.currentPassword || !this.newPassword) {
      this.passwordError.set('All fields are required');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError.set('Passwords do not match');
      return;
    }

    this.savingPassword.set(true);
    this.http.post<any>(`${environment.apiUrl}/auth/change-password`, {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
    }).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.messageService.add({ severity: 'success', summary: 'Password changed' });
      },
      error: (err) => {
        this.savingPassword.set(false);
        this.passwordError.set(err.error?.error || 'Failed to change password');
      },
    });
  }
}
