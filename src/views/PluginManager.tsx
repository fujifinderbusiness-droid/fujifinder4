import React, { useState, useMemo } from 'react';
import {
  Puzzle,
  Download,
  Upload,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Trash2,
  RotateCcw,
  Star,
  ShieldCheck,
  Activity,
  FileCode,
  Check,
  X,
  ExternalLink,
  Layers,
  BarChart3,
  Link2,
  Image as ImageIcon,
  Share2,
  Mail,
  Zap,
  Shield,
  FileText,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  PluginManifest,
  InstalledPlugin,
  PluginCategory,
  PluginStatus,
  PluginPermission,
} from '../types/pluginTypes';
import { usePluginSystem } from '../plugins/PluginContext';
import { pluginMarketplaceService } from '../plugins/marketplaceService';
import { PluginSettingsModal } from './plugins/PluginSettingsModal';
import { PluginPermissionsModal } from './plugins/PluginPermissionsModal';
import { PluginDetailsModal } from './plugins/PluginDetailsModal';
import { PluginUninstallDialog } from './plugins/PluginUninstallDialog';
import { PluginUpdateModal } from './plugins/PluginUpdateModal';

const CATEGORIES: (PluginCategory | 'All')[] = [
  'All',
  'SEO',
  'Analytics',
  'Affiliate Marketing',
  'Image Optimization',
  'Social Media',
  'AI Tools',
  'Security',
  'Performance',
  'Email Marketing',
  'Content',
  'Forms',
  'Utilities',
];

