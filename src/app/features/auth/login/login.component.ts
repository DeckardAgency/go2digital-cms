import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule, CheckboxModule],
  styles: [`
    .login-bg {
      --glow-x: 0;
      --glow-y: 0;
      --glow-opacity: 0;
      background-color: #f4f4f5;
      background-image: radial-gradient(circle, #c8c8d0 0.7px, transparent 0.7px);
      background-size: 9px 9px;
      position: relative;
    }
    .login-bg::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image: radial-gradient(circle, #71717a 0.7px, transparent 0.7px);
      background-size: 9px 9px;
      mask-image: radial-gradient(circle 90px at var(--glow-x) var(--glow-y), black, transparent);
      -webkit-mask-image: radial-gradient(circle 90px at var(--glow-x) var(--glow-y), black, transparent);
      opacity: var(--glow-opacity);
      transition: opacity 0.8s ease;
      pointer-events: none;
      z-index: 0;
    }
    :host-context(.dark) .login-bg {
      background-color: #09090b;
      background-image: radial-gradient(circle, #27272a 0.7px, transparent 0.7px);
      background-size: 9px 9px;
    }
    :host-context(.dark) .login-bg::after {
      background-image: radial-gradient(circle, #a1a1aa 0.7px, transparent 0.7px);
      background-size: 9px 9px;
    }
  `],
  template: `
    <div class="login-bg min-h-screen flex items-center justify-center px-4 relative" (mousemove)="onMouseMove($event)" (mouseleave)="onMouseLeave()"
      [style.--glow-x.px]="glowX" [style.--glow-y.px]="glowY" [style.--glow-opacity]="glowVisible ? 1 : 0">
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
          <h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Go2Digital CMS</h1>
          <p class="text-zinc-500 dark:text-zinc-400 mt-1">Sign in to manage content</p>
        </div>

        <!-- Login Form -->
        <div class="login-card bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-sm border border-zinc-200 dark:border-zinc-800 relative z-10">
          @if (error()) {
            <div class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {{ error() }}
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="flex flex-col gap-5">
              <!-- Email -->
              <div class="flex flex-col gap-2">
                <label for="email" class="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                <input
                  pInputText
                  id="email"
                  type="email"
                  formControlName="email"
                  placeholder="admin&#64;go2digital.hr"
                  class="w-full" />
              </div>

              <!-- Password -->
              <div class="flex flex-col gap-2">
                <label for="password" class="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
                <p-password
                  id="password"
                  formControlName="password"
                  placeholder="Enter password"
                  [toggleMask]="true"
                  [feedback]="false"
                  styleClass="w-full"
                  inputStyleClass="w-full" />
              </div>

              <!-- Remember me + Forgot password -->
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2 cursor-pointer">
                  <p-checkbox formControlName="rememberMe" [binary]="true" />
                  <span class="text-sm text-zinc-600 dark:text-zinc-400">Remember me</span>
                </label>
                <a href="javascript:void(0)" class="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline" (click)="forgotPassword()">
                  Forgot password?
                </a>
              </div>

              <!-- Submit -->
              <p-button
                type="submit"
                label="Sign In"
                icon="pi pi-sign-in"
                styleClass="w-full"
                [loading]="isLoading()"
                [disabled]="loginForm.invalid || isLoading()" />
            </div>
          </form>
        </div>

        <!-- Footer -->
        <p class="text-center text-xs text-zinc-400 dark:text-zinc-600 mt-6">&copy; {{ currentYear }} Go2Digital. All rights reserved.</p>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  readonly themeService = inject(ThemeService);

  error = signal('');
  isLoading = signal(false);

  glowX = 0;
  glowY = 0;
  glowVisible = false;
  private glowTimeout: any = null;
  private targetX = 0;
  private targetY = 0;
  private rafId: number | null = null;
  private readonly LERP = 0.08;

  private startLerp(): void {
    if (this.rafId) return;
    const tick = () => {
      this.glowX += (this.targetX - this.glowX) * this.LERP;
      this.glowY += (this.targetY - this.glowY) * this.LERP;
      if (Math.abs(this.targetX - this.glowX) > 0.5 || Math.abs(this.targetY - this.glowY) > 0.5) {
        this.rafId = requestAnimationFrame(tick);
      } else {
        this.glowX = this.targetX;
        this.glowY = this.targetY;
        this.rafId = null;
      }
    };
    this.rafId = requestAnimationFrame(tick);
  }

  onMouseMove(e: MouseEvent): void {
    // Hide glow when hovering over the form card
    const target = e.target as HTMLElement;
    if (target.closest('.login-card')) {
      this.glowVisible = false;
      clearTimeout(this.glowTimeout);
      return;
    }

    this.targetX = e.clientX;
    this.targetY = e.clientY;
    this.glowVisible = true;
    this.startLerp();
    clearTimeout(this.glowTimeout);
    this.glowTimeout = setTimeout(() => this.glowVisible = false, 1500);
  }

  onMouseLeave(): void {
    this.glowVisible = false;
    clearTimeout(this.glowTimeout);
  }

  currentYear = new Date().getFullYear();

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    rememberMe: [false],
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    const { email, password } = this.loginForm.value;

    this.authService.login({ username: email!, password: password! }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: () => {
        this.error.set('Invalid email or password');
        this.isLoading.set(false);
      }
    });
  }

  forgotPassword(): void {
    const email = this.loginForm.value.email;
    if (email) {
      this.authService.requestPasswordReset(email).subscribe({
        next: () => this.error.set(''),
        error: () => {},
      });
      this.error.set('If the email exists, a reset link has been sent.');
    } else {
      this.error.set('Enter your email address first, then click Forgot password.');
    }
  }
}
