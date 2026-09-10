import React from 'react';
import { Star, CheckCircle2, XCircle, Award, ArrowUpRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { AffiliateButton } from './AffiliateButton';

interface DynamicProductBoxProps {
  productId: string;
  badge?: string;
  customNote?: string;
  sourceSlug?: string;
}

export const DynamicProductBox: React.FC<DynamicProductBoxProps> = ({
  productId,
  badge,
  customNote,
  sourceSlug,
}) => {
  const { cameras, navigateTo } = useData();
  const camera = cameras.find((c) => c.id === productId);

  if (!camera) {
    return (
      <div className="p-4 my-6 bg-[#F4F1EA] rounded-xl border border-dashed border-[#D5CFC5] text-xs text-[#7A746C] text-center">
        Referenced Camera ({productId}) is currently being updated in our gear database.
      </div>
    );
  }

  const primaryDeal = camera.affiliateLinks[0];

  return (
    <div 
      id={`editorial-product-${camera.id}`}
      className="my-8 bg-white border border-[#EEEBE6] hover:border-black p-5 sm:p-6 transition-all duration-200 text-left"
    >
      {/* Top Banner Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[#EEEBE6]">
        <div className="flex items-center gap-2">
          <span className="bg-[#1A1A1A] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-[#E5DFD5]" />
            {badge || camera.bestForBadge || 'FujiFinder Recommendation'}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-[#888] hidden sm:inline">
            Tested & Verified in Field
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A1A1A] bg-[#F9F8F6] border border-[#EEEBE6] px-2.5 py-1">
          <Star className="w-3.5 h-3.5 fill-[#1A1A1A] text-[#1A1A1A]" />
          <span>{camera.rating.toFixed(1)} / 10 Score</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Product Image */}
        <div 
          onClick={() => navigateTo('camera-detail', camera.slug)}
          className="md:col-span-4 h-48 sm:h-52 overflow-hidden bg-[#E5E2DD] cursor-pointer group relative"
        >
          <img
            src={camera.image}
            alt={camera.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Product Highlights & Specs */}
        <div className="md:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#888] mb-1">
              <span className="font-bold">{camera.brand}</span>
              <span>•</span>
              <span>{camera.specs.sensorFormat}</span>
            </div>

            <h3 
              onClick={() => navigateTo('camera-detail', camera.slug)}
              className="font-serif text-2xl font-normal text-[#1A1A1A] hover:opacity-75 cursor-pointer transition-opacity"
            >
              {camera.name}
            </h3>

            {customNote && (
              <p className="text-xs sm:text-sm font-serif italic text-[#555] mt-1.5 bg-[#F9F8F6] p-3 border-l border-black">
                “{customNote}”
              </p>
            )}

            <p className="text-xs sm:text-sm text-[#666] mt-2 leading-relaxed font-sans">
              {camera.shortDescription}
            </p>

            {/* Quick Pros / Cons Snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#EEEBE6] text-xs">
              <div>
                <span className="font-bold text-[#1A1A1A] text-[10px] uppercase tracking-wider flex items-center gap-1 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" /> Top Strengths
                </span>
                <ul className="space-y-1 text-[#666]">
                  {camera.pros.slice(0, 2).map((pro, idx) => (
                    <li key={idx} className="line-clamp-1 text-[11px]">• {pro}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-bold text-[#1A1A1A] text-[10px] uppercase tracking-wider flex items-center gap-1 mb-1">
                  <XCircle className="w-3.5 h-3.5 text-[#C62828]" /> Watch Out For
                </span>
                <ul className="space-y-1 text-[#666]">
                  {camera.cons.slice(0, 2).map((con, idx) => (
                    <li key={idx} className="line-clamp-1 text-[11px]">• {con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Pricing and Action Bar */}
          <div className="mt-5 pt-3 border-t border-[#EEEBE6] flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="block text-[9px] uppercase tracking-widest text-[#888]">
                Best Authorized Price
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl font-light text-[#1A1A1A]">
                  ${camera.price.toLocaleString()}
                </span>
                {primaryDeal && (
                  <span className="text-xs text-[#2E7D32] font-medium uppercase tracking-wider text-[10px]">
                    {primaryDeal.badge || 'In Stock'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTo('camera-detail', camera.slug)}
                className="px-4 py-2.5 text-[11px] uppercase tracking-[0.15em] font-semibold border border-[#EEEBE6] text-[#1A1A1A] hover:border-black transition-colors cursor-pointer"
              >
                In-Depth Review
              </button>
              <AffiliateButton
                productId={camera.id}
                sourceType="article"
                sourceSlug={sourceSlug}
                size="md"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
