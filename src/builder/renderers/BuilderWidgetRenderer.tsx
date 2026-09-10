import React, { useState } from 'react';
import {
  BuilderBlock,
  Breakpoint,
} from '../../types/builderTypes';
import { useData } from '../../context/DataContext';
import {
  ArrowRight,
  Search,
  Camera as CameraIcon,
  Star,
  Clock,
  Mail,
  Check,
  ChevronRight,
  Sparkles,
  Link2,
  BarChart2,
  ExternalLink,
  ShieldCheck,
  Play,
  Share2,
  Sliders,
  Layers,
  Award,
  Instagram,
  Youtube,
  Twitter,
} from 'lucide-react';
import { AffiliateButton } from '../../components/AffiliateButton';
import { subscribePublic } from '../../services/newsletterApi';

interface BuilderWidgetRendererProps {
  block: BuilderBlock;
  breakpoint: Breakpoint;
  isInteractive?: boolean; // In builder canvas, some clicks can be intercepted
  onSelect?: () => void;
  isSelected?: boolean;
}

export const BuilderWidgetRenderer: React.FC<BuilderWidgetRendererProps> = ({
  block,
  breakpoint,
  isInteractive = true,
  onSelect,
  isSelected = false,
}) => {
  const { cameras, articles, navigateTo, setSelectedCategory, setSearchModalOpen, toggleCompareCamera } = useData();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  const [newsletterSuccessMsg, setNewsletterSuccessMsg] = useState<string | null>(null);
  const [activeSim, setActiveSim] = useState<'A' | 'B'>('A');

  const content = block.content || {};
  const style = block.style || {};
  const visibility = block.visibility || { desktop: true, tablet: true, mobile: true };

  // Visibility check for current breakpoint
  if (visibility[breakpoint] === false) {
    if (isInteractive) {
      return (
        <div
          onClick={onSelect}
          className={`p-3 border border-dashed border-amber-300 bg-amber-50/70 text-amber-900 text-xs flex items-center justify-between rounded-sm cursor-pointer ${
            isSelected ? 'ring-2 ring-black' : ''
          }`}
        >
          <span className="font-mono">
            [Tersembunyi di {breakpoint}]: {block.label || 'Widget'}
          </span>
          <span className="text-[10px] uppercase font-semibold bg-amber-200/80 px-2 py-0.5 rounded">
            Hidden
          </span>
        </div>
      );
    }
    return null;
  }

  // Calculate Responsive Styles
  const margin = style.margin?.[breakpoint] || style.margin?.desktop || { top: 0, right: 0, bottom: 0, left: 0 };
  const padding = style.padding?.[breakpoint] || style.padding?.desktop || { top: 0, right: 0, bottom: 0, left: 0 };
  const columns = style.columns?.[breakpoint] || (breakpoint === 'mobile' ? 1 : breakpoint === 'tablet' ? 2 : 3);

  const containerStyle: React.CSSProperties = {
    marginTop: `${margin.top}px`,
    marginRight: `${margin.right}px`,
    marginBottom: `${margin.bottom}px`,
    marginLeft: `${margin.left}px`,
    paddingTop: `${padding.top}px`,
    paddingRight: `${padding.right}px`,
    paddingBottom: `${padding.bottom}px`,
    paddingLeft: `${padding.left}px`,
    backgroundColor: style.backgroundColor || undefined,
    color: style.textColor || undefined,
    borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
    borderWidth: style.borderWidth ? `${style.borderWidth}px` : undefined,
    borderColor: style.borderColor || undefined,
    borderStyle: style.borderWidth ? 'solid' : undefined,
    textAlign: style.textAlign || undefined,
  };

  const maxWidthClass =
    style.maxWidth === 'full'
      ? 'w-full'
      : style.maxWidth === '1440px'
      ? 'max-w-[1440px] mx-auto w-full'
      : style.maxWidth === '1280px'
      ? 'max-w-[1280px] mx-auto w-full'
      : style.maxWidth === '1140px'
      ? 'max-w-[1140px] mx-auto w-full'
      : style.maxWidth === '960px'
      ? 'max-w-[960px] mx-auto w-full'
      : style.maxWidth === '768px'
      ? 'max-w-[768px] mx-auto w-full'
      : 'w-full';

  // 1. HERO SECTION
  if (block.type === 'hero') {
    const minHeight = content.minHeight || 480;
    const overlay = content.overlayOpacity !== undefined ? content.overlayOpacity : 0.6;
    const align = content.alignment || 'left';

    return (
      <div style={containerStyle} className={maxWidthClass}>
        <div
          className={`relative overflow-hidden flex items-center ${
            align === 'center'
              ? 'justify-center text-center'
              : align === 'right'
              ? 'justify-end text-right'
              : 'justify-start text-left'
          }`}
          style={{
            minHeight: `${minHeight}px`,
            backgroundImage: content.backgroundImage ? `url("${content.backgroundImage}")` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: '#1A1A1A',
          }}
        >
          {/* Dark overlay */}
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: overlay }}
          />

          <div className="relative z-10 p-6 md:p-12 max-w-3xl text-white space-y-4">
            {content.badge && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-xs text-[11px] font-semibold tracking-wider uppercase">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{content.badge}</span>
              </div>
            )}

            {content.date && (
              <p className="text-xs text-white/70 font-mono">{content.date}</p>
            )}

            <h1 className="text-2xl md:text-4xl lg:text-5xl font-serif font-normal leading-tight">
              {content.headline || 'Judul Utama Hero'}
            </h1>

            {content.subtitle && (
              <p className="text-sm md:text-base text-white/80 font-light leading-relaxed max-w-2xl">
                {content.subtitle}
              </p>
            )}

            <div className={`flex flex-wrap gap-3 pt-2 ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
              {content.primaryBtnText && (
                <button
                  type="button"
                  onClick={() => content.primaryBtnLink && navigateTo('cameras')}
                  className="px-6 py-3 bg-white text-black text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>{content.primaryBtnText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {content.secondaryBtnText && (
                <button
                  type="button"
                  onClick={() => {
                    const target =
                      document.getElementById('newsletter-subscription-section') ||
                      document.getElementById('sec-newsletter') ||
                      document.querySelector('[data-widget="newsletter-signup"]') ||
                      document.querySelector('input[type="email"]');
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      setTimeout(() => {
                        const input = (target.tagName === 'INPUT' ? target : target.querySelector('input[type="email"]')) as HTMLInputElement | null;
                        if (input) {
                          input.focus();
                          input.classList.add('ring-2', 'ring-white', 'ring-offset-2');
                          setTimeout(() => {
                            input.classList.remove('ring-2', 'ring-white', 'ring-offset-2');
                          }, 2000);
                        }
                      }, 450);
                      return;
                    }
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                  }}
                  className="px-6 py-3 border border-white/40 text-white text-xs font-semibold uppercase tracking-wider hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Mail className="w-4 h-4 text-white/80" />
                  <span>
                    {content.secondaryBtnText === 'Bandingkan Spesifikasi'
                      ? 'Langganan Newsletter'
                      : content.secondaryBtnText}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. SEARCH BAR WIDGET
  if (block.type === 'search-bar') {
    return (
      <div style={containerStyle} className={maxWidthClass}>
        <div className="bg-[#FAF9F6] border border-[#EEEBE6] p-4 md:p-6 space-y-3">
          <div
            onClick={() => setSearchModalOpen(true)}
            className="flex items-center gap-3 px-4 py-3 bg-white border border-[#DDD] hover:border-black cursor-pointer shadow-xs transition-colors"
          >
            <Search className="w-5 h-5 text-[#888]" />
            <span className="text-xs md:text-sm text-[#888] flex-1">
              {content.placeholder || 'Cari kamera Fujifilm, ulasan teknis, sensor X-Trans...'}
            </span>
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-[#FAF9F6] border border-[#DDD] text-[#666]">
              Cmd+K
            </kbd>
          </div>

          {content.showQuickTags && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-[11px] text-[#888] font-medium">Populer:</span>
              {(content.quickTags || ['X-T5', 'X100VI', 'X-S20', 'Film Simulation']).map((tag: string) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSearchModalOpen(true)}
                  className="px-2.5 py-1 bg-white border border-[#EEEBE6] text-[11px] text-[#444] hover:border-black hover:text-black transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. ARTICLE GRID WIDGET
  if (block.type === 'article-grid' || block.type === 'featured-articles' || block.type === 'latest-articles' || block.type === 'popular-articles') {
    // Only synchronize published articles with public view
    let filtered = articles.filter((a) => a.status === 'published');

    if (content.category && content.category !== 'all') {
      filtered = filtered.filter((a) => a.category === content.category);
    }

    if (content.sortBy === 'views') {
      filtered.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
    } else if (content.sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Default: date desc
      filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }

    const count = content.count || (block.type === 'featured-articles' ? 3 : 6);
    const displayArticles = filtered.slice(0, count);

    const colClass =
      columns === 1
        ? 'grid-cols-1'
        : columns === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : columns === 4
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

    return (
      <div style={containerStyle} className={maxWidthClass}>
        {content.headline && (
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl md:text-2xl font-serif text-[#1A1A1A]">
              {content.headline}
            </h3>
            <button
              onClick={() => navigateTo('blog')}
              className="text-xs font-semibold uppercase tracking-wider text-[#C62828] hover:text-black flex items-center gap-1 cursor-pointer"
            >
              <span>Semua Artikel</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className={`grid ${colClass} gap-6`}>
          {displayArticles.map((art) => (
            <article
              key={art.id}
              onClick={() => navigateTo('article-detail', art.slug)}
              className="group bg-white border border-[#EEEBE6] hover:border-black transition-all cursor-pointer flex flex-col h-full"
            >
              <div className="relative aspect-16/10 overflow-hidden bg-[#EAE8E4]">
                <img
                  src={art.coverImage}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                {content.showBadge !== false && (
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/80 text-white text-[10px] font-semibold uppercase tracking-wider">
                    {art.category}
                  </span>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px] text-[#777] font-mono">
                    <span>{art.publishedAt}</span>
                    {content.showReadTime !== false && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {art.readTimeMinutes || art.readingTimeMinutes || 3} min
                        </span>
                      </>
                    )}
                  </div>

                  <h4 className="text-base font-serif font-normal text-[#1A1A1A] group-hover:text-[#C62828] transition-colors line-clamp-2">
                    {art.title}
                  </h4>

                  {content.showExcerpt !== false && (
                    <p className="text-xs text-[#666] line-clamp-2 leading-relaxed font-light">
                      {art.excerpt}
                    </p>
                  )}
                </div>

                {content.showAuthor !== false && (
                  <div className="pt-2 border-t border-[#EEEBE6] flex items-center justify-between text-xs text-[#777]">
                    <div className="flex items-center gap-1.5 min-w-0 pr-2">
                      {typeof art.author === 'object' && art.author?.avatar && (
                        <img
                          src={art.author.avatar}
                          alt=""
                          className="w-4 h-4 rounded-full object-cover shrink-0"
                        />
                      )}
                      <span className="font-medium text-[#444] truncate">
                        {typeof art.author === 'object' && art.author !== null
                          ? art.author.name
                          : (art.author || 'Editorial Team')}
                      </span>
                    </div>
                    <span className="text-[#C62828] text-[11px] font-semibold uppercase tracking-wider group-hover:translate-x-0.5 transition-transform shrink-0">
                      Baca &rarr;
                    </span>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  // 4. ARTICLE LIST WIDGET
  if (block.type === 'article-list' || block.type === 'related-articles') {
    const count = content.count || 4;
    const publishedArticles = articles.filter((a) => a.status === 'published');
    const displayArticles = publishedArticles.slice(0, count);

    return (
      <div style={containerStyle} className={maxWidthClass}>
        {content.title && (
          <h3 className="text-lg md:text-xl font-serif text-[#1A1A1A] mb-4">
            {content.title}
          </h3>
        )}

        <div className="divide-y divide-[#EEEBE6] border-y border-[#EEEBE6] bg-white">
          {displayArticles.map((art) => (
            <div
              key={art.id}
              onClick={() => navigateTo('article-detail', art.slug)}
              className="p-3.5 md:p-4 hover:bg-[#FAF9F6] transition-colors cursor-pointer flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3.5 overflow-hidden">
                {content.showThumbnails !== false && (
                  <img
                    src={art.coverImage}
                    alt={art.title}
                    className="w-16 h-12 object-cover shrink-0 border border-[#EEEBE6]"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2 text-[10px] text-[#888] font-mono">
                    <span className="uppercase font-semibold text-[#C62828]">{art.category}</span>
                    <span>•</span>
                    <span>{art.publishedAt}</span>
                  </div>
                  <h4 className="text-xs md:text-sm font-serif text-[#1A1A1A] group-hover:text-[#C62828] transition-colors truncate">
                    {art.title}
                  </h4>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#AAA] group-hover:text-black shrink-0 transition-transform group-hover:translate-x-0.5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 5. PRODUCT CARDS WIDGET
  if (block.type === 'product-cards') {
    let filteredCameras = cameras.filter((c) => (c.status ?? 'published') === 'published');
    if (content.filterCategory && content.filterCategory !== 'all') {
      filteredCameras = filteredCameras.filter((c) => c.category === content.filterCategory);
    }

    const count = content.count || 6;
    const displayCameras = filteredCameras.slice(0, count);

    const colClass =
      columns === 1
        ? 'grid-cols-1'
        : columns === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : columns === 4
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

    return (
      <div style={containerStyle} className={maxWidthClass}>
        <div className={`grid ${colClass} gap-6`}>
          {displayCameras.map((cam) => {
            const lowestAff = cam.affiliateLinks?.[0];
            return (
              <div
                key={cam.id}
                className="bg-white border border-[#EEEBE6] hover:border-black transition-all flex flex-col justify-between"
              >
                <div>
                  <div
                    onClick={() => navigateTo('camera-detail', cam.slug)}
                    className="relative aspect-4/3 bg-[#FAF9F6] p-4 flex items-center justify-center cursor-pointer group"
                  >
                    <img
                      src={cam.featuredImage}
                      alt={cam.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    {cam.badge && (
                      <span className="absolute top-3 left-3 px-2 py-0.5 bg-black text-white text-[9px] font-semibold uppercase tracking-wider">
                        {cam.badge}
                      </span>
                    )}
                    {content.showScores !== false && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-700 text-white text-[10px] font-mono font-bold flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        {cam.overallScore}
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="text-[10px] text-[#888] uppercase tracking-wider font-semibold">
                      {cam.category}
                    </div>
                    <h4
                      onClick={() => navigateTo('camera-detail', cam.slug)}
                      className="text-base font-serif font-normal text-[#1A1A1A] hover:text-[#C62828] cursor-pointer transition-colors line-clamp-1"
                    >
                      {cam.name}
                    </h4>
                    <p className="text-xs text-[#666] line-clamp-2 leading-relaxed">
                      {cam.tagline}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-sm text-[#1A1A1A]">
                        ${cam.priceEstimate?.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#888] font-mono">
                        {cam.specs.sensorFormat}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 space-y-2">
                  {content.showAffiliateBtn !== false && lowestAff && (
                    <AffiliateButton
                      url={lowestAff.url}
                      retailer={lowestAff.retailer}
                      price={lowestAff.price}
                      currency={lowestAff.currency}
                      productId={cam.id}
                      sourceType="landing_card"
                      className="w-full text-center"
                    />
                  )}

                  {content.showCompareBtn !== false && (
                    <button
                      type="button"
                      onClick={() => toggleCompareCamera(cam.id)}
                      className="w-full py-1.5 border border-[#DDD] hover:border-black text-[11px] font-medium text-[#444] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Bandingkan Kamera</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 6. PRODUCT RECOMMENDATION WIDGET
  if (block.type === 'product-recommendation') {
    const publishedCams = cameras.filter((c) => (c.status ?? 'published') === 'published');
    const topCam = publishedCams[0] || null;
    if (!topCam) return null;

    return (
      <div style={containerStyle} className={maxWidthClass}>
        <div className="bg-[#FAF9F6] border border-[#EEEBE6] p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/3 aspect-4/3 bg-white border border-[#EEEBE6] p-6 flex items-center justify-center">
              <img
                src={topCam.featuredImage}
                alt={topCam.name}
                className="max-h-48 max-w-full object-contain"
              />
            </div>

            <div className="w-full md:w-2/3 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-[#C62828] text-white text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Editor's Gold Choice 2026
                </span>
                <span className="text-xs font-mono text-emerald-700 font-bold">
                  Skor Lab: {topCam.overallScore}/100
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl font-serif text-[#1A1A1A]">
                {topCam.name}
              </h3>

              <p className="text-xs md:text-sm text-[#555] leading-relaxed font-light">
                {topCam.editorialVerdict || topCam.tagline}
              </p>

              {content.showProsCons !== false && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-700">Kelebihan</span>
                    {topCam.pros.slice(0, 3).map((p, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[#444]">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{p}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-rose-700">Kekurangan</span>
                    {topCam.cons.slice(0, 2).map((c, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[#666]">
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0"></span>
                        <span className="truncate">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 flex flex-wrap items-center gap-3">
                {topCam.affiliateLinks?.[0] && (
                  <AffiliateButton
                    url={topCam.affiliateLinks[0].url}
                    retailer={topCam.affiliateLinks[0].retailer}
                    price={topCam.affiliateLinks[0].price}
                    currency={topCam.affiliateLinks[0].currency}
                    productId={topCam.id}
                    sourceType="product_page"
                  />
                )}
                <button
                  type="button"
                  onClick={() => navigateTo('camera-detail', topCam.slug)}
                  className="px-4 py-2.5 border border-[#1A1A1A] text-xs font-semibold uppercase tracking-wider hover:bg-black hover:text-white transition-colors cursor-pointer"
                >
                  Baca Ulasan Lab &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 7. CAMERA COMPARISON WIDGET
  if (block.type === 'camera-comparison') {
    const publishedCams = cameras.filter((c) => (c.status ?? 'published') === 'published');
    const camA = publishedCams[0] || null;
    const camB = publishedCams[1] || null;

    return (
      <div style={containerStyle} className={maxWidthClass}>
        <div className="bg-white border border-[#EEEBE6] p-6 space-y-6">
          <div className="text-center space-y-1 max-w-xl mx-auto">
            <h3 className="text-xl md:text-2xl font-serif text-[#1A1A1A]">
              {content.title || 'Adu Spesifikasi Kamera'}
            </h3>
            <p className="text-xs text-[#666]">
              {content.subtitle || 'Perbandingan teknis sensor, autofokus, dan resolusi video.'}
            </p>
          </div>

          {camA && camB && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Camera A */}
              <div className="border border-[#EEEBE6] p-4 text-center space-y-3 bg-[#FAF9F6]">
                <div className="h-36 flex items-center justify-center">
                  <img src={camA.featuredImage} alt={camA.name} className="max-h-full max-w-full object-contain" />
                </div>
                <h4 className="font-serif font-semibold text-base text-[#1A1A1A]">{camA.name}</h4>
                <div className="text-xs font-mono text-[#C62828] font-bold">${camA.priceEstimate}</div>
                <div className="text-[11px] text-[#555] space-y-1 pt-2 border-t border-[#DDD]">
                  <div><strong>Sensor:</strong> {camA.specs.sensor}</div>
                  <div><strong>Video:</strong> {camA.specs.videoSpecs}</div>
                  <div><strong>Bobot:</strong> {camA.specs.weight}</div>
                </div>
              </div>

              {/* Camera B */}
              <div className="border border-[#EEEBE6] p-4 text-center space-y-3 bg-[#FAF9F6]">
                <div className="h-36 flex items-center justify-center">
                  <img src={camB.featuredImage} alt={camB.name} className="max-h-full max-w-full object-contain" />
                </div>
                <h4 className="font-serif font-semibold text-base text-[#1A1A1A]">{camB.name}</h4>
                <div className="text-xs font-mono text-[#C62828] font-bold">${camB.priceEstimate}</div>
                <div className="text-[11px] text-[#555] space-y-1 pt-2 border-t border-[#DDD]">
                  <div><strong>Sensor:</strong> {camB.specs.sensor}</div>
                  <div><strong>Video:</strong> {camB.specs.videoSpecs}</div>
                  <div><strong>Bobot:</strong> {camB.specs.weight}</div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => navigateTo('comparisons')}
              className="px-5 py-2.5 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Buka Lab Komparasi Lengkap
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 8. AFFILIATE PRODUCT CTA WIDGET
  if (block.type === 'affiliate-product-cta') {
    return (
      <div style={containerStyle} className={maxWidthClass}>
        <div className="bg-[#1A1A1A] text-white p-6 md:p-10 text-center space-y-4 border border-[#333]">
          {content.badge && (
            <span className="inline-block px-3 py-1 bg-white/10 text-amber-300 text-[10px] font-mono uppercase tracking-wider">
              {content.badge}
            </span>
          )}

          <h3 className="text-xl md:text-3xl font-serif font-normal max-w-2xl mx-auto">
            {content.title || 'Dapatkan Penawaran Resmi Terbaik'}
          </h3>

          <p className="text-xs md:text-sm text-white/70 max-w-xl mx-auto font-light leading-relaxed">
            {content.description || 'Kami memantau fluktuasi stok dan harga terendah dari retailer resmi setiap hari.'}
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigateTo('cameras')}
              className="px-6 py-3 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer shadow-md"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{content.btnText || 'Lihat Penawaran Retailer'}</span>
            </button>
          </div>

          {content.trustNote && (
            <p className="text-[10px] text-white/50 font-mono pt-2">
              {content.trustNote}
            </p>
          )}
        </div>
      </div>
    );
  }

  // 9. CATEGORY CARDS WIDGET
  if (block.type === 'category-cards') {
    const cats = [
      { name: 'Full-Frame & Medium Format', count: 'GFX Series', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=75' },
      { name: 'APS-C Flagship Hybrid', count: 'X-T Series', img: 'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=400&q=75' },
      { name: 'Compact & Street Style', count: 'X100 Series', img: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=75' },
      { name: 'Vlogging & Creators', count: 'X-S Series', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=75' },
    ];

    return (
      <div style={containerStyle} className={maxWidthClass}>
        {content.title && (
          <h3 className="text-xl md:text-2xl font-serif text-[#1A1A1A] mb-4">
            {content.title}
          </h3>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cats.map((cat) => (
            <div
              key={cat.name}
              onClick={() => {
                setSelectedCategory(cat.name);
                navigateTo('cameras');
              }}
              className="relative aspect-4/3 group overflow-hidden border border-[#EEEBE6] cursor-pointer"
            >
              <img
                src={cat.img}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] font-mono text-amber-300 uppercase font-semibold">
                  {cat.count}
                </span>
                <h4 className="text-sm font-serif font-medium leading-tight">
                  {cat.name}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 10. NEWSLETTER SIGNUP WIDGET
  if (block.type === 'newsletter-signup') {
    const isDark = content.theme === 'dark';

    return (
      <div
        id="newsletter-subscription-section"
        data-widget="newsletter-signup"
        style={containerStyle}
        className={`${maxWidthClass} scroll-mt-24`}
      >
        <div
          className={`p-8 md:p-12 text-center space-y-4 border ${
            isDark
              ? 'bg-[#141414] text-white border-[#2A2A2A]'
              : 'bg-[#FAF9F6] text-[#1A1A1A] border-[#EEEBE6]'
          }`}
        >
          <Mail className={`w-8 h-8 mx-auto ${isDark ? 'text-amber-400' : 'text-[#C62828]'}`} />

          <div className="space-y-1">
            <span className={`text-[11px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-amber-400' : 'text-[#C62828]'}`}>
              The FujiFinder Dispatch
            </span>
            <h3 className="text-xl md:text-3xl font-serif font-normal max-w-xl mx-auto">
              {content.title && !content.title.includes('Resep Simulasi')
                ? content.title
                : 'The FujiFinder Dispatch'}
            </h3>
          </div>

          <p
            className={`text-xs md:text-sm max-w-md mx-auto font-light leading-relaxed ${
              isDark ? 'text-white/70' : 'text-[#666]'
            }`}
          >
            {content.subtitle && !content.subtitle.toLowerCase().includes('resep')
              ? content.subtitle
              : 'Wawasan teknis independen, uji lab kamera mendalam, dan panduan gear mingguan langsung di inbox Anda.'}
          </p>

          {newsletterSubscribed ? (
            <div className="p-3 bg-emerald-500/20 text-emerald-400 text-xs font-semibold inline-flex items-center gap-2 border border-emerald-500/30">
              <Check className="w-4 h-4" />
              <span>{newsletterSuccessMsg || 'Terima kasih! Anda telah berhasil berlangganan The FujiFinder Dispatch.'}</span>
            </div>
          ) : (
            <div className="space-y-2 max-w-md mx-auto pt-2">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newsletterEmail || newsletterLoading) return;
                  setNewsletterLoading(true);
                  setNewsletterError(null);
                  try {
                    const res = await subscribePublic({
                      email: newsletterEmail.trim(),
                      source: 'builder_newsletter_dispatch',
                    });
                    if (res.success) {
                      setNewsletterSubscribed(true);
                      setNewsletterSuccessMsg(res.message || 'Terima kasih! Anda telah berhasil berlangganan The FujiFinder Dispatch.');
                    } else {
                      const msg = res.message || '';
                      if (!msg || msg.toLowerCase().includes('error') || msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('please enter a valid')) {
                        setNewsletterError("We couldn't find the email address.");
                      } else {
                        setNewsletterError(msg);
                      }
                    }
                  } catch {
                    setNewsletterError("We couldn't find the email address.");
                  } finally {
                    setNewsletterLoading(false);
                  }
                }}
                className="flex flex-col sm:flex-row gap-2"
              >
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => {
                    setNewsletterEmail(e.target.value);
                    if (newsletterError) setNewsletterError(null);
                  }}
                  placeholder="Masukkan alamat email Anda..."
                  disabled={newsletterLoading}
                  className={`flex-1 px-4 py-2.5 text-xs outline-hidden border ${
                    isDark
                      ? 'bg-[#222] border-[#444] text-white placeholder-white/40 focus:border-white'
                      : 'bg-white border-[#DDD] text-black placeholder-neutral-400 focus:border-black'
                  }`}
                />
                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shrink-0 disabled:opacity-50 ${
                    isDark
                      ? 'bg-white text-black hover:bg-neutral-200'
                      : 'bg-[#1A1A1A] text-white hover:bg-black'
                  }`}
                >
                  {newsletterLoading ? 'Memproses...' : (content.btnText || 'Langganan')}
                </button>
              </form>
              {newsletterError && (
                <p className="text-xs text-red-500 font-medium text-center">
                  {newsletterError}
                </p>
              )}
            </div>
          )}

          {content.note && (
            <p className={`text-[10px] font-mono ${isDark ? 'text-white/40' : 'text-[#888]'}`}>
              {content.note}
            </p>
          )}
        </div>
      </div>
    );
  }

  // 11. TEXT WIDGET
  if (block.type === 'text') {
    const TagComponent = (content.tag || 'h2') as React.ElementType;
    const align = content.align || 'left';

    return (
      <div style={containerStyle} className={maxWidthClass}>
        <div className={`space-y-2 ${align === 'center' ? 'text-center mx-auto' : align === 'right' ? 'text-right ml-auto' : 'text-left'}`}>
          {content.eyebrow && (
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#C62828] font-bold">
              {content.eyebrow}
            </div>
          )}

          {content.title && (
            <TagComponent className="text-2xl md:text-3xl lg:text-4xl font-serif font-normal text-[#1A1A1A] leading-tight">
              {content.title}
            </TagComponent>
          )}

          {content.description && (
            <p className="text-xs md:text-sm text-[#666] font-light leading-relaxed max-w-3xl">
              {content.description}
            </p>
          )}
        </div>
      </div>
    );
  }

  // 12. RICH TEXT WIDGET
  if (block.type === 'rich-text') {
    return (
      <div style={containerStyle} className={maxWidthClass}>
        <div
          className="prose prose-sm md:prose-base max-w-none text-[#333] leading-relaxed font-light"
          dangerouslySetInnerHTML={{ __html: content.body || '<p>Teks rich content...</p>' }}
        />
      </div>
    );
  }

  // 13. IMAGE WIDGET
  if (block.type === 'image') {
    return (
      <div style={containerStyle} className={maxWidthClass}>
        <figure className="space-y-2">
          <div className="overflow-hidden border border-[#EEEBE6] bg-[#FAF9F6]">
            <img
              src={content.url || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80'}
              alt={content.caption || 'Foto'}
              className="w-full h-auto object-cover"
            />
          </div>
          {content.caption && (
            <figcaption className="text-[11px] text-[#777] font-mono text-center">
              {content.caption}
            </figcaption>
          )}
        </figure>
      </div>
    );
  }

  // 14. VIDEO WIDGET
  if (block.type === 'video') {
    return (
      <div style={containerStyle} className={maxWidthClass}>
        <div className="space-y-2">
          <div className="relative aspect-16/9 bg-black border border-[#EEEBE6] overflow-hidden">
            {content.embedUrl ? (
              <iframe
                src={content.embedUrl}
                title={content.title || 'Video Embed'}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/60 space-y-2">
                <Play className="w-12 h-12" />
                <span className="text-xs font-mono">Video Embed Placeholder</span>
              </div>
            )}
          </div>
          {content.title && (
            <p className="text-xs text-[#555] font-serif italic text-center">
              {content.title}
            </p>
          )}
        </div>
      </div>
    );
  }

  // 15. BUTTON WIDGET
  if (block.type === 'button') {
    const align = content.alignment || 'center';
    return (
      <div style={containerStyle} className={maxWidthClass}>
        <div className={`flex ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
          <button
            type="button"
            onClick={() => navigateTo('cameras')}
            className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 ${
              content.variant === 'secondary'
                ? 'border border-[#1A1A1A] text-[#1A1A1A] hover:bg-black hover:text-white'
                : 'bg-[#1A1A1A] text-white hover:bg-black shadow-xs'
            }`}
          >
            <span>{content.text || 'Tombol Tindakan'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 16. DIVIDER WIDGET
  if (block.type === 'divider') {
    return (
      <div style={containerStyle} className={maxWidthClass}>
        <hr className="border-t border-[#EEEBE6] my-4" style={{ width: content.width || '100%' }} />
      </div>
    );
  }

  // 17. SPACER WIDGET
  if (block.type === 'spacer') {
    const height = content.height || 48;
    return (
      <div style={{ height: `${height}px`, width: '100%' }}>
        {isInteractive && isSelected && (
          <div className="w-full h-full border border-dashed border-neutral-300 flex items-center justify-center text-[10px] font-mono text-neutral-400">
            Spacer ({height}px)
          </div>
        )}
      </div>
    );
  }

  // 18. SOCIAL LINKS WIDGET
  if (block.type === 'social-links') {
    return (
      <div style={containerStyle} className={maxWidthClass}>
        <div className="flex items-center justify-center gap-4 py-2">
          <a href="#" className="p-2 border border-[#EEEBE6] text-[#666] hover:text-black hover:border-black transition-colors">
            <Instagram className="w-4 h-4" />
          </a>
          <a href="#" className="p-2 border border-[#EEEBE6] text-[#666] hover:text-black hover:border-black transition-colors">
            <Youtube className="w-4 h-4" />
          </a>
          <a href="#" className="p-2 border border-[#EEEBE6] text-[#666] hover:text-black hover:border-black transition-colors">
            <Twitter className="w-4 h-4" />
          </a>
          <a href="#" className="p-2 border border-[#EEEBE6] text-[#666] hover:text-black hover:border-black transition-colors">
            <Share2 className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  // 19. AUTHOR PROFILE WIDGET
  if (block.type === 'author-profile') {
    return (
      <div style={containerStyle} className={maxWidthClass}>
        <div className="bg-[#FAF9F6] border border-[#EEEBE6] p-6 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <img
            src={content.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
            alt={content.name || 'Author'}
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
          />
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#C62828] font-semibold">
              {content.role || 'Reviewer & Lab Tester'}
            </div>
            <h4 className="text-base font-serif font-normal text-[#1A1A1A]">
              {content.name || 'Raden P. & Tim Lab FujiFinder'}
            </h4>
            <p className="text-xs text-[#666] font-light leading-relaxed max-w-xl">
              {content.bio || 'Pengalaman 12+ tahun menguji sensor kamera digital, lensa XF, dan resep warna film simulation.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 20. ADVERTISEMENT BLOCK WIDGET
  if (block.type === 'advertisement-block') {
    return (
      <div style={containerStyle} className={maxWidthClass}>
        <div className="bg-[#FAF9F6] border border-dashed border-[#DDD] p-6 text-center space-y-2">
          <span className="text-[9px] font-mono uppercase tracking-widest text-[#999] bg-neutral-200 px-2 py-0.5">
            {content.badge || 'Sponsor Terverifikasi'}
          </span>
          <p className="text-xs font-serif text-[#555]">{content.title || 'Slot Iklan / Kemitraan Resmi'}</p>
        </div>
      </div>
    );
  }

  // 21. CUSTOM HTML WIDGET
  if (block.type === 'custom-html') {
    return (
      <div style={containerStyle} className={maxWidthClass}>
        <div dangerouslySetInnerHTML={{ __html: content.htmlCode || '<div>Custom HTML Block</div>' }} />
      </div>
    );
  }

  // 22. DYNAMIC PLUGIN WIDGETS
  if (block.type === 'plugin-widget') {
    // 22A. SEO Score & Snippet Preview
    if (block.pluginWidgetId === 'plugin-widget-seo-box') {
      return (
        <div style={containerStyle} className={maxWidthClass}>
          <div className="bg-white border border-[#EEEBE6] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEEBE6]">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#C62828]" />
                <span className="text-xs font-semibold text-[#1A1A1A]">
                  {content.title || 'SEO Readiness & SERP Snapshot'}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold">
                Skor 96/100 (Sempurna)
              </span>
            </div>

            <div className="bg-[#F8F9FA] p-3 rounded-sm border border-[#E0E0E0] space-y-1">
              <div className="text-[11px] text-[#202124] font-sans truncate">
                https://fujifinder.com › ulasan › {content.targetKeyword?.toLowerCase().replace(/\s+/g, '-') || 'fujifilm-xt5'}
              </div>
              <div className="text-sm font-medium text-[#1a0dab] hover:underline cursor-pointer">
                {content.snippetTitle || 'Fujifilm X-T5 Uji Lapangan Lengkap | FujiFinder Lab'}
              </div>
              <div className="text-xs text-[#4d5156] line-clamp-2">
                {content.snippetDesc || 'Hasil pengujian komprehensif sensor 40MP, autofokus AI, dan simulasi film terbaru.'}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 22B. Affiliate Cloaked Deal Box
    if (block.pluginWidgetId === 'plugin-widget-affiliate-deal') {
      return (
        <div style={containerStyle} className={maxWidthClass}>
          <div className="bg-[#FAF9F6] border border-[#EEEBE6] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                {content.badge || 'Best Verified Price'}
              </span>
              <h4 className="text-base font-serif font-normal text-[#1A1A1A]">
                {content.title || 'Dapatkan Diskon Retailer Resmi Hari Ini'}
              </h4>
              <p className="text-xs text-[#666]">
                {content.discountNote || 'Garansi Distributor Resmi 1 Tahun'}
              </p>
            </div>

            <a
              href="#cameras"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('cameras');
              }}
              className="px-5 py-2.5 bg-[#C62828] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#B71C1C] transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>{content.ctaText || 'Cek Promo Sekarang'}</span>
            </a>
          </div>
        </div>
      );
    }

    // 22C. Analytics Pro Live Meter
    if (block.pluginWidgetId === 'plugin-widget-analytics-counter') {
      return (
        <div style={containerStyle} className={maxWidthClass}>
          <div className="bg-[#1A1A1A] text-white p-4 rounded-sm border border-[#333] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></div>
              <div>
                <span className="text-xs font-mono text-neutral-300">
                  {content.label || 'Sedang Dibaca Oleh'}:{' '}
                  <strong className="text-white font-bold">{content.activeUsers || 142} pembaca</strong>
                </span>
                <div className="text-[10px] text-neutral-400">
                  Trending: {content.trendingCamera || 'Fujifilm X100VI'} ({content.timeframe || '15 menit terakhir'})
                </div>
              </div>
            </div>
            <BarChart2 className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      );
    }

    // 22D. Film Simulation Slider
    if (block.pluginWidgetId === 'plugin-widget-film-simulation') {
      return (
        <div style={containerStyle} className={maxWidthClass}>
          <div className="bg-white border border-[#EEEBE6] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-serif text-[#1A1A1A]">
                  {content.title || 'Perbandingan Karakter Film Simulation'}
                </h4>
                <p className="text-xs text-[#666]">
                  {content.subtitle || 'Bandingkan tone warna simulasi film Fujifilm langsung.'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveSim('A')}
                  className={`px-3 py-1 font-mono uppercase text-[11px] transition-colors cursor-pointer ${
                    activeSim === 'A' ? 'bg-black text-white' : 'bg-neutral-100 text-black hover:bg-neutral-200'
                  }`}
                >
                  {content.simulationA || 'Classic Chrome'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSim('B')}
                  className={`px-3 py-1 font-mono uppercase text-[11px] transition-colors cursor-pointer ${
                    activeSim === 'B' ? 'bg-black text-white' : 'bg-neutral-100 text-black hover:bg-neutral-200'
                  }`}
                >
                  {content.simulationB || 'Reala Ace'}
                </button>
              </div>
            </div>

            <div className="relative aspect-16/9 bg-[#111] overflow-hidden border border-[#EEEBE6]">
              <img
                src={activeSim === 'A' ? content.imageA || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80' : content.imageB || 'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=1200&q=80'}
                alt="Film Simulation Preview"
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/80 text-white text-[10px] font-mono">
                Tone: {activeSim === 'A' ? (content.simulationA || 'Classic Chrome') : (content.simulationB || 'Reala Ace')}
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // Fallback for unrecognized widget
  return (
    <div style={containerStyle} className={maxWidthClass}>
      <div className="p-4 border border-dashed border-neutral-300 text-center text-xs font-mono text-[#888]">
        [{block.type}]: {block.label}
      </div>
    </div>
  );
};
