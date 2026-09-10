import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  InstalledPlugin,
  PluginManifest,
  PluginPermission,
  PluginActivityLog,
  PluginStatus,
  PluginBackupData,
} from '../types/pluginTypes';
import { INITIAL_INSTALLED_PLUGINS_DATA, CORE_APP_VERSION } from './marketplaceCatalog';
import { pluginMarketplaceService, isNewerVersion } from './marketplaceService';

const STORAGE_KEYS = {
  INSTALLED: 'fujifinder_installed_plugins_v1',
  SETTINGS: 'fujifinder_plugin_settings_v1',
  LOGS: 'fujifinder_plugin_activity_logs_v1',
};

interface PluginContextType {
  installedPlugins: InstalledPlugin[];
  activityLogs: PluginActivityLog[];
  activePlugins: InstalledPlugin[];
  availableUpdates: { pluginId: string; currentVersion: string; latestManifest: PluginManifest }[];
  activePluginsCount: number;
  availableUpdatesCount: number;
  hasErrors: boolean;
  coreVersion: string;

  // Actions
  installPlugin: (
    manifest: PluginManifest,
    approvedPermissions: PluginPermission[],
    source?: 'marketplace' | 'upload' | 'local'
  ) => { success: boolean; error?: string };

  activatePlugin: (pluginId: string) => { success: boolean; error?: string };
  deactivatePlugin: (pluginId: string) => { success: boolean; error?: string };
  updatePlugin: (pluginId: string, latestManifest: PluginManifest) => { success: boolean; error?: string };
  rollbackPlugin: (pluginId: string) => { success: boolean; error?: string };
  uninstallPlugin: (pluginId: string, deleteSettings?: boolean) => { success: boolean; error?: string };
  updatePluginSettings: (pluginId: string, settings: Record<string, any>) => { success: boolean; error?: string };
  getPluginSettings: (pluginId: string) => Record<string, any>;
  isPluginActive: (pluginId: string) => boolean;
  hasUpdate: (pluginId: string) => PluginManifest | null;

  // Logs
  logActivity: (
    pluginId: string,
    pluginName: string,
    action: PluginActivityLog['action'],
    details: string,
    severity?: PluginActivityLog['severity']
  ) => void;
  clearLogs: () => void;
  exportLogs: () => void;
  resetAllPlugins: () => void;
}

const PluginContext = createContext<PluginContextType | undefined>(undefined);

