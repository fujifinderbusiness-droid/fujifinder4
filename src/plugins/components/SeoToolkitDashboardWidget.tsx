import React from 'react';
import { Search, CheckCircle2, AlertTriangle, ExternalLink, Sparkles, TrendingUp } from 'lucide-react';
import { usePluginSystem } from '../PluginContext';

export const SeoToolkitDashboardWidget: React.FC = () => {
  const { isPluginActive, getPluginSettings } = usePluginSystem();
  if (!isPluginActive('fujifinder-seo-toolkit')) return null;

  const settings = getPluginSettings('fujifinder-seo-toolkit');

  return (
    <div className="bg-[#1A1A1A] text-white p-5 border border-[#333]">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#333]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">SEO & Schema Health</h3>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 uppercase font-mono">
                Plugin Active
              </span>
            </div>
            <p className="text-[11px] text-[#888]">Google Search readiness & JSON-LD coverage</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" /> 94/100 Index Score
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-[#242424] p-2.5 border border-[#333]">
          <span className="text-[10px] text-[#888] uppercase tracking-wider block">Schema Coverage</span>
          <span className="text-base font-bold text-white font-mono">100%</span>
          <span className="text-[10px] text-emerald-400 block mt-0.5">Valid JSON-LD</span>
        </div>
        <div className="bg-[#242424] p-2.5 border border-[#333]">
          <span className="text-[10px] text-[#888] uppercase tracking-wider block">Avg Density</span>
          <span className="text-base font-bold text-white font-mono">{settings.keywordDensityThreshold || 1.8}%</span>
          <span className="text-[10px] text-emerald-400 block mt-0.5">Optimal Range</span>
        </div>
        <div className="bg-[#242424] p-2.5 border border-[#333]">
          <span className="text-[10px] text-[#888] uppercase tracking-wider block">SERP Previews</span>
          <span className="text-base font-bold text-white font-mono">
            {settings.enableSerpSimulator ? 'Active' : 'Off'}
          </span>
          <span className="text-[10px] text-blue-400 block mt-0.5">Desktop + Mobile</span>
        </div>
        <div className="bg-[#242424] p-2.5 border border-[#333]">
          <span className="text-[10px] text-[#888] uppercase tracking-wider block">GSC Status</span>
          <span className="text-base font-bold text-white font-mono truncate">
            {settings.gscVerificationMeta ? 'Verified' : 'Pending'}
          </span>
          <span className="text-[10px] text-[#888] block mt-0.5">Google Console</span>
        </div>
      </div>

      <div className="bg-[#141414] p-3 border border-[#2a2a2a] text-xs space-y-1.5">
        <div className="flex items-center justify-between text-[#aaa]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Canonical Domain:
          </span>
          <span className="font-mono text-white text-[11px] truncate max-w-[200px]">
            {settings.autoCanonicalHost || 'https://www.fujifinder.my.id'}
          </span>
        </div>
        <div className="flex items-center justify-between text-[#aaa]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Default Schema Strategy:
          </span>
          <span className="font-mono text-amber-300 text-[11px]">
            {settings.autoSchemaType === 'auto' ? 'Auto-Detect (Review / Article)' : settings.autoSchemaType}
          </span>
        </div>
      </div>
    </div>
  );
};
