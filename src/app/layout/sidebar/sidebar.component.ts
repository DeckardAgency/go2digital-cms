import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';

import { NavigationService, NavModule, NavItem } from '../../core/services/navigation.service';
import { LayoutService } from '../../core/services/layout.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, TooltipModule, AvatarModule, MenuModule, ButtonModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  private router = inject(Router);
  navigationService = inject(NavigationService);
  layoutService = inject(LayoutService);
  authService = inject(AuthService);
  themeService = inject(ThemeService);

  selectedModule = signal<NavModule | null>(null);

  userMenuItems: MenuItem[] = [
    { label: 'Settings', icon: 'pi pi-cog', routerLink: '/settings' },
    { separator: true },
    { label: 'Logout', icon: 'pi pi-sign-out', command: () => this.authService.logout() }
  ];

  userInitials = computed(() => {
    const user = this.authService.user();
    if (!user) return '';
    return (user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '');
  });

  displayedModule = computed(() => {
    const selected = this.selectedModule();
    if (selected) return selected;
    return this.navigationService.modules.find(m => this.navigationService.isModuleActive(m)) ?? null;
  });

  isModuleActive(module: NavModule): boolean {
    return this.navigationService.isModuleActive(module);
  }

  isItemActive(item: NavItem): boolean {
    return this.navigationService.isItemActive(item);
  }

  onModuleClick(module: NavModule): void {
    this.selectedModule.set(module);
    if (module.children.length > 0) {
      this.router.navigate([module.children[0].route]);
    } else {
      this.router.navigate([module.route]);
    }
  }

  onModuleHover(module: NavModule): void {
    if (this.layoutService.sidebarCollapsed()) {
      this.selectedModule.set(module);
    }
  }

  onSidebarLeave(): void {
    if (this.layoutService.sidebarCollapsed()) {
      this.selectedModule.set(null);
    }
  }

  toggleCollapsed(): void {
    this.layoutService.toggleSidebar();
  }
}