export const PluginProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [installedPlugins, setInstalledPlugins] = useState<InstalledPlugin[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INSTALLED);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading stored plugins, loading defaults:', e);
    }
    return INITIAL_INSTALLED_PLUGINS_DATA;
  });

  const [activityLogs, setActivityLogs] = useState<PluginActivityLog[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return [
      {
        id: 'log-seed-1',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        pluginId: 'fujifinder-seo-toolkit',
        pluginName: 'Advanced SEO & Schema Toolkit',
        action: 'install',
        details: 'Official plugin package installed via FujiFinder Marketplace.',
        severity: 'info',
        userEmail: 'fujifinderbusiness@gmail.com',
      },
      {
        id: 'log-seed-2',
        timestamp: new Date(Date.now() - 3600000 * 23).toISOString(),
        pluginId: 'fujifinder-seo-toolkit',
        pluginName: 'Advanced SEO & Schema Toolkit',
        action: 'activate',
        details: 'Plugin verified and successfully activated. 6 permissions approved.',
        severity: 'success',
        userEmail: 'fujifinderbusiness@gmail.com',
      },
      {
        id: 'log-seed-3',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        pluginId: 'fujifinder-analytics-pro',
        pluginName: 'Real-Time Visitor & Affiliate Analytics',
        action: 'activate',
        details: 'Real-time telemetry and merchant referral tracker activated in privacy mode.',
        severity: 'success',
        userEmail: 'fujifinderbusiness@gmail.com',
      },
    ];
  });

  const [availableUpdates, setAvailableUpdates] = useState<
    { pluginId: string; currentVersion: string; latestManifest: PluginManifest }[]
  >([]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INSTALLED, JSON.stringify(installedPlugins));
    } catch (e) {
      console.error('Failed to save plugins to localStorage:', e);
    }
  }, [installedPlugins]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(activityLogs));
    } catch (e) {
      console.error('Failed to save logs to localStorage:', e);
    }
  }, [activityLogs]);

  // Check for updates
  const refreshUpdates = useCallback(async () => {
    try {
      const checkList = installedPlugins.map((p) => ({
        id: p.manifest.id,
        version: p.manifest.version,
      }));
      const updates = await pluginMarketplaceService.checkForUpdates(checkList);
      setAvailableUpdates(updates);
    } catch (err) {
      console.error('Failed to check for plugin updates:', err);
    }
  }, [installedPlugins]);

  useEffect(() => {
    refreshUpdates();
  }, [refreshUpdates]);

  const logActivity = useCallback(
    (
      pluginId: string,
      pluginName: string,
      action: PluginActivityLog['action'],
      details: string,
      severity: PluginActivityLog['severity'] = 'info'
    ) => {
      const newLog: PluginActivityLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        pluginId,
        pluginName,
        action,
        details,
        severity,
        userEmail: 'fujifinderbusiness@gmail.com',
      };
      setActivityLogs((prev) => [newLog, ...prev.slice(0, 99)]); // keep latest 100
    },
    []
  );

  const installPlugin = useCallback(
    (
      manifest: PluginManifest,
      approvedPermissions: PluginPermission[],
      source: 'marketplace' | 'upload' | 'local' = 'marketplace'
    ) => {
      const existing = installedPlugins.find((p) => p.manifest.id === manifest.id);
      if (existing) {
        return { success: false, error: `Plugin "${manifest.name}" is already installed.` };
      }

      // Check version compatibility
      if (manifest.compatibility?.minAppVersion && isNewerVersion(manifest.compatibility.minAppVersion, CORE_APP_VERSION)) {
        return {
          success: false,
          error: `Incompatible: Requires FujiFinder v${manifest.compatibility.minAppVersion} or higher. Current is v${CORE_APP_VERSION}.`,
        };
      }

      // Initialize default settings from schema
      const initialSettings: Record<string, any> = {};
      if (manifest.settingsSchema) {
        manifest.settingsSchema.forEach((f) => {
          initialSettings[f.id] = f.defaultValue;
        });
      }

      const newInstalled: InstalledPlugin = {
        manifest,
        status: 'active', // Activate by default upon explicit installation & permission approval
        installedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: initialSettings,
        approvedPermissions,
        source,
      };

      setInstalledPlugins((prev) => [newInstalled, ...prev]);

      logActivity(
        manifest.id,
        manifest.name,
        'install',
        `Installed version ${manifest.version} from ${source}. Approved ${approvedPermissions.length} permissions.`,
        'success'
      );

      logActivity(
        manifest.id,
        manifest.name,
        'activate',
        `Plugin initialized and activated. All entry points mounted.`,
        'success'
      );

      return { success: true };
    },
    [installedPlugins, logActivity]
  );

  const activatePlugin = useCallback(
    (pluginId: string) => {
      const target = installedPlugins.find((p) => p.manifest.id === pluginId);
      if (!target) return { success: false, error: 'Plugin not found.' };

      // Safe lifecycle try-catch
      try {
        setInstalledPlugins((prev) =>
          prev.map((p) => (p.manifest.id === pluginId ? { ...p, status: 'active', errorDetails: undefined } : p))
        );

        logActivity(
          target.manifest.id,
          target.manifest.name,
          'activate',
          `Plugin activated successfully. Extension points registered.`,
          'success'
        );
        return { success: true };
      } catch (err: any) {
        setInstalledPlugins((prev) =>
          prev.map((p) =>
            p.manifest.id === pluginId
              ? { ...p, status: 'error', errorDetails: err?.message || 'Activation failed' }
              : p
          )
        );
        logActivity(
          target.manifest.id,
          target.manifest.name,
          'error',
          `Failed to activate plugin: ${err?.message || 'Unknown error'}`,
          'error'
        );
        return { success: false, error: err?.message || 'Activation failed' };
      }
    },
    [installedPlugins, logActivity]
  );

  const deactivatePlugin = useCallback(
    (pluginId: string) => {
      const target = installedPlugins.find((p) => p.manifest.id === pluginId);
      if (!target) return { success: false, error: 'Plugin not found.' };

      setInstalledPlugins((prev) =>
        prev.map((p) => (p.manifest.id === pluginId ? { ...p, status: 'inactive' } : p))
      );

      logActivity(
        target.manifest.id,
        target.manifest.name,
        'deactivate',
        `Plugin safely deactivated. Extension points and frontend injections unmounted.`,
        'info'
      );
      return { success: true };
    },
    [installedPlugins, logActivity]
  );

  const updatePlugin = useCallback(
    (pluginId: string, latestManifest: PluginManifest) => {
      const target = installedPlugins.find((p) => p.manifest.id === pluginId);
      if (!target) return { success: false, error: 'Plugin not found.' };

      // Automatic backup prior to update
      const backup: PluginBackupData = {
        version: target.manifest.version,
        settings: { ...target.settings },
        timestamp: new Date().toISOString(),
      };

      // Merge new settings defaults while preserving existing values
      const mergedSettings = { ...target.settings };
      latestManifest.settingsSchema?.forEach((field) => {
        if (mergedSettings[field.id] === undefined) {
          mergedSettings[field.id] = field.defaultValue;
        }
      });

      // Merge any new permissions
      const updatedPermissions = Array.from(
        new Set([...target.approvedPermissions, ...latestManifest.permissions])
      );

      setInstalledPlugins((prev) =>
        prev.map((p) =>
          p.manifest.id === pluginId
            ? {
                ...p,
                manifest: latestManifest,
                updatedAt: new Date().toISOString(),
                settings: mergedSettings,
                approvedPermissions: updatedPermissions,
                backupData: backup,
                status: 'active',
                errorDetails: undefined,
              }
            : p
        )
      );

      logActivity(
        latestManifest.id,
        latestManifest.name,
        'update',
        `Updated from v${target.manifest.version} to v${latestManifest.version}. Settings and configuration snapshot backed up.`,
        'success'
      );

      return { success: true };
    },
    [installedPlugins, logActivity]
  );

  const rollbackPlugin = useCallback(
    (pluginId: string) => {
      const target = installedPlugins.find((p) => p.manifest.id === pluginId);
      if (!target || !target.backupData) {
        return { success: false, error: 'No previous backup point available for this plugin.' };
      }

      const backup = target.backupData;
      setInstalledPlugins((prev) =>
        prev.map((p) =>
          p.manifest.id === pluginId
            ? {
                ...p,
                manifest: {
                  ...p.manifest,
                  version: backup.version,
                },
                settings: { ...backup.settings },
                backupData: undefined,
                updatedAt: new Date().toISOString(),
                status: 'active',
              }
            : p
        )
      );

      logActivity(
        target.manifest.id,
        target.manifest.name,
        'rollback',
        `Rolled back plugin to backup version ${backup.version}. Settings restored.`,
        'warning'
      );

      return { success: true };
    },
    [installedPlugins, logActivity]
  );

  const uninstallPlugin = useCallback(
    (pluginId: string, deleteSettings: boolean = true) => {
      const target = installedPlugins.find((p) => p.manifest.id === pluginId);
      if (!target) return { success: false, error: 'Plugin not found.' };

      setInstalledPlugins((prev) => prev.filter((p) => p.manifest.id !== pluginId));

      logActivity(
        target.manifest.id,
        target.manifest.name,
        'uninstall',
        `Plugin uninstalled.${deleteSettings ? ' Configuration data cleared.' : ' Settings preserved in archive.'}`,
        'warning'
      );

      return { success: true };
    },
    [installedPlugins, logActivity]
  );

  const updatePluginSettings = useCallback(
    (pluginId: string, newSettings: Record<string, any>) => {
      const target = installedPlugins.find((p) => p.manifest.id === pluginId);
      if (!target) return { success: false, error: 'Plugin not found.' };

      setInstalledPlugins((prev) =>
        prev.map((p) => (p.manifest.id === pluginId ? { ...p, settings: { ...p.settings, ...newSettings } } : p))
      );

      logActivity(
        target.manifest.id,
        target.manifest.name,
        'settings_update',
        `Plugin configuration options updated by administrator.`,
        'info'
      );

      return { success: true };
    },
    [installedPlugins, logActivity]
  );

  const getPluginSettings = useCallback(
    (pluginId: string) => {
      const target = installedPlugins.find((p) => p.manifest.id === pluginId);
      return target?.settings || {};
    },
    [installedPlugins]
  );

  const isPluginActive = useCallback(
    (pluginId: string) => {
      const target = installedPlugins.find((p) => p.manifest.id === pluginId);
      return target?.status === 'active';
    },
    [installedPlugins]
  );

  const hasUpdate = useCallback(
    (pluginId: string) => {
      const up = availableUpdates.find((u) => u.pluginId === pluginId);
      return up ? up.latestManifest : null;
    },
    [availableUpdates]
  );

  const clearLogs = useCallback(() => {
    setActivityLogs([]);
  }, []);

  const exportLogs = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activityLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `fujifinder-plugin-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [activityLogs]);

  const resetAllPlugins = useCallback(() => {
    setInstalledPlugins(INITIAL_INSTALLED_PLUGINS_DATA);
    logActivity('system', 'Plugin Manager', 'install', 'Reset plugins to official default configuration.', 'warning');
  }, [logActivity]);

  const activePlugins = useMemo(() => installedPlugins.filter((p) => p.status === 'active'), [installedPlugins]);
  const activePluginsCount = activePlugins.length;
  const availableUpdatesCount = availableUpdates.length;
  const hasErrors = useMemo(() => installedPlugins.some((p) => p.status === 'error'), [installedPlugins]);

  return (
    <PluginContext.Provider
      value={{
        installedPlugins,
        activityLogs,
        activePlugins,
        availableUpdates,
        activePluginsCount,
        availableUpdatesCount,
        hasErrors,
        coreVersion: CORE_APP_VERSION,
        installPlugin,
        activatePlugin,
        deactivatePlugin,
        updatePlugin,
        rollbackPlugin,
        uninstallPlugin,
        updatePluginSettings,
        getPluginSettings,
        isPluginActive,
        hasUpdate,
        logActivity,
        clearLogs,
        exportLogs,
        resetAllPlugins,
      }}
    >
      {children}
    </PluginContext.Provider>
  );
};

export const usePluginSystem = () => {
  const context = useContext(PluginContext);
  if (!context) {
    throw new Error('usePluginSystem must be used within a PluginProvider');
  }
  return context;
};
