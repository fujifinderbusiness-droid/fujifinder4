import React from 'react';
import { Sparkles, ShieldCheck, ArrowRight, X, AlertCircle } from 'lucide-react';
import { InstalledPlugin, PluginManifest } from '../../types/pluginTypes';

interface PluginUpdateModalProps {
  plugin: InstalledPlugin;
  latestManifest: PluginManifest;
  onConfirmUpdate: () => void;
  onCancel: () => void;
}

export const PluginUpdateModal: React.FC<PluginUpdateModalProps> = ({
  plugin,
  latestManifest,
  onConfirmUpdate,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#1A1A1A] border border-amber-500/40 text-white w-full max-w-lg shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#333]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Plugin Update Available
              </h3>
              <p className="text-xs text-[#888]">{plugin.manifest.name}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-[#888] hover:text-white p-1 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Version comparison */}
        <div className="flex items-center justify-between bg-[#242424] p-3.5 border border-[#333] text-xs font-mono">
          <div>
            <span className="text-[10px] text-[#888] uppercase block">Current Version</span>
            <span className="text-white text-sm font-bold">v{plugin.manifest.version}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-400" />
          <div>
            <span className="text-[10px] text-[#888] uppercase block">Latest Version</span>
            <span className="text-amber-400 text-sm font-bold">v{latestManifest.version}</span>
          </div>
        </div>

        {/* Automated backup guarantee notice */}
        <div className="bg-blue-950/40 border border-blue-800/50 p-3 text-xs text-blue-200 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Safe Update System:</strong> FujiFinder automatically creates a snapshot backup of your current plugin settings prior to upgrading. If anything is incompatible, you can roll back instantly.
          </p>
        </div>

        {/* What's new */}
        <div>
          <span className="text-[11px] uppercase font-mono text-[#888] block mb-2">
            Release Notes (v{latestManifest.version})
          </span>
          <div className="bg-[#141414] p-3 border border-[#2a2a2a] max-h-48 overflow-y-auto space-y-2 text-xs">
            {latestManifest.changelog?.[0]?.changes?.map((change, i) => (
              <div key={i} className="flex items-start gap-2 text-[#ccc]">
                <span className="text-amber-400">&bull;</span>
                <span>{change}</span>
              </div>
            )) || <p className="text-[#888]">Performance improvements and bug fixes.</p>}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#333]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs text-[#aaa] hover:text-white cursor-pointer transition-colors"
          >
            Not Now
          </button>
          <button
            type="button"
            onClick={onConfirmUpdate}
            className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" /> Install Update & Backup
          </button>
        </div>
      </div>
    </div>
  );
};
