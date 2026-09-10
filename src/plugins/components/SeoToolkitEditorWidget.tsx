import React, { useState } from 'react';
import { Search, Sparkles, CheckCircle2, AlertCircle, Eye, RefreshCw } from 'lucide-react';
import { usePluginSystem } from '../PluginContext';

interface SeoToolkitEditorWidgetProps {
  title: string;
  focusKeyword: string;
  contentSnippet: string;
  metaTitle?: string;
  metaDesc?: string;
  slug?: string;
}

export const SeoToolkitEditorWidget: React.FC<SeoToolkitEditorWidgetProps> = ({
  title,
  focusKeyword,
  contentSnippet,
  metaTitle,
  metaDesc,
  slug,
}) => {
  const { isPluginActive, getPluginSettings } = usePluginSystem();
  const [activeSerpTab, setActiveSerpTab] = useState<'desktop' | 'mobile'>('google');

  if (!isPluginActive('fujifinder-seo-toolkit')) return null;

  const settings = getPluginSettings('fujifinder-seo-toolkit');
  const targetDensity = Number(settings.keywordDensityThreshold) || 1.8;

  // Simple live keyword frequency calculation
  const totalWords = (contentSnippet || '').trim().split(/\s+/).filter(Boolean).length;
  const kwMatches = focusKeyword
    ? (contentSnippet.match(new RegExp(focusKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length
    : 0;
  const currentDensity = totalWords > 0 ? ((kwMatches / totalWords) * 100).toFixed(1) : '0.0';

  const kwInTitle = focusKeyword && title.toLowerCase().includes(focusKeyword.toLowerCase());
  const kwInSlug = focusKeyword && (slug || '').toLowerCase().includes(focusKeyword.toLowerCase().replace(/\s+/g, '-'));

  return (
    <div className="bg-[#1C1C1C] border border-amber-500/30 p-5 mt-6 text-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#333]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              SEO Toolkit: Smart Content & SERP Assistant
            </h4>
            <span className="text-[10px] text-[#888]">Plugin extension active</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2 py-0.5 bg-[#2A2A2A] text-amber-300 border border-[#444]">
            KW Density: {currentDensity}% (Target: {targetDensity}%)
          </span>
        </div>
      </div>

      {/* SEO Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="bg-[#242424] p-2.5 border border-[#333] flex items-center gap-2">
          {kwInTitle ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span className="text-[11px]">
            {kwInTitle ? 'Keyword present in H1 headline' : 'Add focus keyword to H1 headline'}
          </span>
        </div>
        <div className="bg-[#242424] p-2.5 border border-[#333] flex items-center gap-2">
          {kwInSlug ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span className="text-[11px]">
            {kwInSlug ? 'Keyword present in URL slug' : 'Include keyword in clean URL slug'}
          </span>
        </div>
        <div className="bg-[#242424] p-2.5 border border-[#333] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-[11px]">JSON-LD Camera Schema: Enabled</span>
        </div>
      </div>

      {/* SERP Live Simulator */}
      {settings.enableSerpSimulator && (
        <div className="bg-[#111] p-3.5 border border-[#2a2a2a] text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-mono text-[#888] tracking-wider flex items-center gap-1.5">
              <Eye className="w-3 h-3 text-blue-400" /> Google SERP Snippet Preview
            </span>
            <div className="flex gap-1 text-[10px]">
              <button
                type="button"
                onClick={() => setActiveSerpTab('desktop')}
                className={`px-2 py-0.5 cursor-pointer ${
                  activeSerpTab === 'desktop' ? 'bg-white text-black font-bold' : 'text-[#888] bg-[#222]'
                }`}
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setActiveSerpTab('mobile')}
                className={`px-2 py-0.5 cursor-pointer ${
                  activeSerpTab === 'mobile' ? 'bg-white text-black font-bold' : 'text-[#888] bg-[#222]'
                }`}
              >
                Mobile
              </button>
            </div>
          </div>

          {/* Google Search Card Preview */}
          <div className="bg-white text-black p-3.5 rounded shadow-sm max-w-xl font-sans">
            <div className="flex items-center gap-2 text-[11px] text-[#555] mb-1">
              <span className="w-4 h-4 rounded-full bg-[#E5E5E5] flex items-center justify-center font-bold text-[9px] text-[#222]">
                F
              </span>
              <span className="truncate">
                {(settings.autoCanonicalHost || 'https://www.fujifinder.my.id')}/reviews/{slug || 'article-slug'}
              </span>
            </div>
            <h5 className="text-[#1a0dab] hover:underline text-[15px] font-medium leading-tight cursor-pointer line-clamp-1">
              {metaTitle || title || 'Article Title - FujiFinder Camera Lab'}
            </h5>
            <p className="text-[12px] text-[#4d5156] mt-1 line-clamp-2 leading-snug">
              {metaDesc ||
                contentSnippet?.slice(0, 150) ||
                'In-depth camera testing, sensor measurements, and retail pricing comparisons from FujiFinder editorial team.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
