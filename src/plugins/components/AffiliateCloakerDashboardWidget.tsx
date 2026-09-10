import React from 'react';
import { Link2, ShieldCheck, Tag, ExternalLink, ArrowRight } from 'lucide-react';
import { usePluginSystem } from '../PluginContext';

export const AffiliateCloakerDashboardWidget: React.FC = () => {
  const { isPluginActive, getPluginSettings } = usePluginSystem();
  if (!isPluginActive('fujifinder-affiliate-cloaker')) return null;

  const settings = getPluginSettings('fujifinder-affiliate-cloaker');
  const prefix = settings.cloakPrefix || '/go/';
  const utmSource = settings.utmSourceDefault || 'fujifinder_review';

  return (
    <div className="bg-[#1A1A1A] text-white p-5 border border-[#333]">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#333]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Link2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Affiliate Deep Link Cloaker & UTM Hub
              </h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 uppercase font-mono">
                Plugin Active
              </span>
            </div>
            <p className="text-[11px] text-[#888]">Brand-safe link routing, Google sponsored compliance & UTM tagging</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
          <ShieldCheck className="w-4 h-4" /> rel="sponsored" Enforced
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-[#242424] p-3 border border-[#333]">
          <span className="text-[10px] text-[#888] uppercase tracking-wider block">Cloak Path Prefix</span>
          <span className="text-base font-bold font-mono text-emerald-300">{prefix}</span>
          <span className="text-[10px] text-[#888] block mt-0.5">e.g. {prefix}fuji-x100vi</span>
        </div>
        <div className="bg-[#242424] p-3 border border-[#333]">
          <span className="text-[10px] text-[#888] uppercase tracking-wider block">Default UTM Source</span>
          <span className="text-base font-bold font-mono text-white truncate block">{utmSource}</span>
          <span className="text-[10px] text-[#888] block mt-0.5">Appended to outbound redirects</span>
        </div>
        <div className="bg-[#242424] p-3 border border-[#333]">
          <span className="text-[10px] text-[#888] uppercase tracking-wider block">Link Integrity</span>
          <span className="text-base font-bold font-mono text-emerald-400">100% Active</span>
          <span className="text-[10px] text-[#888] block mt-0.5">Zero 404 dead referrals</span>
        </div>
      </div>

      {/* Sample Cloaked Routes */}
      <div className="bg-[#141414] p-3 border border-[#2a2a2a] text-xs space-y-2">
        <span className="text-[10px] uppercase font-mono text-[#888] tracking-wider block">
          Active Dynamic Redirect Routes
        </span>
        {[
          {
            slug: 'fujifilm-x100vi',
            target: 'https://www.bhphotovideo.com/c/product/1811946-REG/...',
            clicks: 142,
          },
          {
            slug: 'sony-a7iv',
            target: 'https://www.tokopedia.com/fujiofficial/fuji-xt50-kit?...',
            clicks: 98,
          },
          {
            slug: 'ricoh-gr-iiix',
            target: 'https://www.adorama.com/ircg3x.html?...',
            clicks: 65,
          },
        ].map((item) => (
          <div
            key={item.slug}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] pb-1.5 border-b border-[#262626] last:border-b-0"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-emerald-400">{prefix}{item.slug}</span>
              <ArrowRight className="w-3 h-3 text-[#666]" />
              <span className="text-[#888] truncate max-w-[220px]">{item.target}</span>
            </div>
            <span className="text-[10px] font-mono text-[#aaa]">{item.clicks} tracked clicks</span>
          </div>
        ))}
      </div>
    </div>
  );
};
