import React from 'react';

export type PluginCategory =
  | 'SEO'
  | 'Analytics'
  | 'Affiliate Marketing'
  | 'Content'
  | 'Social Media'
  | 'Email Marketing'
  | 'Performance'
  | 'Security'
  | 'Image Optimization'
  | 'AI Tools'
  | 'Monetization'
  | 'Forms'
  | 'Utilities';

export type PluginPermission =
  | 'articles:read'
  | 'articles:write'
  | 'products:read'
  | 'products:write'
  | 'affiliates:read'
  | 'affiliates:write'
  | 'media:read'
  | 'media:write'
  | 'analytics:read'
  | 'analytics:write'
  | 'settings:read'
  | 'settings:write'
  | 'external_api'
  | 'database'
  | 'frontend_injection'
  | 'editor_extension'
  | 'dashboard_widget';

export interface PluginSettingOption {
  label: string;
  value: string | number;
}

export interface PluginSettingField {
  id: string;
  label: string;
  description?: string;
  type: 'text' | 'number' | 'password' | 'toggle' | 'select' | 'multiselect' | 'color' | 'url' | 'textarea' | 'range';
  defaultValue: any;
  options?: PluginSettingOption[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  sensitive?: boolean; // For API keys or secrets
}

export interface PluginAuthor {
  name: string;
  url?: string;
  email?: string;
  verified?: boolean;
}

export interface PluginChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: PluginAuthor;
  description: string;
  detailedDescription?: string;
  icon: string; // Icon identifier (e.g. 'search', 'bar-chart', 'link', 'image', 'share-2', 'shield', 'sparkles', 'zap')
  category: PluginCategory;
  compatibility: {
    minAppVersion: string;
    testedUpTo: string;
  };
  requiredDependencies?: string[];
  permissions: PluginPermission[];
  entryPoints: {
    hasDashboardWidget?: boolean;
    hasAdminPage?: boolean;
    hasEditorExtension?: boolean;
    hasFrontendComponent?: boolean;
    hooks?: string[];
  };
  settingsSchema: PluginSettingField[];
  features: string[];
  changelog: PluginChangelogEntry[];
  tags: string[];
  rating: number; // e.g. 4.9
  reviewsCount: number;
  downloadsCount: number;
  isOfficial?: boolean;
  downloadUrl?: string;
  lastUpdated?: string;
}

export type PluginStatus = 'active' | 'inactive' | 'error' | 'incompatible' | 'updating';

export interface PluginBackupData {
  version: string;
  settings: Record<string, any>;
  timestamp: string;
}

export interface InstalledPlugin {
  manifest: PluginManifest;
  status: PluginStatus;
  installedAt: string;
  updatedAt: string;
  settings: Record<string, any>;
  approvedPermissions: PluginPermission[];
  errorDetails?: string;
  backupData?: PluginBackupData;
  source: 'marketplace' | 'upload' | 'local';
}

export type PluginActionType =
  | 'install'
  | 'activate'
  | 'deactivate'
  | 'update'
  | 'rollback'
  | 'uninstall'
  | 'settings_update'
  | 'error'
  | 'permission_approved';

export interface PluginActivityLog {
  id: string;
  timestamp: string;
  pluginId: string;
  pluginName: string;
  action: PluginActionType;
  details: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  userEmail?: string;
}

export interface PluginPermissionDefinition {
  permission: PluginPermission;
  name: string;
  category: string;
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
}
