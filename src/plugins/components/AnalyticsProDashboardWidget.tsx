import React, { useState, useEffect } from 'react';
import { BarChart3, Users, MousePointerClick, ArrowUpRight, ShieldCheck, Activity } from 'lucide-react';
import { usePluginSystem } from '../PluginContext';

export const AnalyticsProDashboardWidget: React.FC = () => {
  const { isPluginActive, getPluginSettings } = usePluginSystem();
  const [pulseCount, setPulseCount] = useState(42);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulseCount((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(28, prev + delta);
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  if (!isPluginActive('fujifinder-analytics-pro')) return null;

  const settings = getPluginSettings('fujifinder-analytics-pro');
  const conversionVal = Number(settings.goalConversionValue) || 1.25;

  return (
    <div className="bg-[#1A1A1A] text-white p-5 border border-[#333]">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#333]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Real-Time Telemetry & Affiliate Analytics
              </h3>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 uppercase font-mono">
                Plugin Active
              </span>
            </div>
            <p className="text-[11px] text-[#888]">Cookieless dwell-time & outbound retailer conversions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 border border-emerald-800/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {pulseCount} Live Readers Now
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-[#242424] p-3 border border-[#333]">
          <div className="flex items-center justify-between text-[10px] text-[#888] uppercase mb-1">
            <span>24h Pageviews</span>
            <Users className="w-3 h-3 text-blue-400" />
          </div>
          <span className="text-lg font-bold font-mono text-white">8,420</span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
            <ArrowUpRight className="w-3 h-3" /> +14.2% vs yesterday
          </span>
        </div>

        <div className="bg-[#242424] p-3 border border-[#333]">
          <div className="flex items-center justify-between text-[10px] text-[#888] uppercase mb-1">
            <span>Avg Article Dwell</span>
            <Activity className="w-3 h-3 text-amber-400" />
          </div>
          <span className="text-lg font-bold font-mono text-white">3m 48s</span>
          <span className="text-[10px] text-[#888] block mt-0.5">High Engagement</span>
        </div>

        <div className="bg-[#242424] p-3 border border-[#333]">
          <div className="flex items-center justify-between text-[10px] text-[#888] uppercase mb-1">
            <span>Outbound Clicks</span>
            <MousePointerClick className="w-3 h-3 text-emerald-400" />
          </div>
          <span className="text-lg font-bold font-mono text-white">418</span>
          <span className="text-[10px] text-emerald-400 block mt-0.5">4.96% CTR</span>
        </div>

        <div className="bg-[#242424] p-3 border border-[#333]">
          <div className="flex items-center justify-between text-[10px] text-[#888] uppercase mb-1">
            <span>Est. Referral Value</span>
            <ShieldCheck className="w-3 h-3 text-purple-400" />
          </div>
          <span className="text-lg font-bold font-mono text-white">
            ${(418 * conversionVal).toFixed(0)}
          </span>
          <span className="text-[10px] text-[#888] block mt-0.5">At ${conversionVal}/lead</span>
        </div>
      </div>

      {/* Retailer conversion stream breakdown */}
      <div className="bg-[#141414] p-3 border border-[#2a2a2a] text-xs">
        <div className="text-[10px] uppercase font-mono text-[#888] tracking-wider mb-2 flex items-center justify-between">
          <span>Top Affiliate Referral Destinations</span>
          <span>Share (%)</span>
        </div>
        <div className="space-y-2">
          {[
            { retailer: 'B&H Photo Video', share: 44, clicks: 184, color: 'bg-emerald-500' },
            { retailer: 'Tokopedia (Authorized Fuji)', share: 29, clicks: 121, color: 'bg-green-600' },
            { retailer: 'Amazon US / Global', share: 18, clicks: 75, color: 'bg-amber-500' },
            { retailer: 'Shopee Mall (Official)', share: 9, clicks: 38, color: 'bg-orange-500' },
          ].map((item) => (
            <div key={item.retailer} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white">{item.retailer}</span>
                <span className="font-mono text-[#aaa]">
                  {item.clicks} clicks ({item.share}%)
                </span>
              </div>
              <div className="w-full bg-[#262626] h-1.5 rounded-full overflow-hidden">
                <div className={`h-full ${item.color}`} style={{ width: `${item.share}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
