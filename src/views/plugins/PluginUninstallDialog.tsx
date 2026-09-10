import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { InstalledPlugin } from '../../types/pluginTypes';

interface PluginUninstallDialogProps {
  plugin: InstalledPlugin;
  onConfirm: (deleteSettings: boolean) => void;
  onCancel: () => void;
}

export const PluginUninstallDialog: React.FC<PluginUninstallDialogProps> = ({
  plugin,
  onConfirm,
  onCancel,
}) => {
  const [deleteSettings, setDeleteSettings] = useState(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-[#1A1A1A] border border-rose-900/60 text-white w-full max-w-md shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#333]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Uninstall Plugin
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-[#888] hover:text-white p-1 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#bbb] leading-relaxed">
          Are you sure you want to uninstall <strong className="text-white">{plugin.manifest.name}</strong>?
          All registered widgets, editor extensions, and frontend injections will be immediately detached.
        </p>

        <div className="bg-[#242424] p-3 border border-[#333] text-xs">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={deleteSettings}
              onChange={(e) => setDeleteSettings(e.target.checked)}
              className="mt-0.5 accent-rose-500 cursor-pointer"
            />
            <span className="text-[#ccc] text-xs">
              Permanently purge custom plugin settings and cached operational state (Uncheck to preserve settings in historical backup archive).
            </span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#333]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs text-[#aaa] hover:text-white cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(deleteSettings)}
            className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Confirm Uninstall
          </button>
        </div>
      </div>
    </div>
  );
};
