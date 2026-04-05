import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { PasswordModule } from 'primeng/password';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';

import {
  DataTableWrapperComponent,
  DataTableCellDirective,
  DataTableHeaderActionsDirective,
  DataTableRowActionsDirective,
  DataTableFilterMenuDirective,
  DataTableColumn,
  DataTableState,
  FilterChip,
} from '../../shared/components/data-table-wrapper';
import { UserService, UserRecord, CreateUserPayload, UpdateUserPayload } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, TagModule,
    DrawerModule, InputTextModule, SelectModule, ToggleSwitchModule,
    PasswordModule, ConfirmDialogModule, TooltipModule, MenuModule,
    DataTableWrapperComponent, DataTableCellDirective,
    DataTableHeaderActionsDirective, DataTableRowActionsDirective,
    DataTableFilterMenuDirective,
  ],
  providers: [ConfirmationService],
  template: `
    <app-data-table-wrapper
      title="Users"
      entityName="users"
      [columns]="columns"
      [data]="filteredUsers()"
      [totalRecords]="filteredUsers().length"
      [loading]="userService.isLoading()"
      [filterChips]="filterChips()"
      (stateChange)="onStateChange($event)"
      (rowClick)="openEdit($event)"
      (filterChipRemove)="onFilterChipRemove($event)"
      (filtersClear)="onFiltersClear()"
      (refresh)="loadUsers()">

      <!-- Header Actions -->
      <ng-template dtHeaderActions>
        <p-button label="New User" icon="pi pi-plus" (onClick)="openCreate()" />
      </ng-template>

      <!-- Filter Menu -->
      <ng-template dtFilterMenu>
        <div class="flex flex-wrap items-end gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Role</label>
            <p-select
              [options]="roleFilterOptions"
              [(ngModel)]="filterRole"
              optionLabel="label"
              optionValue="value"
              placeholder="All roles"
              [showClear]="true"
              class="w-48"
              (onChange)="applyFilters()" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Status</label>
            <p-select
              [options]="statusFilterOptions"
              [(ngModel)]="filterStatus"
              optionLabel="label"
              optionValue="value"
              placeholder="All statuses"
              [showClear]="true"
              class="w-48"
              (onChange)="applyFilters()" />
          </div>
        </div>
      </ng-template>

      <!-- Custom Cells -->
      <ng-template dtCell="name" let-row>
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
            {{ row.firstName?.charAt(0) }}{{ row.lastName?.charAt(0) }}
          </div>
          <div>
            <div class="font-medium text-surface-900 dark:text-surface-0">{{ row.firstName }} {{ row.lastName }}</div>
            <div class="text-xs text-surface-400">{{ row.email }}</div>
          </div>
        </div>
      </ng-template>

      <ng-template dtCell="role" let-row>
        <p-tag [value]="getRoleLabel(row.roles)" [severity]="getRoleSeverity(row.roles)" />
      </ng-template>

      <ng-template dtCell="status" let-row>
        <p-tag [value]="row.isActive ? 'Active' : 'Inactive'" [severity]="row.isActive ? 'success' : 'danger'" />
      </ng-template>

      <ng-template dtCell="createdAt" let-row>
        {{ row.createdAt | date:'dd.MM.yyyy' }}
      </ng-template>

      <!-- Row Actions (three-dot menu) -->
      <ng-template dtRowActions let-row>
        <p-button
          icon="pi pi-ellipsis-v"
          [text]="true"
          [rounded]="true"
          severity="secondary"
          (onClick)="setCurrentRow(row); rowMenu.toggle($event)" />
        <p-menu #rowMenu [model]="rowMenuItems" [popup]="true" appendTo="body" />
      </ng-template>
    </app-data-table-wrapper>

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

          <!-- Repeat password -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300">Repeat Password</label>
            <p-password
              [(ngModel)]="form.confirmPassword"
              [feedback]="false"
              [toggleMask]="true"
              styleClass="w-full"
              inputStyleClass="w-full"
              placeholder="Repeat password" />
            @if (form.confirmPassword && form.password !== form.confirmPassword) {
              <span class="text-xs text-red-500">Passwords do not match</span>
            }
          </div>

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
  filterChips = signal<FilterChip[]>([]);
  drawerVisible = false;
  isEditMode = signal(false);
  editId = signal<string | null>(null);
  generatedPassword = signal<string | null>(null);
  sendingReset = signal(false);

  filterRole: string | null = null;
  filterStatus: string | null = null;

  columns: DataTableColumn[] = [
    { key: 'name', label: 'User', defaultVisible: true },
    { key: 'role', label: 'Role', defaultVisible: true, width: '140px' },
    { key: 'status', label: 'Status', defaultVisible: true, width: '110px' },
    { key: 'createdAt', label: 'Created', defaultVisible: true, width: '120px' },
  ];

  currentRow: UserRecord | null = null;
  rowMenuItems: MenuItem[] = [];

  roleFilterOptions = [
    { label: 'Super Admin', value: 'ROLE_SUPER_ADMIN' },
    { label: 'Admin', value: 'ROLE_ADMIN' },
    { label: 'Editor', value: 'ROLE_EDITOR' },
  ];

  statusFilterOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  form = {
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    role: 'ROLE_EDITOR',
    isActive: true,
  };

  roleOptions = [
    { label: 'Editor', value: 'ROLE_EDITOR' },
    { label: 'Admin', value: 'ROLE_ADMIN' },
    { label: 'Super Admin', value: 'ROLE_SUPER_ADMIN' },
  ];

  strengthLabels: Record<number, string> = { 1: 'Very weak', 2: 'Weak', 3: 'Fair', 4: 'Strong', 5: 'Very strong' };
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

  filteredUsers(): UserRecord[] {
    let result = this.users();
    if (this.filterRole) {
      result = result.filter(u => u.roles.includes(this.filterRole!));
    }
    if (this.filterStatus) {
      result = result.filter(u => this.filterStatus === 'active' ? u.isActive : !u.isActive);
    }
    return result;
  }

  onStateChange(state: DataTableState): void {
    // Client-side filtering, no server pagination needed
  }

  applyFilters(): void {
    this.updateFilterChips();
  }

  onFilterChipRemove(key: string): void {
    if (key === 'role') this.filterRole = null;
    if (key === 'status') this.filterStatus = null;
    this.updateFilterChips();
  }

  onFiltersClear(): void {
    this.filterRole = null;
    this.filterStatus = null;
    this.updateFilterChips();
  }

  private updateFilterChips(): void {
    const chips: FilterChip[] = [];
    if (this.filterRole) {
      const opt = this.roleFilterOptions.find(o => o.value === this.filterRole);
      chips.push({ key: 'role', label: `Role: ${opt?.label || this.filterRole}` });
    }
    if (this.filterStatus) {
      chips.push({ key: 'status', label: `Status: ${this.filterStatus}` });
    }
    this.filterChips.set(chips);
  }

  setCurrentRow(row: UserRecord): void {
    this.currentRow = row;
    const isSelf = row.id === this.authService.user()?.id;
    this.rowMenuItems = [
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.openEdit(row) },
      { label: 'Send Reset Email', icon: 'pi pi-envelope', command: () => this.sendReset(row) },
      { separator: true },
      { label: 'Delete', icon: 'pi pi-trash', styleClass: 'text-red-500', disabled: isSelf, command: () => this.confirmDelete(row) },
    ];
  }

  // ─── Drawer ────────────────────────────────────────────

  openCreate(): void {
    this.isEditMode.set(false);
    this.editId.set(null);
    this.generatedPassword.set(null);
    this.form = { email: '', firstName: '', lastName: '', password: '', confirmPassword: '', role: 'ROLE_EDITOR', isActive: true };
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
      confirmPassword: '',
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
    if (this.form.password && this.form.password !== this.form.confirmPassword) {
      this.messageService.add({ severity: 'warn', summary: 'Passwords do not match' });
      return;
    }

    const roles = [this.form.role];

    if (this.isEditMode()) {
      const payload: UpdateUserPayload = {
        email: this.form.email, firstName: this.form.firstName, lastName: this.form.lastName,
        roles, isActive: this.form.isActive,
      };
      if (this.form.password) payload.password = this.form.password;

      this.userService.updateUser(this.editId()!, payload).subscribe({
        next: () => { this.messageService.add({ severity: 'success', summary: 'User updated' }); this.drawerVisible = false; this.loadUsers(); },
        error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'Failed to update user' }),
      });
    } else {
      const payload: CreateUserPayload = {
        email: this.form.email, firstName: this.form.firstName, lastName: this.form.lastName,
        password: this.form.password, roles, isActive: this.form.isActive,
      };
      this.userService.createUser(payload).subscribe({
        next: () => { this.messageService.add({ severity: 'success', summary: 'User created' }); this.drawerVisible = false; this.loadUsers(); },
        error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'Failed to create user' }),
      });
    }
  }

  // ─── Actions ───────────────────────────────────────────

  confirmDelete(user: UserRecord): void {
    this.confirmationService.confirm({
      message: `Delete ${user.firstName} ${user.lastName} (${user.email})?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.userService.deleteUser(user.id).subscribe({
          next: () => { this.messageService.add({ severity: 'success', summary: 'User deleted' }); this.loadUsers(); },
          error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'Failed to delete' }),
        });
      },
    });
  }

  sendReset(user: UserRecord): void {
    this.userService.sendPasswordReset(user.id).subscribe({
      next: (res) => this.messageService.add({ severity: 'success', summary: 'Reset email sent', detail: res.message }),
      error: () => this.messageService.add({ severity: 'error', summary: 'Failed to send reset email' }),
    });
  }

  sendResetFromDrawer(): void {
    const id = this.editId();
    if (!id) return;
    this.sendingReset.set(true);
    this.userService.sendPasswordReset(id).subscribe({
      next: (res) => { this.sendingReset.set(false); this.messageService.add({ severity: 'success', summary: 'Reset email sent', detail: res.message }); },
      error: () => { this.sendingReset.set(false); this.messageService.add({ severity: 'error', summary: 'Failed to send reset email' }); },
    });
  }

  // ─── Password ──────────────────────────────────────────

  generatePassword(): void {
    const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';
    const specials = '!@#$%&*';
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const digits = '23456789';

    let pw = '';
    pw += upper[Math.floor(Math.random() * upper.length)];
    pw += lower[Math.floor(Math.random() * lower.length)];
    pw += digits[Math.floor(Math.random() * digits.length)];
    pw += specials[Math.floor(Math.random() * specials.length)];
    for (let i = 4; i < 16; i++) pw += chars[Math.floor(Math.random() * chars.length)];
    pw = pw.split('').sort(() => Math.random() - 0.5).join('');

    this.form.password = pw;
    this.form.confirmPassword = pw;
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

  // ─── Helpers ───────────────────────────────────────────

  getHighestRole(roles: string[]): string {
    if (roles.includes('ROLE_SUPER_ADMIN')) return 'ROLE_SUPER_ADMIN';
    if (roles.includes('ROLE_ADMIN')) return 'ROLE_ADMIN';
    if (roles.includes('ROLE_EDITOR')) return 'ROLE_EDITOR';
    return 'ROLE_USER';
  }

  getRoleLabel(roles: string[]): string {
    const r = this.getHighestRole(roles);
    if (r === 'ROLE_SUPER_ADMIN') return 'Super Admin';
    if (r === 'ROLE_ADMIN') return 'Admin';
    if (r === 'ROLE_EDITOR') return 'Editor';
    return 'User';
  }

  getRoleSeverity(roles: string[]): 'danger' | 'warn' | 'info' | 'secondary' {
    const role = this.getHighestRole(roles);
    if (role === 'ROLE_SUPER_ADMIN') return 'danger';
    if (role === 'ROLE_ADMIN') return 'warn';
    if (role === 'ROLE_EDITOR') return 'info';
    return 'secondary';
  }
}
