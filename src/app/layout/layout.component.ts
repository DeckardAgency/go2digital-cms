import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { SidebarComponent } from './sidebar/sidebar.component';
import { LayoutService } from '../core/services/layout.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastModule, SidebarComponent],
  template: `
    <div class="min-h-screen bg-zinc-100 dark:bg-zinc-950">
      <app-sidebar></app-sidebar>

      <div class="transition-all duration-300"
           [class.ml-[70px]]="layoutService.sidebarCollapsed()"
           [class.ml-[280px]]="!layoutService.sidebarCollapsed()">
        <main class="flex-1">
          <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>

      <p-toast position="top-right"></p-toast>
    </div>
  `
})
export class LayoutComponent {
  layoutService = inject(LayoutService);
}
