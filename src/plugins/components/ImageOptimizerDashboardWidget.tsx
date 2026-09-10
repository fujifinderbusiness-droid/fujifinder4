import React from 'react';
import { Image as ImageIcon, Zap, HardDrive, CheckCircle2, Shield } from 'lucide-react';
import { usePluginSystem } from '../PluginContext';

export const ImageOptimizerDashboardWidget: React.FC = () => {
  const { isPluginActive, getPluginSettings } = usePluginSystem();
  if (!isPluginActive('fujifinder-image-optimizer')) return null;

  const settings = getPluginSettings('fujifinder-image-optimizer');
  const quality = settings.webpQuality || 85;

  return (
    <div className="bg-[#1A1A1A] text-white p-5 border border-[#333]">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#333]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                WebP & Retina Image Optimizer
              </h3>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 uppercase font-mono">
                Plugin Active
              </span>
            </div>
            <p className="text-[11px] text-[#888]">Next-gen WebP formatting, lazy-loading thresholds & EXIF retention</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5" /> 68.4% Bandwidth Saved
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-[#242424] p-3 border border-[#333]">
          <span className="text-[10px] text-[#888] uppercase tracking-wider block">Compression</span>
          <span className="text-base font-bold font-mono text-white">{quality}% WebP</span>
          <span className="text-[10px] text-purple-400 block mt-0.5">Visually Lossless</span>
        </div>
        <div className="bg-[#242424] p-3 border border-[#333]">
          <span className="text-[10px] text-[#888] uppercase tracking-wider block">Lazy Loading</span>
          <span className="text-base font-bold font-mono text-emerald-400">
            {settings.enableLazyThreshold ? 'Enabled' : 'Disabled'}
          </span>
          <span className="text-[10px] text-[#888] block mt-0.5">Viewport + 200px</span>
        </div>
        <div className="bg-[#242424] p-3 border border-[#333]">
          <span className="text-[10px] text-[#888] uppercase tracking-wider block">EXIF Metadata</span>
          <span className="text-base font-bold font-mono text-white">
            {settings.preserveExifGearTags ? 'Preserved' : 'Stripped'}
          </span>
          <span className="text-[10px] text-amber-400 block mt-0.5">Aperture & ISO kept</span>
        </div>
        <div className="bg-[#242424] p-3 border border-[#333]">
          <span className="text-[10px] text-[#888] uppercase tracking-wider block">CDN Delivery</span>
          <span className="text-base font-bold font-mono text-blue-400">Edge Cache</span>
          <span className="text-[10px] text-[#888] block mt-0.5">&lt;35ms latency</span>
        </div>
      </div>

      <div className="bg-[#141414] p-3 border border-[#2a2a2a] text-xs flex items-center justify-between text-[#aaa]">
        <div className="flex items-center gap-2">
          <HardDrive className="w-3.5 h-3.5 text-purple-400" />
          <span>Total Asset Library Payload:</span>
          <span className="font-mono text-white">128.4 MB original &rarr; 40.5 MB WebP</span>
        </div>
        <span className="font-mono text-emerald-400 font-semibold">+87.9 MB saved</span>
      </div>
    </div>
  );
};
