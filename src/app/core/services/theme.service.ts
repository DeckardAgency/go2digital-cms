import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'theme_dark';
  private _isDark = signal(false);
  readonly isDark = this._isDark.asReadonly();

  constructor() {
    const stored = localStorage.getItem(this.THEME_KEY);
    if (stored !== null) {
      this._isDark.set(stored === 'true');
    } else {
      this._isDark.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    this.applyTheme();
  }

  toggleTheme(): void {
    this._isDark.set(!this._isDark());
    localStorage.setItem(this.THEME_KEY, String(this._isDark()));
    this.applyTheme();
  }

  private applyTheme(): void {
    if (this._isDark()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
