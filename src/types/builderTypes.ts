export type Breakpoint = 'desktop' | 'tablet' | 'mobile';

export type WidgetCategory =
  | 'layout'
  | 'content'
  | 'gear'
  | 'marketing'
  | 'plugins'
  | 'advanced';

export type WidgetType =
  // Layout & Structure
  | 'hero'
  | 'header'
  | 'navigation'
  | 'container'
  | 'divider'
  | 'spacer'
  | 'footer'
  // Editorial & Content
  | 'featured-articles'
  | 'article-grid'
  | 'article-list'
  | 'latest-articles'
  | 'popular-articles'
  | 'related-articles'
  | 'text'
  | 'rich-text'
  | 'image'
  | 'video'
  | 'button'
  | 'search-bar'
  | 'author-profile'
  // Gear & Products
  | 'product-cards'
  | 'camera-comparison'
  | 'product-recommendation'
  | 'affiliate-product-cta'
  | 'review-rating'
  // Marketing & Engagement
  | 'category-cards'
  | 'newsletter-signup'
  | 'social-links'
  | 'advertisement-block'
  // Advanced & Plugins
  | 'custom-html'
  | 'plugin-widget';

export interface ResponsiveValue<T> {
  desktop: T;
  tablet?: T;
  mobile?: T;
}

export interface BoxSpacing {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface BlockStyle {
  margin?: ResponsiveValue<BoxSpacing>;
  padding?: ResponsiveValue<BoxSpacing>;
  backgroundColor?: string;
  textColor?: string;
  maxWidth?: string; // 'full' | '1440px' | '1280px' | '1140px' | '960px' | '768px'
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  boxShadow?: 'none' | 'subtle' | 'medium' | 'elevation' | 'border-only';
  textAlign?: 'left' | 'center' | 'right';
  gap?: number;
  columns?: ResponsiveValue<number>;
  minHeight?: number;
  backgroundImage?: string;
  backgroundOverlay?: number; // 0 to 1 opacity
  customCss?: string;
}

export interface BlockVisibility {
  desktop: boolean;
  tablet: boolean;
  mobile: boolean;
}

export interface BuilderBlock {
  id: string;
  type: WidgetType;
  label: string;
  pluginWidgetId?: string; // If type === 'plugin-widget'
  content: Record<string, any>;
  style: BlockStyle;
  visibility: BlockVisibility;
  customId?: string;
  customClass?: string;
}

export interface SectionStyle {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundOverlay?: number; // 0 to 1
  paddingY?: ResponsiveValue<number>;
  fullWidth?: boolean;
  borderTop?: boolean;
  borderBottom?: boolean;
  borderColor?: string;
  minHeight?: number;
}

export interface BuilderSection {
  id: string;
  name: string;
  isReusable?: boolean;
  reusableSourceId?: string;
  visibility: BlockVisibility;
  style: SectionStyle;
  blocks: BuilderBlock[];
}

export type PageType =
  | 'landing'
  | 'blog'
  | 'category'
  | 'product'
  | 'article'
  | 'comparison'
  | 'custom';

export type PageStatus = 'published' | 'draft';

export interface BuilderPage {
  id: string;
  slug: string;
  title: string;
  description?: string;
  type: PageType;
  status: PageStatus;
  lastModified: string;
  publishedAt?: string;
  author: string;
  sections: BuilderSection[];
  isDefaultCorePage?: boolean;
  useBuilderLayout?: boolean; // When true, renders builder output instead of hardcoded JSX
}

export interface BuilderRevision {
  id: string;
  pageId: string;
  timestamp: string;
  author: string;
  description: string;
  sections: BuilderSection[];
}

export interface ReusableSection {
  id: string;
  title: string;
  category: string;
  section: BuilderSection;
  createdAt: string;
}

export interface BuilderTemplate {
  id: string;
  title: string;
  description: string;
  category: 'landing' | 'blog' | 'review' | 'comparison' | 'affiliate' | 'custom';
  thumbnailUrl: string;
  sections: BuilderSection[];
}

export interface GlobalDesignColors {
  primary: string; // e.g. '#1A1A1A'
  accent: string; // e.g. '#C62828'
  background: string; // e.g. '#FDFCFB'
  cardBackground: string; // e.g. '#FFFFFF'
  textPrimary: string; // e.g. '#1A1A1A'
  textMuted: string; // e.g. '#666666'
  border: string; // e.g. '#EEEBE6'
  badgeBackground: string; // e.g. '#FAF9F6'
}

export interface GlobalDesignTypography {
  headingFont: 'Playfair Display' | 'Cinzel' | 'Merriweather' | 'Plus Jakarta Sans' | 'System Serif';
  bodyFont: 'Plus Jakarta Sans' | 'Inter' | 'System Sans' | 'Georgia';
  baseFontSize: number; // 14, 15, 16, 17, 18
  scaleRatio: number; // 1.125, 1.2, 1.25, 1.333
  headingWeight: 'normal' | 'medium' | 'semibold' | 'bold';
}

export interface GlobalDesignButtons {
  style: 'editorial-flat' | 'rounded-pill' | 'minimal-outline' | 'subtle-bevel';
  borderRadius: number; // 0, 4, 8, 9999
  paddingPreset: 'compact' | 'normal' | 'spacious';
  uppercase: boolean;
  letterSpacing: 'normal' | 'wide' | 'wider';
}

export interface GlobalDesignCards {
  borderRadius: number; // 0, 4, 8, 12, 16
  shadow: 'none' | 'subtle' | 'elevation' | 'border-only';
  containerMaxWidth: '1140px' | '1280px' | '1440px' | 'full';
  borderStyle: 'solid' | 'subtle' | 'none';
}

export interface GlobalDesignHeader {
  style: 'editorial-classic' | 'minimalist-center' | 'compact-sticky';
  transparentOnTop: boolean;
  showCategoryNav: boolean;
}

export interface GlobalDesignFooter {
  theme: 'dark' | 'light' | 'editorial';
  showNewsletter: boolean;
  showSocialIcons: boolean;
  copyrightText: string;
}

export interface GlobalDesignSystem {
  enabled: boolean;
  colors: GlobalDesignColors;
  typography: GlobalDesignTypography;
  buttons: GlobalDesignButtons;
  cards: GlobalDesignCards;
  header: GlobalDesignHeader;
  footer: GlobalDesignFooter;
}

export interface PluginBuilderWidgetDef {
  id: string;
  pluginId: string;
  name: string;
  description: string;
  iconName: string; // Lucide icon identifier
  category: WidgetCategory;
  defaultContent: Record<string, any>;
  defaultStyle?: Partial<BlockStyle>;
}
