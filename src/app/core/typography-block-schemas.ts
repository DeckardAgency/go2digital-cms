export interface BlockElement {
  key: string;
  label: string;
  defaultSlug: string;
}

export interface BlockSchema {
  id: string;
  label: string;
  elements: BlockElement[];
}

export const BLOCK_SCHEMAS: BlockSchema[] = [
  {
    id: 'panels',
    label: 'Horizontal Scroll Panels',
    elements: [
      { key: 'title', label: 'Panel Title', defaultSlug: 'panel-title' },
      { key: 'tag', label: 'Tag', defaultSlug: 'eyebrow' },
      { key: 'description', label: 'Description', defaultSlug: 'body' },
      { key: 'statValue', label: 'Stat Value', defaultSlug: 'panel-stat' },
      { key: 'scrollLabel', label: 'Scroll Label', defaultSlug: 'eyebrow' },
    ],
  },
  {
    id: 'tracking',
    label: 'Tracking Features',
    elements: [
      { key: 'title', label: 'Section Title', defaultSlug: 'tracking-title' },
      { key: 'number', label: 'Number', defaultSlug: 'number-lg' },
      { key: 'feature', label: 'Feature Title', defaultSlug: 'feature-title' },
      { key: 'description', label: 'Description', defaultSlug: 'body' },
    ],
  },
  {
    id: 'featured-labs',
    label: 'Featured Labs',
    elements: [
      { key: 'label', label: 'Label', defaultSlug: 'eyebrow-tight' },
      { key: 'title', label: 'Section Title', defaultSlug: 'featured-labs-title' },
      { key: 'count', label: 'Count', defaultSlug: 'number-responsive' },
      { key: 'text', label: 'Description', defaultSlug: 'body-sm' },
      { key: 'cardTitle', label: 'Card Title', defaultSlug: 'card-title' },
      { key: 'cardDescription', label: 'Card Description', defaultSlug: 'body-sm' },
      { key: 'cardTag', label: 'Card Tag', defaultSlug: 'card-tag' },
    ],
  },
  {
    id: 'possibilities',
    label: 'Possibilities',
    elements: [
      { key: 'label', label: 'Label', defaultSlug: 'eyebrow' },
      { key: 'subtitle', label: 'Subtitle', defaultSlug: 'eyebrow' },
      { key: 'counter', label: 'Counter', defaultSlug: 'number-lg' },
      { key: 'item', label: 'List Item', defaultSlug: 'possibilities-item' },
      { key: 'description', label: 'Description', defaultSlug: 'body-xs' },
    ],
  },
  {
    id: 'products',
    label: 'Products (Cube)',
    elements: [
      { key: 'title', label: 'Title', defaultSlug: 'cube-title' },
      { key: 'number', label: 'Number', defaultSlug: 'cube-number' },
      { key: 'badge', label: 'Badge', defaultSlug: 'eyebrow-tight' },
      { key: 'specsTitle', label: 'Specs Title', defaultSlug: 'card-title' },
      { key: 'specLabel', label: 'Spec Label', defaultSlug: 'body-sm' },
      { key: 'specValue', label: 'Spec Value', defaultSlug: 'body-sm' },
      { key: 'descIndicator', label: 'Description Indicator', defaultSlug: 'eyebrow-tight' },
      { key: 'descTitle', label: 'Description Title', defaultSlug: 'display-md' },
    ],
  },
  {
    id: 'interactive-display',
    label: 'Interactive Display',
    elements: [
      { key: 'title', label: 'Title', defaultSlug: 'cube-title' },
      { key: 'number', label: 'Number', defaultSlug: 'cube-number' },
      { key: 'badge', label: 'Badge', defaultSlug: 'eyebrow-tight' },
      { key: 'specsTitle', label: 'Specs Title', defaultSlug: 'card-title' },
      { key: 'specLabel', label: 'Spec Label', defaultSlug: 'body-sm' },
      { key: 'specValue', label: 'Spec Value', defaultSlug: 'body-sm' },
    ],
  },
  {
    id: 'interactive-description',
    label: 'Interactive Description',
    elements: [
      { key: 'indicator', label: 'Indicator', defaultSlug: 'eyebrow-tight' },
      { key: 'title', label: 'Title', defaultSlug: 'display-md' },
    ],
  },
  {
    id: 'blog-list',
    label: 'Blog — List Page',
    elements: [
      { key: 'pageTitle', label: 'Page Title', defaultSlug: 'hero-title' },
      { key: 'count', label: 'Article Count', defaultSlug: 'body-sm' },
      { key: 'filter', label: 'Filter Button', defaultSlug: 'label-micro' },
      { key: 'cardTitle', label: 'Card Title', defaultSlug: 'card-title' },
      { key: 'cardMeta', label: 'Card Metadata', defaultSlug: 'body-xs' },
      { key: 'cardCategory', label: 'Card Category', defaultSlug: 'label-micro' },
      { key: 'emptyTitle', label: 'Empty State Title', defaultSlug: 'section-title' },
      { key: 'emptyText', label: 'Empty State Body', defaultSlug: 'body' },
    ],
  },
  {
    id: 'blog-detail',
    label: 'Blog — Post Detail',
    elements: [
      { key: 'heroTitle', label: 'Hero Title', defaultSlug: 'hero-heading' },
      { key: 'specLabel', label: 'Spec Label', defaultSlug: 'label-micro' },
      { key: 'specValue', label: 'Spec Value', defaultSlug: 'body' },
      { key: 'actionButton', label: 'Action Button', defaultSlug: 'body-sm' },
      { key: 'contentHeading', label: 'Content Heading', defaultSlug: 'section-title' },
      { key: 'contentBody', label: 'Content Body', defaultSlug: 'body' },
    ],
  },
  {
    id: 'lab-list',
    label: 'Lab — List Page',
    elements: [
      { key: 'label', label: 'Breadcrumb Label', defaultSlug: 'eyebrow' },
      { key: 'intro', label: 'Intro Text', defaultSlug: 'hero-heading' },
      { key: 'filter', label: 'Filter Button', defaultSlug: 'label-micro' },
      { key: 'pageTitle', label: 'Page Title', defaultSlug: 'display-huge' },
      { key: 'count', label: 'Project Count', defaultSlug: 'body-sm' },
      { key: 'cardTitle', label: 'Card Title', defaultSlug: 'card-title' },
      { key: 'cardDescription', label: 'Card Description', defaultSlug: 'body' },
      { key: 'cardTag', label: 'Card Tag', defaultSlug: 'body-sm' },
      { key: 'emptyText', label: 'Empty State', defaultSlug: 'body' },
    ],
  },
  {
    id: 'lab-detail',
    label: 'Lab — Project Detail',
    elements: [
      { key: 'heroTitle', label: 'Hero Title', defaultSlug: 'hero-heading' },
      { key: 'specLabel', label: 'Spec Label', defaultSlug: 'label-micro' },
      { key: 'specValue', label: 'Spec Value', defaultSlug: 'body' },
      { key: 'actionButton', label: 'Action Button', defaultSlug: 'body-sm' },
      { key: 'introLabel', label: 'Intro Label', defaultSlug: 'eyebrow' },
      { key: 'introBody', label: 'Intro Body', defaultSlug: 'body-lg-static' },
      { key: 'sectionLabel', label: 'Section Label', defaultSlug: 'eyebrow' },
      { key: 'sectionTitle', label: 'Section Title', defaultSlug: 'section-title' },
      { key: 'sectionContent', label: 'Section Content', defaultSlug: 'body' },
    ],
  },
  {
    id: 'esg',
    label: 'ESG Page',
    elements: [
      { key: 'displayTitle', label: 'Display Title', defaultSlug: 'display-huge' },
      { key: 'label', label: 'Hero Label', defaultSlug: 'eyebrow' },
      { key: 'introSmall', label: 'Intro Small', defaultSlug: 'body' },
      { key: 'introLarge', label: 'Intro Large', defaultSlug: 'body-lg' },
      { key: 'actionLink', label: 'Action Link', defaultSlug: 'body' },
      { key: 'pillarNumber', label: 'Pillar Number', defaultSlug: 'number-responsive' },
      { key: 'pillarTitle', label: 'Pillar Title', defaultSlug: 'section-title' },
      { key: 'pillarDesc', label: 'Pillar Description', defaultSlug: 'body' },
      { key: 'cardText', label: 'Card Text', defaultSlug: 'body' },
      { key: 'visionTitle', label: 'Vision Title', defaultSlug: 'section-title' },
      { key: 'diagramBadge', label: 'Diagram Badge', defaultSlug: 'label-micro' },
      { key: 'diagramTitle', label: 'Diagram Title', defaultSlug: 'body' },
      { key: 'diagramDesc', label: 'Diagram Description', defaultSlug: 'body-sm' },
      { key: 'scrollHint', label: 'Scroll Hint', defaultSlug: 'eyebrow-tight' },
    ],
  },
  {
    id: 'team',
    label: 'Team Page',
    elements: [
      { key: 'heroTitle', label: 'Hero Title', defaultSlug: 'display-xl' },
    ],
  },
  {
    id: 'contact',
    label: 'Contact Page',
    elements: [
      { key: 'headerTime', label: 'Header Time', defaultSlug: 'display-stat' },
      { key: 'headerDate', label: 'Header Date', defaultSlug: 'display-stat' },
      { key: 'temperature', label: 'Temperature', defaultSlug: 'display-stat' },
      { key: 'weatherDesc', label: 'Weather Description', defaultSlug: 'body' },
      { key: 'batteryText', label: 'Battery Text', defaultSlug: 'body' },
      { key: 'batteryPercent', label: 'Battery Percent', defaultSlug: 'body-sm' },
    ],
  },
];

export function getBlockSchema(blockId: string): BlockSchema | undefined {
  return BLOCK_SCHEMAS.find(s => s.id === blockId);
}
