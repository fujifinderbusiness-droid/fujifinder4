import React, { useState } from 'react';
import { 
  Star, 
  Award, 
  CheckCircle2, 
  XCircle, 
  ShoppingBag, 
  SlidersHorizontal, 
  ExternalLink, 
  ShieldCheck, 
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Share2,
  Bookmark,
  Check
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { AffiliateButton } from '../components/AffiliateButton';
import { AffiliateDisclosureBanner } from '../components/AffiliateDisclosure';
import { ComparisonTable } from '../components/ComparisonTable';
import { ArticleCard } from '../components/ArticleCard';
import { CameraCard } from '../components/CameraCard';

export const CameraDetailPage: React.FC = () => {
  const { activeSlug, cameras, articles, navigateTo, setComparedCameraIds, isAdminLoggedIn } = useData();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const camera = (activeSlug ? cameras.find((c) => c.slug === activeSlug) : undefined) || cameras.find((c) => (c.status ?? 'published') === 'published') || cameras[0];

  if (!camera) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-[#1A1918]">Camera Not Found</h2>
        <p className="text-sm text-[#6B655D]">The requested camera model is not in our database.</p>
        <button
          onClick={() => navigateTo('cameras')}
          className="px-5 py-2.5 rounded-full bg-[#1A1918] text-white text-xs font-semibold"
        >
          Return to Cameras
        </button>
      </div>
    );
  }

  if ((camera.status ?? 'published') === 'draft' && !isAdminLoggedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-[#1A1918]">Kamera Masih dalam Draft</h2>
        <p className="text-sm text-[#6B655D]">Produk kamera ini belum dipublikasikan untuk pembaca umum.</p>
        <button
          onClick={() => navigateTo('cameras')}
          className="px-5 py-2.5 rounded-full bg-[#1A1918] text-white text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          Kembali ke Katalog Kamera
        </button>
      </div>
    );
  }

  const allImages = [camera.image, ...(camera.secondaryImages || [])];
  const relatedArticles = articles.filter((a) => a.status === 'published' && camera.relatedArticleSlugs?.includes(a.slug));
  const relatedCameras = cameras.filter((c) => (c.status ?? 'published') === 'published' && camera.relatedProductIds?.includes(c.id));

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCompareWith = (otherId: string) => {
    setComparedCameraIds([camera.id, otherId]);
    navigateTo('comparisons');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12 text-left">
      {/* Draft notice banner for admin */}
      {(camera.status ?? 'published') === 'draft' && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-2.5 rounded text-xs flex items-center justify-between shadow-xs">
          <span>Mode Pratinjau Admin: Kamera ini berstatus <strong>Draft</strong> dan tersembunyi dari publik.</span>
          <span className="bg-amber-400 text-amber-950 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Draft</span>
        </div>
      )}

      {/* Breadcrumb Bar */}
      <div className="flex items-center justify-between">
        <Breadcrumbs
          items={[
            { label: 'Cameras', view: 'cameras' },
            { label: camera.brand, view: 'cameras' },
            { label: camera.name, active: true },
          ]}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-full border border-[#D5CFC5] text-[#5C564E] hover:text-[#1A1918] hover:bg-[#F4F1EA] text-xs flex items-center gap-1.5 cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#2E7D32]" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? 'Link Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Hero Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="h-96 sm:h-[480px] w-full overflow-hidden bg-[#E5E2DD] border border-[#EEEBE6] relative">
            <img
              src={allImages[activeImageIndex]}
              alt={camera.name}
              className="w-full h-full object-cover object-center transition-all duration-500"
            />
            {camera.editorsChoice && (
              <span className="absolute top-4 left-4 bg-[#1A1A1A] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-white" />
                FujiFinder Editor’s Choice
              </span>
            )}
            <div className="absolute bottom-4 right-4 bg-[#1A1A1A] text-white text-[10px] font-bold px-2.5 py-1">
              ★ {camera.rating.toFixed(1)} / 10 Overall
            </div>
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-3">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-16 overflow-hidden border transition-all cursor-pointer ${
                    activeImageIndex === idx ? 'border-black' : 'border-[#EEEBE6] opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Key Details & Purchasing Hub */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#888] uppercase tracking-[0.15em] mb-2">
              <span>{camera.brand}</span>
              <span>•</span>
              <span>{camera.specs.sensorFormat}</span>
              <span>•</span>
              <span>Released {camera.releaseYear}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#1A1A1A] leading-tight">
              {camera.name}
            </h1>

            <p className="text-sm font-serif italic text-[#666] mt-2">
              Ideal for: {camera.idealUseCase}
            </p>

            <p className="text-sm sm:text-base text-[#666] mt-3 leading-relaxed">
              {camera.editorialOverview}
            </p>
          </div>

          {/* Score Radar / Category Breakdown */}
          <div className="bg-white border border-[#EEEBE6] p-4 sm:p-5 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#888]">
              FujiFinder Testing Scorecard
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#FDFCFB] p-2.5 border border-[#EEEBE6]">
                <span className="text-[#888] block text-[10px] uppercase tracking-wider">Image Quality</span>
                <span className="font-serif text-base text-[#1A1A1A]">
                  {camera.scoreBreakdown.imageQuality} / 10
                </span>
              </div>
              <div className="bg-[#FDFCFB] p-2.5 border border-[#EEEBE6]">
                <span className="text-[#888] block text-[10px] uppercase tracking-wider">Autofocus Precision</span>
                <span className="font-serif text-base text-[#1A1A1A]">
                  {camera.scoreBreakdown.autofocus} / 10
                </span>
              </div>
              <div className="bg-[#FDFCFB] p-2.5 border border-[#EEEBE6]">
                <span className="text-[#888] block text-[10px] uppercase tracking-wider">Build & Dials</span>
                <span className="font-serif text-base text-[#1A1A1A]">
                  {camera.scoreBreakdown.buildErgonomics} / 10
                </span>
              </div>
              <div className="bg-[#FDFCFB] p-2.5 border border-[#EEEBE6]">
                <span className="text-[#888] block text-[10px] uppercase tracking-wider">Video Codecs</span>
                <span className="font-serif text-base text-[#1A1A1A]">
                  {camera.scoreBreakdown.videoFeatures} / 10
                </span>
              </div>
              <div className="bg-[#FDFCFB] p-2.5 border border-[#EEEBE6]">
                <span className="text-[#888] block text-[10px] uppercase tracking-wider">Value Proposition</span>
                <span className="font-serif text-base text-[#1A1A1A]">
                  {camera.scoreBreakdown.valueForMoney} / 10
                </span>
              </div>
              <div className="bg-[#1A1A1A] text-white p-2.5 flex flex-col justify-center">
                <span className="text-[#888] block text-[10px] uppercase tracking-wider">Overall Rating</span>
                <span className="font-serif text-base text-white">
                  ★ {camera.rating.toFixed(1)} / 10
                </span>
              </div>
            </div>
          </div>

          {/* Central Affiliate Purchasing Hub */}
          <div className="bg-white border-2 border-[#1A1A1A] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#888]">
                  Authorized Retail Availability
                </span>
                <h3 className="font-serif text-xl font-normal text-[#1A1A1A]">
                  Best Current Verified Prices
                </h3>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-[#2E7D32] font-bold border border-[#2E7D32]/30 px-2 py-0.5">
                Price-Checked Daily
              </span>
            </div>

            {/* List of Retailers */}
            <div className="space-y-2.5">
              {camera.affiliateLinks.map((deal) => (
                <div
                  key={deal.id}
                  className="flex items-center justify-between p-3.5 border border-[#EEEBE6] bg-[#FDFCFB] hover:border-black transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#1A1A1A]">{deal.retailer}</span>
                      {deal.badge && (
                        <span className="text-[9px] font-bold uppercase tracking-wider border border-[#EEEBE6] bg-white text-[#666] px-1.5 py-0.5">
                          {deal.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#888]">
                      {deal.inStock ? 'In Stock & Ships Immediately' : 'Check Backorder Queue'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-serif text-lg font-normal text-[#1A1A1A]">
                      ${deal.price.toLocaleString()}
                    </span>
                    <AffiliateButton
                      productId={camera.id}
                      retailerLink={deal}
                      sourceType="product_page"
                      sourceSlug={camera.slug}
                      size="sm"
                      customText="Check Deal"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-[#888] leading-relaxed pt-1">
              <strong className="text-[#1A1A1A]">Reader Guarantee:</strong> FujiFinder earns an affiliate commission when you purchase through our links. This does not increase the price you pay.
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#EEEBE6] p-6">
          <div className="flex items-center gap-2 text-[#2E7D32] font-bold text-[11px] uppercase tracking-[0.15em] mb-4">
            <CheckCircle2 className="w-4 h-4" />
            Key Strengths & Field Highlights
          </div>
          <ul className="space-y-3">
            {camera.pros.map((pro, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#444] leading-relaxed">
                <span className="text-[#2E7D32] font-bold mt-0.5">•</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-[#EEEBE6] p-6">
          <div className="flex items-center gap-2 text-[#C62828] font-bold text-[11px] uppercase tracking-[0.15em] mb-4">
            <XCircle className="w-4 h-4" />
            Trade-Offs & Potential Drawbacks
          </div>
          <ul className="space-y-3">
            {camera.cons.map((con, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#444] leading-relaxed">
                <span className="text-[#C62828] font-bold mt-0.5">•</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Who is This Camera For? */}
      <section className="bg-white border border-[#EEEBE6] p-6 sm:p-8">
        <h3 className="font-serif text-2xl font-normal text-[#1A1A1A] mb-2">
          Who Is the {camera.name} Right For?
        </h3>
        <p className="text-sm sm:text-base text-[#666] leading-relaxed">
          {camera.whoIsThisFor}
        </p>
      </section>

      {/* Full Technical Specifications Sheet */}
      <section className="bg-white border border-[#EEEBE6] overflow-hidden">
        <div className="p-6 bg-[#FDFCFB] border-b border-[#EEEBE6] flex items-center justify-between">
          <div>
            <h3 className="font-serif text-2xl font-normal text-[#1A1A1A]">
              Laboratory & Hardware Specifications
            </h3>
            <p className="text-xs text-[#888] mt-0.5">
              Verified technical datasheet for {camera.name}
            </p>
          </div>
          <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#888] bg-white px-3 py-1 border border-[#EEEBE6]">
            Full Specs
          </span>
        </div>

        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-xs sm:text-sm">
          <div className="py-2.5 border-b border-[#EEEBE6] flex justify-between">
            <span className="text-[#888]">Sensor & Resolution</span>
            <span className="font-medium text-[#1A1A1A] text-right">{camera.specs.sensor}</span>
          </div>
          <div className="py-2.5 border-b border-[#EEEBE6] flex justify-between">
            <span className="text-[#888]">Sensor Format</span>
            <span className="font-medium text-[#1A1A1A] text-right">{camera.specs.sensorFormat}</span>
          </div>
          <div className="py-2.5 border-b border-[#EEEBE6] flex justify-between">
            <span className="text-[#888]">Lens Mount</span>
            <span className="font-medium text-[#1A1A1A] text-right">{camera.specs.mount}</span>
          </div>
          <div className="py-2.5 border-b border-[#EEEBE6] flex justify-between">
            <span className="text-[#888]">Effective Pixels</span>
            <span className="font-medium text-[#1A1A1A] text-right">{camera.specs.megapixels} MP</span>
          </div>
          <div className="py-2.5 border-b border-[#EEEBE6] flex justify-between">
            <span className="text-[#888]">In-Body Stabilization</span>
            <span className="font-medium text-[#1A1A1A] text-right">{camera.specs.ibis}</span>
          </div>
          <div className="py-2.5 border-b border-[#EEEBE6] flex justify-between">
            <span className="text-[#888]">Autofocus System</span>
            <span className="font-medium text-[#1A1A1A] text-right max-w-xs">{camera.specs.autofocus}</span>
          </div>
          <div className="py-2.5 border-b border-[#EEEBE6] flex justify-between">
            <span className="text-[#888]">ISO Sensitivity</span>
            <span className="font-medium text-[#1A1A1A] text-right">{camera.specs.isoRange}</span>
          </div>
          <div className="py-2.5 border-b border-[#EEEBE6] flex justify-between">
            <span className="text-[#888]">Continuous Burst Rate</span>
            <span className="font-medium text-[#1A1A1A] text-right">{camera.specs.continuousShooting}</span>
          </div>
          <div className="py-2.5 border-b border-[#EEEBE6] flex justify-between">
            <span className="text-[#888]">Video Capabilities</span>
            <span className="font-medium text-[#1A1A1A] text-right max-w-xs">{camera.specs.videoSpecs}</span>
          </div>
          <div className="py-2.5 border-b border-[#EEEBE6] flex justify-between">
            <span className="text-[#888]">Electronic Viewfinder</span>
            <span className="font-medium text-[#1A1A1A] text-right">{camera.specs.viewfinder}</span>
          </div>
          <div className="py-2.5 border-b border-[#EEEBE6] flex justify-between">
            <span className="text-[#888]">Rear LCD Display</span>
            <span className="font-medium text-[#1A1A1A] text-right">{camera.specs.rearDisplay}</span>
          </div>
          <div className="py-2.5 border-b border-[#EEEBE6] flex justify-between">
            <span className="text-[#888]">Battery Endurance</span>
            <span className="font-medium text-[#1A1A1A] text-right">{camera.specs.batteryLife}</span>
          </div>
          <div className="py-2.5 border-b border-[#EEEBE6] flex justify-between">
            <span className="text-[#888]">Weight (with Battery)</span>
            <span className="font-medium text-[#1A1A1A] text-right">{camera.specs.weight}</span>
          </div>
          <div className="py-2.5 border-b border-[#EEEBE6] flex justify-between">
            <span className="text-[#888]">Memory Media</span>
            <span className="font-medium text-[#1A1A1A] text-right">{camera.specs.memorySlots}</span>
          </div>
        </div>
      </section>

      {/* Head-to-Head Comparison against Competitors */}
      {relatedCameras.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#888]">
                Direct Competitors
              </span>
              <h3 className="font-serif text-2xl font-normal text-[#1A1A1A]">
                Compare {camera.name} with Rival Cameras
              </h3>
            </div>
          </div>
          <ComparisonTable productIds={[camera.id, ...relatedCameras.map((c) => c.id)]} sourceSlug={camera.slug} />
        </section>
      )}

      {/* Related Articles and Field Reports */}
      {relatedArticles.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-[#EEEBE6]">
          <h3 className="font-serif text-2xl font-normal text-[#1A1A1A]">
            In-Depth Field Guides Featuring {camera.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedArticles.map((art) => (
              <ArticleCard key={art.id} article={art} layout="horizontal" />
            ))}
          </div>
        </section>
      )}

      {/* Affiliate Transparency */}
      <AffiliateDisclosureBanner />
    </div>
  );
};
