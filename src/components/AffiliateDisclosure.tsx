import React, { useState } from 'react';
import { Info, Shield, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useData } from '../context/DataContext';

export const AffiliateDisclosureBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { siteSettings } = useData();
  const [expanded, setExpanded] = useState(false);

  if (compact) {
    return (
      <div className="text-xs text-[#7A746C] py-2 px-3 bg-[#F4F1EA]/80 border border-[#EAE4DC] rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#8E877E] shrink-0" />
          <span>Independent & Reader-Supported: We may earn an affiliate commission on qualifying purchases.</span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[11px] underline hover:text-[#1A1918] ml-2 shrink-0"
        >
          {expanded ? 'Less' : 'Learn more'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#F6F4EF] border border-[#E8E2D8] rounded-xl p-4 my-6 text-sm text-[#5C564E]">
      <div className="flex items-start gap-3">
        <Shield className="w-5 h-5 text-[#8E877E] shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-[#1A1918] text-xs uppercase tracking-wider">
              Editorial Integrity & Affiliate Notice
            </h4>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-[#8E877E] hover:text-[#1A1918] flex items-center gap-1"
            >
              {expanded ? 'Hide Details' : 'Our Testing Ethics'}
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-[#6B655D]">
            {siteSettings.affiliateDisclosureText}
          </p>

          {expanded && (
            <div className="mt-3 pt-3 border-t border-[#E5DFD5] text-xs text-[#5C564E] space-y-2 animate-in fade-in duration-200">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0 mt-0.5" />
                <span><strong>Zero Sponsored Reviews:</strong> Brands cannot pay for positive scores, favorable rankings, or inclusion in our guides.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0 mt-0.5" />
                <span><strong>Real-World Field Testing:</strong> Every camera undergoes rigorous street, studio, or landscape shooting before receiving an editorial rating.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0 mt-0.5" />
                <span><strong>Transparent Retail Links:</strong> We track authorized pricing across Amazon, B&H Photo, Adorama, and MPB to save our readers money.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
