export interface BlogPost {
  id: string;
  slug: string;
  date: string;
  author: string;
  featured: boolean;
  status: string;
  category: BlogCategory | null;
  image: any;
  translations: {
    hr: { title: string; excerpt: string; body: string };
    en: { title: string; excerpt: string; body: string };
  };
  // Flat fields (when not using includeTranslations)
  title?: string;
  locale?: string;
}

export interface BlogCategory {
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
