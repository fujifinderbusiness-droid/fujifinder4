import React, { useState, useMemo, useRef } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Globe, 
  Share2, 
  Code2, 
  Search, 
  Smartphone, 
  Monitor, 
  Copy, 
  Check, 
  Plus, 
  X, 
  ExternalLink, 
  Link as LinkIcon, 
  Camera, 
  Info, 
  RefreshCw,
  Upload,
  Lock,
  Unlock,
  Layers,
  ChevronDown,
  ChevronUp,
  Sliders,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Article, CameraProduct, SEOData, SiteSettings } from '../types';
import { 
  analyzeArticleSEO, 
  autoGenerateSEOMetadata, 
  generateCleanSlug, 
  generateArticleSchemaJson,
  SEOAnalysisReport 
} from '../utils/seoUtils';
import { readFileAsOptimizedDataUrl } from '../utils/imageUtils';

interface ArticleSEOEditorProps {
  articleForm: Article;
  setArticleForm: React.Dispatch<React.SetStateAction<Article>>;
  connectedCameras: CameraProduct[];
  allArticles: Article[];
  siteSettings: SiteSettings;
  sanitizeSlug: (val: string) => string;
}

export const ArticleSEOEditor: React.FC<ArticleSEOEditorProps> = ({
  articleForm,
  setArticleForm,
  connectedCameras,
  allArticles,
  siteSettings,
  sanitizeSlug,
}) => {
  // Tabs for preview
  const [previewTab, setPreviewTab] = useState<'google' | 'social' | 'schema' | 'links'>('google');
  const [serpDevice, setSerpDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [checklistFilter, setChecklistFilter] = useState<'all' | 'warning_fail' | 'pass'>('all');
  const [showConfirmAutoModal, setShowConfirmAutoModal] = useState(false);
  const [pendingAutoSEO, setPendingAutoSEO] = useState<ReturnType<typeof autoGenerateSEOMetadata> | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedLinkText, setCopiedLinkText] = useState<string | null>(null);
  const [secondaryInput, setSecondaryInput] = useState('');
  const [isUploadingOgImage, setIsUploadingOgImage] = useState(false);
  const ogFileInputRef = useRef<HTMLInputElement>(null);

  // Fallback domain
  const rawDomain = (siteSettings.siteUrl || 'https://www.fujifinder.my.id').replace(/\/+$/, '');
  const domain = rawDomain.includes('focalpointjournal') || rawDomain === 'https://fujifinder.com' 
    ? 'https://www.fujifinder.my.id' 
    : rawDomain;
  const slugPrefix = (siteSettings.blogSlugPrefix || '/article/').replace(/^\/+|\/+$/g, '');

  // Computed live Canonical URL
  const autoCanonicalUrl = `${domain}/${slugPrefix}/${articleForm.slug || 'slug-artikel'}`;
  const effectiveCanonicalUrl = articleForm.seo.customCanonicalOverride && articleForm.seo.canonicalUrl
    ? articleForm.seo.canonicalUrl
    : autoCanonicalUrl;

  // Run real-time on-page SEO analysis
  const seoReport: SEOAnalysisReport = useMemo(() => {
    return analyzeArticleSEO(articleForm, connectedCameras, domain);
  }, [articleForm, connectedCameras, domain]);

  // Connected camera for review snippet preview
  const primaryCamera = useMemo(() => {
    const ids = articleForm.featuredCameraIds || [];
    return connectedCameras.find((c) => ids.includes(c.id));
  }, [articleForm.featuredCameraIds, connectedCameras]);

  // Live character lengths & statuses
  const metaTitle = articleForm.seo?.metaTitle || '';
  const metaDesc = articleForm.seo?.metaDescription || '';
  const focusKeyword = articleForm.seo?.focusKeyword || articleForm.seo?.primaryKeyword || '';
  const secondaryKeywords = articleForm.seo?.secondaryKeywords || [];

  const titleLength = metaTitle.length;
  const descLength = metaDesc.length;

  // Title validation status
  const titleStatus = useMemo(() => {
    if (titleLength === 0) return { label: 'Kosong', color: 'text-neutral-400 bg-neutral-100', barColor: 'bg-neutral-200' };
    if (titleLength >= 50 && titleLength <= 60) return { label: 'Optimal (50–60)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', barColor: 'bg-emerald-500' };
    if (titleLength > 60) return { label: 'Terlalu Panjang (>60)', color: 'text-amber-700 bg-amber-50 border-amber-200', barColor: 'bg-amber-500' };
    return { label: 'Kurang Panjang (<50)', color: 'text-amber-700 bg-amber-50 border-amber-200', barColor: 'bg-amber-400' };
  }, [titleLength]);

  // Description validation status
  const descStatus = useMemo(() => {
    if (descLength === 0) return { label: 'Kosong', color: 'text-neutral-400 bg-neutral-100', barColor: 'bg-neutral-200' };
    if (descLength >= 140 && descLength <= 160) return { label: 'Optimal (140–160)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', barColor: 'bg-emerald-500' };
    if (descLength > 160) return { label: 'Terpotong di SERP (>160)', color: 'text-rose-700 bg-rose-50 border-rose-200', barColor: 'bg-rose-500' };
    return { label: 'Kurang Panjang (<140)', color: 'text-amber-700 bg-amber-50 border-amber-200', barColor: 'bg-amber-400' };
  }, [descLength]);

  // Helper to update SEO subfield
  const updateSEO = (updates: Partial<SEOData>) => {
    setArticleForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        ...updates,
      },
    }));
  };

  // Add secondary keyword tag
  const handleAddSecondaryKeyword = (kw: string) => {
    const trimmed = kw.trim().toLowerCase();
    if (!trimmed || secondaryKeywords.includes(trimmed)) return;
    updateSEO({ secondaryKeywords: [...secondaryKeywords, trimmed] });
    setSecondaryInput('');
  };

  const handleRemoveSecondaryKeyword = (kwToRemove: string) => {
    updateSEO({ secondaryKeywords: secondaryKeywords.filter((k) => k !== kwToRemove) });
  };

  // Auto Generate SEO logic with explicit confirmation guard
  const handleTriggerAutoSEO = () => {
    const generated = autoGenerateSEOMetadata(articleForm, connectedCameras, siteSettings);

    const hasExistingData = Boolean(
      (articleForm.seo?.focusKeyword && articleForm.seo.focusKeyword.trim() !== '') ||
      (articleForm.seo?.metaTitle && articleForm.seo.metaTitle.trim() !== '') ||
      (articleForm.seo?.metaDescription && articleForm.seo.metaDescription.trim() !== '') ||
      (articleForm.slug && articleForm.slug.trim() !== '')
    );

    if (hasExistingData) {
      setPendingAutoSEO(generated);
      setShowConfirmAutoModal(true);
    } else {
      applyAutoSEO(generated);
    }
  };

  const applyAutoSEO = (generated: ReturnType<typeof autoGenerateSEOMetadata>) => {
    setArticleForm((prev) => ({
      ...prev,
      slug: generated.slug,
      seo: {
        ...prev.seo,
        focusKeyword: generated.focusKeyword,
        primaryKeyword: generated.focusKeyword,
        secondaryKeywords: Array.from(new Set([...(prev.seo?.secondaryKeywords || []), ...generated.secondaryKeywords])),
        metaTitle: generated.metaTitle,
        metaDescription: generated.metaDescription,
        ogTitle: generated.ogTitle,
        ogDescription: generated.ogDescription,
        ogImage: prev.seo?.ogImage || prev.coverImage,
        schemaType: generated.schemaType,
      },
    }));
    setShowConfirmAutoModal(false);
    setPendingAutoSEO(null);
  };

  // Handle OG Image File Upload
  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingOgImage(true);
    try {
      const dataUrl = await readFileAsOptimizedDataUrl(file, 1200, 630, 0.85);
      updateSEO({ ogImage: dataUrl });
    } catch (err) {
      console.error('Failed to upload OG image', err);
    } finally {
      setIsUploadingOgImage(false);
      if (ogFileInputRef.current) ogFileInputRef.current.value = '';
    }
  };

  // Filtered Checklist
  const filteredChecks = useMemo(() => {
    if (checklistFilter === 'pass') {
      return seoReport.checks.filter((c) => c.status === 'pass');
    }
    if (checklistFilter === 'warning_fail') {
      return seoReport.checks.filter((c) => c.status === 'warning' || c.status === 'fail');
    }
    return seoReport.checks;
  }, [seoReport.checks, checklistFilter]);

  // Schema JSON-LD representation
  const schemaJsonObj = useMemo(() => {
    return generateArticleSchemaJson(articleForm, connectedCameras, siteSettings);
  }, [articleForm, connectedCameras, siteSettings]);

  const schemaJsonString = JSON.stringify(schemaJsonObj, null, 2);

  const copyToClipboard = (text: string, type: 'schema' | 'link') => {
    navigator.clipboard?.writeText(text);
    if (type === 'schema') {
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2000);
    } else {
      setCopiedLinkText(text);
      setTimeout(() => setCopiedLinkText(null), 2000);
    }
  };

  return (
    <div className="bg-white border border-[#EEEBE6] space-y-6 text-xs text-[#1A1A1A]">
      {/* Top Banner / Section Header */}
      <div className="p-5 sm:p-6 border-b border-[#EEEBE6] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF9F6]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-[#1A1A1A] text-white">
              SEO Engine 2026
            </span>
            <span className="text-[11px] text-[#666] font-mono">
              FujiFinder Editorial Intelligence
            </span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#1A1A1A]">
            SEO & Social Meta Optimization
          </h3>
          <p className="text-[#666] text-xs max-w-2xl leading-relaxed">
            Optimalkan ulasan kamera untuk peringkat organik Google dan tingkatkan konversi klik afiliasi (Amazon, B&H Photo) secara terukur.
          </p>
        </div>

        {/* Action Button & Live Score Badge */}
        <div className="flex items-center gap-3 shrink-0">
          {/* SEO Score Meter */}
          <div className={`px-3.5 py-2 border flex items-center gap-2.5 ${seoReport.ratingColor}`}>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">SEO Score</div>
              <div className="text-sm font-semibold">{seoReport.ratingLabel}</div>
            </div>
            <div className="text-2xl font-bold font-mono pl-2 border-l border-current/20">
              {seoReport.score}<span className="text-xs font-normal opacity-70">/100</span>
            </div>
          </div>

          {/* Auto Generate SEO Button */}
          <button
            type="button"
            onClick={handleTriggerAutoSEO}
            className="px-4 py-2.5 bg-[#1A1A1A] text-white text-xs uppercase tracking-wider font-semibold hover:bg-black transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            title="Analisis otomatis konten ulasan, kamera terhubung, dan buat rekomendasi SEO lengkap"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Auto Generate SEO</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 sm:p-6 space-y-8">
        
        {/* SECTION 1: KEYWORDS & URL SLUG */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#EEEBE6] pb-2">
            <h4 className="font-serif text-base font-normal text-[#1A1A1A] flex items-center gap-2">
              <span>1. Target Kata Kunci & Struktur URL</span>
            </h4>
            <span className="text-[11px] text-[#666]">Fondasi Pencarian Organik</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Primary Focus Keyword */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] uppercase tracking-wider text-[#1A1A1A] font-semibold">
                  Primary / Focus Keyword <span className="text-rose-600">*</span>
                </label>
                {focusKeyword && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 font-mono">
                    Aktif
                  </span>
                )}
              </div>
              <input
                type="text"
                value={focusKeyword}
                onChange={(e) => updateSEO({ focusKeyword: e.target.value, primaryKeyword: e.target.value })}
                placeholder="misal: fujifilm x100vi review atau best street cameras 2026"
                className="w-full px-3 py-2.5 border border-[#EEEBE6] bg-[#FDFCFB] text-xs text-[#1A1A1A] focus:outline-none focus:border-black font-medium"
              />

              {/* Keyword Quick Suggestions */}
              {seoReport.suggestedKeywords.length > 0 && (
                <div className="pt-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#888] font-medium mr-1.5">
                    Saran Kontekstual:
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {seoReport.suggestedKeywords.slice(0, 4).map((kw, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => updateSEO({ focusKeyword: kw, primaryKeyword: kw })}
                        className="text-[10px] bg-[#FAF9F6] border border-[#E5E2DD] hover:border-black text-[#555] hover:text-black px-2 py-0.5 transition-colors cursor-pointer"
                      >
                        + {kw}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Custom Clean URL Slug */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] uppercase tracking-wider text-[#1A1A1A] font-semibold">
                  Custom URL Slug <span className="text-rose-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const clean = generateCleanSlug(focusKeyword || articleForm.title, true);
                    setArticleForm((prev) => ({ ...prev, slug: clean }));
                  }}
                  className="text-[10px] text-[#666] hover:text-black underline cursor-pointer"
                  title="Hapus kata-kata stopword (yang, dan, the, dll) agar URL ringkas & ramah Google"
                >
                  Bersihkan Stopwords
                </button>
              </div>

              <div className="flex items-center border border-[#EEEBE6] bg-[#FDFCFB] focus-within:border-black">
                <span className="pl-3 pr-1 text-[11px] text-neutral-500 font-mono select-none">
                  /{slugPrefix}/
                </span>
                <input
                  type="text"
                  value={articleForm.slug}
                  onChange={(e) => setArticleForm((prev) => ({ ...prev, slug: sanitizeSlug(e.target.value) }))}
                  placeholder="fujifilm-x100vi-review-sensor-40mp"
                  className="w-full px-2 py-2.5 text-xs bg-transparent font-mono focus:outline-none text-[#1A1A1A]"
                />
              </div>

              {/* Dynamic Canonical URL Display with Production Domain */}
              <div className="flex items-center justify-between gap-2 text-[10px] text-[#666] font-mono bg-[#FAF9F6] p-2 border border-[#EEEBE6]">
                <div className="flex items-center gap-1.5 truncate">
                  <Globe className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="text-[#888]">Canonical:</span>
                  <span className="text-[#1A1A1A] font-medium truncate">
                    {effectiveCanonicalUrl}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => updateSEO({ customCanonicalOverride: !articleForm.seo.customCanonicalOverride })}
                  className="text-[10px] text-[#666] hover:text-black underline shrink-0 cursor-pointer ml-1"
                >
                  {articleForm.seo.customCanonicalOverride ? 'Gunakan Otomatis' : 'Kustomisasi'}
                </button>
              </div>

              {/* Optional Custom Canonical Input if enabled */}
              {articleForm.seo.customCanonicalOverride && (
                <div className="p-2.5 bg-amber-50/70 border border-amber-200 text-xs space-y-1 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase text-amber-900">
                      Override URL Canonical Manual
                    </span>
                  </div>
                  <input
                    type="url"
                    value={articleForm.seo.canonicalUrl || ''}
                    onChange={(e) => updateSEO({ canonicalUrl: e.target.value })}
                    placeholder="https://www.fujifinder.my.id/article/custom-url"
                    className="w-full px-2.5 py-1.5 text-xs border border-amber-300 bg-white font-mono focus:outline-none focus:border-black"
                  />
                  <p className="text-[10px] text-amber-800">
                    Hanya ubah jika artikel ini merupakan sindikasi atau terbitan ulang dari sumber berhak cipta lain.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Secondary Keywords Chips Input */}
          <div className="p-3.5 bg-[#FAF9F6] border border-[#EEEBE6] space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#1A1A1A] font-semibold">
                  Secondary / Long-Tail Keywords ({secondaryKeywords.length})
                </span>
                <p className="text-[10px] text-[#666]">
                  Kata kunci pendukung untuk menangkap pencarian spesifik (misal: "sensor 40mp", "ibis 6-stop", "resep film simulation").
                </p>
              </div>
            </div>

            {/* Keyword Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {secondaryKeywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#DDD8D0] text-[11px] text-[#1A1A1A]"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSecondaryKeyword(kw)}
                    className="text-[#888] hover:text-rose-600 cursor-pointer"
                    title="Hapus kata kunci"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {/* Add Input */}
              <div className="inline-flex items-center gap-1">
                <input
                  type="text"
                  value={secondaryInput}
                  onChange={(e) => setSecondaryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSecondaryKeyword(secondaryInput);
                    }
                  }}
                  placeholder="Ketik & Enter..."
                  className="px-2 py-1 text-[11px] border border-[#DDD8D0] bg-white text-[#1A1A1A] focus:outline-none focus:border-black w-36"
                />
                <button
                  type="button"
                  onClick={() => handleAddSecondaryKeyword(secondaryInput)}
                  className="p-1 bg-[#1A1A1A] text-white hover:bg-black cursor-pointer"
                  title="Tambah kata kunci"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: META TITLE & DESCRIPTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#EEEBE6] pb-2">
            <h4 className="font-serif text-base font-normal text-[#1A1A1A] flex items-center gap-2">
              <span>2. Cuplikan Hasil Pencarian Google (Snippet Meta)</span>
            </h4>
            <span className="text-[11px] text-[#666]">Teks yang muncul pada halaman Google SERP</span>
          </div>

          {/* Meta Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] uppercase tracking-wider text-[#1A1A1A] font-semibold">
                Meta Title (Tag Judul Halaman) <span className="text-rose-600">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const suffix = ` | ${siteSettings.siteName || 'FujiFinder'}`;
                    if (!metaTitle.includes(suffix)) {
                      updateSEO({ metaTitle: `${metaTitle}${suffix}` });
                    }
                  }}
                  className="text-[10px] text-[#666] hover:text-black underline cursor-pointer"
                >
                  + Tambah | FujiFinder
                </button>
                <span className={`text-[10px] px-2 py-0.5 border font-mono font-medium ${titleStatus.color}`}>
                  {titleLength}/60 karakter · {titleStatus.label}
                </span>
              </div>
            </div>

            <input
              type="text"
              value={metaTitle}
              onChange={(e) => updateSEO({ metaTitle: e.target.value })}
              placeholder="misal: Fujifilm X100VI Review: Uji Lab Sensor 40MP & Street Test | FujiFinder"
              className="w-full px-3 py-2.5 border border-[#EEEBE6] bg-[#FDFCFB] text-xs text-[#1A1A1A] focus:outline-none focus:border-black font-medium"
            />

            {/* Character meter bar */}
            <div className="w-full h-1 bg-neutral-100 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${titleStatus.barColor}`}
                style={{ width: `${Math.min(100, (titleLength / 60) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-[#777]">
              Rekomendasi Google: 50–60 karakter. Sertakan Primary Keyword di 30 karakter pertama untuk visibilitas optimal.
            </p>
          </div>

          {/* Meta Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] uppercase tracking-wider text-[#1A1A1A] font-semibold">
                Meta Description <span className="text-rose-600">*</span>
              </label>
              <span className={`text-[10px] px-2 py-0.5 border font-mono font-medium ${descStatus.color}`}>
                {descLength}/160 karakter · {descStatus.label}
              </span>
            </div>

            <textarea
              rows={3}
              value={metaDesc}
              onChange={(e) => updateSEO({ metaDescription: e.target.value })}
              placeholder="Tulis ringkasan ulasan kamera yang persuasif dan memuat ajakan bertindak (CTA). Misal: Simak hasil uji lab kamera Fujifilm X100VI: ketajaman sensor 40MP, stabilisasi 6-stop, dan simulasi film terbaru. Baca laporan lengkap di FujiFinder."
              className="w-full px-3 py-2.5 border border-[#EEEBE6] bg-[#FDFCFB] text-xs text-[#1A1A1A] focus:outline-none focus:border-black leading-relaxed"
            />

            {/* Character meter bar */}
            <div className="w-full h-1 bg-neutral-100 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${descStatus.barColor}`}
                style={{ width: `${Math.min(100, (descLength / 160) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-[#777]">
              Rekomendasi Google: 140–160 karakter. Berikan intisari ulasan kamera tanpa melakukan keyword stuffing.
            </p>
          </div>
        </div>

        {/* SECTION 3: SOCIAL OPEN GRAPH & SCHEMA STRUCTURED DATA */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#EEEBE6] pb-2">
            <h4 className="font-serif text-base font-normal text-[#1A1A1A] flex items-center gap-2">
              <span>3. Media Sosial & Schema Terstruktur (JSON-LD)</span>
            </h4>
            <span className="text-[11px] text-[#666]">Open Graph & Rich Review Snippet</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Open Graph Image & Preview */}
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-wider text-[#1A1A1A] font-semibold">
                Open Graph Image (1200x630)
              </label>

              <div className="aspect-[1.91/1] bg-[#FAF9F6] border border-[#DDD8D0] relative overflow-hidden flex items-center justify-center group">
                {articleForm.seo?.ogImage || articleForm.coverImage ? (
                  <img
                    src={articleForm.seo?.ogImage || articleForm.coverImage}
                    alt="Open Graph Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4 text-[#888]">
                    <Share2 className="w-6 h-6 mx-auto mb-1 opacity-50" />
                    <span className="text-[10px]">Belum ada gambar terpilih</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={() => ogFileInputRef.current?.click()}
                    className="px-2 py-1 bg-white text-black text-[10px] font-medium uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" /> Unggah File
                  </button>
                  {articleForm.coverImage && (
                    <button
                      type="button"
                      onClick={() => updateSEO({ ogImage: articleForm.coverImage })}
                      className="px-2 py-1 bg-[#1A1A1A] text-white text-[10px] font-medium uppercase tracking-wider cursor-pointer"
                    >
                      Pakai Cover
                    </button>
                  )}
                </div>
              </div>

              <input
                ref={ogFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleOgImageUpload}
                className="hidden"
              />

              {/* URL input fallback */}
              <input
                type="url"
                value={articleForm.seo?.ogImage || ''}
                onChange={(e) => updateSEO({ ogImage: e.target.value })}
                placeholder="https://images.unsplash.com/... atau URL gambar kustom"
                className="w-full px-2.5 py-1.5 text-[11px] border border-[#EEEBE6] bg-[#FDFCFB] font-mono text-[#1A1A1A] focus:outline-none focus:border-black"
              />
            </div>

            {/* Social Titles & Schema Settings */}
            <div className="lg:col-span-2 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Schema Type */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#1A1A1A] font-semibold mb-1">
                    Structured Schema Type
                  </label>
                  <select
                    value={articleForm.seo?.schemaType || (primaryCamera ? 'Review' : 'Article')}
                    onChange={(e) => updateSEO({ schemaType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] text-xs text-[#1A1A1A] focus:outline-none focus:border-black"
                  >
                    <option value="Article">Article (General Editorial)</option>
                    <option value="Review">Product Review (Rating & Rich Stars)</option>
                    <option value="TechArticle">TechArticle (Lab & Sensor Benchmark)</option>
                    <option value="NewsArticle">NewsArticle (Camera Gear Announcement)</option>
                  </select>
                </div>

                {/* Open Graph Title */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] uppercase tracking-wider text-[#1A1A1A] font-semibold">
                      OG Title (Opsional)
                    </label>
                    <span className="text-[10px] text-[#888]">Default: Meta Title</span>
                  </div>
                  <input
                    type="text"
                    value={articleForm.seo?.ogTitle || ''}
                    onChange={(e) => updateSEO({ ogTitle: e.target.value })}
                    placeholder={metaTitle || 'Judul saat dibagikan ke WhatsApp, FB, X'}
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] text-xs text-[#1A1A1A] focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Open Graph Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] uppercase tracking-wider text-[#1A1A1A] font-semibold">
                    OG Description (Opsional)
                  </label>
                  <span className="text-[10px] text-[#888]">Default: Meta Description</span>
                </div>
                <textarea
                  rows={2}
                  value={articleForm.seo?.ogDescription || ''}
                  onChange={(e) => updateSEO({ ogDescription: e.target.value })}
                  placeholder={metaDesc || 'Deskripsi saat link dibagikan di media sosial'}
                  className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] text-xs text-[#1A1A1A] focus:outline-none focus:border-black"
                />
              </div>

              {/* Rich Review Signals Callout */}
              {primaryCamera && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <span className="font-semibold text-emerald-900">Rich Review Snippet Siap:</span>{' '}
                      <span className="text-emerald-800">
                        Terhubung ke <strong>{primaryCamera.name}</strong> (Rating {primaryCamera.rating}/10). Bintang review dan harga akan tersemat di schema Google.
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-700 text-white text-[10px] font-mono shrink-0">
                    Schema.org Review
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 4: LIVE GOOGLE & SOCIAL SHARING PREVIEWS */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-[#EEEBE6] pb-2">
            <h4 className="font-serif text-base font-normal text-[#1A1A1A] flex items-center gap-2">
              <span>4. Pratinjau Langsung (Live Search & Social Preview)</span>
            </h4>

            {/* Preview Selector Tabs */}
            <div className="flex items-center gap-1 bg-[#FAF9F6] p-1 border border-[#EEEBE6]">
              <button
                type="button"
                onClick={() => setPreviewTab('google')}
                className={`px-3 py-1 text-[11px] font-medium uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                  previewTab === 'google' ? 'bg-white text-black shadow-xs font-semibold' : 'text-[#666] hover:text-black'
                }`}
              >
                <Search className="w-3 h-3 text-emerald-600" /> Google SERP
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('social')}
                className={`px-3 py-1 text-[11px] font-medium uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                  previewTab === 'social' ? 'bg-white text-black shadow-xs font-semibold' : 'text-[#666] hover:text-black'
                }`}
              >
                <Share2 className="w-3 h-3 text-blue-600" /> Social Card
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('schema')}
                className={`px-3 py-1 text-[11px] font-medium uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                  previewTab === 'schema' ? 'bg-white text-black shadow-xs font-semibold' : 'text-[#666] hover:text-black'
                }`}
              >
                <Code2 className="w-3 h-3 text-purple-600" /> Schema JSON-LD
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('links')}
                className={`px-3 py-1 text-[11px] font-medium uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                  previewTab === 'links' ? 'bg-white text-black shadow-xs font-semibold' : 'text-[#666] hover:text-black'
                }`}
              >
                <LinkIcon className="w-3 h-3 text-amber-600" /> Internal Links
              </button>
            </div>
          </div>

          {/* TAB 1: GOOGLE SERP PREVIEW */}
          {previewTab === 'google' && (
            <div className="p-4 sm:p-5 bg-white border border-[#DDD8D0] space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#EEEBE6]">
                <div className="flex items-center gap-2 text-xs text-[#555]">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Simulasi Tampilan Hasil Pencarian Google Organik</span>
                </div>

                <div className="flex items-center gap-1 bg-[#FAF9F6] p-0.5 border border-[#DDD8D0] text-[10px]">
                  <button
                    type="button"
                    onClick={() => setSerpDevice('desktop')}
                    className={`px-2 py-0.5 flex items-center gap-1 cursor-pointer ${
                      serpDevice === 'desktop' ? 'bg-white font-semibold text-black shadow-xs' : 'text-[#666]'
                    }`}
                  >
                    <Monitor className="w-3 h-3" /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setSerpDevice('mobile')}
                    className={`px-2 py-0.5 flex items-center gap-1 cursor-pointer ${
                      serpDevice === 'mobile' ? 'bg-white font-semibold text-black shadow-xs' : 'text-[#666]'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" /> Mobile
                  </button>
                </div>
              </div>

              {/* Google Result Card Simulation */}
              <div
                className={`mx-auto bg-white p-4 transition-all ${
                  serpDevice === 'mobile'
                    ? 'max-w-md border border-[#E0DCD6] rounded-xl shadow-xs'
                    : 'max-w-2xl'
                }`}
              >
                {/* Domain & Favicon header */}
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[10px] text-white font-serif font-bold">
                    F
                  </div>
                  <div className="leading-tight truncate">
                    <div className="text-[12px] text-[#202124] font-medium font-sans">
                      {siteSettings.siteName || 'FujiFinder'}
                    </div>
                    <div className="text-[11px] text-[#4d5156] font-mono truncate">
                      {domain} › {slugPrefix} › {articleForm.slug || 'slug-artikel'}
                    </div>
                  </div>
                </div>

                {/* Clickable Title (Blue link) */}
                <h3 className="text-[#1a0dab] hover:underline cursor-pointer text-[18px] sm:text-[20px] font-sans font-normal leading-snug line-clamp-2">
                  {metaTitle || articleForm.title || 'Judul Ulasan Kamera di FujiFinder'}
                </h3>

                {/* Rich Review Snippet Stars (if review schema) */}
                {primaryCamera && (
                  <div className="flex items-center gap-1.5 mt-1 text-[12px] text-[#4d5156] font-sans">
                    <span className="text-[#e37400] font-medium">★★★★★</span>
                    <span className="font-semibold text-[#202124]">Rating: {primaryCamera.rating}/10</span>
                    <span>·</span>
                    <span>Ulasan oleh {articleForm.author?.name || 'FujiFinder'}</span>
                    <span>·</span>
                    <span className="text-emerald-700 font-medium">Tersedia di ritel resmi</span>
                  </div>
                )}

                {/* Meta Description snippet */}
                <p className="text-[13px] text-[#4d5156] font-sans leading-relaxed mt-1 line-clamp-2">
                  <span className="text-[#70757a] text-[12px]">
                    {articleForm.publishedAt || '2026-09-07'} —{' '}
                  </span>
                  {metaDesc || articleForm.excerpt || 'Deskripsi ringkasan ulasan kamera Anda akan tampil di sini untuk pembaca di Google...'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: SOCIAL CARD PREVIEW */}
          {previewTab === 'social' && (
            <div className="p-4 sm:p-5 bg-white border border-[#DDD8D0] space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#EEEBE6]">
                <div className="flex items-center gap-2 text-xs text-[#555]">
                  <Share2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Pratinjau Open Graph Card (Facebook, LinkedIn, X, WhatsApp)</span>
                </div>
                <span className="text-[10px] text-[#777] font-mono">1200 × 630 px</span>
              </div>

              <div className="max-w-md mx-auto border border-[#E0DCD6] overflow-hidden bg-white shadow-xs">
                {/* Image */}
                <div className="aspect-[1.91/1] bg-[#F5F3EF] overflow-hidden relative">
                  {articleForm.seo?.ogImage || articleForm.coverImage ? (
                    <img
                      src={articleForm.seo?.ogImage || articleForm.coverImage}
                      alt="Social Card"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#888] text-xs font-mono">
                      Foto Cover / OG Image
                    </div>
                  )}
                </div>

                {/* Card Meta Content */}
                <div className="p-3 bg-[#FAF9F6] border-t border-[#EEEBE6] space-y-1">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#888] font-mono truncate">
                    {domain.replace(/^https?:\/\//, '').toUpperCase()}
                  </div>
                  <div className="text-sm font-semibold text-[#1A1A1A] line-clamp-2 leading-snug">
                    {articleForm.seo?.ogTitle || metaTitle || articleForm.title || 'Judul Ulasan Kamera'}
                  </div>
                  <p className="text-[11px] text-[#666] line-clamp-2 leading-relaxed">
                    {articleForm.seo?.ogDescription || metaDesc || articleForm.excerpt || 'Deskripsi artikel ulasan...'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCHEMA JSON-LD VIEWER */}
          {previewTab === 'schema' && (
            <div className="p-4 sm:p-5 bg-[#1E1E1E] text-neutral-200 border border-[#333] space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-700">
                <div className="flex items-center gap-2 text-xs text-neutral-300">
                  <Code2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Schema.org Valid Structured Data (JSON-LD)</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(schemaJsonString, 'schema')}
                  className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedSchema ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedSchema ? 'Tersalin' : 'Salin JSON-LD'}
                </button>
              </div>

              <pre className="text-[11px] font-mono overflow-x-auto p-3 bg-black/40 border border-neutral-800 text-emerald-400 leading-relaxed max-h-72">
                <code>{schemaJsonString}</code>
              </pre>
              <p className="text-[10px] text-neutral-400">
                Skema terstruktur ini diinjeksi ke dalam header dokumen HTML agar Google Search Console mengenali entitas artikel, reviewer, foto, dan produk kamera berafiliasi.
              </p>
            </div>
          )}

          {/* TAB 4: INTERNAL LINKS & AFFILIATE RADAR */}
          {previewTab === 'links' && (
            <div className="p-4 sm:p-5 bg-white border border-[#DDD8D0] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#EEEBE6]">
                <div>
                  <h5 className="font-semibold text-xs text-[#1A1A1A]">Peluang Tautan Internal & Afiliasi (Internal Link Hub)</h5>
                  <p className="text-[11px] text-[#666]">
                    Salin URL internal ke kamera atau artikel lain untuk disematkan dalam blok teks ulasan Anda.
                  </p>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 font-mono">
                  Meningkatkan Page Authority
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Connected Cameras Links */}
                <div className="space-y-2">
                  <span className="text-[11px] uppercase font-bold text-[#1A1A1A] tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" /> Kamera Katalog Terkait
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {connectedCameras.slice(0, 5).map((cam) => {
                      const link = `#/camera/${cam.slug}`;
                      return (
                        <div key={cam.id} className="flex items-center justify-between p-2 bg-[#FAF9F6] border border-[#EEEBE6] text-xs">
                          <div className="truncate mr-2">
                            <span className="font-medium text-[#1A1A1A]">{cam.name}</span>
                            <span className="text-[10px] text-[#666] ml-1 font-mono">({link})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(link, 'link')}
                            className="px-2 py-0.5 text-[10px] bg-white border border-[#DDD8D0] hover:border-black font-mono shrink-0 cursor-pointer"
                          >
                            {copiedLinkText === link ? 'Disalin' : 'Salin'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Related Articles */}
                <div className="space-y-2">
                  <span className="text-[11px] uppercase font-bold text-[#1A1A1A] tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Artikel Jurnal Lainnya
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {allArticles.filter((a) => a.id !== articleForm.id).slice(0, 5).map((art) => {
                      const link = `#/${slugPrefix}/${art.slug}`;
                      return (
                        <div key={art.id} className="flex items-center justify-between p-2 bg-[#FAF9F6] border border-[#EEEBE6] text-xs">
                          <div className="truncate mr-2">
                            <span className="font-medium text-[#1A1A1A]">{art.title}</span>
                            <span className="text-[10px] text-[#666] ml-1 font-mono">({link})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(link, 'link')}
                            className="px-2 py-0.5 text-[10px] bg-white border border-[#DDD8D0] hover:border-black font-mono shrink-0 cursor-pointer"
                          >
                            {copiedLinkText === link ? 'Disalin' : 'Salin'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 5: REAL-TIME ON-PAGE SEO CHECKLIST & METRICS */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EEEBE6] pb-3">
            <div>
              <h4 className="font-serif text-base font-normal text-[#1A1A1A] flex items-center gap-2">
                <span>5. Audit & Checklist On-Page SEO Real-Time</span>
              </h4>
              <p className="text-[11px] text-[#666]">
                Evaluasi otomatis berdasarkan 13 parameter teknis & editorial untuk performa organik maksimum.
              </p>
            </div>

            {/* Checklist Filter Pills */}
            <div className="flex items-center gap-1 bg-[#FAF9F6] p-1 border border-[#EEEBE6]">
              <button
                type="button"
                onClick={() => setChecklistFilter('all')}
                className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium cursor-pointer ${
                  checklistFilter === 'all' ? 'bg-white text-black shadow-xs font-semibold' : 'text-[#666]'
                }`}
              >
                Semua ({seoReport.checks.length})
              </button>
              <button
                type="button"
                onClick={() => setChecklistFilter('warning_fail')}
                className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium cursor-pointer ${
                  checklistFilter === 'warning_fail' ? 'bg-white text-rose-700 shadow-xs font-semibold' : 'text-[#666]'
                }`}
              >
                Perlu Perbaikan ({seoReport.checks.filter((c) => c.status !== 'pass').length})
              </button>
              <button
                type="button"
                onClick={() => setChecklistFilter('pass')}
                className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium cursor-pointer ${
                  checklistFilter === 'pass' ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-[#666]'
                }`}
              >
                Lolos ({seoReport.checks.filter((c) => c.status === 'pass').length})
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="p-2.5 bg-[#FAF9F6] border border-[#EEEBE6]">
              <div className="text-[10px] uppercase text-[#777] font-medium">Panjang Kata</div>
              <div className="text-base font-bold font-mono text-[#1A1A1A]">
                {seoReport.stats.wordCount} <span className="text-[10px] font-normal text-[#666]">kata</span>
              </div>
            </div>
            <div className="p-2.5 bg-[#FAF9F6] border border-[#EEEBE6]">
              <div className="text-[10px] uppercase text-[#777] font-medium">Densitas Keyword</div>
              <div className="text-base font-bold font-mono text-[#1A1A1A]">
                {seoReport.stats.keywordDensityPercent}%{' '}
                <span className="text-[10px] font-normal text-[#666]">({seoReport.stats.keywordOccurrences}x)</span>
              </div>
            </div>
            <div className="p-2.5 bg-[#FAF9F6] border border-[#EEEBE6]">
              <div className="text-[10px] uppercase text-[#777] font-medium">Sub-Headings</div>
              <div className="text-base font-bold font-mono text-[#1A1A1A]">
                {seoReport.stats.headingsCount.h2} H2{' '}
                <span className="text-[10px] font-normal text-[#666]">/ {seoReport.stats.headingsCount.h3} H3</span>
              </div>
            </div>
            <div className="p-2.5 bg-[#FAF9F6] border border-[#EEEBE6]">
              <div className="text-[10px] uppercase text-[#777] font-medium">Internal Links</div>
              <div className="text-base font-bold font-mono text-[#1A1A1A]">
                {seoReport.stats.internalLinksCount}{' '}
                <span className="text-[10px] font-normal text-[#666]">link</span>
              </div>
            </div>
            <div className="p-2.5 bg-[#FAF9F6] border border-[#EEEBE6]">
              <div className="text-[10px] uppercase text-[#777] font-medium">Gambar Alt Text</div>
              <div className="text-base font-bold font-mono text-[#1A1A1A]">
                {seoReport.stats.imagesWithAltCount}{' '}
                <span className="text-[10px] font-normal text-[#666]">teroptimasi</span>
              </div>
            </div>
            <div className="p-2.5 bg-[#FAF9F6] border border-[#EEEBE6]">
              <div className="text-[10px] uppercase text-[#777] font-medium">Kamera Afiliasi</div>
              <div className="text-base font-bold font-mono text-emerald-700">
                {seoReport.stats.connectedProductsCount}{' '}
                <span className="text-[10px] font-normal text-[#666]">terhubung</span>
              </div>
            </div>
          </div>

          {/* Checklist Items List */}
          <div className="divide-y divide-[#EEEBE6] border border-[#EEEBE6]">
            {filteredChecks.map((item) => (
              <div
                key={item.id}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-[#FAF9F6] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="pt-0.5 shrink-0">
                    {item.status === 'pass' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                    {item.status === 'warning' && (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                    {item.status === 'fail' && (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-semibold text-xs text-[#1A1A1A]">{item.title}</h5>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 bg-neutral-100 text-neutral-600 font-mono">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#555] leading-relaxed">{item.description}</p>
                    {item.recommendation && (
                      <div className="text-[11px] text-amber-900 bg-amber-50/80 p-2 border border-amber-200/80 mt-1 flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{item.recommendation}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 self-end sm:self-start">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 border ${
                      item.status === 'pass'
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : item.status === 'warning'
                        ? 'text-amber-700 bg-amber-50 border-amber-200'
                        : 'text-rose-700 bg-rose-50 border-rose-200'
                    }`}
                  >
                    +{item.score} / {item.maxScore} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CONFIRMATION MODAL FOR AUTO GENERATE OVERWRITE */}
      {showConfirmAutoModal && pendingAutoSEO && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full border border-[#DDD8D0] shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-[#EEEBE6] pb-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-normal text-[#1A1A1A]">
                  Konfirmasi Pembaruan SEO Otomatis
                </h4>
                <p className="text-[11px] text-[#666]">
                  Beberapa kolom SEO sudah memiliki teks yang Anda ketik.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs bg-[#FAF9F6] p-3.5 border border-[#EEEBE6]">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#888]">Primary Keyword Baru:</span>
                <div className="font-mono text-[#1A1A1A] font-semibold">{pendingAutoSEO.focusKeyword}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#888]">Meta Title Baru:</span>
                <div className="text-[#1A1A1A] font-medium">{pendingAutoSEO.metaTitle}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#888]">Meta Description Baru:</span>
                <div className="text-[#555] leading-relaxed">{pendingAutoSEO.metaDescription}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#888]">URL Slug Baru:</span>
                <div className="font-mono text-[#1A1A1A]">/{pendingAutoSEO.slug}</div>
              </div>
            </div>

            <p className="text-[11px] text-[#666]">
              Apakah Anda ingin menerapkan nilai-nilai optimal di atas dan menimpa konfigurasi SEO saat ini?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#EEEBE6]">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmAutoModal(false);
                  setPendingAutoSEO(null);
                }}
                className="px-4 py-2 text-xs font-medium text-[#666] hover:text-black uppercase tracking-wider cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => applyAutoSEO(pendingAutoSEO)}
                className="px-5 py-2 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors cursor-pointer"
              >
                Ya, Perbarui SEO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