export const PluginManager: React.FC = () => {
  const {
    installedPlugins,
    activityLogs,
    activePluginsCount,
    availableUpdatesCount,
    hasErrors,
    coreVersion,
    installPlugin,
    activatePlugin,
    deactivatePlugin,
    updatePlugin,
    rollbackPlugin,
    uninstallPlugin,
    hasUpdate,
    clearLogs,
    exportLogs,
    resetAllPlugins,
  } = usePluginSystem();

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'installed' | 'marketplace' | 'upload' | 'updates' | 'logs'>('installed');

  // Filters for Installed Plugins
  const [searchInstalled, setSearchInstalled] = useState('');
  const [categoryInstalled, setCategoryInstalled] = useState<PluginCategory | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'updates' | 'error'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'installedAt' | 'status'>('name');

  // Filters for Marketplace
  const [searchMarketplace, setSearchMarketplace] = useState('');
  const [categoryMarketplace, setCategoryMarketplace] = useState<PluginCategory | 'All'>('All');

  // Upload Tab state
  const [uploadedJson, setUploadedJson] = useState('');
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [parsedManifest, setParsedManifest] = useState<PluginManifest | null>(null);

  // Modals state
  const [settingsModalPlugin, setSettingsModalPlugin] = useState<InstalledPlugin | null>(null);
  const [detailsModalManifest, setDetailsModalManifest] = useState<PluginManifest | null>(null);
  const [permissionsModalManifest, setPermissionsModalManifest] = useState<PluginManifest | null>(null);
  const [permissionsActionType, setPermissionsActionType] = useState<'install' | 'activate' | 'update'>('install');
  const [uninstallTargetPlugin, setUninstallTargetPlugin] = useState<InstalledPlugin | null>(null);
  const [updateTargetPlugin, setUpdateTargetPlugin] = useState<{
    plugin: InstalledPlugin;
    latestManifest: PluginManifest;
  } | null>(null);

  // Full marketplace catalog items
  const [marketplacePlugins, setMarketplacePlugins] = useState<PluginManifest[]>([]);
  const [loadingMarketplace, setLoadingMarketplace] = useState(false);

  // Fetch marketplace items on tab change or filter
  React.useEffect(() => {
    let isMounted = true;
    const loadMarketplace = async () => {
      setLoadingMarketplace(true);
      try {
        const list = await pluginMarketplaceService.fetchPlugins({
          category: categoryMarketplace,
          search: searchMarketplace,
        });
        if (isMounted) setMarketplacePlugins(list);
      } finally {
        if (isMounted) setLoadingMarketplace(false);
      }
    };
    loadMarketplace();
    return () => {
      isMounted = false;
    };
  }, [categoryMarketplace, searchMarketplace]);

  // Helper for plugin icon
  const renderPluginIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'search':
        return <Search className={className} />;
      case 'bar-chart':
        return <BarChart3 className={className} />;
      case 'link':
        return <Link2 className={className} />;
      case 'image':
        return <ImageIcon className={className} />;
      case 'share-2':
        return <Share2 className={className} />;
      case 'sparkles':
        return <Sparkles className={className} />;
      case 'shield':
        return <Shield className={className} />;
      case 'mail':
        return <Mail className={className} />;
      case 'zap':
        return <Zap className={className} />;
      default:
        return <Puzzle className={className} />;
    }
  };

  // Filtered & sorted installed plugins
  const filteredInstalled = useMemo(() => {
    return installedPlugins
      .filter((p) => {
        if (categoryInstalled !== 'All' && p.manifest.category !== categoryInstalled) return false;
        if (statusFilter === 'active' && p.status !== 'active') return false;
        if (statusFilter === 'inactive' && p.status !== 'inactive') return false;
        if (statusFilter === 'updates' && !hasUpdate(p.manifest.id)) return false;
        if (statusFilter === 'error' && p.status !== 'error') return false;
        if (searchInstalled.trim()) {
          const q = searchInstalled.toLowerCase().trim();
          const matchName = p.manifest.name.toLowerCase().includes(q);
          const matchDesc = p.manifest.description.toLowerCase().includes(q);
          const matchAuthor = p.manifest.author.name.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchAuthor) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.manifest.name.localeCompare(b.manifest.name);
        if (sortBy === 'installedAt') return new Date(b.installedAt).getTime() - new Date(a.installedAt).getTime();
        if (sortBy === 'status') return a.status.localeCompare(b.status);
        return 0;
      });
  }, [installedPlugins, categoryInstalled, statusFilter, searchInstalled, sortBy, hasUpdate]);

  // Handle uploading and parsing a plugin manifest package
  const handleValidateUploadedManifest = () => {
    setUploadErrors([]);
    setParsedManifest(null);

    try {
      const json = JSON.parse(uploadedJson);
      const validation = pluginMarketplaceService.validatePackageManifest(json);
      if (!validation.valid || !validation.manifest) {
        setUploadErrors(validation.errors);
      } else {
        setParsedManifest(validation.manifest);
      }
    } catch (e: any) {
      setUploadErrors([`Invalid JSON format: ${e.message}`]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setUploadedJson(content);
      try {
        const json = JSON.parse(content);
        const validation = pluginMarketplaceService.validatePackageManifest(json);
        if (!validation.valid || !validation.manifest) {
          setUploadErrors(validation.errors);
          setParsedManifest(null);
        } else {
          setUploadErrors([]);
          setParsedManifest(validation.manifest);
        }
      } catch (err: any) {
        setUploadErrors([`File read error: ${err.message}`]);
      }
    };
    reader.readAsText(file);
  };

  // Perform safe install after permissions review
  const handleProceedInstallFromManifest = (manifest: PluginManifest) => {
    setPermissionsModalManifest(manifest);
    setPermissionsActionType('install');
  };

  const handleConfirmPermissions = (approvedPermissions: PluginPermission[]) => {
    if (!permissionsModalManifest) return;

    if (permissionsActionType === 'install') {
      const res = installPlugin(permissionsModalManifest, approvedPermissions, 'marketplace');
      if (res.success) {
        setPermissionsModalManifest(null);
        setDetailsModalManifest(null);
        setActiveTab('installed');
      } else {
        alert(res.error || 'Failed to install plugin.');
      }
    }
  };

  // Update All batch action
  const handleUpdateAll = () => {
    installedPlugins.forEach((p) => {
      const update = hasUpdate(p.manifest.id);
      if (update) {
        updatePlugin(p.manifest.id, update);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#1C1C1C] border border-[#2E2E2E] text-white p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#2E2E2E]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 border border-amber-500/30 flex items-center gap-1">
                <Puzzle className="w-3 h-3" /> Modular System Architecture
              </span>
              <span className="text-xs text-[#888] font-mono">FujiFinder Core v{coreVersion}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Plugin Manager</h1>
            <p className="text-xs text-[#aaa] mt-1 max-w-2xl leading-relaxed">
              Extend FujiFinder with modular plugins inspired by WordPress. Install, configure, update, and sandbox extensions for SEO, Analytics, Affiliate cloaking, and Image optimization without modifying core engine files.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('marketplace')}
              className="px-4 py-2 bg-white hover:bg-[#EEE] text-black font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Browse Marketplace
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className="px-4 py-2 bg-[#262626] hover:bg-[#333] text-white text-xs border border-[#3E3E3E] flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Upload className="w-3.5 h-3.5" /> Upload Package
            </button>
          </div>
        </div>

        {/* System Health & Status Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
          <div className="bg-[#242424] p-3.5 border border-[#333]">
            <span className="text-[10px] text-[#888] uppercase tracking-wider block font-mono">
              Installed Plugins
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-white">{installedPlugins.length}</span>
              <span className="text-xs text-[#888]">modules loaded</span>
            </div>
          </div>

          <div className="bg-[#242424] p-3.5 border border-[#333]">
            <span className="text-[10px] text-[#888] uppercase tracking-wider block font-mono">
              Active Plugins
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-emerald-400">{activePluginsCount}</span>
              <span className="text-xs text-[#888]">running securely</span>
            </div>
          </div>

          <div className="bg-[#242424] p-3.5 border border-[#333]">
            <span className="text-[10px] text-[#888] uppercase tracking-wider block font-mono">
              Updates Available
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-2xl font-bold font-mono ${
                  availableUpdatesCount > 0 ? 'text-amber-400 animate-pulse' : 'text-white'
                }`}
              >
                {availableUpdatesCount}
              </span>
              {availableUpdatesCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('updates')}
                  className="text-[11px] text-amber-300 underline cursor-pointer hover:text-white"
                >
                  Review updates &rarr;
                </button>
              ) : (
                <span className="text-xs text-emerald-400">Up to date</span>
              )}
            </div>
          </div>

          <div className="bg-[#242424] p-3.5 border border-[#333]">
            <span className="text-[10px] text-[#888] uppercase tracking-wider block font-mono">
              Engine Health
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {hasErrors ? '1 Warning' : 'All Systems Normal'}
              </span>
            </div>
            <span className="text-[10px] text-[#777] block mt-0.5">Sandboxed & isolated</span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex border-b border-[#2E2E2E] text-xs font-medium bg-[#141414] overflow-x-auto">
        {[
          { id: 'installed', label: `Installed Plugins (${installedPlugins.length})`, icon: Layers },
          { id: 'marketplace', label: 'Plugin Marketplace', icon: Download },
          { id: 'upload', label: 'Upload Plugin', icon: Upload },
          {
            id: 'updates',
            label: 'Updates',
            badge: availableUpdatesCount > 0 ? availableUpdatesCount : undefined,
            icon: Sparkles,
          },
          { id: 'logs', label: `Activity Logs (${activityLogs.length})`, icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3.5 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                isActive
                  ? 'border-white text-white font-bold bg-[#1C1C1C]'
                  : 'border-transparent text-[#888] hover:text-[#ccc] hover:bg-[#181818]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.2 rounded-full font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INSTALLED PLUGINS */}
      {/* ========================================================================= */}
      {activeTab === 'installed' && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="bg-[#1C1C1C] border border-[#2E2E2E] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search input */}
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchInstalled}
                  onChange={(e) => setSearchInstalled(e.target.value)}
                  placeholder="Search installed plugins..."
                  className="w-full bg-[#242424] border border-[#3A3A3A] text-white pl-8 pr-3 py-1.5 text-xs focus:outline-hidden focus:border-white transition-colors"
                />
                {searchInstalled && (
                  <button
                    onClick={() => setSearchInstalled('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777] hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <select
                value={categoryInstalled}
                onChange={(e) => setCategoryInstalled(e.target.value as any)}
                className="bg-[#242424] border border-[#3A3A3A] text-white px-3 py-1.5 text-xs focus:outline-hidden focus:border-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    Category: {cat}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-[#242424] border border-[#3A3A3A] text-white px-3 py-1.5 text-xs focus:outline-hidden focus:border-white"
              >
                <option value="all">Status: All</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
                <option value="updates">Updates Available</option>
                <option value="error">Errors</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-[#888]">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#242424] border border-[#3A3A3A] text-white px-2.5 py-1.5 text-xs focus:outline-hidden"
              >
                <option value="name">Plugin Name</option>
                <option value="installedAt">Recently Installed</option>
                <option value="status">Active State</option>
              </select>
            </div>
          </div>

          {/* Installed Plugins List */}
          {filteredInstalled.length === 0 ? (
            <div className="bg-[#1C1C1C] border border-[#2E2E2E] text-center py-16 px-4 space-y-3">
              <Puzzle className="w-10 h-10 text-[#444] mx-auto" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">No plugins found</h3>
              <p className="text-xs text-[#888] max-w-sm mx-auto">
                No installed plugins match your filter criteria. Browse the marketplace to discover and install new modules.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchInstalled('');
                  setCategoryInstalled('All');
                  setStatusFilter('all');
                }}
                className="text-xs text-amber-400 hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInstalled.map((plugin) => {
                const updateManifest = hasUpdate(plugin.manifest.id);
                const isActive = plugin.status === 'active';
                const isError = plugin.status === 'error';

                return (
                  <div
                    key={plugin.manifest.id}
                    className={`bg-[#1C1C1C] border transition-colors p-5 ${
                      isActive ? 'border-[#333]' : 'border-[#262626] opacity-90'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Plugin Icon & Info */}
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-11 h-11 shrink-0 flex items-center justify-center border ${
                            isActive
                              ? 'bg-[#282828] text-amber-400 border-[#404040]'
                              : 'bg-[#202020] text-[#666] border-[#303030]'
                          }`}
                        >
                          {renderPluginIcon(plugin.manifest.icon, 'w-5 h-5')}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold text-white tracking-tight">
                              {plugin.manifest.name}
                            </h3>
                            <span className="text-[11px] font-mono text-[#888]">
                              v{plugin.manifest.version}
                            </span>
                            <span className="text-[10px] font-mono uppercase bg-[#262626] text-[#bbb] px-2 py-0.5 border border-[#383838]">
                              {plugin.manifest.category}
                            </span>
                            {plugin.manifest.isOfficial && (
                              <span className="text-[10px] font-mono uppercase bg-blue-950 text-blue-300 px-1.5 py-0.2 border border-blue-800 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-blue-400" /> Official
                              </span>
                            )}
                            {/* Status badge */}
                            {isActive ? (
                              <span className="text-[10px] font-mono uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Active
                              </span>
                            ) : isError ? (
                              <span className="text-[10px] font-mono uppercase bg-rose-950/80 text-rose-300 border border-rose-800/80 px-2 py-0.5 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-rose-400" />
                                Error
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono uppercase bg-[#2A2A2A] text-[#888] px-2 py-0.5 border border-[#3A3A3A]">
                                Inactive
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[#aaa] leading-relaxed max-w-3xl">
                            {plugin.manifest.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#777] pt-1 font-mono">
                            <span>By {plugin.manifest.author.name}</span>
                            <span>&bull;</span>
                            <span>Installed {new Date(plugin.installedAt).toLocaleDateString()}</span>
                            <span>&bull;</span>
                            <button
                              type="button"
                              onClick={() => setDetailsModalManifest(plugin.manifest)}
                              className="text-amber-400 hover:underline cursor-pointer"
                            >
                              View details & permissions ({plugin.approvedPermissions.length})
                            </button>
                            {plugin.backupData && (
                              <>
                                <span>&bull;</span>
                                <button
                                  type="button"
                                  onClick={() => rollbackPlugin(plugin.manifest.id)}
                                  className="text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                                  title="Restore previous version from automatic backup"
                                >
                                  <RotateCcw className="w-3 h-3" /> Rollback to v{plugin.backupData.version}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0">
                        {/* Update banner/action if update exists */}
                        {updateManifest && (
                          <button
                            type="button"
                            onClick={() =>
                              setUpdateTargetPlugin({ plugin, latestManifest: updateManifest })
                            }
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Update to v{updateManifest.version}
                          </button>
                        )}

                        {/* Settings Button */}
                        <button
                          type="button"
                          onClick={() => setSettingsModalPlugin(plugin)}
                          className="px-3 py-1.5 bg-[#262626] hover:bg-[#333] text-white text-xs border border-[#3E3E3E] flex items-center gap-1.5 cursor-pointer transition-colors"
                          title="Plugin Settings"
                        >
                          <Settings className="w-3.5 h-3.5" /> Settings
                        </button>

                        {/* Activate / Deactivate Toggle */}
                        {isActive ? (
                          <button
                            type="button"
                            onClick={() => deactivatePlugin(plugin.manifest.id)}
                            className="px-3.5 py-1.5 bg-[#2B2B2B] hover:bg-[#383838] text-[#ccc] hover:text-white text-xs cursor-pointer border border-[#3E3E3E] transition-colors"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => activatePlugin(plugin.manifest.id)}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" /> Activate
                          </button>
                        )}

                        {/* Uninstall button */}
                        <button
                          type="button"
                          onClick={() => setUninstallTargetPlugin(plugin)}
                          className="p-1.5 text-[#777] hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/60 cursor-pointer transition-colors"
                          title="Uninstall Plugin"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PLUGIN MARKETPLACE */}
      {/* ========================================================================= */}
      {activeTab === 'marketplace' && (
        <div className="space-y-6">
          {/* Marketplace Filter Bar */}
          <div className="bg-[#1C1C1C] border border-[#2E2E2E] p-4 space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchMarketplace}
                  onChange={(e) => setSearchMarketplace(e.target.value)}
                  placeholder="Search marketplace for camera plugins, SEO, analytics..."
                  className="w-full bg-[#242424] border border-[#3A3A3A] text-white pl-9 pr-4 py-2 text-xs focus:outline-hidden focus:border-white transition-colors"
                />
              </div>

              <div className="text-[11px] text-[#888] font-mono">
                Showing {marketplacePlugins.length} available official & community plugins
              </div>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryMarketplace(cat)}
                  className={`px-3 py-1 text-xs cursor-pointer transition-colors ${
                    categoryMarketplace === cat
                      ? 'bg-white text-black font-bold'
                      : 'bg-[#252525] text-[#888] hover:text-white border border-[#333]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Notice about extensible registry */}
          <div className="bg-[#181818] border border-[#2A2A2A] p-3 text-xs text-[#888] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Marketplace Provider Architecture:</strong> Uses the pluggable <code className="text-white font-mono text-[11px]">IPluginMarketplaceProvider</code> service. Ready to bind to remote official registries without modifying the Admin UI.
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 shrink-0">Registry Online</span>
          </div>

          {/* Marketplace Grid */}
          {loadingMarketplace ? (
            <div className="text-center py-20 text-[#888] text-xs">
              Fetching catalog from marketplace registry...
            </div>
          ) : marketplacePlugins.length === 0 ? (
            <div className="text-center py-16 bg-[#1C1C1C] border border-[#2E2E2E] text-xs text-[#888]">
              No plugins found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketplacePlugins.map((manifest) => {
                const installed = installedPlugins.find((p) => p.manifest.id === manifest.id);
                const hasPendingUpdate = installed && manifest.version !== installed.manifest.version;

                return (
                  <div
                    key={manifest.id}
                    className="bg-[#1C1C1C] border border-[#2E2E2E] hover:border-[#444] transition-colors p-5 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-10 h-10 bg-[#262626] text-amber-400 border border-[#3A3A3A] flex items-center justify-center shrink-0">
                          {renderPluginIcon(manifest.icon, 'w-5 h-5')}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono uppercase bg-[#262626] text-amber-300 px-2 py-0.5 border border-[#383838]">
                            {manifest.category}
                          </span>
                          {manifest.isOfficial && (
                            <span className="text-[10px] font-mono uppercase bg-blue-950 text-blue-300 px-1.5 py-0.2 border border-blue-800">
                              Official
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-white leading-tight">
                          {manifest.name}
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] text-[#777] mt-1 font-mono">
                          <span>v{manifest.version}</span>
                          <span>&bull;</span>
                          <span>{manifest.author.name}</span>
                        </div>
                      </div>

                      <p className="text-xs text-[#aaa] leading-relaxed line-clamp-3">
                        {manifest.description}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-[#888] pt-1">
                        <div className="flex items-center gap-1 text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="font-bold font-mono">{manifest.rating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[#aaa] font-mono">
                          <Download className="w-3 h-3 text-[#666]" />
                          <span>{manifest.downloadsCount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#2A2A2A] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setDetailsModalManifest(manifest)}
                        className="text-xs text-[#bbb] hover:text-white underline cursor-pointer"
                      >
                        More Details
                      </button>

                      {installed ? (
                        hasPendingUpdate ? (
                          <button
                            type="button"
                            onClick={() =>
                              setUpdateTargetPlugin({ plugin: installed, latestManifest: manifest })
                            }
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Sparkles className="w-3 h-3" /> Update
                          </button>
                        ) : (
                          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Installed
                          </span>
                        )
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleProceedInstallFromManifest(manifest)}
                          className="px-3.5 py-1.5 bg-white hover:bg-[#EEE] text-black font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" /> Install
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: UPLOAD PLUGIN */}
      {/* ========================================================================= */}
      {activeTab === 'upload' && (
        <div className="bg-[#1C1C1C] border border-[#2E2E2E] p-6 space-y-6 max-w-3xl">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Upload Custom Plugin Package
            </h2>
            <p className="text-xs text-[#aaa] mt-1 leading-relaxed">
              Upload a compatible FujiFinder plugin package or manifest. The system strictly validates manifest integrity, semver compatibility, and permissions before sandboxing and activating the code.
            </p>
          </div>

          {/* Drag & drop / File input */}
          <div className="border-2 border-dashed border-[#3A3A3A] hover:border-amber-500/50 p-8 text-center space-y-3 bg-[#181818] transition-colors">
            <Upload className="w-8 h-8 text-[#888] mx-auto" />
            <div>
              <label className="text-xs font-bold text-white bg-white text-black hover:bg-[#eee] px-4 py-2 cursor-pointer inline-block transition-colors">
                Choose .JSON or .ZIP Package
                <input
                  type="file"
                  accept=".json,.zip"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-[11px] text-[#777]">
              Supported formats: FujiFinder Manifest JSON or ZIP package with root <code className="text-[#aaa]">manifest.json</code>.
            </p>
          </div>

          {/* Or Paste Raw JSON */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#ddd] flex items-center justify-between">
              <span>Or Paste Raw Plugin Manifest JSON:</span>
              <button
                type="button"
                onClick={() => {
                  const sample = {
                    id: 'custom-camera-watermark',
                    name: 'Custom Gear EXIF Watermarker',
                    version: '1.0.0',
                    author: { name: 'Community Contributor', url: 'https://github.com' },
                    description: 'Automated watermark overlay on sample photo uploads with camera model and lens focal length.',
                    category: 'Utilities',
                    compatibility: { minAppVersion: '2.0.0', testedUpTo: '2.5.0' },
                    permissions: ['media:read', 'media:write'],
                    entryPoints: { hasAdminPage: true },
                    settingsSchema: [
                      {
                        id: 'watermarkText',
                        label: 'Watermark Signature Text',
                        type: 'text',
                        defaultValue: 'Photo by FujiFinder Lab',
                      },
                    ],
                    features: ['Batch EXIF overlay', 'Custom font positioning'],
                    changelog: [{ version: '1.0.0', date: '2026-09-01', changes: ['Initial community build'] }],
                    tags: ['watermark', 'media', 'exif'],
                    rating: 5.0,
                    reviewsCount: 1,
                    downloadsCount: 1,
                  };
                  setUploadedJson(JSON.stringify(sample, null, 2));
                }}
                className="text-[11px] text-amber-400 hover:underline cursor-pointer"
              >
                Insert Sample Manifest
              </button>
            </label>
            <textarea
              rows={8}
              value={uploadedJson}
              onChange={(e) => setUploadedJson(e.target.value)}
              placeholder="Paste plugin JSON manifest structure here..."
              className="w-full bg-[#141414] border border-[#333] p-3 text-xs font-mono text-white focus:outline-hidden focus:border-white"
            />
            <button
              type="button"
              onClick={handleValidateUploadedManifest}
              disabled={!uploadedJson.trim()}
              className="px-4 py-2 bg-[#2A2A2A] hover:bg-[#333] text-white text-xs border border-[#444] cursor-pointer disabled:opacity-50 transition-colors"
            >
              Validate & Inspect Package
            </button>
          </div>

          {/* Validation errors */}
          {uploadErrors.length > 0 && (
            <div className="bg-rose-950/40 border border-rose-900/60 p-4 space-y-2 text-xs text-rose-200">
              <div className="flex items-center gap-2 font-bold text-rose-400">
                <AlertTriangle className="w-4 h-4" /> Manifest Validation Failed:
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {uploadErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Parsed Inspection Preview */}
          {parsedManifest && (
            <div className="bg-[#242424] border border-emerald-500/40 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#333]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Package Validated Successfully
                  </span>
                </div>
                <span className="text-xs font-mono text-emerald-400">
                  Ready for Review
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{parsedManifest.name}</h3>
                <p className="text-xs text-[#aaa] mt-0.5">{parsedManifest.description}</p>
                <div className="flex items-center gap-3 text-[11px] text-[#888] font-mono mt-2">
                  <span>ID: {parsedManifest.id}</span>
                  <span>&bull;</span>
                  <span>v{parsedManifest.version}</span>
                  <span>&bull;</span>
                  <span>By {parsedManifest.author.name}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setParsedManifest(null)}
                  className="px-3 py-1.5 text-xs text-[#888] hover:text-white"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={() => handleProceedInstallFromManifest(parsedManifest)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" /> Review Permissions & Install
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: UPDATES */}
      {/* ========================================================================= */}
      {activeTab === 'updates' && (
        <div className="space-y-4">
          <div className="bg-[#1C1C1C] border border-[#2E2E2E] p-4 flex items-center justify-between text-xs">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Plugin Updates Available ({availableUpdatesCount})
              </h2>
              <p className="text-xs text-[#888]">
                Keep your installed plugins updated for new features, speed optimizations, and security patches.
              </p>
            </div>

            {availableUpdatesCount > 0 && (
              <button
                type="button"
                onClick={handleUpdateAll}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" /> Update All ({availableUpdatesCount})
              </button>
            )}
          </div>

          {availableUpdatesCount === 0 ? (
            <div className="bg-[#1C1C1C] border border-[#2E2E2E] text-center py-16 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                All Plugins Are Up to Date
              </h3>
              <p className="text-xs text-[#888] max-w-sm mx-auto">
                No newer versions were found across the FujiFinder official marketplace registry.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {installedPlugins.map((plugin) => {
                const latest = hasUpdate(plugin.manifest.id);
                if (!latest) return null;

                return (
                  <div
                    key={plugin.manifest.id}
                    className="bg-[#1C1C1C] border border-amber-500/30 p-5 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{plugin.manifest.name}</h3>
                          <span className="text-[10px] font-mono uppercase bg-[#262626] text-amber-400 px-2 py-0.5 border border-[#383838]">
                            Update Available
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono text-[#aaa] mt-1">
                          <span>Current: v{plugin.manifest.version}</span>
                          <ArrowRight className="w-3 h-3 text-amber-400" />
                          <span className="text-amber-400 font-bold">New: v{latest.version}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setUpdateTargetPlugin({ plugin, latestManifest: latest })
                        }
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Review & Update
                      </button>
                    </div>

                    {/* Release Notes Preview */}
                    <div className="bg-[#141414] p-3 border border-[#262626] text-xs">
                      <span className="text-[10px] uppercase font-mono text-[#888] block mb-1">
                        Changelog Highlights:
                      </span>
                      <ul className="list-disc pl-4 text-xs text-[#bbb] space-y-0.5">
                        {latest.changelog?.[0]?.changes?.map((ch, idx) => (
                          <li key={idx}>{ch}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ACTIVITY / LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'logs' && (
        <div className="bg-[#1C1C1C] border border-[#2E2E2E] p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#2E2E2E]">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Plugin Lifecycle & Security Logs
              </h2>
              <p className="text-xs text-[#888]">
                Audit trail of all installation, activation, permission approval, and rollback events.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportLogs}
                className="px-3 py-1.5 bg-[#252525] hover:bg-[#333] text-white text-xs border border-[#3A3A3A] cursor-pointer transition-colors"
              >
                Export JSON
              </button>
              <button
                type="button"
                onClick={clearLogs}
                className="px-3 py-1.5 bg-[#252525] hover:bg-rose-950/50 text-[#888] hover:text-rose-300 text-xs border border-[#3A3A3A] cursor-pointer transition-colors"
              >
                Clear Logs
              </button>
            </div>
          </div>

          {activityLogs.length === 0 ? (
            <div className="text-center py-12 text-[#888] text-xs">
              No activity logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#ccc]">
                <thead>
                  <tr className="border-b border-[#2A2A2A] text-[10px] uppercase font-mono text-[#888]">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Plugin</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Details</th>
                    <th className="py-2.5 px-3">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {activityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#222] transition-colors">
                      <td className="py-2 px-3 font-mono text-[#777] whitespace-nowrap text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2 px-3 font-semibold text-white whitespace-nowrap">
                        {log.pluginName}
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-mono text-[10px] uppercase bg-[#282828] text-amber-300 px-1.5 py-0.2 border border-[#383838]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[#aaa] max-w-md">{log.details}</td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {log.severity === 'error' && (
                          <span className="text-[10px] font-mono text-rose-400">Error</span>
                        )}
                        {log.severity === 'warning' && (
                          <span className="text-[10px] font-mono text-amber-400">Warning</span>
                        )}
                        {log.severity === 'success' && (
                          <span className="text-[10px] font-mono text-emerald-400">Success</span>
                        )}
                        {log.severity === 'info' && (
                          <span className="text-[10px] font-mono text-blue-400">Info</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* 1. Settings Modal */}
      {settingsModalPlugin && (
        <PluginSettingsModal
          plugin={settingsModalPlugin}
          onClose={() => setSettingsModalPlugin(null)}
        />
      )}

      {/* 2. Permissions Approval Modal */}
      {permissionsModalManifest && (
        <PluginPermissionsModal
          manifest={permissionsModalManifest}
          actionType={permissionsActionType}
          onConfirm={handleConfirmPermissions}
          onCancel={() => setPermissionsModalManifest(null)}
        />
      )}

      {/* 3. Plugin Details Modal */}
      {detailsModalManifest && (
        <PluginDetailsModal
          manifest={detailsModalManifest}
          installedPlugin={installedPlugins.find((p) => p.manifest.id === detailsModalManifest.id)}
          onInstall={(m) => {
            setDetailsModalManifest(null);
            handleProceedInstallFromManifest(m);
          }}
          onActivate={(id) => activatePlugin(id)}
          onDeactivate={(id) => deactivatePlugin(id)}
          onOpenSettings={(p) => {
            setDetailsModalManifest(null);
            setSettingsModalPlugin(p);
          }}
          onUpdate={(id, m) => {
            setDetailsModalManifest(null);
            const inst = installedPlugins.find((p) => p.manifest.id === id);
            if (inst) setUpdateTargetPlugin({ plugin: inst, latestManifest: m });
          }}
          onClose={() => setDetailsModalManifest(null)}
        />
      )}

      {/* 4. Uninstall Confirmation Dialog */}
      {uninstallTargetPlugin && (
        <PluginUninstallDialog
          plugin={uninstallTargetPlugin}
          onConfirm={(deleteSettings) => {
            uninstallPlugin(uninstallTargetPlugin.manifest.id, deleteSettings);
            setUninstallTargetPlugin(null);
          }}
          onCancel={() => setUninstallTargetPlugin(null)}
        />
      )}

      {/* 5. Update Modal */}
      {updateTargetPlugin && (
        <PluginUpdateModal
          plugin={updateTargetPlugin.plugin}
          latestManifest={updateTargetPlugin.latestManifest}
          onConfirmUpdate={() => {
            updatePlugin(
              updateTargetPlugin.plugin.manifest.id,
              updateTargetPlugin.latestManifest
            );
            setUpdateTargetPlugin(null);
          }}
          onCancel={() => setUpdateTargetPlugin(null)}
        />
      )}
    </div>
  );
};
