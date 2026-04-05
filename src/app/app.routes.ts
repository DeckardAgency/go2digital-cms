import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      // Blog
      { path: 'blog/posts', loadComponent: () => import('./features/blog/posts/blog-post-list.component').then(m => m.BlogPostListComponent) },
      { path: 'blog/posts/new', loadComponent: () => import('./features/blog/posts/blog-post-form.component').then(m => m.BlogPostFormComponent) },
      { path: 'blog/posts/:id', loadComponent: () => import('./features/blog/posts/blog-post-form.component').then(m => m.BlogPostFormComponent) },
      { path: 'blog/categories', loadComponent: () => import('./features/blog/categories/blog-category-list.component').then(m => m.BlogCategoryListComponent) },
      { path: 'blog/categories/new', loadComponent: () => import('./features/blog/categories/blog-category-form.component').then(m => m.BlogCategoryFormComponent) },
      { path: 'blog/categories/:id', loadComponent: () => import('./features/blog/categories/blog-category-form.component').then(m => m.BlogCategoryFormComponent) },
      // Lab
      { path: 'lab/projects', loadComponent: () => import('./features/lab/projects/lab-project-list.component').then(m => m.LabProjectListComponent) },
      { path: 'lab/projects/new', loadComponent: () => import('./features/lab/projects/lab-project-form.component').then(m => m.LabProjectFormComponent) },
      { path: 'lab/projects/:id', loadComponent: () => import('./features/lab/projects/lab-project-form.component').then(m => m.LabProjectFormComponent) },
      { path: 'lab/categories', loadComponent: () => import('./features/lab/categories/lab-category-list.component').then(m => m.LabCategoryListComponent) },
      { path: 'lab/categories/new', loadComponent: () => import('./features/lab/categories/lab-category-form.component').then(m => m.LabCategoryFormComponent) },
      { path: 'lab/categories/:id', loadComponent: () => import('./features/lab/categories/lab-category-form.component').then(m => m.LabCategoryFormComponent) },
      // Homepage
      { path: 'homepage', loadComponent: () => import('./features/homepage/homepage-overview.component').then(m => m.HomepageOverviewComponent) },
      { path: 'homepage/hero', loadComponent: () => import('./features/homepage/hero-editor.component').then(m => m.HeroEditorComponent) },
      { path: 'homepage/custom-solution', loadComponent: () => import('./features/homepage/custom-solution-editor.component').then(m => m.CustomSolutionEditorComponent) },
      { path: 'homepage/human-focused', loadComponent: () => import('./features/homepage/human-focused-editor.component').then(m => m.HumanFocusedEditorComponent) },
      { path: 'homepage/text-animation', loadComponent: () => import('./features/homepage/text-animation-editor.component').then(m => m.TextAnimationEditorComponent) },
      { path: 'homepage/billboard', loadComponent: () => import('./features/homepage/billboard-editor.component').then(m => m.BillboardEditorComponent) },
      { path: 'homepage/why-section', loadComponent: () => import('./features/homepage/why-section-editor.component').then(m => m.WhySectionEditorComponent) },
      { path: 'homepage/custom-image', loadComponent: () => import('./features/homepage/custom-image-editor.component').then(m => m.CustomImageEditorComponent) },
      { path: 'homepage/rentals-image', loadComponent: () => import('./features/homepage/rentals-image-editor.component').then(m => m.RentalsImageEditorComponent) },
      // Homepage — Panels
      { path: 'homepage/panels', loadComponent: () => import('./features/homepage/panels/panel-list.component').then(m => m.PanelListComponent) },
      { path: 'homepage/panels/new', loadComponent: () => import('./features/homepage/panels/panel-form.component').then(m => m.PanelFormComponent) },
      { path: 'homepage/panels/:id', loadComponent: () => import('./features/homepage/panels/panel-form.component').then(m => m.PanelFormComponent) },
      // Homepage — Why Cards
      { path: 'homepage/why-cards', loadComponent: () => import('./features/homepage/why-cards/why-card-list.component').then(m => m.WhyCardListComponent) },
      { path: 'homepage/why-cards/new', loadComponent: () => import('./features/homepage/why-cards/why-card-form.component').then(m => m.WhyCardFormComponent) },
      { path: 'homepage/why-cards/:id', loadComponent: () => import('./features/homepage/why-cards/why-card-form.component').then(m => m.WhyCardFormComponent) },
      // Homepage — Tracking Features
      { path: 'homepage/tracking', loadComponent: () => import('./features/homepage/tracking/tracking-list.component').then(m => m.TrackingListComponent) },
      { path: 'homepage/tracking/new', loadComponent: () => import('./features/homepage/tracking/tracking-form.component').then(m => m.TrackingFormComponent) },
      { path: 'homepage/tracking/:id', loadComponent: () => import('./features/homepage/tracking/tracking-form.component').then(m => m.TrackingFormComponent) },
      // Homepage — Featured Labs Configuration
      { path: 'homepage/featured-labs', loadComponent: () => import('./features/homepage/featured-labs/featured-labs-config.component').then(m => m.FeaturedLabsConfigComponent) },
      // Homepage — Products
      { path: 'homepage/products', loadComponent: () => import('./features/homepage/products/product-list.component').then(m => m.ProductListComponent) },
      { path: 'homepage/products/new', loadComponent: () => import('./features/homepage/products/product-form.component').then(m => m.ProductFormComponent) },
      { path: 'homepage/products/:id', loadComponent: () => import('./features/homepage/products/product-form.component').then(m => m.ProductFormComponent) },
      // ESG
      { path: 'esg/page-content', loadComponent: () => import('./features/esg/page-content.component').then(m => m.EsgPageContentComponent) },
      { path: 'esg/pillars', loadComponent: () => import('./features/esg/pillars/pillar-list.component').then(m => m.PillarListComponent) },
      { path: 'esg/pillars/new', loadComponent: () => import('./features/esg/pillars/pillar-form.component').then(m => m.PillarFormComponent) },
      { path: 'esg/pillars/:id', loadComponent: () => import('./features/esg/pillars/pillar-form.component').then(m => m.PillarFormComponent) },
      { path: 'esg/cards', loadComponent: () => import('./features/esg/cards/card-list.component').then(m => m.CardListComponent) },
      { path: 'esg/cards/new', loadComponent: () => import('./features/esg/cards/card-form.component').then(m => m.CardFormComponent) },
      { path: 'esg/cards/:id', loadComponent: () => import('./features/esg/cards/card-form.component').then(m => m.CardFormComponent) },
      { path: 'esg/badges', loadComponent: () => import('./features/esg/badges/badge-list.component').then(m => m.BadgeListComponent) },
      { path: 'esg/badges/new', loadComponent: () => import('./features/esg/badges/badge-form.component').then(m => m.BadgeFormComponent) },
      { path: 'esg/badges/:id', loadComponent: () => import('./features/esg/badges/badge-form.component').then(m => m.BadgeFormComponent) },
      // Locations
      { path: 'locations', loadComponent: () => import('./features/locations/sync-page.component').then(m => m.SyncPageComponent) },
      { path: 'locations/cities', loadComponent: () => import('./features/locations/cities/city-list.component').then(m => m.CityListComponent) },
      { path: 'locations/totems', loadComponent: () => import('./features/locations/totems/totem-list.component').then(m => m.TotemListComponent) },
      { path: 'locations/totems/:id', loadComponent: () => import('./features/locations/totems/totem-form.component').then(m => m.TotemFormComponent) },
      // Pages
      { path: 'pages', loadComponent: () => import('./features/pages/page-list.component').then(m => m.PageListComponent) },
      { path: 'pages/new', loadComponent: () => import('./features/pages/page-form.component').then(m => m.PageFormComponent) },
      { path: 'pages/:id', loadComponent: () => import('./features/pages/page-form.component').then(m => m.PageFormComponent) },
      // Navigation
      { path: 'navigation', loadComponent: () => import('./features/navigation/nav-item-list.component').then(m => m.NavItemListComponent) },
      { path: 'navigation/new', loadComponent: () => import('./features/navigation/nav-item-form.component').then(m => m.NavItemFormComponent) },
      { path: 'navigation/:id', loadComponent: () => import('./features/navigation/nav-item-form.component').then(m => m.NavItemFormComponent) },
      // Team
      { path: 'team', loadComponent: () => import('./features/team/team-list.component').then(m => m.TeamListComponent) },
      { path: 'team/new', loadComponent: () => import('./features/team/team-form.component').then(m => m.TeamFormComponent) },
      { path: 'team/:id', loadComponent: () => import('./features/team/team-form.component').then(m => m.TeamFormComponent) },
      // Media
      { path: 'media', loadComponent: () => import('./features/media/media-page.component').then(m => m.MediaPageComponent) },
      // Files
      { path: 'files', loadComponent: () => import('./features/files/files-page.component').then(m => m.FilesPageComponent) },
      // Settings
      { path: 'settings', redirectTo: 'settings/general', pathMatch: 'full' },
      { path: 'settings/:section', loadComponent: () => import('./features/settings/settings-page.component').then(m => m.SettingsPageComponent) },
      // Contact
      { path: 'contact/info', loadComponent: () => import('./features/contact/contact-info-list.component').then(m => m.ContactInfoListComponent) },
      { path: 'contact/info/new', loadComponent: () => import('./features/contact/contact-info-form.component').then(m => m.ContactInfoFormComponent) },
      { path: 'contact/info/:id', loadComponent: () => import('./features/contact/contact-info-form.component').then(m => m.ContactInfoFormComponent) },
      { path: 'contact/social', loadComponent: () => import('./features/contact/social-link-list.component').then(m => m.SocialLinkListComponent) },
      { path: 'contact/social/new', loadComponent: () => import('./features/contact/social-link-form.component').then(m => m.SocialLinkFormComponent) },
      { path: 'contact/social/:id', loadComponent: () => import('./features/contact/social-link-form.component').then(m => m.SocialLinkFormComponent) },
    ]
  },
  { path: '**', redirectTo: '' }
];
