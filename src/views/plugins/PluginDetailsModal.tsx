import React, { useState } from 'react';
import {
  X,
  Star,
  Download,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Layers,
  Sparkles,
  Settings,
  ArrowUpRight,
} from 'lucide-react';
import { PluginManifest, InstalledPlugin } from '../../types/pluginTypes';
import { getPermissionDefinition } from '../../plugins/permissionRegistry';
import { CORE_APP_VERSION } from '../../plugins/marketplaceCatalog';

interface PluginDetailsModalProps {
  manifest: PluginManifest;
  installedPlugin?: InstalledPlugin;
  onInstall: (manifest: PluginManifest) => void;
  onActivate?: (id: string) => void;
  onDeactivate?: (id: string) => void;
  onOpenSettings?: (plugin: InstalledPlugin) => void;
  onUpdate?: (pluginId: string, manifest: PluginManifest) => void;
  onClose: () => void;
}

export const PluginDetailsModal: React.FC<PluginDetailsModalProps> = ({
  manifest,
  installedPlugin,
  onInstall,
  onActivate,
  onDeactivate,
  onOpenSettings,
  onUpdate,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'permissions' | 'changelog'>('overview');

  const isInstalled = Boolean(installedPlugin);
  const isActive = installedPlugin?.status === 'active';
  const hasUpdate = isInstalled && installedPlugin && manifest.version !== installedPlugin.manifest.version;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#1A1A1A] border border-[#333] text-white w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#333] relative">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 text-[#888] hover:text-white p-1 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pr-8">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono uppercase bg-[#262626] text-amber-400 px-2 py-0.5 border border-[#3A3A3A]">
                  {manifest.category}
                </span>
                {manifest.isOfficial && (
                  <span className="text-[10px] font-mono uppercase bg-blue-950 text-blue-300 px-2 py-0.5 border border-blue-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-blue-400" /> Verified Official
                  </span>
                )}
                <span className="text-xs text-[#888] font-mono">v{manifest.version}</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">{manifest.name}</h2>
              <p className="text-xs text-[#aaa] mt-1 max-w-xl leading-relaxed">
                {manifest.description}
              </p>
            </div>

            {/* Quick action button */}
            <div className="shrink-0 flex items-center gap-2">
              {!isInstalled ? (
                <button
                  type="button"
                  onClick={() => onInstall(manifest)}
                  className="px-5 py-2.5 bg-white text-black font-bold text-xs hover:bg-[#EEE] flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-4 h-4" /> Install Now
                </button>
              ) : hasUpdate ? (
                <button
                  type="button"
                  onClick={() => onUpdate && onUpdate(manifest.id, manifest)}
                  className="px-5 py-2.5 bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-4 h-4" /> Update to v{manifest.version}
                </button>
              ) : isActive ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenSettings && onOpenSettings(installedPlugin!)}
                    className="px-3.5 py-2 bg-[#2A2A2A] hover:bg-[#333] text-white text-xs flex items-center gap-1.5 cursor-pointer border border-[#444] transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" /> Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeactivate && onDeactivate(manifest.id)}
                    className="px-4 py-2 bg-[#333] hover:bg-[#444] text-[#ddd] text-xs cursor-pointer transition-colors"
                  >
                    Deactivate
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onActivate && onActivate(manifest.id)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" /> Activate
                </button>
              )}
            </div>
          </div>

          {/* Quick meta strip */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#888] mt-4 pt-3 border-t border-[#2A2A2A]">
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-bold font-mono">{manifest.rating.toFixed(1)}</span>
              <span className="text-[#777]">({manifest.reviewsCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-3.5 h-3.5 text-[#666]" />
              <span className="font-mono text-[#ddd]">{manifest.downloadsCount.toLocaleString()}</span> downloads
            </div>
            <div>
              Author: <span className="text-white font-medium">{manifest.author.name}</span>
            </div>
            <div className="font-mono text-[11px] text-emerald-400">
              Tested up to FujiFinder v{manifest.compatibility.testedUpTo}
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-[#333] bg-[#141414] px-6 text-xs font-medium">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'features', label: `Features (${manifest.features.length})` },
            { id: 'permissions', label: `Permissions (${manifest.permissions.length})` },
            { id: 'changelog', label: `Changelog (${manifest.changelog.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 -mb-px cursor-pointer transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-white text-white font-bold'
                  : 'border-transparent text-[#888] hover:text-[#bbb]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-[#ccc] space-y-4">
          {activeTab === 'overview' && (
            <div className="space-y-4 leading-relaxed">
              <div className="bg-[#242424] p-4 border border-[#333] text-sm text-[#eee] leading-relaxed">
                {manifest.detailedDescription || manifest.description}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-[#222] p-3 border border-[#333] space-y-1">
                  <span className="text-[10px] uppercase font-mono text-[#888]">Compatibility</span>
                  <p className="text-white font-mono text-xs">
                    Requires FujiFinder v{manifest.compatibility.minAppVersion} or newer (Current: v{CORE_APP_VERSION})
                  </p>
                </div>
                <div className="bg-[#222] p-3 border border-[#333] space-y-1">
                  <span className="text-[10px] uppercase font-mono text-[#888]">Release Date</span>
                  <p className="text-white font-mono text-xs flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#888]" /> {manifest.lastUpdated || '2026-08-15'}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[11px] uppercase font-mono text-[#888] block mb-2">Category Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {manifest.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-[#252525] border border-[#3A3A3A] text-[11px] font-mono text-[#aaa]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-2.5">
              {manifest.features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-[#242424] p-3 border border-[#333] text-xs text-white"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-2.5">
              <p className="text-[#888] text-[11px] mb-2">
                To guarantee modular stability, this plugin operates with least-privilege capability boundaries:
              </p>
              {manifest.permissions.map((perm) => {
                const def = getPermissionDefinition(perm);
                return (
                  <div key={perm} className="bg-[#242424] p-3 border border-[#333] flex justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <strong className="text-white">{def.name}</strong>
                        <code className="text-[10px] font-mono text-[#888] bg-[#181818] px-1 py-0.2">
                          {def.permission}
                        </code>
                      </div>
                      <p className="text-[11px] text-[#999]">{def.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'changelog' && (
            <div className="space-y-4">
              {manifest.changelog.map((entry) => (
                <div key={entry.version} className="bg-[#242424] p-3.5 border border-[#333] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono text-sm">v{entry.version}</span>
                    <span className="text-[11px] font-mono text-[#888]">{entry.date}</span>
                  </div>
                  <ul className="list-disc pl-4 text-xs text-[#bbb] space-y-1">
                    {entry.changes.map((ch, idx) => (
                      <li key={idx}>{ch}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#333] bg-[#141414] text-xs">
          <span className="text-[#777]">
            FujiFinder Extensible Plugin Framework &bull; Sandboxed Architecture
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-[#aaa] hover:text-white cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
