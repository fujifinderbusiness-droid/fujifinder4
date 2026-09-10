import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Shield, Check, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { InstalledPlugin, PluginSettingField } from '../../types/pluginTypes';
import { usePluginSystem } from '../../plugins/PluginContext';

interface PluginSettingsModalProps {
  plugin: InstalledPlugin;
  onClose: () => void;
}

export const PluginSettingsModal: React.FC<PluginSettingsModalProps> = ({ plugin, onClose }) => {
  const { updatePluginSettings } = usePluginSystem();
  const [formData, setFormData] = useState<Record<string, any>>({ ...plugin.settings });
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setFormData({ ...plugin.settings });
  }, [plugin]);

  const handleChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const toggleSensitive = (fieldId: string) => {
    setShowSensitive((prev) => ({ ...prev, [fieldId]: !prev[fieldId] }));
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetDefaults = () => {
    const defaults: Record<string, any> = {};
    plugin.manifest.settingsSchema?.forEach((f) => {
      defaults[f.id] = f.defaultValue;
    });
    setFormData(defaults);
    setShowResetConfirm(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updatePluginSettings(plugin.manifest.id, formData);
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const schema = plugin.manifest.settingsSchema || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#1A1A1A] border border-[#333] text-white w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#333]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase bg-[#2A2A2A] text-amber-400 px-2 py-0.5 border border-[#444]">
                {plugin.manifest.category}
              </span>
              <h3 className="text-base font-bold text-white">{plugin.manifest.name}</h3>
            </div>
            <p className="text-xs text-[#888] mt-0.5">
              Plugin Configuration &bull; v{plugin.manifest.version} by {plugin.manifest.author.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#888] hover:text-white p-1 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {schema.length === 0 ? (
            <div className="text-center py-12 text-[#888] text-xs">
              This plugin does not require any additional configuration settings. It runs automatically with core system defaults.
            </div>
          ) : (
            schema.map((field: PluginSettingField) => {
              const value = formData[field.id] !== undefined ? formData[field.id] : field.defaultValue;

              return (
                <div key={field.id} className="space-y-1.5 pb-4 border-b border-[#2A2A2A] last:border-b-0">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#ddd] flex items-center gap-1.5">
                      {field.label}
                      {field.required && <span className="text-rose-400">*</span>}
                      {field.sensitive && (
                        <span className="text-[10px] text-amber-400 font-mono bg-amber-950/60 px-1.5 py-0.2 border border-amber-800/40">
                          Secret / Key
                        </span>
                      )}
                    </label>
                    {field.type === 'range' && (
                      <span className="text-xs font-mono text-amber-300 font-bold">{value}</span>
                    )}
                  </div>

                  {field.description && (
                    <p className="text-[11px] text-[#888] leading-relaxed">{field.description}</p>
                  )}

                  {/* Render based on field type */}
                  {field.type === 'toggle' && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => handleChange(field.id, !value)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                          value ? 'bg-emerald-600' : 'bg-[#333]'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="text-xs text-[#aaa] ml-3">
                        {value ? 'Active / Enabled' : 'Inactive / Disabled'}
                      </span>
                    </div>
                  )}

                  {field.type === 'text' && (
                    <input
                      type="text"
                      value={value || ''}
                      placeholder={field.placeholder}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full bg-[#242424] border border-[#3A3A3A] px-3 py-2 text-xs text-white focus:outline-hidden focus:border-white transition-colors"
                    />
                  )}

                  {field.type === 'url' && (
                    <input
                      type="url"
                      value={value || ''}
                      placeholder={field.placeholder || 'https://...'}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full bg-[#242424] border border-[#3A3A3A] px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-white transition-colors"
                    />
                  )}

                  {field.type === 'password' && (
                    <div className="relative">
                      <input
                        type={showSensitive[field.id] ? 'text' : 'password'}
                        value={value || ''}
                        placeholder={field.placeholder || 'Enter secret key...'}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        className="w-full bg-[#242424] border border-[#3A3A3A] px-3 py-2 pr-10 text-xs text-white font-mono focus:outline-hidden focus:border-white transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSensitive(field.id)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777] hover:text-white cursor-pointer"
                      >
                        {showSensitive[field.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  )}

                  {field.type === 'number' && (
                    <input
                      type="number"
                      value={value}
                      min={field.min}
                      max={field.max}
                      step={field.step || 1}
                      onChange={(e) => handleChange(field.id, Number(e.target.value))}
                      className="w-full max-w-xs bg-[#242424] border border-[#3A3A3A] px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-white transition-colors"
                    />
                  )}

                  {field.type === 'range' && (
                    <input
                      type="range"
                      value={value}
                      min={field.min || 0}
                      max={field.max || 100}
                      step={field.step || 1}
                      onChange={(e) => handleChange(field.id, Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  )}

                  {field.type === 'select' && (
                    <select
                      value={value}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full bg-[#242424] border border-[#3A3A3A] px-3 py-2 text-xs text-white focus:outline-hidden focus:border-white transition-colors"
                    >
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {field.type === 'color' && (
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={value || '#1A1A1A'}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        className="w-10 h-8 bg-transparent cursor-pointer border border-[#444]"
                      />
                      <span className="text-xs font-mono text-[#aaa]">{value}</span>
                    </div>
                  )}

                  {field.type === 'textarea' && (
                    <textarea
                      rows={3}
                      value={value || ''}
                      placeholder={field.placeholder}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full bg-[#242424] border border-[#3A3A3A] px-3 py-2 text-xs text-white focus:outline-hidden focus:border-white transition-colors"
                    />
                  )}
                </div>
              );
            })
          )}
        </form>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#333] bg-[#141414]">
          {showResetConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-400">Reset all?</span>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-2 py-1 text-[11px] bg-rose-600 hover:bg-rose-700 text-white font-medium transition-colors cursor-pointer"
              >
                Yes, Reset
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="text-xs text-[#888] hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 text-xs text-[#888] hover:text-white cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restore Plugin Defaults
            </button>
          )}

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved successfully
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#aaa] hover:text-white cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold bg-white text-black hover:bg-[#EEE] flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
