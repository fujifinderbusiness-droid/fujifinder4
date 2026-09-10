import React, { useState, useRef } from 'react';
import { 
  HomePageSettings, 
  HeroSlideConfig, 
  CategoryCardConfig, 
  CameraProduct, 
  Article, 
  SiteSettings, 
  MediaAsset 
} from '../types';
import { 
  Save, 
  Plus, 
  Trash2, 
  Upload, 
  Link2, 
  Eye, 
  CheckCircle, 
  Sparkles, 
  ShieldCheck, 
  Sliders, 
  Compass, 
  Layers, 
  Camera, 
  Mail, 
  FileText,
  UploadCloud,
  ChevronRight,
  Info
} from 'lucide-react';
import { readFileAsOptimizedDataUrl } from '../utils/imageUtils';

interface HomeEditorCMSProps {
  homeForm: HomePageSettings;
  setHomeForm: React.Dispatch<React.SetStateAction<HomePageSettings>>;
  onSave: () => void;
  homeSaveSuccess: boolean;
  cameras: CameraProduct[];
  articles: Article[];
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  addMediaAsset: (asset: Omit<MediaAsset, 'id' | 'uploadedAt'>) => void;
  navigateTo: (view: string, slug?: string) => void;
}

export const HomeEditorCMS: React.FC<HomeEditorCMSProps> = ({
  homeForm,
  setHomeForm,
  onSave,
  homeSaveSuccess,
  cameras,
  articles,
  siteSettings,
  updateSiteSettings,
  addMediaAsset,
  navigateTo,
}) => {
  const [activeSection, setActiveSection] = useState<'hero' | 'categories' | 'cameras' | 'methodology' | 'newsletter' | 'slugs'>('hero');
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);

  // Hidden file inputs
  const heroSlideFileInputRef = useRef<HTMLInputElement>(null);
  const categoryFileInputRef = useRef<HTMLInputElement>(null);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  // Handlers for Hero Slides
  const handleAddSlide = () => {
    const newSlide: HeroSlideConfig = {
      id: 'slide-' + Date.now(),
      badge: 'Editor Highlight',
      date: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
      headline: 'Judul Headline Slide Baru',
      subtitle: 'Review & Uji Lab Eksklusif',
      description: 'Tulis ringkasan singkat ulasan lapangan atau fitur utama kamera di sini...',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1600&q=80',
      storySlug: articles[0]?.slug || 'fujifilm-x100vi-review',
      primaryCtaText: 'Baca Ulasan Lengkap',
      secondaryCtaText: 'Lihat Skor Sensor',
    };
    const updated = [...homeForm.heroSlides, newSlide];
    setHomeForm({ ...homeForm, heroSlides: updated });
    setSelectedSlideIndex(updated.length - 1);
  };

  const handleDeleteSlide = (index: number) => {
    if (homeForm.heroSlides.length <= 1) {
      alert('Minimal harus ada 1 slide hero.');
      return;
    }
    const updated = homeForm.heroSlides.filter((_, i) => i !== index);
    setHomeForm({ ...homeForm, heroSlides: updated });
    setSelectedSlideIndex(Math.max(0, index - 1));
  };

  const handleUpdateCurrentSlide = (field: keyof HeroSlideConfig, value: string) => {
    const updated = [...homeForm.heroSlides];
    if (updated[selectedSlideIndex]) {
      updated[selectedSlideIndex] = {
        ...updated[selectedSlideIndex],
        [field]: value,
      };
      setHomeForm({ ...homeForm, heroSlides: updated });
    }
  };

  const handleSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const dataUrl = await readFileAsOptimizedDataUrl(file, 1600, 1000, 0.85);
      handleUpdateCurrentSlide('image', dataUrl);
      addMediaAsset({
        title: `Hero Slide ${selectedSlideIndex + 1} Image`,
        url: dataUrl,
        category: 'editorial',
      });
    } catch (err: any) {
      alert('Gagal mengunggah foto slide: ' + (err.message || 'Error'));
    } finally {
      setIsUploading(false);
      if (heroSlideFileInputRef.current) heroSlideFileInputRef.current.value = '';
    }
  };

  const handleCategoryCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const dataUrl = await readFileAsOptimizedDataUrl(file, 800, 600, 0.85);
      const updated = [...homeForm.categoryCards];
      if (updated[activeCategoryIndex]) {
        updated[activeCategoryIndex] = {
          ...updated[activeCategoryIndex],
          image: dataUrl,
        };
        setHomeForm({ ...homeForm, categoryCards: updated });
        addMediaAsset({
          title: `Category ${updated[activeCategoryIndex].title} Card`,
          url: dataUrl,
          category: 'camera',
        });
      }
    } catch (err: any) {
      alert('Gagal mengunggah foto kategori: ' + (err.message || 'Error'));
    } finally {
      setIsUploading(false);
      if (categoryFileInputRef.current) categoryFileInputRef.current.value = '';
    }
  };

  const toggleFeaturedCamera = (camId: string) => {
    const currentList = homeForm.featuredCameraIds || [];
    let updated: string[];
    if (currentList.includes(camId)) {
      updated = currentList.filter((id) => id !== camId);
    } else {
      updated = [...currentList, camId];
    }
    setHomeForm({ ...homeForm, featuredCameraIds: updated });
  };

  const currentSlide = homeForm.heroSlides[selectedSlideIndex] || homeForm.heroSlides[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-left">
      {/* Top Header & Save Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EEEBE6]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-500 bg-neutral-100 px-2.5 py-0.5 rounded mb-1">
            <Sparkles className="w-3 h-3 text-neutral-800" />
            <span>Visual Homepage CMS</span>
          </div>
          <h1 className="font-serif text-3xl font-normal text-[#1A1A1A]">Home Page Content Editor</h1>
          <p className="text-xs text-[#666] mt-0.5">
            Kelola hero carousel, kategori format sensor, kamera uji lab unggulan, metodologi, dan slug navigasi
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => navigateTo('landing')}
            className="px-3.5 py-2 border border-[#EEEBE6] bg-white text-neutral-800 text-xs font-semibold hover:border-black rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Lihat Halaman Depan</span>
          </button>

          <button
            type="button"
            onClick={onSave}
            className="px-5 py-2 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-wider font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition-all shadow-sm active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan Home</span>
          </button>
        </div>
      </div>

      {/* Save Success Alert */}
      {homeSaveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">
              Pengaturan Halaman Depan (Homepage) berhasil disimpan dan langsung diterapkan ke pengunjung!
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700">Tersinkronisasi</span>
        </div>
      )}

      {/* Section Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-[#EEEBE6] text-xs">
        {[
          { id: 'hero', label: '1. Hero Carousel Banner', icon: Sparkles },
          { id: 'categories', label: '2. Kategori Sensor & Bodi', icon: Layers },
          { id: 'cameras', label: '3. Kamera Uji Lab Unggulan', icon: Camera },
          { id: 'methodology', label: '4. Metodologi Pengujian Lab', icon: ShieldCheck },
          { id: 'newsletter', label: '5. Newsletter & Banner', icon: Mail },
          { id: 'slugs', label: '6. Konfigurasi Slug URL', icon: Link2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-3.5 py-2 rounded-t-lg flex items-center gap-2 font-medium transition-colors shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-white border border-b-0 border-[#EEEBE6] text-neutral-900 font-semibold shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: HERO CAROUSEL BANNER */}
      {activeSection === 'hero' && (
        <div className="space-y-6">
          {/* Mode Switcher */}
          <div className="bg-white p-5 border border-[#EEEBE6] rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg font-normal text-[#1A1A1A]">Mode Tampilan Hero Banner</h3>
                <p className="text-xs text-[#666]">
                  Pilih apakah hero slide diatur secara manual kustom atau diambil otomatis dari artikel pilihan editor
                </p>
              </div>

              <div className="inline-flex bg-neutral-100 p-1 rounded-xl border border-neutral-200">
                <button
                  type="button"
                  onClick={() => setHomeForm({ ...homeForm, heroMode: 'manual' })}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    homeForm.heroMode === 'manual'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Manual (Kustom Penuh)
                </button>
                <button
                  type="button"
                  onClick={() => setHomeForm({ ...homeForm, heroMode: 'dynamic' })}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    homeForm.heroMode === 'dynamic'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Otomatis (Dari Artikel)
                </button>
              </div>
            </div>

            {homeForm.heroMode === 'dynamic' && (
              <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-600 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Mode Otomatis Aktif:</strong> Hero banner akan menampilkan artikel-artikel yang ditandai sebagai <em>"Hero Featured"</em> atau <em>"Featured Story"</em> di Menu Artikel & Guides. Anda tetap dapat mengedit slide manual di bawah untuk dipakai saat beralih ke mode manual.
                </div>
              </div>
            )}
          </div>

          {/* Slide Selector & Editor */}
          <div className="bg-white p-6 border border-[#EEEBE6] rounded-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EEEBE6]">
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {homeForm.heroSlides.map((slide, idx) => (
                  <button
                    key={slide.id || idx}
                    type="button"
                    onClick={() => setSelectedSlideIndex(idx)}
                    className={`px-3.5 py-1.5 text-xs rounded-lg border font-medium transition-all cursor-pointer shrink-0 ${
                      selectedSlideIndex === idx
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    Slide {idx + 1}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleAddSlide}
                  className="px-3 py-1.5 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Slide</span>
                </button>
              </div>

              {homeForm.heroSlides.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteSlide(selectedSlideIndex)}
                  className="text-xs text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-200 flex items-center gap-1 cursor-pointer transition-colors self-start"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Slide Ini</span>
                </button>
              )}
            </div>

            {currentSlide && (
              <div className="space-y-5">
                {/* Visual Image Uploader & Preview for Hero Slide */}
                <div className="bg-[#FDFCFB] p-4 border border-[#EEEBE6] rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#1A1A1A] font-semibold">
                        Hero Slide Background Image (Gambar Latar) *
                      </label>
                      <p className="text-[11px] text-[#777]">
                        Unggah file foto langsung dari laptop/HP (format 16:9 atau foto landscape resolusi tinggi)
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => heroSlideFileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-medium rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File Gambar</span>
                      </button>

                      <input
                        ref={heroSlideFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleSlideImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div 
                      onClick={() => heroSlideFileInputRef.current?.click()}
                      className="md:col-span-1 aspect-[16/9] rounded-xl border-2 border-dashed border-neutral-300 hover:border-neutral-900 bg-neutral-50 overflow-hidden cursor-pointer relative group flex items-center justify-center"
                    >
                      {currentSlide.image ? (
                        <>
                          <img
                            src={currentSlide.image}
                            alt="Slide Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-medium gap-1">
                            <UploadCloud className="w-5 h-5" />
                            <span>Ganti File Gambar</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-3 text-neutral-500">
                          <Upload className="w-6 h-6 mx-auto mb-1" />
                          <span className="text-xs font-medium">Klik untuk upload</span>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-[10px] uppercase tracking-wider text-[#666] font-medium">
                        Atau URL Gambar Web Eksternal:
                      </label>
                      <div className="flex items-center border border-neutral-300 bg-white rounded-lg focus-within:border-black overflow-hidden">
                        <span className="pl-3 pr-2 text-neutral-400">
                          <Link2 className="w-3.5 h-3.5" />
                        </span>
                        <input
                          type="text"
                          value={currentSlide.image}
                          onChange={(e) => handleUpdateCurrentSlide('image', e.target.value)}
                          placeholder="https://images.unsplash.com/... atau link foto lain"
                          className="w-full px-2 py-2 text-xs font-mono bg-transparent focus:outline-none"
                        />
                      </div>
                      <span className="text-[10px] text-neutral-500 block">
                        Rekomendasi resolusi: 1600x900px atau lebih tinggi untuk ketajaman layar Retina.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Text Content Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">
                      Badge Label Atas
                    </label>
                    <input
                      type="text"
                      value={currentSlide.badge}
                      onChange={(e) => handleUpdateCurrentSlide('badge', e.target.value)}
                      placeholder="e.g. Exclusive Lab Test • 40MP Sensor"
                      className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">
                      Tanggal / Waktu Rilis Ulasan
                    </label>
                    <input
                      type="text"
                      value={currentSlide.date}
                      onChange={(e) => handleUpdateCurrentSlide('date', e.target.value)}
                      placeholder="e.g. Mei 2026 atau Spring 2026"
                      className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black rounded-lg"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">
                      Headline Utama Slide *
                    </label>
                    <input
                      type="text"
                      value={currentSlide.headline}
                      onChange={(e) => handleUpdateCurrentSlide('headline', e.target.value)}
                      placeholder="e.g. Fujifilm X100VI: Uji Ketajaman Sensor 40MP di Jalanan Tokyo"
                      className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black rounded-lg font-serif text-sm font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">
                      Subjudul / Tagline Singkat
                    </label>
                    <input
                      type="text"
                      value={currentSlide.subtitle}
                      onChange={(e) => handleUpdateCurrentSlide('subtitle', e.target.value)}
                      placeholder="e.g. Review Lengkap & Uji Lab Sensor X-Trans 5"
                      className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black rounded-lg"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">
                      Deskripsi Ringkas (Paragraf Slide)
                    </label>
                    <textarea
                      rows={3}
                      value={currentSlide.description}
                      onChange={(e) => handleUpdateCurrentSlide('description', e.target.value)}
                      placeholder="Tulis ringkasan singkat evaluasi ergonomi, stabilisasi bodi, dan kualitas warna khas Fujifilm..."
                      className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">
                      Slug Artikel Terkait (Tautan Baca)
                    </label>
                    <div className="flex items-center border border-[#EEEBE6] bg-[#FDFCFB] rounded-lg focus-within:border-black overflow-hidden">
                      <span className="pl-3 pr-1 text-neutral-400 font-mono text-[11px]">
                        {siteSettings.blogSlugPrefix || '/article/'}
                      </span>
                      <input
                        type="text"
                        value={currentSlide.storySlug}
                        onChange={(e) => handleUpdateCurrentSlide('storySlug', e.target.value)}
                        placeholder="fujifilm-x100vi-review"
                        className="w-full px-2 py-2 text-xs font-mono bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">
                      Pilih dari Artikel Terbit:
                    </label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleUpdateCurrentSlide('storySlug', e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] rounded-lg focus:outline-none focus:border-black text-xs"
                    >
                      <option value="">-- Hubungkan Artikel --</option>
                      {articles.map((art) => (
                        <option key={art.id} value={art.slug}>
                          {art.title} ({art.slug})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">
                      Teks Tombol Utama (Primary CTA)
                    </label>
                    <input
                      type="text"
                      value={currentSlide.primaryCtaText}
                      onChange={(e) => handleUpdateCurrentSlide('primaryCtaText', e.target.value)}
                      placeholder="Baca Ulasan Lengkap"
                      className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">
                      Teks Tombol Kedua (Opsional)
                    </label>
                    <input
                      type="text"
                      value={currentSlide.secondaryCtaText || ''}
                      onChange={(e) => handleUpdateCurrentSlide('secondaryCtaText', e.target.value)}
                      placeholder="Lihat Skor Sensor"
                      className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: CATEGORIES (FORMAT SENSOR & BODI) */}
      {activeSection === 'categories' && (
        <div className="bg-white p-6 border border-[#EEEBE6] rounded-2xl space-y-6 text-xs">
          <div className="pb-4 border-b border-[#EEEBE6] space-y-3">
            <h3 className="font-serif text-lg font-normal text-[#1A1A1A]">Bagian Kartu Kategori & Sensor</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">
                  Judul Bagian Kategori
                </label>
                <input
                  type="text"
                  value={homeForm.categoriesSectionTitle}
                  onChange={(e) => setHomeForm({ ...homeForm, categoriesSectionTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">
                  Subjudul Deskripsi Kategori
                </label>
                <input
                  type="text"
                  value={homeForm.categoriesSectionSubtitle}
                  onChange={(e) => setHomeForm({ ...homeForm, categoriesSectionSubtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Hidden Category File Input */}
          <input
            ref={categoryFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleCategoryCardImageUpload}
            className="hidden"
          />

          {/* Cards Editor Grid */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-normal text-neutral-900">
              Edit 6 Kartu Format Sensor ({homeForm.categoryCards.length} Kartu Terpasang):
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {homeForm.categoryCards.map((card, idx) => (
                <div key={card.id || idx} className="p-4 bg-[#FDFCFB] border border-[#EEEBE6] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      Kartu #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategoryIndex(idx);
                        categoryFileInputRef.current?.click();
                      }}
                      className="px-2 py-1 bg-neutral-900 hover:bg-black text-white text-[10px] rounded flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-2.5 h-2.5" />
                      <span>Upload Foto</span>
                    </button>
                  </div>

                  {/* Image Thumbnail */}
                  <div className="aspect-[16/10] rounded-lg bg-neutral-200 overflow-hidden relative group">
                    <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategoryIndex(idx);
                        categoryFileInputRef.current?.click();
                      }}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium cursor-pointer"
                    >
                      Ganti Foto
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-neutral-500 font-medium mb-0.5">Judul Format</label>
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => {
                        const updated = [...homeForm.categoryCards];
                        updated[idx] = { ...updated[idx], title: e.target.value };
                        setHomeForm({ ...homeForm, categoryCards: updated });
                      }}
                      className="w-full px-2.5 py-1.5 border border-neutral-300 bg-white text-xs rounded focus:outline-none focus:border-black font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-neutral-500 font-medium mb-0.5">Ringkasan Fitur</label>
                    <input
                      type="text"
                      value={card.desc}
                      onChange={(e) => {
                        const updated = [...homeForm.categoryCards];
                        updated[idx] = { ...updated[idx], desc: e.target.value };
                        setHomeForm({ ...homeForm, categoryCards: updated });
                      }}
                      className="w-full px-2.5 py-1.5 border border-neutral-300 bg-white text-xs rounded focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-neutral-500 font-medium mb-0.5">URL Gambar (Manual)</label>
                    <input
                      type="text"
                      value={card.image}
                      onChange={(e) => {
                        const updated = [...homeForm.categoryCards];
                        updated[idx] = { ...updated[idx], image: e.target.value };
                        setHomeForm({ ...homeForm, categoryCards: updated });
                      }}
                      className="w-full px-2 py-1 border border-neutral-300 bg-white text-[10px] font-mono rounded focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: REVIEWED CAMERAS & LAB SCORECARDS */}
      {activeSection === 'cameras' && (
        <div className="bg-white p-6 border border-[#EEEBE6] rounded-2xl space-y-6 text-xs">
          <div className="space-y-4 pb-4 border-b border-[#EEEBE6]">
            <div>
              <h3 className="font-serif text-lg font-normal text-[#1A1A1A]">Bagian Ulasan Kamera & Hasil Uji Lab</h3>
              <p className="text-xs text-[#666]">
                Atur judul, badge independensi editorial, pemberitahuan transparansi, dan pilih kamera yang ditampilkan di beranda
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">
                  Badge Independensi (Pill Atas)
                </label>
                <input
                  type="text"
                  value={homeForm.reviewedCamerasBadge}
                  onChange={(e) => setHomeForm({ ...homeForm, reviewedCamerasBadge: e.target.value })}
                  className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">
                  Judul Utama Bagian Review
                </label>
                <input
                  type="text"
                  value={homeForm.reviewedCamerasTitle}
                  onChange={(e) => setHomeForm({ ...homeForm, reviewedCamerasTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">
                  Deskripsi Uji Lab & Pengujian Lapangan
                </label>
                <textarea
                  rows={2}
                  value={homeForm.reviewedCamerasDescription}
                  onChange={(e) => setHomeForm({ ...homeForm, reviewedCamerasDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">
                  Teks Pemberitahuan Transparansi (FTC Transparency Banner)
                </label>
                <textarea
                  rows={2}
                  value={homeForm.transparencyBannerText}
                  onChange={(e) => setHomeForm({ ...homeForm, transparencyBannerText: e.target.value })}
                  className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] rounded-lg focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* Camera Selection Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif text-base font-normal text-neutral-900">
                  Pilih Kamera yang Ditampilkan di Home:
                </h4>
                <p className="text-neutral-500 text-[11px]">
                  {homeForm.featuredCameraIds?.length > 0 
                    ? `Menampilkan ${homeForm.featuredCameraIds.length} kamera kustom terpilih.` 
                    : 'Belum ada kamera dipilih khusus: otomatis menampilkan 6 kamera teratas dari katalog.'}
                </p>
              </div>

              {homeForm.featuredCameraIds?.length > 0 && (
                <button
                  type="button"
                  onClick={() => setHomeForm({ ...homeForm, featuredCameraIds: [] })}
                  className="text-[11px] text-red-600 hover:underline cursor-pointer font-medium"
                >
                  Reset ke Otomatis (Semua)
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {cameras.map((cam) => {
                const isChecked = homeForm.featuredCameraIds?.includes(cam.id);
                return (
                  <label
                    key={cam.id}
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                        : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleFeaturedCamera(cam.id)}
                      className="rounded text-neutral-900 focus:ring-0"
                    />
                    <img src={cam.image} alt={cam.name} className="w-10 h-10 object-contain bg-neutral-100 rounded p-1 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 font-semibold text-xs truncate">
                        <span className="truncate">{cam.name}</span>
                        {(cam.status ?? 'published') === 'draft' && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 shrink-0">
                            Draft
                          </span>
                        )}
                      </div>
                      <div className={`text-[10px] truncate ${isChecked ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        {cam.brand} • {cam.specs.sensorFormat} • ★ {cam.rating.toFixed(1)}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: TESTING METHODOLOGY */}
      {activeSection === 'methodology' && (
        <div className="bg-white p-6 border border-[#EEEBE6] rounded-2xl space-y-6 text-xs">
          <div className="pb-4 border-b border-[#EEEBE6] space-y-4">
            <div>
              <h3 className="font-serif text-lg font-normal text-[#1A1A1A]">Standar Metodologi Evaluasi Jurnal</h3>
              <p className="text-xs text-[#666]">
                Jelaskan kepada pembaca 4 pilar pengujian kamera di lab independen Anda
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">Badge Metodologi</label>
                <input
                  type="text"
                  value={homeForm.methodologyBadge}
                  onChange={(e) => setHomeForm({ ...homeForm, methodologyBadge: e.target.value })}
                  className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">Judul Bagian</label>
                <input
                  type="text"
                  value={homeForm.methodologyTitle}
                  onChange={(e) => setHomeForm({ ...homeForm, methodologyTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">Subjudul Penjelasan</label>
                <textarea
                  rows={2}
                  value={homeForm.methodologySubtitle}
                  onChange={(e) => setHomeForm({ ...homeForm, methodologySubtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] rounded-lg focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* 4 Methodology Pillars */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-normal text-neutral-900">4 Pilar Evaluasi Lab:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {homeForm.methodologyPillars.map((pillar, idx) => (
                <div key={pillar.id || idx} className="p-4 bg-[#FDFCFB] border border-[#EEEBE6] rounded-xl space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                    Pilar 0{idx + 1}
                  </span>
                  <div>
                    <label className="block text-[10px] uppercase text-neutral-500 font-medium mb-0.5">Judul Pilar</label>
                    <input
                      type="text"
                      value={pillar.title}
                      onChange={(e) => {
                        const updated = [...homeForm.methodologyPillars];
                        updated[idx] = { ...updated[idx], title: e.target.value };
                        setHomeForm({ ...homeForm, methodologyPillars: updated });
                      }}
                      className="w-full px-2.5 py-1.5 border border-neutral-300 bg-white text-xs rounded focus:outline-none focus:border-black font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-neutral-500 font-medium mb-0.5">Deskripsi Pilar</label>
                    <textarea
                      rows={2}
                      value={pillar.description}
                      onChange={(e) => {
                        const updated = [...homeForm.methodologyPillars];
                        updated[idx] = { ...updated[idx], description: e.target.value };
                        setHomeForm({ ...homeForm, methodologyPillars: updated });
                      }}
                      className="w-full px-2.5 py-1.5 border border-neutral-300 bg-white text-xs rounded focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: NEWSLETTER & SUBSCRIBER */}
      {activeSection === 'newsletter' && (
        <div className="bg-white p-6 border border-[#EEEBE6] rounded-2xl space-y-6 text-xs">
          <div>
            <h3 className="font-serif text-lg font-normal text-[#1A1A1A]">Bagian Newsletter & Langganan</h3>
            <p className="text-xs text-[#666]">
              Sesuaikan teks ajakan berlangganan ulasan gear dan laporan lab mingguan
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">Headline Newsletter</label>
              <input
                type="text"
                value={homeForm.newsletterHeadline}
                onChange={(e) => setHomeForm({ ...homeForm, newsletterHeadline: e.target.value })}
                className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] rounded-lg focus:outline-none focus:border-black font-semibold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">Subjudul Newsletter</label>
              <textarea
                rows={2}
                value={homeForm.newsletterSubtitle}
                onChange={(e) => setHomeForm({ ...homeForm, newsletterSubtitle: e.target.value })}
                className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] rounded-lg focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">Teks Tombol Berlangganan</label>
              <input
                type="text"
                value={homeForm.newsletterButtonText}
                onChange={(e) => setHomeForm({ ...homeForm, newsletterButtonText: e.target.value })}
                className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] rounded-lg focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: NAVIGATION SLUGS & URLS */}
      {activeSection === 'slugs' && (
        <div className="bg-white p-6 border border-[#EEEBE6] rounded-2xl space-y-6 text-xs">
          <div className="pb-3 border-b border-[#EEEBE6]">
            <h3 className="font-serif text-lg font-normal text-[#1A1A1A] flex items-center gap-2">
              <Link2 className="w-4 h-4 text-neutral-800" />
              <span>Konfigurasi Slug Navigasi & Struktur URL Website</span>
            </h3>
            <p className="text-xs text-[#666] mt-0.5">
              Sesuaikan URL slug untuk setiap menu navigasi utama (Home, Cameras, Blog, Detail Kamera, dan Detail Artikel)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">
                Slug Navigasi Beranda (Home Slug)
              </label>
              <div className="flex items-center border border-[#EEEBE6] bg-[#FDFCFB] rounded-lg focus-within:border-black overflow-hidden">
                <span className="pl-3 pr-1 text-neutral-400 font-mono text-[11px]">#/</span>
                <input
                  type="text"
                  value={siteSettings.homeSlug ?? 'home'}
                  onChange={(e) => updateSiteSettings({ homeSlug: e.target.value.toLowerCase().trim() })}
                  placeholder="home"
                  className="w-full px-2 py-2 text-xs font-mono bg-transparent focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-neutral-500 mt-1 block">Default: #/ atau #/home</span>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">
                Slug Navigasi Katalog Kamera (Cameras Slug)
              </label>
              <div className="flex items-center border border-[#EEEBE6] bg-[#FDFCFB] rounded-lg focus-within:border-black overflow-hidden">
                <span className="pl-3 pr-1 text-neutral-400 font-mono text-[11px]">#/</span>
                <input
                  type="text"
                  value={siteSettings.camerasSlug ?? 'cameras'}
                  onChange={(e) => updateSiteSettings({ camerasSlug: e.target.value.toLowerCase().trim() })}
                  placeholder="cameras"
                  className="w-full px-2 py-2 text-xs font-mono bg-transparent focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-neutral-500 mt-1 block">Contoh: cameras, gear, katalog-kamera</span>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">
                Slug Navigasi Blog & Ulasan (Blog Slug)
              </label>
              <div className="flex items-center border border-[#EEEBE6] bg-[#FDFCFB] rounded-lg focus-within:border-black overflow-hidden">
                <span className="pl-3 pr-1 text-neutral-400 font-mono text-[11px]">#/</span>
                <input
                  type="text"
                  value={siteSettings.blogSlug ?? 'blog'}
                  onChange={(e) => updateSiteSettings({ blogSlug: e.target.value.toLowerCase().trim() })}
                  placeholder="blog"
                  className="w-full px-2 py-2 text-xs font-mono bg-transparent focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-neutral-500 mt-1 block">Contoh: blog, ulasan, articles, journal</span>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">
                Awalan Slug Detail Kamera (Camera Slug Prefix)
              </label>
              <div className="flex items-center border border-[#EEEBE6] bg-[#FDFCFB] rounded-lg focus-within:border-black overflow-hidden">
                <span className="pl-3 pr-1 text-neutral-400 font-mono text-[11px]">#/</span>
                <input
                  type="text"
                  value={siteSettings.cameraSlugPrefix ?? 'camera'}
                  onChange={(e) => updateSiteSettings({ cameraSlugPrefix: e.target.value.toLowerCase().trim() })}
                  placeholder="camera"
                  className="w-full px-2 py-2 text-xs font-mono bg-transparent focus:outline-none"
                />
                <span className="pr-3 text-neutral-400 font-mono text-[11px]">/:slug</span>
              </div>
              <span className="text-[10px] text-neutral-500 mt-1 block">Contoh: #/camera/:slug atau #/gear/:slug</span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">
                Awalan Slug Detail Artikel (Blog Slug Prefix)
              </label>
              <div className="flex items-center border border-[#EEEBE6] bg-[#FDFCFB] rounded-lg focus-within:border-black overflow-hidden">
                <span className="pl-3 pr-1 text-neutral-400 font-mono text-[11px]">Canonical URL +</span>
                <input
                  type="text"
                  value={siteSettings.blogSlugPrefix ?? '/article/'}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (!val.startsWith('/')) val = '/' + val;
                    if (!val.endsWith('/')) val = val + '/';
                    updateSiteSettings({ blogSlugPrefix: val });
                  }}
                  placeholder="/article/"
                  className="w-full px-2 py-2 text-xs font-mono bg-transparent focus:outline-none"
                />
                <span className="pr-3 text-neutral-400 font-mono text-[11px]">:slug</span>
              </div>
              <span className="text-[10px] text-neutral-500 mt-1 block">Contoh: /article/, /blog/, /review/, /journal/</span>
            </div>
          </div>

          {/* Real-time URLs Preview Box */}
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
            <span className="text-[10px] uppercase font-bold text-neutral-700 tracking-wider block">
              Pratinjau Navigasi Hash & URL Aktif:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
              <div className="bg-white p-2.5 rounded border border-neutral-200">
                <div className="text-[10px] text-neutral-400 uppercase font-sans">Navigasi Beranda</div>
                <div className="text-neutral-900 font-semibold truncate">#/{siteSettings.homeSlug ?? 'home'}</div>
              </div>
              <div className="bg-white p-2.5 rounded border border-neutral-200">
                <div className="text-[10px] text-neutral-400 uppercase font-sans">Navigasi Kamera</div>
                <div className="text-neutral-900 font-semibold truncate">#/{siteSettings.camerasSlug ?? 'cameras'}</div>
              </div>
              <div className="bg-white p-2.5 rounded border border-neutral-200">
                <div className="text-[10px] text-neutral-400 uppercase font-sans">Navigasi Blog</div>
                <div className="text-neutral-900 font-semibold truncate">#/{siteSettings.blogSlug ?? 'blog'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Save Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-[#EEEBE6]">
        <span className="text-xs text-neutral-500">
          Semua perubahan di beranda akan langsung terlihat oleh pengunjung setelah Anda klik simpan.
        </span>

        <button
          type="button"
          onClick={onSave}
          className="px-6 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-wider font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition-all shadow-sm active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Perubahan Home</span>
        </button>
      </div>
    </div>
  );
};
