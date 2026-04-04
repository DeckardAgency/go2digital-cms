import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private _sidebarCollapsed = signal(false);
  readonly sidebarCollapsed = this._sidebarCollapsed.asReadonly();

  toggleSidebar(): void {
    this._sidebarCollapsed.set(!this._sidebarCollapsed());
  }

  collapseSidebar(): void {
    this._sidebarCollapsed.set(true);
  }

  expandSidebar(): void {
    this._sidebarCollapsed.set(false);
  }
}
