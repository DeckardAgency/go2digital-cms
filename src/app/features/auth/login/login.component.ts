import { Component, inject, signal, HostListener, OnDestroy } from '@angular/core';
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

    /* ── Deckard Mode ── */
    :host-context(.deckard-active) .login-bg {
      background-color: #0a0a0f !important;
      background-image: radial-gradient(circle, #1a3a4a 0.7px, transparent 0.7px) !important;
    }
    .deckard-active .login-bg::after {
      background-image: radial-gradient(circle, #ff6a1a 0.7px, transparent 0.7px) !important;
    }

    .deckard-rain {
      position: fixed;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      overflow: hidden;
    }
    .deckard-rain::before,
    .deckard-rain::after {
      content: '';
      position: absolute;
      top: -100%;
      left: 0;
      width: 100%;
      height: 200%;
      background-image:
        linear-gradient(180deg, transparent 95%, rgba(0, 200, 255, 0.12) 95%, rgba(0, 200, 255, 0.12) 95.5%, transparent 95.5%),
        linear-gradient(180deg, transparent 87%, rgba(0, 200, 255, 0.06) 87%, rgba(0, 200, 255, 0.06) 87.3%, transparent 87.3%),
        linear-gradient(180deg, transparent 73%, rgba(0, 200, 255, 0.08) 73%, rgba(0, 200, 255, 0.08) 73.2%, transparent 73.2%);
      background-size: 3px 120px, 2px 80px, 1px 200px;
      animation: deckard-rain-fall 1.2s linear infinite;
    }
    .deckard-rain::after {
      left: 50%;
      animation-delay: -0.5s;
      animation-duration: 0.9s;
      opacity: 0.7;
    }
    @keyframes deckard-rain-fall {
      0% { transform: translateY(0); }
      100% { transform: translateY(50%); }
    }

    .deckard-scanlines {
      position: fixed;
      inset: 0;
      z-index: 2;
      pointer-events: none;
      background: repeating-linear-gradient(
        0deg,
        transparent 0px,
        transparent 2px,
        rgba(0, 0, 0, 0.15) 2px,
        rgba(0, 0, 0, 0.15) 4px
      );
      animation: deckard-scanline-move 8s linear infinite;
    }
    .deckard-scanlines::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        180deg,
        transparent 0%,
        rgba(0, 200, 255, 0.03) 50%,
        transparent 100%
      );
      background-size: 100% 200%;
      animation: deckard-crt-glow 3s ease-in-out infinite;
    }
    @keyframes deckard-scanline-move {
      0% { background-position-y: 0; }
      100% { background-position-y: 4px; }
    }
    @keyframes deckard-crt-glow {
      0%, 100% { background-position-y: 0%; }
      50% { background-position-y: 100%; }
    }

    /* Neon glow pulse on the form */
    :host-context(.deckard-active) .login-card {
      animation: deckard-neon-pulse 4s ease-in-out infinite;
    }
    @keyframes deckard-neon-pulse {
      0%, 100% { box-shadow: 0 0 30px rgba(255, 106, 26, 0.06), 0 0 60px rgba(0, 200, 255, 0.03), inset 0 0 30px rgba(0, 200, 255, 0.02); }
      50% { box-shadow: 0 0 40px rgba(255, 106, 26, 0.12), 0 0 80px rgba(0, 200, 255, 0.06), inset 0 0 40px rgba(0, 200, 255, 0.04); }
    }

    /* Glitch on the whole form area */
    :host-context(.deckard-active) .login-logo h1 {
      text-shadow: 0 0 10px rgba(255, 106, 26, 0.5);
      animation: deckard-text-glitch 5s ease-in-out infinite;
    }
    :host-context(.deckard-active) .login-logo p {
      animation: deckard-text-glitch 5s ease-in-out infinite;
      animation-delay: -1.5s;
    }
    :host-context(.deckard-active) .login-card {
      animation: deckard-neon-pulse 4s ease-in-out infinite, deckard-card-glitch 8s ease-in-out infinite;
    }
    :host-context(.deckard-active) .login-card label {
      animation: deckard-text-glitch 7s ease-in-out infinite;
      animation-delay: -2s;
    }

    @keyframes deckard-text-glitch {
      0%, 84% { transform: translate(0); text-shadow: inherit; filter: none; }
      85% { transform: translate(-2px, 0); text-shadow: 3px 0 rgba(0, 200, 255, 0.8), -3px 0 rgba(255, 106, 26, 0.8); filter: none; }
      85.5% { transform: translate(3px, 1px); text-shadow: -2px 0 rgba(0, 200, 255, 0.6), 2px 0 rgba(255, 106, 26, 0.6); filter: none; }
      86% { transform: translate(0, -1px); text-shadow: 1px 0 rgba(0, 200, 255, 0.4), -1px 0 rgba(255, 106, 26, 0.4); filter: hue-rotate(30deg); }
      86.5% { transform: translate(-1px, 0); text-shadow: 2px 0 rgba(0, 200, 255, 0.9), -2px 0 rgba(255, 106, 26, 0.9); filter: none; }
      87% { transform: translate(0); text-shadow: inherit; filter: none; }
      93%, 93.3% { transform: translate(0); text-shadow: inherit; filter: none; }
      93.4% { transform: translate(4px, 0); text-shadow: -4px 0 rgba(0, 200, 255, 1), 4px 0 rgba(255, 106, 26, 1); filter: saturate(2); }
      93.6% { transform: translate(-3px, 1px); text-shadow: 3px 0 rgba(0, 200, 255, 0.7), -3px 0 rgba(255, 106, 26, 0.7); filter: none; }
      93.8% { transform: translate(0); text-shadow: inherit; filter: none; }
      100% { transform: translate(0); text-shadow: inherit; filter: none; }
    }

    @keyframes deckard-card-glitch {
      0%, 89% { transform: translate(0); clip-path: none; }
      89.5% { transform: translate(-2px, 0); clip-path: inset(10% 0 60% 0); }
      89.7% { transform: translate(3px, 0); clip-path: inset(40% 0 20% 0); }
      89.9% { transform: translate(-1px, 0); clip-path: inset(70% 0 5% 0); }
      90.1% { transform: translate(0); clip-path: none; }
      95%, 95.2% { transform: translate(0); clip-path: none; }
      95.3% { transform: translate(2px, 0); clip-path: inset(5% 0 80% 0); }
      95.5% { transform: translate(-3px, 0); clip-path: inset(50% 0 30% 0); }
      95.6% { transform: translate(0); clip-path: none; }
      100% { transform: translate(0); clip-path: none; }
    }

    /* Synthwave horizon line */
    .deckard-horizon {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 35vh;
      z-index: 0;
      pointer-events: none;
      background: linear-gradient(
        0deg,
        rgba(255, 106, 26, 0.06) 0%,
        rgba(0, 200, 255, 0.02) 30%,
        transparent 100%
      );
    }
    .deckard-horizon::before {
      content: '';
      position: absolute;
      bottom: 30%;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, rgba(255, 106, 26, 0.3) 20%, rgba(0, 200, 255, 0.2) 50%, rgba(255, 106, 26, 0.3) 80%, transparent 100%);
      box-shadow: 0 0 20px rgba(255, 106, 26, 0.15), 0 0 40px rgba(0, 200, 255, 0.1);
    }
    .deckard-grid {
      position: fixed;
      bottom: 0;
      left: -20%;
      right: -20%;
      height: 30vh;
      z-index: 0;
      pointer-events: none;
      background:
        linear-gradient(90deg, rgba(0, 200, 255, 0.05) 1px, transparent 1px),
        linear-gradient(0deg, rgba(0, 200, 255, 0.05) 1px, transparent 1px);
      background-size: 60px 30px;
      transform: perspective(400px) rotateX(60deg);
      transform-origin: bottom center;
      mask-image: linear-gradient(0deg, black 0%, transparent 80%);
      -webkit-mask-image: linear-gradient(0deg, black 0%, transparent 80%);
    }

    :host-context(.deckard-active) .login-card {
      background: rgba(10, 15, 25, 0.9) !important;
      border-color: rgba(255, 106, 26, 0.3) !important;
    }
    :host-context(.deckard-active) .login-card input,
    :host-context(.deckard-active) .login-card .p-password,
    :host-context(.deckard-active) .login-card .p-inputtext {
      background: rgba(0, 20, 30, 0.6) !important;
      border-color: rgba(0, 200, 255, 0.2) !important;
      color: #00c8ff !important;
    }
    :host-context(.deckard-active) .login-card label,
    :host-context(.deckard-active) .login-card span,
    :host-context(.deckard-active) .login-card p,
    :host-context(.deckard-active) .login-card a {
      color: rgba(0, 200, 255, 0.7) !important;
    }
    :host-context(.deckard-active) .login-logo h1 {
      color: #ff6a1a !important;
    }
    :host-context(.deckard-active) .login-logo p {
      color: rgba(0, 200, 255, 0.4) !important;
    }
    :host-context(.deckard-active) .login-logo div {
      background: rgba(255, 106, 26, 0.15) !important;
      border: 1px solid rgba(255, 106, 26, 0.3);
    }
    :host-context(.deckard-active) .login-logo span {
      color: #ff6a1a !important;
    }
    :host-context(.deckard-active) .login-card ::ng-deep .p-button {
      background: rgba(255, 106, 26, 0.8) !important;
      border-color: #ff6a1a !important;
      color: #0a0a0f !important;
    }
    :host-context(.deckard-active) .login-card ::ng-deep .p-checkbox .p-checkbox-box {
      border-color: rgba(0, 200, 255, 0.3) !important;
      background: rgba(0, 20, 30, 0.6) !important;
    }
    :host-context(.deckard-active) .login-card ::ng-deep .p-password-input {
      background: rgba(0, 20, 30, 0.6) !important;
      border-color: rgba(0, 200, 255, 0.2) !important;
      color: #00c8ff !important;
    }

    .deckard-quote {
      position: fixed;
      bottom: 3rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 3;
      text-align: center;
      font-family: 'Courier New', monospace;
      animation: deckard-flicker 4s ease-in-out infinite;
    }
    .deckard-quote p {
      font-size: 0.8rem;
      color: rgba(0, 200, 255, 0.5);
      letter-spacing: 0.1em;
      font-style: italic;
    }
    .deckard-quote span {
      font-size: 0.65rem;
      color: rgba(255, 106, 26, 0.4);
      display: block;
      margin-top: 0.5rem;
    }
    @keyframes deckard-flicker {
      0%, 100% { opacity: 1; }
      92% { opacity: 1; }
      93% { opacity: 0.3; }
      94% { opacity: 1; }
      96% { opacity: 0.5; }
      97% { opacity: 1; }
    }

    .deckard-glitch {
      animation: deckard-glitch-text 0.3s ease forwards;
    }
    @keyframes deckard-glitch-text {
      0% { transform: translate(0); filter: none; }
      20% { transform: translate(-2px, 1px); filter: hue-rotate(90deg); }
      40% { transform: translate(2px, -1px); filter: hue-rotate(-90deg); }
      60% { transform: translate(-1px, -1px); filter: hue-rotate(45deg); }
      80% { transform: translate(1px, 1px); filter: none; }
      100% { transform: translate(0); filter: none; }
    }

    .deckard-exit {
      position: fixed;
      top: 1rem;
      left: 1rem;
      z-index: 10;
      padding: 0.35rem 0.75rem;
      font-size: 0.7rem;
      font-family: 'Courier New', monospace;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(255, 106, 26, 0.6);
      background: rgba(255, 106, 26, 0.08);
      border: 1px solid rgba(255, 106, 26, 0.2);
      border-radius: 4px;
      cursor: pointer;
    }
    .deckard-exit:hover {
      color: #ff6a1a;
      border-color: rgba(255, 106, 26, 0.5);
    }
  `],
  template: `
    <div class="login-bg min-h-screen flex items-center justify-center px-4 relative" (mousemove)="onMouseMove($event)" (mouseleave)="onMouseLeave()"
      [style.--glow-x.px]="glowX" [style.--glow-y.px]="glowY" [style.--glow-opacity]="glowVisible ? 1 : 0">

      @if (deckardMode()) {
        <div class="deckard-grid"></div>
        <div class="deckard-horizon"></div>
        <div class="deckard-rain"></div>
        <div class="deckard-scanlines"></div>
        <button class="deckard-exit" (click)="exitDeckardMode()">[ Exit Deckard Mode ]</button>
        <div class="deckard-quote">
          <p>"All those moments will be lost in time, like tears in rain."</p>
          <span>— Roy Batty, 2019</span>
        </div>
      }
      <!-- Dark mode toggle -->
      <button
        type="button"
        class="absolute top-4 right-4 w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        (click)="themeService.toggleTheme()">
        <i [class]="themeService.isDark() ? 'pi pi-sun' : 'pi pi-moon'" class="text-base"></i>
      </button>

      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="login-logo text-center mb-8">
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
export class LoginComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  readonly themeService = inject(ThemeService);

  error = signal('');
  isLoading = signal(false);
  deckardMode = signal(false);
  private keyBuffer = '';
  private readonly SECRET = 'deckard';

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

  // ── Deckard Mode Easter Egg ──

  @HostListener('document:keypress', ['$event'])
  onKeyPress(e: KeyboardEvent): void {
    // Don't capture when typing in form fields
    if ((e.target as HTMLElement).tagName === 'INPUT') return;

    this.keyBuffer += e.key.toLowerCase();
    if (this.keyBuffer.length > this.SECRET.length) {
      this.keyBuffer = this.keyBuffer.slice(-this.SECRET.length);
    }
    if (this.keyBuffer === this.SECRET) {
      this.activateDeckardMode();
      this.keyBuffer = '';
    }
  }

  activateDeckardMode(): void {
    this.deckardMode.set(true);
    document.documentElement.classList.add('deckard-active');
  }

  exitDeckardMode(): void {
    this.deckardMode.set(false);
    document.documentElement.classList.remove('deckard-active');
  }

  ngOnDestroy(): void {
    document.documentElement.classList.remove('deckard-active');
  }
}
