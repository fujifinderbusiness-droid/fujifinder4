import React from 'react';
import { Star, Award, ArrowUpRight, SlidersHorizontal, Check } from 'lucide-react';
import { CameraProduct } from '../types';
import { useData } from '../context/DataContext';
import { AffiliateButton } from './AffiliateButton';

interface CameraCardProps {
  camera: CameraProduct;
  layout?: 'grid' | 'horizontal' | 'compact';
  sourceSlug?: string;
}

export const CameraCard: React.FC<CameraCardProps> = ({ camera, layout = 'grid', sourceSlug }) => {
  const { navigateTo, toggleCompareCamera, comparedCameraIds } = useData();
  const isCompared = comparedCameraIds.includes(camera.id);

  if (layout === 'horizontal') {
    return (
      <div className="bg-white border border-[#EEEBE6] hover:border-black p-5 md:p-6 transition-all duration-200 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group">
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center flex-1">
          <div 
            onClick={() => navigateTo('camera-detail', camera.slug)}
            className="w-full sm:w-44 h-36 overflow-hidden bg-[#E5E2DD] shrink-0 cursor-pointer relative"
          >
            <img
              src={camera.image}
              alt={camera.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {camera.editorsChoice && (
              <span className="absolute top-2 left-2 bg-[#1A1A1A] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 flex items-center gap-1">
                <Award className="w-3 h-3 text-[#E5DFD5]" />
                Editor’s Choice
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#888]">{camera.brand}</span>
              <span className="text-[#CCC]">•</span>
              <span className="text-[10px] uppercase tracking-wider text-[#888]">{camera.specs.sensorFormat}</span>
            </div>

            <h3 
              onClick={() => navigateTo('camera-detail', camera.slug)}
              className="font-serif text-xl font-normal text-[#1A1A1A] group-hover:opacity-75 cursor-pointer transition-opacity leading-tight truncate"
            >
              {camera.name}
            </h3>

            <p className="text-xs text-[#666] mt-1.5 line-clamp-2 leading-relaxed font-sans">
              {camera.shortDescription}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1A1A1A] bg-[#F9F8F6] border border-[#EEEBE6] px-2 py-0.5">
                <Star className="w-3 h-3 fill-[#1A1A1A] text-[#1A1A1A]" />
                {camera.rating.toFixed(1)} / 10
              </span>
              <span className="text-xs text-[#888] italic font-serif">
                Ideal for: {camera.idealUseCase}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-[#EEEBE6] shrink-0">
          <div className="text-left md:text-right">
            <div className="text-[10px] uppercase tracking-widest text-[#888]">Starting Price</div>
            <div className="font-serif text-xl font-light text-[#1A1A1A]">
              ${camera.price.toLocaleString()}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('camera-detail', camera.slug)}
              className="px-4 py-2 text-[11px] uppercase tracking-[0.15em] font-semibold border border-[#EEEBE6] text-[#1A1A1A] hover:border-black transition-colors cursor-pointer"
            >
              View Review
            </button>
            <AffiliateButton
              productId={camera.id}
              sourceType="landing_card"
              sourceSlug={sourceSlug}
              size="sm"
              customText="Checkout"
              showRetailer={false}
            />
          </div>
        </div>
      </div>
    );
  }

  // Standard Grid Card
  return (
    <div 
      id={`camera-card-${camera.id}`}
      className="bg-white border border-[#EEEBE6] hover:border-black overflow-hidden transition-all duration-200 flex flex-col group relative"
    >
      {/* Visual Header */}
      <div 
        onClick={() => navigateTo('camera-detail', camera.slug)}
        className="h-56 w-full overflow-hidden bg-[#E5E2DD] relative cursor-pointer"
      >
        <img
          src={camera.image}
          alt={camera.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {camera.bestForBadge ? (
            <span className="bg-[#1A1A1A] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1">
              {camera.bestForBadge}
            </span>
          ) : camera.editorsChoice ? (
            <span className="bg-[#1A1A1A] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 flex items-center gap-1">
              <Award className="w-3 h-3 text-[#E5DFD5]" />
              Editor’s Choice
            </span>
          ) : null}
        </div>

        {/* Score Badge */}
        <div className="absolute bottom-3 right-3 bg-white/95 border border-[#EEEBE6] text-[#1A1A1A] text-[11px] font-bold px-2 py-0.5 flex items-center gap-1">
          <Star className="w-3 h-3 fill-[#1A1A1A] text-[#1A1A1A]" />
          <span>{camera.rating.toFixed(1)}</span>
        </div>

        {/* Quick Compare Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleCompareCamera(camera.id);
          }}
          title={isCompared ? 'Remove from compare' : 'Add to compare'}
          className={`absolute top-3 right-3 p-1.5 border border-[#EEEBE6] transition-colors cursor-pointer ${
            isCompared 
              ? 'bg-[#1A1A1A] text-white border-black' 
              : 'bg-white/90 text-[#666] hover:text-black hover:border-black'
          }`}
        >
          {isCompared ? <Check className="w-3.5 h-3.5" /> : <SlidersHorizontal className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#888] mb-1.5">
            <span className="font-bold">{camera.brand}</span>
            <span>{camera.specs.sensorFormat}</span>
          </div>

          <h3 
            onClick={() => navigateTo('camera-detail', camera.slug)}
            className="font-serif text-xl font-normal text-[#1A1A1A] group-hover:opacity-75 transition-opacity cursor-pointer leading-snug"
          >
            {camera.name}
          </h3>

          <p className="text-xs text-[#888] font-serif italic mt-1 line-clamp-1">
            Best for: {camera.idealUseCase}
          </p>

          <p className="text-xs text-[#666] mt-2.5 line-clamp-2 leading-relaxed">
            {camera.shortDescription}
          </p>

          {/* Key Specs Pills */}
          <div className="grid grid-cols-2 gap-1.5 mt-4 pt-3 border-t border-[#EEEBE6] text-[11px] text-[#666]">
            <div className="truncate">
              <span className="text-[#999] uppercase tracking-wider text-[10px]">Sensor:</span> {camera.specs.megapixels}MP
            </div>
            <div className="truncate">
              <span className="text-[#999] uppercase tracking-wider text-[10px]">IBIS:</span> {camera.specs.ibis ? 'Yes' : 'OIS Only'}
            </div>
          </div>
        </div>

        {/* Pricing & CTA Buttons */}
        <div className="mt-6 pt-4 border-t border-[#EEEBE6] flex items-center justify-between gap-2">
          <div>
            <span className="block text-[9px] uppercase tracking-widest text-[#888]">Starting At</span>
            <span className="font-serif text-lg font-light text-[#1A1A1A]">
              ${camera.price.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('camera-detail', camera.slug)}
              className="px-3.5 py-2 text-[11px] uppercase tracking-[0.15em] font-semibold border border-[#EEEBE6] text-[#1A1A1A] hover:border-black transition-colors cursor-pointer whitespace-nowrap"
            >
              Review
            </button>
            <AffiliateButton
              productId={camera.id}
              sourceType="landing_card"
              sourceSlug={sourceSlug}
              size="sm"
              customText="Checkout"
              showRetailer={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
