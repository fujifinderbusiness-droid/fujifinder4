import { PluginPermission, PluginPermissionDefinition } from '../types/pluginTypes';

export const PERMISSION_DEFINITIONS: Record<PluginPermission, PluginPermissionDefinition> = {
  'articles:read': {
    permission: 'articles:read',
    name: 'Read Articles & Guides',
    category: 'Content',
    riskLevel: 'low',
    description: 'Allows the plugin to read article content, drafts, tags, and editorial metadata.',
  },
  'articles:write': {
    permission: 'articles:write',
    name: 'Write & Edit Articles',
    category: 'Content',
    riskLevel: 'medium',
    description: 'Allows the plugin to create, update, or modify article drafts, blocks, and published guides.',
  },
  'products:read': {
    permission: 'products:read',
    name: 'Read Camera Catalog',
    category: 'Products',
    riskLevel: 'low',
    description: 'Allows access to camera specifications, pricing, reviews, and test lab metrics.',
  },
  'products:write': {
    permission: 'products:write',
    name: 'Modify Camera Catalog',
    category: 'Products',
    riskLevel: 'medium',
    description: 'Allows the plugin to edit camera specs, pricing details, or add new gear entries.',
  },
  'affiliates:read': {
    permission: 'affiliates:read',
    name: 'Read Affiliate Links',
    category: 'Monetization',
    riskLevel: 'low',
    description: 'Access to merchant partner links, referral rates, and click performance records.',
  },
  'affiliates:write': {
    permission: 'affiliates:write',
    name: 'Manage Affiliate Links',
    category: 'Monetization',
    riskLevel: 'high',
    description: 'Allows modifying affiliate link URLs, redirection rules, and retailer mappings.',
  },
  'media:read': {
    permission: 'media:read',
    name: 'Read Media Assets',
    category: 'Media',
    riskLevel: 'low',
    description: 'Allows viewing uploaded sample images, camera photos, and cover art.',
  },
  'media:write': {
    permission: 'media:write',
    name: 'Upload & Modify Media',
    category: 'Media',
    riskLevel: 'medium',
    description: 'Allows compressing images, uploading optimized formats (WebP/AVIF), and managing alt text.',
  },
  'analytics:read': {
    permission: 'analytics:read',
    name: 'Access Traffic & Analytics',
    category: 'Analytics',
    riskLevel: 'low',
    description: 'View real-time pageviews, referral paths, reader dwell times, and gear interest trends.',
  },
  'analytics:write': {
    permission: 'analytics:write',
    name: 'Record Custom Analytics',
    category: 'Analytics',
    riskLevel: 'low',
    description: 'Allows logging custom conversion events, affiliate redirects, and user engagement metrics.',
  },
  'settings:read': {
    permission: 'settings:read',
    name: 'Read Site Settings',
    category: 'System',
    riskLevel: 'low',
    description: 'View site name, brand metadata, navigation menus, and public SEO defaults.',
  },
  'settings:write': {
    permission: 'settings:write',
    name: 'Modify Site Settings',
    category: 'System',
    riskLevel: 'high',
    description: 'Allows changing platform configuration, analytics keys, and global SEO parameters.',
  },
  'external_api': {
    permission: 'external_api',
    name: 'External Network Requests',
    category: 'Network',
    riskLevel: 'medium',
    description: 'Allows fetching data from external services (e.g. social APIs, price monitoring, CDN).',
  },
  'database': {
    permission: 'database',
    name: 'Direct Storage Access',
    category: 'Storage',
    riskLevel: 'high',
    description: 'Allows managing isolated plugin state and data collections in the local database.',
  },
  'frontend_injection': {
    permission: 'frontend_injection',
    name: 'Frontend Component Injection',
    category: 'UI Extension',
    riskLevel: 'medium',
    description: 'Allows rendering UI elements (e.g. floating share bar, announcement banners) on public pages.',
  },
  'editor_extension': {
    permission: 'editor_extension',
    name: 'Article Editor Extensions',
    category: 'UI Extension',
    riskLevel: 'low',
    description: 'Enriches the CMS article editor with custom sidebars, validation tools, and preview panels.',
  },
  'dashboard_widget': {
    permission: 'dashboard_widget',
    name: 'Dashboard Overview Widgets',
    category: 'UI Extension',
    riskLevel: 'low',
    description: 'Allows registering informative cards and charts inside the main Admin Dashboard overview.',
  },
};

export function getPermissionDefinition(perm: PluginPermission): PluginPermissionDefinition {
  return PERMISSION_DEFINITIONS[perm] || {
    permission: perm,
    name: perm,
    category: 'General',
    riskLevel: 'low',
    description: `Grants access to ${perm} capabilities.`,
  };
}
