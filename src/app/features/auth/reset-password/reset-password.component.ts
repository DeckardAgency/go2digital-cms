import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PasswordModule, ButtonModule],
  styles: [`
    .reset-bg {
      background-color: #f4f4f5;
      background-image: radial-gradient(circle, #a0a0ac 0.7px, transparent 0.7px);
      background-size: 9px 9px;
    }
    :host-context(.dark) .reset-bg {
      background-color: #09090b;
      background-image: radial-gradient(circle, #52525b 0.7px, transparent 0.7px);
      background-size: 9px 9px;
    }
  `],
  template: `
    <div class="reset-bg min-h-screen flex items-center justify-center px-4 relative">
      <!-- Dark mode toggle -->
      <button
        type="button"
        class="absolute top-4 right-4 w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        (click)="themeService.toggleTheme()">
        <i [class]="themeService.isDark() ? 'pi pi-sun' : 'pi pi-moon'" class="text-base"></i>
      </button>

      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-zinc-900 dark:bg-white rounded-2xl mb-4">
            <span class="text-white dark:text-zinc-900 font-bold text-xl">G2D</span>
          </div>
          <h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Reset Password</h1>
          <p class="text-zinc-500 dark:text-zinc-400 mt-1">Enter your new password</p>
        </div>

        <!-- Form Card -->
        <div class="bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-sm border border-zinc-200 dark:border-zinc-800 relative z-10">

          @if (success()) {
            <div class="text-center py-4">
              <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 mb-4">
                <i class="pi pi-check text-green-600 dark:text-green-400 text-xl"></i>
              </div>
              <h2 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Password Reset</h2>
              <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Your password has been successfully changed. You can now sign in.</p>
              <p-button label="Go to Login" icon="pi pi-sign-in" styleClass="w-full" (onClick)="router.navigate(['/login'])" />
            </div>
          } @else {
            @if (error()) {
              <div class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                {{ error() }}
              </div>
            }

            @if (tokenValid()) {
              <form [formGroup]="resetForm" (ngSubmit)="onSubmit()">
                <div class="flex flex-col gap-5">
                  <div class="flex flex-col gap-2">
                    <label for="password" class="text-sm font-medium text-zinc-700 dark:text-zinc-300">New Password</label>
                    <p-password
                      id="password"
                      formControlName="password"
                      placeholder="Enter new password"
                      [toggleMask]="true"
                      [feedback]="true"
                      styleClass="w-full"
                      inputStyleClass="w-full" />
                  </div>

                  <div class="flex flex-col gap-2">
                    <label for="confirmPassword" class="text-sm font-medium text-zinc-700 dark:text-zinc-300">Confirm Password</label>
                    <p-password
                      id="confirmPassword"
                      formControlName="confirmPassword"
                      placeholder="Confirm new password"
                      [toggleMask]="true"
                      [feedback]="false"
                      styleClass="w-full"
                      inputStyleClass="w-full" />
                  </div>

                  @if (resetForm.hasError('passwordMismatch')) {
                    <p class="text-red-500 text-xs -mt-2">Passwords do not match.</p>
                  }

                  <p-button
                    type="submit"
                    label="Reset Password"
                    icon="pi pi-lock"
                    styleClass="w-full"
                    [loading]="isLoading()"
                    [disabled]="resetForm.invalid || isLoading()" />
                </div>
              </form>
            } @else {
              <div class="text-center py-4">
                <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 mb-4">
                  <i class="pi pi-times text-red-600 dark:text-red-400 text-xl"></i>
                </div>
                <h2 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Invalid Link</h2>
                <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-6">This reset link is invalid or has expired. Please request a new one.</p>
                <p-button label="Back to Login" icon="pi pi-arrow-left" severity="secondary" styleClass="w-full" (onClick)="router.navigate(['/login'])" />
              </div>
            }
          }
        </div>

        <p class="text-center text-xs text-zinc-400 dark:text-zinc-600 mt-6">&copy; {{ currentYear }} Go2Digital. All rights reserved.</p>
      </div>
    </div>
  `,
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  readonly router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  readonly themeService = inject(ThemeService);

  error = signal('');
  success = signal(false);
  isLoading = signal(false);
  tokenValid = signal(true);
  currentYear = new Date().getFullYear();
  private token = '';

  resetForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  }, {
    validators: (group: any) => {
      const pass = group.get('password')?.value;
      const confirm = group.get('confirmPassword')?.value;
      return pass === confirm ? null : { passwordMismatch: true };
    }
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] || '';
    if (!this.token) {
      this.tokenValid.set(false);
    }
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    const { password } = this.resetForm.value;

    this.authService.resetPassword(this.token, password!).subscribe({
      next: () => {
        this.success.set(true);
        this.isLoading.set(false);
      },
      error: (err) => {
        const msg = err.error?.error || 'Failed to reset password. The link may be expired.';
        this.error.set(msg);
        this.isLoading.set(false);
      }
    });
  }
}
