import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  Share2, 
  Bookmark, 
  Check, 
  ChevronRight, 
  ArrowLeft,
  User,
  Quote,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Search,
  Code2,
  ShoppingBag
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { DynamicProductBox } from '../components/DynamicProductBox';
import { ComparisonTable } from '../components/ComparisonTable';
import { AffiliateButton } from '../components/AffiliateButton';
import { NewsletterSubscribeBox } from '../components/NewsletterSubscribeBox';
import { AffiliateDisclosureBanner } from '../components/AffiliateDisclosure';
import { ArticleCard } from '../components/ArticleCard';
import { CameraCard } from '../components/CameraCard';
import { generateArticleSchemaJsonString, buildCanonicalUrl } from '../utils/seoUtils';
import { SocialShareFloatingBar } from '../plugins/components/SocialShareFloatingBar';

export const ArticleDetailPage: React.FC = () => {
  const { activeSlug, articles, cameras, navigateTo, siteSettings, getArticleBySlug, recordAffiliateClick, isAdminLoggedIn } = useData();
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const article = (activeSlug ? getArticleBySlug(activeSlug) : undefined) || articles.find(a => a.status === 'published') || articles[0];

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-[#1A1918]">Article Not Found</h2>
        <p className="text-sm text-[#6B655D]">The article you were looking for could not be located.</p>
        <button
          onClick={() => navigateTo('blog')}
          className="px-5 py-2.5 rounded-full bg-[#1A1918] text-white text-xs font-semibold"
        >
          Return to Journal
        </button>
      </div>
    );
  }

  if (article.status === 'draft' && !isAdminLoggedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-[#1A1918]">Artikel Masih dalam Draft</h2>
        <p className="text-sm text-[#6B655D]">Artikel ini belum dipublikasikan untuk pembaca umum.</p>
        <button
          onClick={() => navigateTo('blog')}
          className="px-5 py-2.5 rounded-full bg-[#1A1918] text-white text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          Kembali ke Blog
        </button>
      </div>
    );
  }

  const handleShare = () => {
    const slugPrefix = (siteSettings.blogSlugPrefix || '/article/').replace(/^\/+|\/+$/g, '');
    const shareUrl = typeof window !== 'undefined' && window.location.origin
      ? `${window.location.origin}/#/${slugPrefix}/${article.slug}`
      : `${siteSettings.siteUrl}/${slugPrefix}/${article.slug}`;
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const relatedArticles = articles
    .filter((a) => a.status === 'published' && a.id !== article.id && (a.category === article.category || article.relatedArticleSlugs?.includes(a.slug)))
    .slice(0, 2);

  const [showRawSchema, setShowRawSchema] = useState(false);

  const featuredCameras = article.featuredCameraIds
    ? article.featuredCameraIds.map((id) => cameras.find((c) => c.id === id)).filter(Boolean) as typeof cameras
    : [];

  const canonicalUrl = buildCanonicalUrl(siteSettings, article.slug, article.seo?.canonicalOverride);

  // Synchronize document head tags and JSON-LD Schema
  useEffect(() => {
    if (!article) return;

    const originalTitle = document.title;
    const pageTitle = article.seo?.metaTitle || `${article.title} | FujiFinder`;
    document.title = pageTitle;

    // Helper to set or update meta tag
    const setMetaTag = (attrName: string, attrVal: string, content: string) => {
      let el = document.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    // Helper to set or update link tag
    const setLinkTag = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.rel = rel;
        document.head.appendChild(el);
      }
      el.href = href;
    };

    // Description & Robots
    const metaDesc = article.seo?.metaDescription || article.excerpt || '';
    if (metaDesc) setMetaTag('name', 'description', metaDesc);

    const robotsVal = article.seo?.noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large';
    setMetaTag('name', 'robots', robotsVal);

    // Open Graph
    const ogTitle = article.seo?.ogTitle || article.seo?.metaTitle || article.title;
    const ogDesc = article.seo?.ogDescription || article.seo?.metaDescription || article.excerpt || '';
    const ogImg = article.seo?.ogImage || article.coverImage || '';

    setMetaTag('property', 'og:title', ogTitle);
    if (ogDesc) setMetaTag('property', 'og:description', ogDesc);
    if (ogImg) setMetaTag('property', 'og:image', ogImg);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', 'article');

    // Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', ogTitle);
    if (ogDesc) setMetaTag('name', 'twitter:description', ogDesc);
    if (ogImg) setMetaTag('name', 'twitter:image', ogImg);

    // Canonical link
    setLinkTag('canonical', canonicalUrl);

    // JSON-LD Structured Data Injection
    const schemaJson = generateArticleSchemaJsonString(article, featuredCameras, siteSettings);
    let scriptTag = document.getElementById('fujifinder-article-schema') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'fujifinder-article-schema';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = schemaJson;

    return () => {
      document.title = originalTitle;
      const existingScript = document.getElementById('fujifinder-article-schema');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, [article, canonicalUrl, featuredCameras, siteSettings]);

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-10 text-left relative">
      {/* Draft notice banner for admin */}
      {article.status === 'draft' && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-2.5 rounded text-xs flex items-center justify-between shadow-xs">
          <span>Mode Pratinjau Admin: Artikel ini berstatus <strong>Draft</strong> dan tersembunyi dari pembaca umum.</span>
          <span className="bg-amber-400 text-amber-950 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Draft</span>
        </div>
      )}

      {/* Plugin Extension: Floating Social Share Bar (when plugin is active) */}
      <SocialShareFloatingBar articleTitle={article.title} articleUrl={canonicalUrl} />

      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between border-b border-[#EEEBE6] pb-4">
        <Breadcrumbs
          items={[
            { label: 'Journal', view: 'blog' },
            { label: article.category, view: 'blog' },
            { label: article.title, active: true },
          ]}
        />

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBookmarked(!bookmarked)}
            className="p-2 border border-[#EEEBE6] text-[#666] hover:text-black hover:border-black cursor-pointer transition-colors"
            title="Save article"
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-black text-black' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 border border-[#EEEBE6] text-[#666] hover:text-black hover:border-black cursor-pointer flex items-center gap-1 text-[11px] uppercase tracking-wider transition-colors"
            title="Share article"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#2E7D32]" /> : <Share2 className="w-3.5 h-3.5 text-[#666]" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Article Header */}
      <header className="space-y-5">
        <div className="flex items-center gap-2">
          <span className="bg-[#1A1A1A] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1">
            {article.category}
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#888] hidden sm:inline">
            FujiFinder Editorial Journal
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#1A1A1A] leading-[1.1] tracking-tight">
          {article.title}
        </h1>

        {article.subtitle && (
          <p className="text-base sm:text-xl text-[#666] font-serif italic leading-relaxed">
            {article.subtitle}
          </p>
        )}

        {/* Author Byline & Publishing Meta */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#EEEBE6] text-xs text-[#666]">
          <div className="flex items-center gap-3">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-10 h-10 object-cover border border-[#EEEBE6]"
            />
            <div>
              <div className="font-semibold text-sm text-[#1A1A1A]">{article.author.name}</div>
              <div className="text-[10px] text-[#888]">{article.author.role}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-[#888]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {article.publishedAt}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.readTimeMinutes} min read
            </span>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      <div className="h-80 sm:h-[480px] w-full overflow-hidden bg-[#E5E2DD] relative border border-[#EEEBE6]">
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Affiliate Transparency Disclosure Banner */}
      <AffiliateDisclosureBanner />

      {/* Table of Contents (if available) */}
      {article.tableOfContents && article.tableOfContents.length > 0 && (
        <div className="bg-white border border-[#EEEBE6] p-5 sm:p-6 my-6">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888] mb-3">
            Table of Contents
          </h4>
          <nav className="space-y-1.5 text-xs text-[#666]">
            {article.tableOfContents.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-2 hover:text-black transition-colors">
                <span className="text-[#888] font-mono text-[11px]">{idx + 1}.</span>
                <a href={`#${item.id}`} className="hover:underline">
                  {item.title}
                </a>
              </div>
            ))}
          </nav>
        </div>
      )}

      {/* Main Rich Content Blocks Renderer */}
      <div className="space-y-8 text-base text-[#1A1A1A] leading-[1.8]">
        {article.blocks.map((block) => {
          switch (block.type) {
            case 'paragraph':
              return (
                <p key={block.id} className="text-base sm:text-lg text-[#333] font-normal leading-[1.8] font-sans">
                  {block.text}
                </p>
              );

            case 'heading2':
              const headingId = block.text?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              return (
                <h2 
                  key={block.id} 
                  id={headingId}
                  className="font-serif text-2xl sm:text-3xl font-normal text-[#1A1A1A] pt-6 pb-2 border-b border-[#EEEBE6] leading-snug"
                >
                  {block.text}
                </h2>
              );

            case 'heading3':
              return (
                <h3 key={block.id} className="font-serif text-xl sm:text-2xl font-normal text-[#1A1A1A] pt-4">
                  {block.text}
                </h3>
              );

            case 'quote':
              return (
                <div key={block.id} className="my-8 p-6 sm:p-8 bg-[#FDFCFB] border-l-2 border-black">
                  <p className="font-serif text-xl sm:text-2xl italic text-[#1A1A1A] leading-relaxed">
                    “{block.text}”
                  </p>
                  {block.authorQuote && (
                    <span className="block text-[10px] uppercase tracking-[0.15em] font-bold text-[#888] mt-3">
                      — {block.authorQuote}
                    </span>
                  )}
                </div>
              );

            case 'callout':
              return (
                <div key={block.id} className="p-4 sm:p-5 bg-white border border-[#EEEBE6] text-xs sm:text-sm text-[#666] leading-relaxed my-6 rounded-lg">
                  {block.text}
                </div>
              );

            case 'image':
              return (
                <figure key={block.id} className="my-8 space-y-2">
                  <div className="overflow-hidden bg-[#F5F4F0] border border-[#EEEBE6] rounded-xl">
                    <img
                      src={block.imageUrl}
                      alt={block.imageAlt || block.imageCaption || 'Article visual'}
                      className="w-full h-auto object-cover max-h-[550px]"
                    />
                  </div>
                  {block.imageCaption && (
                    <figcaption className="text-xs text-[#777] italic text-center font-sans">
                      {block.imageCaption}
                    </figcaption>
                  )}
                </figure>
              );

            case 'bullet_list':
              return (
                <ul key={block.id} className="space-y-2 my-4 pl-6 list-disc text-base text-[#333]">
                  {block.items?.map((item, i) => (
                    <li key={i} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              );

            case 'numbered_list':
              return (
                <ol key={block.id} className="space-y-2 my-4 pl-6 list-decimal text-base text-[#333]">
                  {block.items?.map((item, i) => (
                    <li key={i} className="leading-relaxed">{item}</li>
                  ))}
                </ol>
              );

            case 'product_card':
              return block.productId ? (
                <DynamicProductBox
                  key={block.id}
                  productId={block.productId}
                  badge={block.productBadge}
                  customNote={block.productNote}
                  sourceSlug={article.slug}
                />
              ) : null;

            case 'comparison_table':
              return block.comparedProductIds ? (
                <ComparisonTable
                  key={block.id}
                  productIds={block.comparedProductIds}
                  sourceSlug={article.slug}
                />
              ) : null;

            case 'pros_cons':
              return (
                <div key={block.id} className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
                  <div className="bg-white border border-[#EEEBE6] p-5">
                    <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#2E7D32] flex items-center gap-1.5 mb-3">
                      <CheckCircle2 className="w-4 h-4" /> Strengths
                    </span>
                    <ul className="space-y-2 text-xs text-[#555]">
                      {block.pros?.map((p, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#2E7D32] font-bold">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white border border-[#EEEBE6] p-5">
                    <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#C62828] flex items-center gap-1.5 mb-3">
                      <XCircle className="w-4 h-4" /> Weaknesses
                    </span>
                    <ul className="space-y-2 text-xs text-[#555]">
                      {block.cons?.map((c, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#C62828] font-bold">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );

            case 'affiliate_cta': {
              const targetProduct = cameras.find((c) => c.id === block.productId);
              const destinationUrl = block.linkUrl || targetProduct?.affiliateLinks?.[0]?.url || '#';
              const productName = block.subjectName || targetProduct?.name || 'Produk Rekomendasi';
              const buttonText = block.ctaText || (targetProduct ? `Check Price for ${targetProduct.name}` : 'Check Current Price & Stock');
              const subText = block.ctaSubtext || (targetProduct ? `Bandingkan harga dan ketersediaan stok resmi untuk ${targetProduct.name}.` : 'Lihat penawaran harga & ketersediaan stok resmi.');

              return (
                <div key={block.id} className="my-8 p-6 sm:p-7 bg-[#1A1A1A] text-white flex flex-col sm:flex-row items-center justify-between gap-5 rounded-xs border border-neutral-800 shadow-sm">
                  <div className="space-y-1.5 text-left w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-950/90 text-emerald-300 border border-emerald-800/80 text-[9px] font-bold uppercase tracking-widest rounded-xs">
                        <Sparkles className="w-2.5 h-2.5" /> Affiliate Deal
                      </span>
                      {productName && (
                        <span className="text-xs text-neutral-300 font-medium truncate max-w-[280px]">
                          {productName}
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif text-lg sm:text-xl font-normal text-white">
                      {buttonText}
                    </h4>
                    <p className="text-xs text-[#BBB] leading-relaxed max-w-xl">
                      {subText}
                    </p>
                  </div>
                  <div className="shrink-0 w-full sm:w-auto">
                    <a
                      href={destinationUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      onClick={() => {
                        recordAffiliateClick(
                          block.productId || 'manual-cta',
                          productName,
                          'article',
                          article.slug
                        );
                      }}
                      className="inline-flex items-center justify-center gap-2 bg-white text-[#1A1A1A] hover:bg-[#E5DFD5] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] transition-all whitespace-nowrap cursor-pointer w-full sm:w-auto shadow-sm group"
                      title={`Buka penawaran resmi ${productName} di tab/halaman baru`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#1A1A1A]" />
                      <span>{buttonText}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity ml-0.5" />
                    </a>
                  </div>
                </div>
              );
            }

            default:
              return null;
          }
        })}
      </div>

      {/* Inline Newsletter Dispatch Callout */}
      <NewsletterSubscribeBox variant="inline-article" source={`article_${article.slug}`} />

      {/* Featured Cameras Quick Shelf */}
      {featuredCameras.length > 0 && (
        <section className="pt-10 border-t border-[#EEEBE6] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-normal text-[#1A1A1A]">
              Gear Referenced in This Article
            </h3>
            <span className="text-xs text-[#888]">
              {featuredCameras.length} Cameras Field Tested
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredCameras.map((cam) => (
              <CameraCard key={cam.id} camera={cam} layout="horizontal" sourceSlug={article.slug} />
            ))}
          </div>
        </section>
      )}

      {/* Author Bio Box */}
      <section className="bg-white border border-[#EEEBE6] p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={article.author.avatar}
          alt={article.author.name}
          className="w-20 h-20 object-cover border border-[#EEEBE6] shrink-0"
        />
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#888]">
            About the Author
          </span>
          <h4 className="font-serif text-xl font-normal text-[#1A1A1A]">
            {article.author.name}
          </h4>
          <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
            {article.author.bio}
          </p>
        </div>
      </section>

      {/* SEO Metadata Inspection Preview Bar (shows editorial diligence) */}
      <section className="bg-white border border-[#EEEBE6] p-4 sm:p-5 text-xs text-[#666] space-y-3">
        <div className="flex items-center justify-between font-medium text-[#1A1A1A] text-[10px] uppercase tracking-[0.15em] border-b border-[#EEEBE6] pb-2">
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#1A1A1A]" />
            <span>SEO & Schema Meta Verification</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-xs ${
              article.seo?.noIndex ? 'bg-amber-100 text-amber-900' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}>
              {article.seo?.noIndex ? 'noindex • Staging' : 'Indexable • Rank Ready'}
            </span>
            <button
              onClick={() => setShowRawSchema(!showRawSchema)}
              className="flex items-center gap-1 text-[10px] font-mono text-neutral-600 hover:text-black underline cursor-pointer"
            >
              <Code2 className="w-3 h-3" />
              {showRawSchema ? 'Hide Schema' : 'View JSON-LD'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-[11px]">
          <div>
            <span className="text-[#888] block text-[10px] uppercase tracking-wider">Focus Keyword</span>
            <strong className="text-[#1A1A1A]">{article.seo?.focusKeyword || '—'}</strong>
          </div>
          <div>
            <span className="text-[#888] block text-[10px] uppercase tracking-wider">Schema Type</span>
            <span className="font-mono text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded text-[10px]">
              {article.seo?.schemaType || (featuredCameras.length > 0 ? 'Review' : 'Article')}
            </span>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <span className="text-[#888] block text-[10px] uppercase tracking-wider">Canonical Target</span>
            <a 
              href={canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-900 hover:underline font-mono text-[10px] truncate block"
              title={canonicalUrl}
            >
              {canonicalUrl}
            </a>
          </div>
        </div>

        {article.seo?.secondaryKeywords && article.seo.secondaryKeywords.length > 0 && (
          <div className="pt-2 border-t border-neutral-100 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider text-[#888] font-medium mr-1">Secondary:</span>
            {article.seo.secondaryKeywords.map((kw, i) => (
              <span key={i} className="text-[10px] bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full font-medium">
                {kw}
              </span>
            ))}
          </div>
        )}

        {showRawSchema && (
          <div className="mt-3 pt-3 border-t border-[#EEEBE6] space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
              <span>Google Rich Snippet Structured Data (JSON-LD)</span>
              <span>application/ld+json</span>
            </div>
            <pre className="p-3 bg-neutral-900 text-emerald-400 font-mono text-[10px] rounded overflow-x-auto max-h-56">
              {generateArticleSchemaJsonString(article, featuredCameras, siteSettings)}
            </pre>
          </div>
        )}
      </section>

      {/* Related Content */}
      {relatedArticles.length > 0 && (
        <section className="pt-10 border-t border-[#EEEBE6] space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-normal text-[#1A1A1A]">
              Continue Reading
            </h3>
            <button
              onClick={() => navigateTo('blog')}
              className="text-[11px] uppercase tracking-wider font-semibold text-[#1A1A1A] hover:opacity-75 cursor-pointer"
            >
              All Articles →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedArticles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
};
