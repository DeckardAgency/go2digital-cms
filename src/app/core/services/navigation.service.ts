import { Injectable, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

export interface NavModule {
  id: string;
  label: string;
  icon: string;
  route: string;
  children: NavItem[];
  requiredRole?: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  requiredRole?: string;
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
      route: '/homepage',
      children: [
        { id: 'hp-overview', label: 'All Sections', icon: 'pi pi-list', route: '/homepage' },
        { id: 'hp-hero', label: 'Hero', icon: 'pi pi-star', route: '/homepage/hero' },
        { id: 'hp-panels', label: 'Scroll Panels', icon: 'pi pi-arrows-h', route: '/homepage/panels' },
        { id: 'hp-why', label: 'Why Section', icon: 'pi pi-question-circle', route: '/homepage/why-section' },
        { id: 'hp-why-cards', label: 'Why Cards', icon: 'pi pi-th-large', route: '/homepage/why-cards' },
        { id: 'hp-custom-image', label: 'Custom Image', icon: 'pi pi-image', route: '/homepage/custom-image' },
        { id: 'hp-custom-solution', label: 'Custom Solution', icon: 'pi pi-cog', route: '/homepage/custom-solution' },
        { id: 'hp-featured-labs', label: 'Featured Labs', icon: 'pi pi-bolt', route: '/homepage/featured-labs' },
        { id: 'hp-human-focused', label: 'Human Focused', icon: 'pi pi-users', route: '/homepage/human-focused' },
        { id: 'hp-text-animation', label: 'Text Animation', icon: 'pi pi-align-center', route: '/homepage/text-animation' },
        { id: 'hp-billboard', label: 'Billboard', icon: 'pi pi-megaphone', route: '/homepage/billboard' },
        { id: 'hp-analytics', label: 'Analytics', icon: 'pi pi-chart-bar', route: '/homepage/analytics' },
        { id: 'hp-tracking', label: 'Tracking Features', icon: 'pi pi-chart-line', route: '/homepage/tracking' },
        { id: 'hp-rentals', label: 'Rentals Image', icon: 'pi pi-image', route: '/homepage/rentals-image' },
        { id: 'hp-products', label: 'Products', icon: 'pi pi-box', route: '/homepage/products' }
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
      id: 'locations',
      label: 'Locations',
      icon: 'pi pi-map-marker',
      route: '/locations',
      children: [
        { id: 'loc-sync', label: 'Sync & Overview', icon: 'pi pi-sync', route: '/locations' },
        { id: 'loc-cities', label: 'Cities', icon: 'pi pi-building', route: '/locations/cities' },
        { id: 'loc-totems', label: 'Totems', icon: 'pi pi-map', route: '/locations/totems' },
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
      id: 'users',
      label: 'Users',
      icon: 'pi pi-users',
      route: '/users',
      requiredRole: 'ROLE_SUPER_ADMIN',
      children: [
        { id: 'users-list', label: 'All Users', icon: 'pi pi-users', route: '/users' },
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'pi pi-sliders-h',
      route: '/settings/general',
      children: [
        { id: 'settings-general', label: 'General', icon: 'pi pi-cog', route: '/settings/general' },
        { id: 'settings-integrations', label: 'Integrations', icon: 'pi pi-link', route: '/settings/integrations' },
        { id: 'settings-seo', label: 'SEO', icon: 'pi pi-search', route: '/settings/seo' },
        { id: 'settings-translations', label: 'Translations', icon: 'pi pi-language', route: '/settings/translations' },
        { id: 'settings-pdf-layout', label: 'PDF Layout', icon: 'pi pi-file-pdf', route: '/settings/pdf-layout' },
        { id: 'settings-maintenance', label: 'Maintenance', icon: 'pi pi-wrench', route: '/settings/maintenance' },
        { id: 'settings-advanced', label: 'Advanced', icon: 'pi pi-database', route: '/settings/advanced' },
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
