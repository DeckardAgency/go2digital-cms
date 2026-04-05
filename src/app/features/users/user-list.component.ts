import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { PasswordModule } from 'primeng/password';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

import { UserService, UserRecord, CreateUserPayload, UpdateUserPayload } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, TableModule, TagModule,
    DrawerModule, InputTextModule, SelectModule, ToggleSwitchModule,
    PasswordModule, ConfirmDialogModule, TooltipModule,
  ],
  providers: [ConfirmationService],
  template: `
    <div>
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Users</h1>
          <p class="text-surface-500 text-sm mt-0.5">Manage user accounts and permissions</p>
        </div>
        <p-button label="New User" icon="pi pi-plus" (onClick)="openCreate()" />
      </div>

      <!-- Table -->
      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
        <p-table
          [value]="users()"
          [loading]="userService.isLoading()"
          styleClass="p-datatable-sm"
          [paginator]="users().length > 20"
          [rows]="20">
          <ng-template #header>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th class="w-32 text-right">Actions</th>
            </tr>
          </ng-template>
          <ng-template #body let-user>
            <tr>
              <td>
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    {{ user.firstName?.charAt(0) }}{{ user.lastName?.charAt(0) }}
                  </div>
                  <div>
                    <div class="font-medium text-surface-900 dark:text-surface-0">{{ user.firstName }} {{ user.lastName }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="text-surface-600 dark:text-surface-400">{{ user.email }}</span>
              </td>
              <td>
                <p-tag [value]="getHighestRole(user.roles)" [severity]="getRoleSeverity(user.roles)" />
              </td>
              <td>
                <p-tag [value]="user.isActive ? 'Active' : 'Inactive'" [severity]="user.isActive ? 'success' : 'danger'" />
              </td>
              <td>
                <span class="text-sm text-surface-500">{{ user.createdAt | date:'MMM d, y' }}</span>
              </td>
              <td class="text-right">
                <div class="flex items-center justify-end gap-1">
                  <p-button icon="pi pi-envelope" [text]="true" size="small" severity="secondary" pTooltip="Send reset email" (onClick)="sendReset(user)" />
                  <p-button icon="pi pi-pencil" [text]="true" size="small" severity="secondary" (onClick)="openEdit(user)" />
                  <p-button icon="pi pi-trash" [text]="true" size="small" severity="danger"
                    [disabled]="user.id === authService.user()?.id"
                    (onClick)="confirmDelete($event, user)" />
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template #emptymessage>
            <tr>
              <td colspan="6" class="text-center py-8 text-surface-400">
                <i class="pi pi-users text-3xl mb-2 block"></i>
                No users found
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- User Drawer -->
    <p-drawer [(visible)]="drawerVisible" [header]="isEditMode() ? 'Edit User' : 'New User'" position="right" [style]="{ width: '480px' }">
      <div class="flex flex-col gap-5">
        <!-- Name -->
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">First Name</label>
            <input pInputText class="w-full" [(ngModel)]="form.firstName" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Last Name</label>
            <input pInputText class="w-full" [(ngModel)]="form.lastName" />
          </div>
        </div>

        <!-- Email -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Email</label>
          <input pInputText class="w-full" [(ngModel)]="form.email" type="email" />
        </div>

        <!-- Role -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Role</label>
          <p-select [options]="roleOptions" [(ngModel)]="form.role" optionLabel="label" optionValue="value" class="w-full" />
        </div>

        <!-- Active -->
        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Active</label>
            <p class="text-xs text-surface-400 mt-0.5">Inactive users cannot log in</p>
          </div>
          <p-toggleswitch [(ngModel)]="form.isActive" />
        </div>

        <!-- Password -->
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">
              {{ isEditMode() ? 'New Password' : 'Password' }}
            </label>
            <p-button label="Generate" icon="pi pi-sync" [text]="true" size="small" (onClick)="generatePassword()" />
          </div>
          <p-password
            [(ngModel)]="form.password"
            [feedback]="true"
            [toggleMask]="true"
            styleClass="w-full"
            inputStyleClass="w-full"
            [placeholder]="isEditMode() ? 'Leave empty to keep current' : 'Enter password'" />

          <!-- Strength meter -->
          @if (form.password) {
            <div class="flex flex-col gap-1.5">
              <div class="flex gap-1">
                @for (i of [0,1,2,3,4]; track i) {
                  <div class="h-1.5 flex-1 rounded-full transition-colors"
                    [class]="i < passwordStrength() ? strengthColors[passwordStrength() - 1] : 'bg-surface-200 dark:bg-surface-700'">
                  </div>
                }
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs" [class]="strengthTextColors[passwordStrength() - 1] || 'text-surface-400'">
                  {{ strengthLabels[passwordStrength()] || '' }}
                </span>
                <span class="text-xs text-surface-400">{{ form.password.length }} characters</span>
              </div>
            </div>
          }

          <!-- Generated password display -->
          @if (generatedPassword()) {
            <div class="flex items-center gap-2 p-3 bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700">
              <code class="flex-1 text-sm font-mono text-surface-900 dark:text-surface-0 break-all">{{ generatedPassword() }}</code>
              <p-button icon="pi pi-copy" [text]="true" size="small" severity="secondary" pTooltip="Copy" (onClick)="copyPassword()" />
            </div>
          }

          @if (isEditMode()) {
            <span class="text-xs text-surface-400">Leave empty to keep the current password</span>
          }
        </div>
      </div>

      <!-- Footer -->
      <ng-template #footer>
        <div class="flex items-center justify-between">
          @if (isEditMode()) {
            <p-button label="Send Reset Email" icon="pi pi-envelope" severity="secondary" [outlined]="true" size="small"
              [loading]="sendingReset()" (onClick)="sendResetFromDrawer()" />
          } @else {
            <div></div>
          }
          <div class="flex gap-2">
            <p-button label="Cancel" severity="secondary" [outlined]="true" (onClick)="drawerVisible = false" />
            <p-button [label]="isEditMode() ? 'Update' : 'Create'" icon="pi pi-check"
              [loading]="userService.isLoading()" (onClick)="onSave()" />
          </div>
        </div>
      </ng-template>
    </p-drawer>

    <p-confirmDialog />
  `,
})
export class UserListComponent implements OnInit {
  readonly userService = inject(UserService);
  readonly authService = inject(AuthService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  users = signal<UserRecord[]>([]);
  drawerVisible = false;
  isEditMode = signal(false);
  editId = signal<string | null>(null);
  generatedPassword = signal<string | null>(null);
  sendingReset = signal(false);

  form = {
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'ROLE_EDITOR',
    isActive: true,
  };

  roleOptions = [
    { label: 'Editor', value: 'ROLE_EDITOR' },
    { label: 'Admin', value: 'ROLE_ADMIN' },
    { label: 'Super Admin', value: 'ROLE_SUPER_ADMIN' },
  ];

  strengthLabels: Record<number, string> = {
    1: 'Very weak', 2: 'Weak', 3: 'Fair', 4: 'Strong', 5: 'Very strong',
  };
  strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'];
  strengthTextColors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-green-500', 'text-emerald-500'];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => this.users.set(users),
      error: () => this.messageService.add({ severity: 'error', summary: 'Failed to load users' }),
    });
  }

  openCreate(): void {
    this.isEditMode.set(false);
    this.editId.set(null);
    this.generatedPassword.set(null);
    this.form = { email: '', firstName: '', lastName: '', password: '', role: 'ROLE_EDITOR', isActive: true };
    this.drawerVisible = true;
  }

  openEdit(user: UserRecord): void {
    this.isEditMode.set(true);
    this.editId.set(user.id);
    this.generatedPassword.set(null);
    this.form = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: '',
      role: this.getHighestRole(user.roles),
      isActive: user.isActive,
    };
    this.drawerVisible = true;
  }

  onSave(): void {
    if (!this.form.email || !this.form.firstName || !this.form.lastName) {
      this.messageService.add({ severity: 'warn', summary: 'Please fill in all required fields' });
      return;
    }

    if (!this.isEditMode() && !this.form.password) {
      this.messageService.add({ severity: 'warn', summary: 'Password is required for new users' });
      return;
    }

    const roles = [this.form.role];

    if (this.isEditMode()) {
      const payload: UpdateUserPayload = {
        email: this.form.email,
        firstName: this.form.firstName,
        lastName: this.form.lastName,
        roles,
        isActive: this.form.isActive,
      };
      if (this.form.password) payload.password = this.form.password;

      this.userService.updateUser(this.editId()!, payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'User updated' });
          this.drawerVisible = false;
          this.loadUsers();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'Failed to update user' });
        },
      });
    } else {
      const payload: CreateUserPayload = {
        email: this.form.email,
        firstName: this.form.firstName,
        lastName: this.form.lastName,
        password: this.form.password,
        roles,
        isActive: this.form.isActive,
      };

      this.userService.createUser(payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'User created' });
          this.drawerVisible = false;
          this.loadUsers();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'Failed to create user' });
        },
      });
    }
  }

  confirmDelete(event: Event, user: UserRecord): void {
    this.confirmationService.confirm({
      message: `Delete ${user.firstName} ${user.lastName} (${user.email})?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'User deleted' });
            this.loadUsers();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'Failed to delete user' });
          },
        });
      },
    });
  }

  sendReset(user: UserRecord): void {
    this.userService.sendPasswordReset(user.id).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Reset email sent', detail: res.message });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Failed to send reset email' });
      },
    });
  }

  sendResetFromDrawer(): void {
    const id = this.editId();
    if (!id) return;
    this.sendingReset.set(true);
    this.userService.sendPasswordReset(id).subscribe({
      next: (res) => {
        this.sendingReset.set(false);
        this.messageService.add({ severity: 'success', summary: 'Reset email sent', detail: res.message });
      },
      error: () => {
        this.sendingReset.set(false);
        this.messageService.add({ severity: 'error', summary: 'Failed to send reset email' });
      },
    });
  }

  generatePassword(): void {
    const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';
    const specials = '!@#$%&*';
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const digits = '23456789';

    let pw = '';
    // Ensure at least one of each type
    pw += upper[Math.floor(Math.random() * upper.length)];
    pw += lower[Math.floor(Math.random() * lower.length)];
    pw += digits[Math.floor(Math.random() * digits.length)];
    pw += specials[Math.floor(Math.random() * specials.length)];

    for (let i = 4; i < 16; i++) {
      pw += chars[Math.floor(Math.random() * chars.length)];
    }

    // Shuffle
    pw = pw.split('').sort(() => Math.random() - 0.5).join('');

    this.form.password = pw;
    this.generatedPassword.set(pw);
  }

  copyPassword(): void {
    const pw = this.generatedPassword();
    if (pw) {
      navigator.clipboard.writeText(pw);
      this.messageService.add({ severity: 'info', summary: 'Copied to clipboard' });
    }
  }

  passwordStrength(): number {
    const pw = this.form.password;
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 5);
  }

  getHighestRole(roles: string[]): string {
    if (roles.includes('ROLE_SUPER_ADMIN')) return 'ROLE_SUPER_ADMIN';
    if (roles.includes('ROLE_ADMIN')) return 'ROLE_ADMIN';
    if (roles.includes('ROLE_EDITOR')) return 'ROLE_EDITOR';
    return 'ROLE_USER';
  }

  getRoleSeverity(roles: string[]): 'danger' | 'warn' | 'info' | 'secondary' {
    const role = this.getHighestRole(roles);
    if (role === 'ROLE_SUPER_ADMIN') return 'danger';
    if (role === 'ROLE_ADMIN') return 'warn';
    if (role === 'ROLE_EDITOR') return 'info';
    return 'secondary';
  }
}
