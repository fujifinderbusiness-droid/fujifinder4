import React, { useState, useMemo } from 'react';
import { 
  ArrowRight, 
  Search, 
  Camera, 
  Star, 
  Clock, 
  Mail, 
  Check, 
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Sliders,
  BookOpen,
  Award,
  FlaskConical,
  Layers,
  Cpu,
  Eye,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { AffiliateDisclosureBanner } from '../components/AffiliateDisclosure';
import { ArticleCategory } from '../types';
import { AffiliateButton } from '../components/AffiliateButton';
import { useSiteBuilder } from '../builder/BuilderContext';
import { BuilderPageRenderer } from '../builder/renderers/BuilderPageRenderer';
import { NewsletterSubscribeBox } from '../components/NewsletterSubscribeBox';

interface HeroSlide {
  badge: string;
  date: string;
  headline: string;
  subtitle: string;
  description: string;
  image: string;
  storySlug: string;
  primaryCtaText: string;
  secondaryCtaText?: string;
}

export const LandingPage: React.FC = () => {
  const { 
    cameras, 
    articles, 
    homeSettings,
    navigateTo, 
    setSelectedCategory, 
    setSearchModalOpen,
    toggleCompareCamera
  } = useData();

  // Active Hero Slide index
  const [activeHeroIndex, setActiveHeroIndex] = useState<number>(0);

  // Newsletter state
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Only consider published articles on the landing page
  const publishedArticles = useMemo(() => {
    return articles.filter((a) => a.status === 'published');
  }, [articles]);

  // Dynamic or Manual Hero Slides based on homeSettings
  const heroSlides: HeroSlide[] = useMemo(() => {
    if (homeSettings?.heroMode === 'manual' && homeSettings.heroSlides && homeSettings.heroSlides.length > 0) {
      return homeSettings.heroSlides.map((slide) => ({
        badge: slide.badge || 'FEATURED STORY',
        date: slide.date || '',
        headline: slide.headline,
        subtitle: slide.subtitle,
        description: slide.description,
        image: slide.image,
        storySlug: slide.storySlug,
        primaryCtaText: slide.primaryCtaText || 'Read Story',
        secondaryCtaText: slide.secondaryCtaText || 'Katalog Review & Uji Lab',
      }));
    }

    const heroArticles = publishedArticles.filter(
      (a) => a.isHeroFeatured || (a.showOnLandingPage && a.featured)
    );

    const source = heroArticles.length > 0 ? heroArticles : publishedArticles.slice(0, 3);

    if (source.length === 0) {
      return [
        {
          badge: 'FEATURED STORY',
          date: 'May 20, 2026',
          headline: 'Capture More.\nCreate Better.',
          subtitle: 'The Right Camera for Every Story',
          description: 'Discover the best cameras, in-depth reviews, and expert guides to help you capture your world in stunning detail.',
          image: 'https://images.unsplash.com/photo-1510127031490-569779437d68?auto=format&fit=crop&w=2000&q=85',
          storySlug: 'best-street-photography-cameras-2026',
          primaryCtaText: 'Read Story',
          secondaryCtaText: 'Katalog Review & Uji Lab',
        },
      ];
    }

    return source.map((art) => ({
      badge: art.category ? art.category.toUpperCase() : 'FEATURED STORY',
      date: art.publishedAt,
      headline: art.title.includes(':') 
        ? `${art.title.split(':')[0]}.\n${art.title.split(':')[1].trim()}` 
        : art.title,
      subtitle: art.subtitle || 'FujiFinder Editorial Journal',
      description: art.excerpt,
      image: art.coverImage,
      storySlug: art.slug,
      primaryCtaText: 'Read Story',
      secondaryCtaText: 'Katalog Review & Uji Lab',
    }));
  }, [publishedArticles, homeSettings]);

  const currentHero = heroSlides[activeHeroIndex] || heroSlides[0];

  // 6 Camera Categories with dynamic article counts from CMS or custom cards
  const categories = useMemo(() => {
    const rawCards = homeSettings?.categoryCards && homeSettings.categoryCards.length > 0
      ? homeSettings.categoryCards
      : [
          {
            id: 'mirrorless',
            title: 'Mirrorless',
            desc: 'Lightweight, fast and perfect for any creator.',
            image: 'https://images.unsplash.com/photo-1510127031490-569779437d68?auto=format&fit=crop&w=800&q=80',
            categoryParam: 'Mirrorless' as ArticleCategory,
          },
          {
            id: 'dslr',
            title: 'DSLR',
            desc: 'Powerful performance that never gets old.',
            image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
            categoryParam: 'DSLR' as ArticleCategory,
          },
          {
            id: 'compact',
            title: 'Compact',
            desc: 'Small size, big possibilities.',
            image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
            categoryParam: 'Compact' as ArticleCategory,
          },
          {
            id: 'action-camera',
            title: 'Action Camera',
            desc: 'Built for adventure. Capture every moment.',
            image: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?auto=format&fit=crop&w=800&q=80',
            categoryParam: 'Action Camera' as ArticleCategory,
          },
          {
            id: 'vlogging',
            title: 'Vlogging',
            desc: 'Create content. Share your story.',
            image: 'https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?auto=format&fit=crop&w=800&q=80',
            categoryParam: 'Vlogging' as ArticleCategory,
          },
          {
            id: 'accessories',
            title: 'Accessories',
            desc: 'Lenses, bags, tripods and more gear.',
            image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=800&q=80',
            categoryParam: 'Accessories' as ArticleCategory,
          },
        ];

    return rawCards.map((cat) => {
      const count = publishedArticles.filter((art) => {
        const c = (art.category || '').toLowerCase();
        const target = (cat.categoryParam || '').toLowerCase();
        return c === target || c.includes(target);
      }).length;

      return {
        ...cat,
        count: `${count} ${count === 1 ? 'article' : 'articles'}`,
      };
    });
  }, [publishedArticles, homeSettings?.categoryCards]);

  // Dynamic Popular Now articles matching isPopularNow or isTrending
  const popularArticles = useMemo(() => {
    const tagged = publishedArticles.filter((a) => a.isPopularNow || a.isTrending);
    const source = tagged.length >= 4 ? tagged.slice(0, 4) : [...tagged, ...publishedArticles.filter((a) => !tagged.includes(a))].slice(0, 4);

    return source.map((art) => ({
      category: (art.category || 'REVIEWS').toUpperCase(),
      date: art.publishedAt,
      title: art.title,
      readTime: `${art.readTimeMinutes} min read`,
      slug: art.slug,
    }));
  }, [publishedArticles]);

  // Dynamic Featured Guide Article
  const featuredGuideArticle = useMemo(() => {
    return (
      publishedArticles.find((a) => a.isFeaturedContent || a.isFeaturedStory) ||
      publishedArticles.find((a) => a.category === 'Camera Guides' || a.category === 'Mirrorless') ||
      publishedArticles[0]
    );
  }, [publishedArticles]);


  const publishedCameras = useMemo(() => {
    return cameras.filter((c) => (c.status ?? 'published') === 'published');
  }, [cameras]);

  // Dynamic Reviewed Cameras from database or custom selected from homeSettings
  const reviewedCameras = useMemo(() => {
    if (homeSettings?.featuredCameraIds && homeSettings.featuredCameraIds.length > 0) {
      const selected = homeSettings.featuredCameraIds
        .map((id) => publishedCameras.find((c) => c.id === id))
        .filter((c): c is typeof cameras[0] => Boolean(c));
      if (selected.length > 0) return selected;
    }
    return publishedCameras.slice(0, 6);
  }, [publishedCameras, homeSettings?.featuredCameraIds]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
    }, 4000);
  };

  const handleCategoryNavigate = (cat: typeof categories[0]) => {
    setSelectedCategory(cat.categoryParam);
    navigateTo('blog');
  };

  const { pages, globalDesign } = useSiteBuilder();
  const landingBuilderPage = pages.find((p) => p.id === 'page-landing' || p.type === 'landing');

  if (landingBuilderPage && landingBuilderPage.useBuilderLayout) {
    return (
      <div className="w-full">
        <AffiliateDisclosureBanner />
        <BuilderPageRenderer
          page={landingBuilderPage}
          breakpoint="desktop"
          isEditor={false}
          globalDesign={globalDesign}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-12 sm:space-y-16 text-left">
      {/* 1. FULL-WIDTH CINEMATIC HERO SECTION */}
      <section 
        id="hero-cinematic-section" 
        className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden min-h-[480px] sm:min-h-[580px] lg:min-h-[640px] flex flex-col justify-end p-6 sm:p-10 lg:p-14 transition-all duration-700 shadow-sm"
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={currentHero.image}
            alt={currentHero.headline}
            className="w-full h-full object-cover object-center transition-all duration-700 filter brightness-[0.85]"
          />
          {/* Editorial Vignette & Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-2xl space-y-4 sm:space-y-5 text-left mb-6 sm:mb-8">
          {/* Badge & Date */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase text-white bg-white/20 backdrop-blur-md border border-white/25">
              {currentHero.badge}
            </span>
            <span className="text-xs sm:text-sm text-white/80 font-medium">
              {currentHero.date}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05] whitespace-pre-line font-sans">
            {currentHero.headline}
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-white/85 max-w-xl font-normal leading-relaxed">
            {currentHero.description}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="hero-read-story-btn"
              onClick={() => navigateTo('article-detail', currentHero.storySlug)}
              className="bg-white text-black hover:bg-white/90 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-2 shadow-sm active:scale-95"
            >
              <BookOpen className="w-4 h-4 text-black" />
              <span>{currentHero.primaryCtaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              id="hero-subscribe-cta-btn"
              onClick={() => {
                const target =
                  document.getElementById('newsletter-subscription-section') ||
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
                }
              }}
              className="bg-transparent border border-white/40 hover:bg-white/10 hover:border-white text-white px-6 py-3 rounded-full text-xs sm:text-sm font-medium tracking-wide transition-all cursor-pointer backdrop-blur-xs active:scale-95 flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>Langganan Newsletter</span>
            </button>
          </div>
        </div>

        {/* Bottom Carousel Indicators */}
        <div className="relative z-10 flex items-center justify-center gap-2 pt-2">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveHeroIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === activeHeroIndex
                  ? 'w-7 h-2 bg-white'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. EXPLORE BY CATEGORY */}
      <section id="explore-by-category-section" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight font-sans">
              Review Kamera Berdasarkan Format
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Eksplorasi uji lab independen, komparasi sensor, dan panduan field photography untuk setiap sistem kamera.
            </p>
          </div>
          <button
            onClick={() => navigateTo('cameras')}
            className="text-xs sm:text-sm text-neutral-700 hover:text-neutral-900 font-semibold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>Semua Review Format</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6 Category Photographic Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategoryNavigate(cat)}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4.2] flex flex-col justify-between p-4 cursor-pointer transition-all duration-300 hover:shadow-md"
            >
              {/* Background Photo */}
              <div className="absolute inset-0 z-0">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/15" />
              </div>

              {/* Top-Right Arrow Action Button */}
              <div className="relative z-10 flex justify-end">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-black flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Card Bottom Content */}
              <div className="relative z-10 text-left space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                  {cat.title}
                </h3>
                <p className="text-[11px] text-white/80 line-clamp-2 leading-tight font-normal">
                  {cat.desc}
                </p>
                <div className="pt-1">
                  <span className="text-[10px] uppercase tracking-wider text-white/70 font-medium">
                    {cat.count}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. POPULAR NOW SECTION */}
      <section id="popular-now-section" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight font-sans">
            Popular Now
          </h2>
          <button
            onClick={() => {
              setSelectedCategory(null);
              navigateTo('blog');
            }}
            className="text-xs sm:text-sm text-neutral-600 hover:text-neutral-900 font-medium transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>View all articles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Compact Article Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularArticles.map((art) => (
            <div
              key={art.slug}
              onClick={() => navigateTo('article-detail', art.slug)}
              className="bg-white border border-neutral-200/80 hover:border-neutral-400 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer group shadow-2xs hover:shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  <span className="text-neutral-900 font-bold">{art.category}</span>
                  <span>•</span>
                  <span>{art.date}</span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-neutral-900 group-hover:text-neutral-600 transition-colors leading-snug line-clamp-2">
                  {art.title}
                </h3>
              </div>

              <div className="pt-4 mt-2 flex items-center gap-1 text-[11px] text-neutral-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>{art.readTime}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURED GUIDE & DISCOVERY ROW */}
      {featuredGuideArticle && (
        <section id="featured-guide-row" className="w-full">
          <div 
            onClick={() => navigateTo('article-detail', featuredGuideArticle.slug)}
            className="w-full relative rounded-[28px] sm:rounded-[32px] overflow-hidden min-h-[400px] sm:min-h-[480px] flex flex-col justify-between p-6 sm:p-10 cursor-pointer group shadow-xs"
          >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <img
                src={featuredGuideArticle.coverImage}
                alt={featuredGuideArticle.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/20" />
            </div>

            {/* Top Badge */}
            <div className="relative z-10 flex justify-start">
              <span className="inline-flex items-center px-3.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase text-white bg-white/20 backdrop-blur-md border border-white/25">
                {featuredGuideArticle.category?.toUpperCase() || 'FEATURED GUIDE'}
              </span>
            </div>

            {/* Bottom Card Content */}
            <div className="relative z-10 text-left space-y-3">
              <span className="text-xs sm:text-sm text-white/80 font-medium">
                {featuredGuideArticle.publishedAt}
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight max-w-3xl">
                {featuredGuideArticle.title}
              </h2>
              <p className="text-xs sm:text-sm text-white/85 max-w-2xl font-normal leading-relaxed line-clamp-2">
                {featuredGuideArticle.excerpt}
              </p>

              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateTo('article-detail', featuredGuideArticle.slug);
                  }}
                  className="bg-white text-black hover:bg-white/90 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>Read the Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <span className="text-xs text-white/80 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-white/70" />
                  <span>{featuredGuideArticle.readTimeMinutes} min read</span>
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. INDEPENDENT CAMERA REVIEWS & LAB SCORECARDS */}
      <section id="camera-reviews-section" className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-2 border-b border-neutral-200">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 border border-neutral-200 text-neutral-800 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{homeSettings?.reviewedCamerasBadge || '100% Ulasan Independen • Kami Menilai, Bukan Menjual Kamera'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight font-sans">
              {homeSettings?.reviewedCamerasTitle || 'Hasil Uji Lab & Review Kamera Terbaru'}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              {homeSettings?.reviewedCamerasDescription || 'FujiFinder adalah jurnal pengujian gear independen — kami tidak menjual kamera atau menerima sponsor pabrikan untuk menaikkan skor. Setiap unit kami uji langsung di lab dan lapangan nyata untuk mengevaluasi ketajaman sensor, sistem autofokus, stabilisasi gambar, serta kehandalan ergonomi bodi.'}
            </p>
          </div>

          <button
            onClick={() => navigateTo('cameras')}
            className="text-xs sm:text-sm text-neutral-900 font-semibold hover:text-neutral-600 transition-colors flex items-center gap-1 cursor-pointer shrink-0 py-2 px-4 rounded-full border border-neutral-300 hover:border-neutral-900"
          >
            <span>Semua Review Kamera</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6 Editorial Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviewedCameras.map((cam) => (
            <div
              key={cam.id}
              className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col justify-between hover:border-neutral-400 hover:shadow-md transition-all duration-200 group text-left"
            >
              <div>
                {/* Header: Brand & Score */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3 text-xs">
                  <span className="font-bold tracking-wider uppercase text-[10px] px-2.5 py-0.5 bg-neutral-100 text-neutral-800 rounded">
                    {cam.brand} • {cam.category}
                  </span>

                  <div className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 border border-amber-200/80 text-amber-900 rounded-full font-bold text-[11px]">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>Skor Lab {cam.rating} / 10</span>
                  </div>
                </div>

                {/* Camera Image */}
                <div 
                  onClick={() => navigateTo('camera-detail', cam.slug)}
                  className="w-full h-44 bg-[#F8F7F5] rounded-xl flex items-center justify-center p-3 mb-4 overflow-hidden relative cursor-pointer group-hover:bg-[#F3F2EE] transition-colors"
                >
                  <img
                    src={cam.image}
                    alt={cam.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-2 left-2 text-[9px] uppercase tracking-wider text-neutral-500 font-mono bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded border border-neutral-200">
                    Field Tested Unit
                  </span>
                </div>

                {/* Camera Info */}
                <div className="space-y-2.5">
                  <h3 
                    onClick={() => navigateTo('camera-detail', cam.slug)}
                    className="text-base sm:text-lg font-bold text-neutral-900 group-hover:text-black transition-colors cursor-pointer leading-snug"
                  >
                    {cam.name}
                  </h3>

                  {/* Tested Specifications Chips */}
                  <div className="flex flex-wrap gap-1.5 text-[11px] text-neutral-600">
                    <span className="px-2 py-0.5 bg-neutral-100 rounded text-neutral-700 font-medium">
                      {cam.specs.sensorFormat} • {cam.specs.megapixels}MP
                    </span>
                    <span className="px-2 py-0.5 bg-neutral-100 rounded text-neutral-700 font-medium">
                      {cam.specs.ibis ? '6-Stop IBIS' : 'Optics Stabilized'}
                    </span>
                    <span className="px-2 py-0.5 bg-neutral-100 rounded text-neutral-700 font-medium">
                      {cam.specs.videoSpecs?.maxResolution || '4K 60p'}
                    </span>
                  </div>

                  {/* Editorial Verdict Quote */}
                  <p className="text-xs text-neutral-600 line-clamp-2 italic leading-relaxed pt-1 border-t border-neutral-100">
                    "{cam.verdict || 'Performa sensor solid dengan reproduksi warna khas dan sistem autofokus responsif untuk segala kondisi pemotretan.'}"
                  </p>
                </div>
              </div>

              {/* Action Buttons: Read Review & Checkout (Mitra Affiliate) */}
              <div className="pt-4 mt-3 border-t border-neutral-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigateTo('camera-detail', cam.slug)}
                  className="flex-1 bg-neutral-900 hover:bg-black text-white text-xs font-semibold py-2.5 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Review</span>
                </button>

                <div className="flex-1">
                  <AffiliateButton
                    productId={cam.id}
                    sourceType="landing_card"
                    size="sm"
                    customText="Checkout"
                    showRetailer={false}
                    className="rounded-xl w-full py-2.5 text-center text-xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    toggleCompareCamera(cam.id);
                    navigateTo('comparisons');
                  }}
                  className="p-2.5 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-black border border-neutral-200 rounded-xl transition-colors cursor-pointer shrink-0"
                  title="Bandingkan spesifikasi kamera ini"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Editorial Transparency Note */}
        <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Pemberitahuan Transparansi:</strong> {homeSettings?.transparencyBannerText || 'FujiFinder adalah media ulasan independen. Kami tidak menjual kamera dan tidak menerima kompensasi untuk mengubah penilaian skor uji lab.'}
            </span>
          </div>
          <button
            onClick={() => navigateTo('cameras')}
            className="text-neutral-900 hover:underline font-bold shrink-0 text-xs cursor-pointer"
          >
            Lihat Tabel Skor Lengkap →
          </button>
        </div>
      </section>

      {/* 5B. TESTING METHODOLOGY SECTION */}
      <section id="testing-methodology-section" className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 lg:p-10 space-y-6 text-left">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-neutral-500">
            <FlaskConical className="w-3.5 h-3.5 text-neutral-900" />
            <span>Standar Evaluasi Jurnal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight font-sans">
            Metodologi Pengujian Kamera FujiFinder
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            Setiap kamera yang kami ulas melewati protokol uji ketat selama minimal dua pekan sebelum skor akhir diterbitkan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Pillar 1 */}
          <div className="p-4 rounded-2xl bg-[#FDFCFB] border border-neutral-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-900 mb-2">
              <FlaskConical className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900">1. Uji Sensor & Resolusi</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Pengukuran dynamic range piksel demi piksel, reproduksi warna, dan ketahanan noise di ISO 6400 hingga 51.200 pada target studio terkalibrasi.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-4 rounded-2xl bg-[#FDFCFB] border border-neutral-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-900 mb-2">
              <Camera className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900">2. Lapangan Nyata</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Minimal 2.000 foto nyata pada genre street photography, dokumenter, potret minim cahaya, dan lanskap dinamis oleh fotografer aktif.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-4 rounded-2xl bg-[#FDFCFB] border border-neutral-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-900 mb-2">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900">3. Autofokus & Ergonomi</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Evaluasi akurasi pelacakan mata AI, kecepatan shutter lag, kenyamanan grip tangan, susunan dial fisik, dan efisiensi baterai harian.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-4 rounded-2xl bg-[#FDFCFB] border border-neutral-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-900 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900">4. 100% Bebas Sponsor</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Kami tidak menerima bayaran untuk mengubah skor atau menghapus kelemahan produk. Semua kelebihan dan kekurangan diungkap secara jujur.
            </p>
          </div>
        </div>
      </section>

      {/* 6. DARK NEWSLETTER SUBSCRIPTION SECTION */}
      <section id="newsletter-subscription-section">
        <NewsletterSubscribeBox source="landing_page_banner" variant="dark-hero" />
      </section>

      {/* 7. EDITORIAL INTEGRITY & AFFILIATE DISCLOSURE */}
      <section className="pt-4">
        <AffiliateDisclosureBanner />
      </section>
    </div>
  );
};
