export interface LabProject {
  id: string;
  slug: string;
  featured: boolean;
  status: string;
  categories: LabCategory[];
  image: any;
  translations: {
    hr: { title: string; shortTitle: string; subtitle: string; body: string };
    en: { title: string; shortTitle: string; subtitle: string; body: string };
  };
  // Flat fields (when not using includeTranslations)
  title?: string;
  locale?: string;
}

export interface LabCategory {
  id: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  translations: {
    hr: { name: string };
    en: { name: string };
  };
  name?: string;
}
