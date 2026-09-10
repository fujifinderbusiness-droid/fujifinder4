import React, { useState } from 'react';
import { ExternalLink, Check, ShoppingBag, ShieldCheck } from 'lucide-react';
import { AffiliateRetailerLink } from '../types';
import { useData } from '../context/DataContext';

interface AffiliateButtonProps {
  productId: string;
  retailerLink?: AffiliateRetailerLink;
  sourceType?: 'article' | 'product_page' | 'comparison' | 'landing_card' | 'quick_finder';
  sourceSlug?: string;
  customText?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showRetailer?: boolean;
}

export const AffiliateButton: React.FC<AffiliateButtonProps> = ({
  productId,
  retailerLink,
  sourceType = 'landing_card',
  sourceSlug,
  customText,
  className = '',
  size = 'md',
  showRetailer = true,
}) => {
  const { cameras, recordAffiliateClick } = useData();
  const [clicked, setClicked] = useState(false);
  const [showRedirectModal, setShowRedirectModal] = useState(false);

  const product = cameras.find((c) => c.id === productId);
  const primaryLink = retailerLink || product?.affiliateLinks?.[0];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!primaryLink) return;

    recordAffiliateClick(productId, primaryLink.retailer, sourceType, sourceSlug);
    setClicked(true);
    setShowRedirectModal(true);

    // Provide clear, realistic UX: inform reader of affiliate redirect with merchant notice
    setTimeout(() => {
      setClicked(false);
    }, 3000);
  };

  const closeRedirect = () => {
    setShowRedirectModal(false);
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em]',
    md: 'px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em]',
    lg: 'px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.2em]',
  };

  const retailerName = primaryLink?.retailer || 'Authorized Retailer';
  const priceDisplay = primaryLink?.price ? `$${primaryLink.price.toLocaleString()}` : '';

  return (
    <>
      <button
        id={`affiliate-btn-${productId}-${primaryLink?.id || 'default'}`}
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-2 bg-[#1A1A1A] text-white transition-all duration-200 hover:bg-black cursor-pointer whitespace-nowrap ${sizeClasses[size]} ${className}`}
        title="Checkout melalui link affiliate mitra resmi (FujiFinder tidak menjual kamera secara langsung)"
      >
        <ShoppingBag className="w-3.5 h-3.5 text-[#E5DFD5]" />
        <span>
          {customText || (
            <>
              {clicked ? 'Mengarahkan...' : 'Checkout'}
              {showRetailer && retailerName && (
                <span className="opacity-80 font-normal ml-1">di {retailerName}</span>
              )}
              {priceDisplay && <span className="ml-1 font-bold text-white">({priceDisplay})</span>}
            </>
          )}
        </span>
        <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {/* Transparent Affiliate Redirection Modal */}
      {showRedirectModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={closeRedirect}
        >
          <div 
            className="w-full max-w-md bg-white border border-[#EEEBE6] p-6 shadow-2xl relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EEEBE6]">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#2E7D32]">
                <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
                Checkout via Mitra Resmi (Link Affiliate)
              </div>
              <button 
                onClick={closeRedirect}
                className="text-xs text-[#888] hover:text-black p-1"
              >
                ✕ Close
              </button>
            </div>

            <div className="mt-4">
              <h4 className="font-serif text-xl font-normal text-[#1A1A1A]">
                Checkout di {primaryLink?.retailer}
              </h4>
              <p className="text-xs text-[#666] mt-1.5 leading-relaxed">
                Anda akan dialihkan ke halaman pemesanan resmi untuk{' '}
                <strong className="text-[#1A1A1A]">{product?.name || 'Kamera Pilihan'}</strong>.
              </p>

              {primaryLink?.price && (
                <div className="mt-4 p-3 bg-[#FDFCFB] border border-[#EEEBE6] flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-[#888]">Harga Terverifikasi:</span>
                  <span className="text-lg font-serif font-normal text-[#1A1A1A]">
                    ${primaryLink.price.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="mt-4 text-xs text-[#555] bg-[#F9F8F6] p-3 border border-[#E5DFD5] leading-relaxed">
                <p className="font-bold text-[#1A1A1A] mb-1">ℹ️ Pemberitahuan Pembelian:</p>
                FujiFinder adalah media ulasan independen dan <strong>tidak menjual produk secara langsung</strong>. Tombol checkout ini menggunakan link affiliate resmi ke toko rekanan ({primaryLink?.retailer}). Kami dapat menerima komisi rujukan tanpa biaya tambahan bagi Anda.
              </div>

              <div className="mt-5 flex items-center gap-3">
                <a
                  href={primaryLink?.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  onClick={closeRedirect}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#1A1A1A] text-white font-semibold text-xs uppercase tracking-widest hover:bg-black transition-colors"
                >
                  Buka Checkout di {primaryLink?.retailer}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={closeRedirect}
                  className="py-3 px-4 border border-[#EEEBE6] text-xs uppercase tracking-widest font-semibold text-[#666] hover:border-black hover:text-black"
                >
                  Stay on Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
