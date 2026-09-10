import { PluginManifest, PluginCategory } from '../types/pluginTypes';
import { MARKETPLACE_CATALOG, CORE_APP_VERSION } from './marketplaceCatalog';

/**
 * Extensible Plugin Marketplace Interface
 * Allows FujiFinder to query plugins from local registry or remote API.
 */
export interface IPluginMarketplaceProvider {
  fetchPlugins(options?: { category?: PluginCategory | 'All'; search?: string }): Promise<PluginManifest[]>;
  fetchPluginById(id: string): Promise<PluginManifest | null>;
  checkForUpdates(installedList: { id: string; version: string }[]): Promise<{
    pluginId: string;
    currentVersion: string;
    latestManifest: PluginManifest;
  }[]>;
  validatePackageManifest(manifestJson: any): { valid: boolean; errors: string[]; manifest?: PluginManifest };
}

/**
 * Compare two semver strings (e.g. '1.4.2' > '1.4.0')
 */
export function isNewerVersion(latest: string, current: string): boolean {
  const parse = (v: string) => v.split('.').map((p) => parseInt(p, 10) || 0);
  const l = parse(latest);
  const c = parse(current);

  for (let i = 0; i < Math.max(l.length, c.length); i++) {
    const lPart = l[i] || 0;
    const cPart = c[i] || 0;
    if (lPart > cPart) return true;
    if (lPart < cPart) return false;
  }
  return false;
}

/**
 * Default Local/Remote Hybrid Marketplace Service Provider
 */
export class DefaultPluginMarketplaceService implements IPluginMarketplaceProvider {
  private localCatalog: PluginManifest[] = MARKETPLACE_CATALOG;
  private customUploadedCatalog: PluginManifest[] = [];

  constructor() {
    this.loadCustomCatalog();
  }

  private loadCustomCatalog() {
    try {
      const stored = localStorage.getItem('fujifinder_custom_marketplace_plugins');
      if (stored) {
        this.customUploadedCatalog = JSON.parse(stored);
      }
    } catch {
      this.customUploadedCatalog = [];
    }
  }

  public registerCustomManifest(manifest: PluginManifest) {
    const existingIndex = this.customUploadedCatalog.findIndex((p) => p.id === manifest.id);
    if (existingIndex >= 0) {
      this.customUploadedCatalog[existingIndex] = manifest;
    } else {
      this.customUploadedCatalog.unshift(manifest);
    }
    localStorage.setItem('fujifinder_custom_marketplace_plugins', JSON.stringify(this.customUploadedCatalog));
  }

  public async fetchPlugins(options?: { category?: PluginCategory | 'All'; search?: string }): Promise<PluginManifest[]> {
    // Simulate slight network resolution if needed, keeping UI responsive
    let all = [...this.customUploadedCatalog, ...this.localCatalog];

    // Remove duplicates favoring custom/newer
    const seen = new Set<string>();
    all = all.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });

    if (options?.category && options.category !== 'All') {
      all = all.filter((p) => p.category === options.category);
    }

    if (options?.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      all = all.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.author.name.toLowerCase().includes(q)
      );
    }

    return all;
  }

  public async fetchPluginById(id: string): Promise<PluginManifest | null> {
    const all = [...this.customUploadedCatalog, ...this.localCatalog];
    return all.find((p) => p.id === id) || null;
  }

  public async checkForUpdates(installedList: { id: string; version: string }[]): Promise<
    {
      pluginId: string;
      currentVersion: string;
      latestManifest: PluginManifest;
    }[]
  > {
    const updates: { pluginId: string; currentVersion: string; latestManifest: PluginManifest }[] = [];
    const all = [...this.customUploadedCatalog, ...this.localCatalog];

    for (const inst of installedList) {
      const latest = all.find((p) => p.id === inst.id);
      if (latest && isNewerVersion(latest.version, inst.version)) {
        updates.push({
          pluginId: inst.id,
          currentVersion: inst.version,
          latestManifest: latest,
        });
      }
    }

    return updates;
  }

  public validatePackageManifest(manifestJson: any): { valid: boolean; errors: string[]; manifest?: PluginManifest } {
    const errors: string[] = [];

    if (!manifestJson || typeof manifestJson !== 'object') {
      return { valid: false, errors: ['Manifest must be a valid JSON object.'] };
    }

    if (!manifestJson.id || typeof manifestJson.id !== 'string' || !/^[a-z0-9-_]+$/.test(manifestJson.id)) {
      errors.push('Plugin "id" is required and must contain only lowercase alphanumeric characters, dashes, or underscores (e.g. "my-plugin-id").');
    }

    if (!manifestJson.name || typeof manifestJson.name !== 'string') {
      errors.push('Plugin "name" is required.');
    }

    if (!manifestJson.version || !/^\d+\.\d+(\.\d+)?(-[a-z0-9.]+)?$/i.test(manifestJson.version)) {
      errors.push('Plugin "version" must follow semantic versioning (e.g. "1.0.0").');
    }

    if (!manifestJson.author || !manifestJson.author.name) {
      errors.push('Plugin "author" with a valid author name is required.');
    }

    if (!manifestJson.description) {
      errors.push('Plugin "description" is required.');
    }

    if (!manifestJson.category) {
      errors.push('Plugin "category" is required.');
    }

    if (!Array.isArray(manifestJson.permissions)) {
      errors.push('Plugin "permissions" array is required.');
    }

    // Compatibility check
    if (manifestJson.compatibility?.minAppVersion) {
      if (isNewerVersion(manifestJson.compatibility.minAppVersion, CORE_APP_VERSION)) {
        errors.push(`This plugin requires FujiFinder version ${manifestJson.compatibility.minAppVersion} or higher. Current version is ${CORE_APP_VERSION}.`);
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    const manifest: PluginManifest = {
      id: manifestJson.id,
      name: manifestJson.name,
      version: manifestJson.version,
      author: {
        name: manifestJson.author.name,
        url: manifestJson.author.url || '',
        email: manifestJson.author.email || '',
        verified: Boolean(manifestJson.author.verified),
      },
      description: manifestJson.description,
      detailedDescription: manifestJson.detailedDescription || manifestJson.description,
      icon: manifestJson.icon || 'puzzle',
      category: manifestJson.category,
      compatibility: manifestJson.compatibility || { minAppVersion: '2.0.0', testedUpTo: CORE_APP_VERSION },
      permissions: manifestJson.permissions || [],
      entryPoints: manifestJson.entryPoints || { hasAdminPage: true },
      settingsSchema: Array.isArray(manifestJson.settingsSchema) ? manifestJson.settingsSchema : [],
      features: Array.isArray(manifestJson.features) ? manifestJson.features : ['Modular extension'],
      changelog: Array.isArray(manifestJson.changelog)
        ? manifestJson.changelog
        : [{ version: manifestJson.version, date: new Date().toISOString().split('T')[0], changes: ['Initial release'] }],
      tags: Array.isArray(manifestJson.tags) ? manifestJson.tags : [manifestJson.category.toLowerCase()],
      rating: typeof manifestJson.rating === 'number' ? manifestJson.rating : 5.0,
      reviewsCount: typeof manifestJson.reviewsCount === 'number' ? manifestJson.reviewsCount : 1,
      downloadsCount: typeof manifestJson.downloadsCount === 'number' ? manifestJson.downloadsCount : 1,
      isOfficial: Boolean(manifestJson.isOfficial),
      lastUpdated: manifestJson.lastUpdated || new Date().toISOString().split('T')[0],
    };

    return { valid: true, errors: [], manifest };
  }
}

export const pluginMarketplaceService = new DefaultPluginMarketplaceService();
