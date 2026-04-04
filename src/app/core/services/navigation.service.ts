import { Injectable, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

export interface NavModule {
  id: string;
  label: string;
  icon: string;
  route: string;
  children: NavItem[];
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
}

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private _currentUrl = signal('/');
  private _activeModuleId = signal<string | null>(null);

  readonly currentUrl = this._currentUrl.asReadonly();
  readonly activeModuleId = this._activeModuleId.asReadonly();

  readonly modules: NavModule[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'pi pi-home',
      route: '/dashboard',
      children: [
        { id: 'dashboard-overview', label: 'Overview', icon: 'pi pi-chart-bar', route: '/dashboard' }
      ]
    },
    {
      id: 'content',
      label: 'Content',
      icon: 'pi pi-file-edit',
      route: '/blog/posts',
      children: [
        { id: 'blog-posts', label: 'Blog Posts', icon: 'pi pi-file', route: '/blog/posts' },
        { id: 'blog-categories', label: 'Blog Categories', icon: 'pi pi-tags', route: '/blog/categories' },
        { id: 'lab-projects', label: 'Lab Projects', icon: 'pi pi-box', route: '/lab/projects' },
        { id: 'lab-categories', label: 'Lab Categories', icon: 'pi pi-tags', route: '/lab/categories' },
        { id: 'pages', label: 'Pages', icon: 'pi pi-file', route: '/pages' }
      ]
    },
    {
      id: 'homepage',
      label: 'Homepage',
      icon: 'pi pi-desktop',
      route: '/homepage/hero',
      children: [
        { id: 'hp-hero', label: 'Hero', icon: 'pi pi-star', route: '/homepage/hero' },
        { id: 'hp-panels', label: 'Panels', icon: 'pi pi-images', route: '/homepage/panels' },
        { id: 'hp-why', label: 'Why Section', icon: 'pi pi-question-circle', route: '/homepage/why-section' },
        { id: 'hp-custom-solution', label: 'Custom Solution', icon: 'pi pi-cog', route: '/homepage/custom-solution' },
        { id: 'hp-featured-labs', label: 'Featured Labs', icon: 'pi pi-bolt', route: '/homepage/featured-labs' },
        { id: 'hp-billboard', label: 'Billboard', icon: 'pi pi-image', route: '/homepage/billboard' },
        { id: 'hp-tracking', label: 'Tracking Features', icon: 'pi pi-chart-line', route: '/homepage/tracking' },
        { id: 'hp-products', label: 'Products', icon: 'pi pi-th-large', route: '/homepage/products' }
      ]
    },
    {
      id: 'esg',
      label: 'ESG',
      icon: 'pi pi-globe',
      route: '/esg/page-content',
      children: [
        { id: 'esg-content', label: 'Page Content', icon: 'pi pi-file-edit', route: '/esg/page-content' },
        { id: 'esg-pillars', label: 'Pillars', icon: 'pi pi-building', route: '/esg/pillars' },
        { id: 'esg-cards', label: 'Cards', icon: 'pi pi-id-card', route: '/esg/cards' },
        { id: 'esg-badges', label: 'Vision Badges', icon: 'pi pi-eye', route: '/esg/badges' }
      ]
    },
    {
      id: 'site',
      label: 'Site',
      icon: 'pi pi-cog',
      route: '/navigation',
      children: [
        { id: 'navigation', label: 'Navigation', icon: 'pi pi-bars', route: '/navigation' },
        { id: 'team', label: 'Team Members', icon: 'pi pi-users', route: '/team' },
        { id: 'contact-info', label: 'Contact Info', icon: 'pi pi-envelope', route: '/contact/info' },
        { id: 'social-links', label: 'Social Links', icon: 'pi pi-share-alt', route: '/contact/social' }
      ]
    },
    {
      id: 'media',
      label: 'Media',
      icon: 'pi pi-image',
      route: '/media',
      children: [
        { id: 'media-library', label: 'Media Library', icon: 'pi pi-images', route: '/media' },
        { id: 'files', label: 'Files', icon: 'pi pi-folder', route: '/files' }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'pi pi-sliders-h',
      route: '/settings',
      children: [
        { id: 'site-settings', label: 'Site Settings', icon: 'pi pi-sliders-h', route: '/settings' }
      ]
    }
  ];

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this._currentUrl.set(event.urlAfterRedirects);
    });
  }

  isModuleActive(module: NavModule): boolean {
    const url = this._currentUrl();
    return module.children.some(child => url.startsWith(child.route));
  }

  isItemActive(item: NavItem): boolean {
    return this._currentUrl() === item.route || this._currentUrl().startsWith(item.route + '/');
  }

  setActiveModule(moduleId: string | null): void {
    this._activeModuleId.set(moduleId);
  }
}
