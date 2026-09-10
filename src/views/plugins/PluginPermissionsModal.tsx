import React from 'react';
import { Shield, ShieldAlert, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { PluginManifest, PluginPermission } from '../../types/pluginTypes';
import { getPermissionDefinition } from '../../plugins/permissionRegistry';

interface PluginPermissionsModalProps {
  manifest: PluginManifest;
  actionType: 'install' | 'activate' | 'update';
  onConfirm: (approvedPermissions: PluginPermission[]) => void;
  onCancel: () => void;
}

export const PluginPermissionsModal: React.FC<PluginPermissionsModalProps> = ({
  manifest,
  actionType,
  onConfirm,
  onCancel,
}) => {
  const permissions = manifest.permissions || [];

  const handleApprove = () => {
    onConfirm(permissions);
  };

  const getRiskBadge = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'high':
        return (
          <span className="text-[10px] font-mono uppercase bg-rose-950/80 text-rose-300 border border-rose-800/60 px-2 py-0.5 font-bold">
            High Privilege
          </span>
        );
      case 'medium':
        return (
          <span className="text-[10px] font-mono uppercase bg-amber-950/80 text-amber-300 border border-amber-800/60 px-2 py-0.5 font-bold">
            Standard Access
          </span>
        );
      case 'low':
      default:
        return (
          <span className="text-[10px] font-mono uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 font-bold">
            Read Only
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#1A1A1A] border border-[#333] text-white w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#333]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Security & Permission Review
              </h3>
              <p className="text-xs text-[#888]">
                Review capabilities requested by {manifest.name}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-[#888] hover:text-white p-1 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permissions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-[#242424] p-3.5 border border-[#333] text-xs leading-relaxed text-[#bbb]">
            <strong className="text-white block mb-1">
              Administrator Approval Required
            </strong>
            This plugin is requesting access to {permissions.length} system boundary {permissions.length === 1 ? 'scope' : 'scopes'}. FujiFinder isolates plugins in a sandboxed module layer, but sensitive scopes require your explicit consent before activation.
          </div>

          <div className="space-y-2.5">
            {permissions.map((perm) => {
              const def = getPermissionDefinition(perm);
              return (
                <div
                  key={perm}
                  className="bg-[#222] border border-[#333] p-3 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{def.name}</span>
                      <code className="text-[10px] text-[#888] font-mono bg-[#181818] px-1.5 py-0.5">
                        {def.permission}
                      </code>
                    </div>
                    <p className="text-[11px] text-[#999] leading-normal">{def.description}</p>
                  </div>
                  <div className="shrink-0">{getRiskBadge(def.riskLevel)}</div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-[#777] pt-2 border-t border-[#2A2A2A]">
            Developer: <strong className="text-[#bbb]">{manifest.author.name}</strong> &bull; Version: <strong className="text-[#bbb]">v{manifest.version}</strong>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#333] bg-[#141414]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs text-[#aaa] hover:text-white cursor-pointer transition-colors"
          >
            Cancel & Reject
          </button>
          <button
            type="button"
            onClick={handleApprove}
            className="px-5 py-2 text-xs font-bold bg-white text-black hover:bg-[#EEE] flex items-center gap-2 cursor-pointer transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Approve & {actionType === 'install' ? 'Install Plugin' : actionType === 'update' ? 'Update Plugin' : 'Activate Plugin'}
          </button>
        </div>
      </div>
    </div>
  );
};
