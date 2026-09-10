import React, { useState } from 'react';
import {
  WidgetType,
  BuilderSection,
  BuilderTemplate,
} from '../../types/builderTypes';
import { useSiteBuilder } from '../BuilderContext';
import {
  Layout,
  Layers,
  FileText,
  Sliders,
  Search,
  Plus,
  Compass,
  Sparkles,
  ShoppingBag,
  Grid,
  Image as ImageIcon,
  Type,
  Video,
  MousePointer,
  Minus,
  Maximize2,
  Share2,
  User,
  Megaphone,
  Code,
  Link2,
  BarChart2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Palette,
  Check,
} from 'lucide-react';

interface WidgetDef {
  type: WidgetType;
  label: string;
  category: 'core' | 'content' | 'commerce' | 'layout' | 'plugins';
  icon: React.ReactNode;
  description: string;
}

const WIDGET_CATALOG: WidgetDef[] = [
  // Core Editorial
  {
    type: 'hero',
    label: 'Hero Showcase',
    category: 'core',
    icon: <Compass className="w-4 h-4 text-rose-600" />,
    description: 'Header visual dengan headline, background, badge, dan tombol CTA ganda.',
  },
  {
    type: 'search-bar',
    label: 'Universal Search Bar',
    category: 'core',
    icon: <Search className="w-4 h-4 text-blue-600" />,
    description: 'Bilah pencarian cepat kamera dan artikel dengan tags rekomendasi.',
  },
  {
    type: 'featured-articles',
    label: 'Artikel Pilihan Editor',
    category: 'core',
    icon: <Sparkles className="w-4 h-4 text-amber-600" />,
    description: 'Sorotan 3 liputan eksklusif lab paling penting.',
  },
  {
    type: 'article-grid',
    label: 'Grid Artikel Editorial',
    category: 'core',
    icon: <Grid className="w-4 h-4 text-neutral-800" />,
    description: 'Grid artikel 2-4 kolom dengan thumbnail, kategori, author, dan estimasi baca.',
  },
  {
    type: 'article-list',
    label: 'Daftar Artikel Baris',
    category: 'core',
    icon: <FileText className="w-4 h-4 text-neutral-700" />,
    description: 'List ringkas artikel dengan thumbnail kecil dan tanggal.',
  },

  // Gear & Commerce
  {
    type: 'product-cards',
    label: 'Katalog Kamera Teruji',
    category: 'commerce',
    icon: <ShoppingBag className="w-4 h-4 text-emerald-600" />,
    description: 'Kartu produk kamera lengkap dengan skor uji lab, harga, dan tombol affiliate.',
  },
  {
    type: 'product-recommendation',
    label: 'Rekomendasi Kamera Lab',
    category: 'commerce',
    icon: <Sparkles className="w-4 h-4 text-emerald-700" />,
    description: 'Highlight kamera terbaik editor lengkap dengan pros, cons, dan skor 100.',
  },
  {
    type: 'camera-comparison',
    label: 'Tabel Adu Spesifikasi',
    category: 'commerce',
    icon: <Sliders className="w-4 h-4 text-indigo-600" />,
    description: 'Widget interaktif perbandingan side-by-side kamera Fujifilm.',
  },
  {
    type: 'affiliate-product-cta',
    label: 'Banner Penawaran Affiliate',
    category: 'commerce',
    icon: <Link2 className="w-4 h-4 text-rose-700" />,
    description: 'Banner berkonversi tinggi dengan link diskon retailer resmi terverifikasi.',
  },
  {
    type: 'category-cards',
    label: 'Kartu Kategori Visual',
    category: 'commerce',
    icon: <Grid className="w-4 h-4 text-teal-600" />,
    description: 'Kartu navigasi format kamera (GFX, X-T, X100, X-S).',
  },

  // Content & Media
  {
    type: 'text',
    label: 'Judul / Blok Teks',
    category: 'content',
    icon: <Type className="w-4 h-4 text-neutral-700" />,
    description: 'Heading editorial dengan eyebrow merah, judul font serif, dan deskripsi.',
  },
  {
    type: 'rich-text',
    label: 'Konten Rich Text',
    category: 'content',
    icon: <FileText className="w-4 h-4 text-neutral-700" />,
    description: 'Blok paragraf panjang, daftar poin, dan kutipan.',
  },
  {
    type: 'image',
    label: 'Gambar & Foto Lab',
    category: 'content',
    icon: <ImageIcon className="w-4 h-4 text-blue-500" />,
    description: 'Foto beresolusi tinggi dengan caption dan rasio aspek responsif.',
  },
  {
    type: 'video',
    label: 'Video YouTube / Lab Test',
    category: 'content',
    icon: <Video className="w-4 h-4 text-red-600" />,
    description: 'Embed video rekaman 4K/6.2K atau video panduan.',
  },
  {
    type: 'author-profile',
    label: 'Profil Penulis / Reviewer',
    category: 'content',
    icon: <User className="w-4 h-4 text-purple-600" />,
    description: 'Kartu biodata penguji kamera dan kredensial fotografi.',
  },
  {
    type: 'newsletter-signup',
    label: 'Kotak Langganan Email',
    category: 'content',
    icon: <FileText className="w-4 h-4 text-amber-700" />,
    description: 'Formulir langganan newsletter tema terang atau gelap.',
  },

  // Layout & UI Controls
  {
    type: 'button',
    label: 'Tombol Call-to-Action',
    category: 'layout',
    icon: <MousePointer className="w-4 h-4 text-neutral-800" />,
    description: 'Tombol navigasi kustom dengan berbagai variasi gaya.',
  },
  {
    type: 'divider',
    label: 'Garis Pemisah (Divider)',
    category: 'layout',
    icon: <Minus className="w-4 h-4 text-neutral-400" />,
    description: 'Garis pemisah elegan tipis antar bagian konten.',
  },
  {
    type: 'spacer',
    label: 'Ruang Kosong (Spacer)',
    category: 'layout',
    icon: <Maximize2 className="w-4 h-4 text-neutral-400" />,
    description: 'Jarak vertikal yang dapat diatur ukurannya.',
  },
  {
    type: 'social-links',
    label: 'Tautan Media Sosial',
    category: 'layout',
    icon: <Share2 className="w-4 h-4 text-blue-400" />,
    description: 'Ikon profil Instagram, YouTube, dan X.',
  },
  {
    type: 'advertisement-block',
    label: 'Slot Iklan Sponsor',
    category: 'layout',
    icon: <Megaphone className="w-4 h-4 text-orange-500" />,
    description: 'Wadah penempatan banner sponsorship terverifikasi.',
  },
  {
    type: 'custom-html',
    label: 'Kustom HTML / Script',
    category: 'layout',
    icon: <Code className="w-4 h-4 text-neutral-600" />,
    description: 'Sisipkan potongan kode HTML, iframe, atau widget pihak ketiga.',
  },
];

export const LeftComponentPanel: React.FC = () => {
  const {
    activePage,
    selectedSectionId,
    setSelectedSectionId,
    selectedBlockId,
    setSelectedBlockId,
    addBlock,
    addSection,
    deleteSection,
    moveSection,
    duplicateSection,
    deleteBlock,
    moveBlock,
    duplicateBlock,
    templates,
    applyTemplate,
    reusableSections,
    pluginWidgets,
    globalDesign,
    updateGlobalDesign,
    resetGlobalDesign,
  } = useSiteBuilder();

  const [activeTab, setActiveTab] = useState<'widgets' | 'layers' | 'templates' | 'global'>('widgets');
  const [widgetSearch, setWidgetSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [templateCategory, setTemplateCategory] = useState<string>('all');

  // Filter widgets by search query and category
  const filteredWidgets = WIDGET_CATALOG.filter((w) => {
    const matchesSearch =
      w.label.toLowerCase().includes(widgetSearch.toLowerCase()) ||
      w.description.toLowerCase().includes(widgetSearch.toLowerCase());
    const matchesCat = activeCategory === 'all' || w.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const handleAddWidget = (widgetType: WidgetType, pluginWidgetId?: string) => {
    // If no section selected, add a section first or select the last section
    let targetSectionId = selectedSectionId;
    if (!targetSectionId) {
      if (activePage.sections.length > 0) {
        targetSectionId = activePage.sections[activePage.sections.length - 1].id;
        setSelectedSectionId(targetSectionId);
      } else {
        addSection();
        return;
      }
    }
    addBlock(targetSectionId, widgetType, pluginWidgetId);
  };

  return (
    <aside className="w-80 h-full bg-white border-r border-[#EEEBE6] flex flex-col shrink-0 select-none">
      {/* PANEL TABS */}
      <div className="flex border-b border-[#EEEBE6] bg-[#FAF9F6]">
        <button
          type="button"
          onClick={() => setActiveTab('widgets')}
          className={`flex-1 py-3 px-2 text-center text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'widgets'
              ? 'border-black text-black bg-white'
              : 'border-transparent text-[#777] hover:text-black hover:bg-neutral-100'
          }`}
          title="Katalog Widget & Komponen"
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Widgets</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-3 px-2 text-center text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'layers'
              ? 'border-black text-black bg-white'
              : 'border-transparent text-[#777] hover:text-black hover:bg-neutral-100'
          }`}
          title="Struktur Pohon Layer Halaman"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Layers</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`flex-1 py-3 px-2 text-center text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'templates'
              ? 'border-black text-black bg-white'
              : 'border-transparent text-[#777] hover:text-black hover:bg-neutral-100'
          }`}
          title="Template Halaman & Reusable Sections"
        >
          <Layout className="w-3.5 h-3.5" />
          <span>Library</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('global')}
          className={`flex-1 py-3 px-2 text-center text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'global'
              ? 'border-black text-black bg-white'
              : 'border-transparent text-[#777] hover:text-black hover:bg-neutral-100'
          }`}
          title="Sistem Desain Global (Tipografi, Warna, Header)"
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Design</span>
        </button>
      </div>

      {/* TAB 1: WIDGETS CATALOG */}
      {activeTab === 'widgets' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search bar */}
          <div className="p-3 border-b border-[#EEEBE6] bg-white">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-[#888] absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari widget (hero, artikel, harga)..."
                value={widgetSearch}
                onChange={(e) => setWidgetSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF9F6] border border-[#DDD] focus:border-black outline-hidden"
              />
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-1 overflow-x-auto pt-2 pb-1 scrollbar-none text-[10px]">
              {['all', 'core', 'commerce', 'content', 'layout', 'plugins'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2 py-0.5 uppercase font-mono whitespace-nowrap cursor-pointer transition-colors ${
                    activeCategory === cat
                      ? 'bg-black text-white'
                      : 'bg-[#FAF9F6] text-[#666] hover:bg-neutral-200'
                  }`}
                >
                  {cat === 'all' ? 'Semua' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Widgets List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Standard Catalog */}
            <div className="grid grid-cols-2 gap-2">
              {filteredWidgets.map((w) => (
                <div
                  key={w.type}
                  onClick={() => handleAddWidget(w.type)}
                  className="p-3 bg-[#FAF9F6] border border-[#EEEBE6] hover:border-black hover:bg-white transition-all cursor-pointer flex flex-col justify-between group h-24"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-1.5 bg-white border border-[#EEEBE6] group-hover:border-black transition-colors">
                      {w.icon}
                    </div>
                    <Plus className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-[#1A1A1A] line-clamp-1">
                      {w.label}
                    </h5>
                    <p className="text-[10px] text-[#777] line-clamp-1">
                      {w.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Dynamic Plugin Widgets */}
            {(activeCategory === 'all' || activeCategory === 'plugins') && pluginWidgets.length > 0 && (
              <div className="pt-2 border-t border-[#EEEBE6] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase font-bold text-[#C62828] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Plugin Extension Widgets
                  </span>
                  <span className="text-[10px] font-mono text-[#888]">
                    {pluginWidgets.length} Aktif
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {pluginWidgets.map((pw) => (
                    <div
                      key={pw.id}
                      onClick={() => handleAddWidget('plugin-widget', pw.id)}
                      className="p-3 bg-rose-50/40 border border-rose-200 hover:border-[#C62828] hover:bg-white transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-white border border-rose-200 shrink-0 text-[#C62828]">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-semibold text-[#1A1A1A] truncate">
                            {pw.name}
                          </h5>
                          <p className="text-[10px] text-[#666] line-clamp-1">
                            {pw.description}
                          </p>
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-[#C62828] shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Add Section Button */}
            <div className="pt-4 border-t border-[#EEEBE6]">
              <button
                type="button"
                onClick={() => addSection()}
                className="w-full py-2.5 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Section Baru</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LAYERS & STRUCTURE */}
      {activeTab === 'layers' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-[#EEEBE6] bg-[#FAF9F6] flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#666]">
              Struktur Section ({activePage.sections.length})
            </span>
            <button
              type="button"
              onClick={() => addSection()}
              className="text-[10px] font-mono text-[#C62828] font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Section
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {activePage.sections.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#888]">
                Belum ada section. Klik tombol di atas untuk menambah.
              </div>
            ) : (
              activePage.sections.map((sec, sIdx) => {
                const isSelectedSec = selectedSectionId === sec.id;

                return (
                  <div
                    key={sec.id}
                    className={`border transition-all ${
                      isSelectedSec ? 'border-black bg-white shadow-xs' : 'border-[#EEEBE6] bg-[#FAF9F6]'
                    }`}
                  >
                    {/* Section Header */}
                    <div
                      onClick={() => setSelectedSectionId(sec.id)}
                      className="p-2.5 flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Layers className={`w-3.5 h-3.5 shrink-0 ${isSelectedSec ? 'text-black' : 'text-[#888]'}`} />
                        <span className="text-xs font-semibold text-[#1A1A1A] truncate">
                          {sec.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveSection(sec.id, 'up');
                          }}
                          disabled={sIdx === 0}
                          className="p-1 text-[#888] hover:text-black disabled:opacity-20 cursor-pointer"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveSection(sec.id, 'down');
                          }}
                          disabled={sIdx === activePage.sections.length - 1}
                          className="p-1 text-[#888] hover:text-black disabled:opacity-20 cursor-pointer"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateSection(sec.id);
                          }}
                          className="p-1 text-[#888] hover:text-black cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSection(sec.id);
                          }}
                          className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Section Child Blocks */}
                    <div className="pl-4 pr-2 pb-2 space-y-1">
                      {sec.blocks.map((blk, bIdx) => {
                        const isSelectedBlk = selectedBlockId === blk.id;

                        return (
                          <div
                            key={blk.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSectionId(sec.id);
                              setSelectedBlockId(blk.id);
                            }}
                            className={`p-1.5 text-xs flex items-center justify-between border cursor-pointer transition-colors ${
                              isSelectedBlk
                                ? 'bg-blue-50 border-blue-400 text-blue-900 font-medium'
                                : 'bg-white border-[#EEEBE6] text-[#444] hover:border-black'
                            }`}
                          >
                            <span className="truncate pr-2">{blk.label}</span>
                            <div className="flex items-center gap-0.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveBlock(blk.id, 'up');
                                }}
                                disabled={bIdx === 0}
                                className="p-0.5 text-[#888] hover:text-black disabled:opacity-20 cursor-pointer"
                              >
                                <ChevronUp className="w-2.5 h-2.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveBlock(blk.id, 'down');
                                }}
                                disabled={bIdx === sec.blocks.length - 1}
                                className="p-0.5 text-[#888] hover:text-black disabled:opacity-20 cursor-pointer"
                              >
                                <ChevronDown className="w-2.5 h-2.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteBlock(blk.id);
                                }}
                                className="p-0.5 text-red-400 hover:text-red-700 cursor-pointer"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TEMPLATES & REUSABLE SECTIONS LIBRARY */}
      {activeTab === 'templates' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-[#EEEBE6] bg-[#FAF9F6] space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#666]">
              Pustaka Template & Section
            </span>
            <div className="flex items-center gap-1 text-[10px]">
              {['all', 'landing', 'blog', 'affiliate', 'comparison'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setTemplateCategory(c)}
                  className={`px-2 py-0.5 font-mono uppercase cursor-pointer ${
                    templateCategory === c ? 'bg-black text-white' : 'bg-white text-[#666] border border-[#DDD]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Prebuilt Templates */}
            <div className="space-y-3">
              <span className="text-[11px] font-mono uppercase font-bold text-[#1A1A1A]">
                Full-Page Layout Templates
              </span>

              {templates
                .filter((t) => templateCategory === 'all' || t.category === templateCategory)
                .map((tpl) => (
                  <div
                    key={tpl.id}
                    className="border border-[#EEEBE6] bg-white p-3 space-y-2 hover:border-black transition-all"
                  >
                    {tpl.thumbnailUrl && (
                      <div className="aspect-16/9 overflow-hidden bg-neutral-100">
                        <img src={tpl.thumbnailUrl} alt={tpl.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <span className="text-[9px] font-mono uppercase text-[#C62828] font-bold">
                        {tpl.category}
                      </span>
                      <h5 className="text-xs font-serif font-semibold text-[#1A1A1A]">
                        {tpl.title}
                      </h5>
                      <p className="text-[11px] text-[#666] line-clamp-2 leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => applyTemplate(tpl)}
                      className="w-full py-1.5 bg-[#FAF9F6] hover:bg-black hover:text-white border border-[#DDD] text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Gunakan Template Ini
                    </button>
                  </div>
                ))}
            </div>

            {/* Reusable Section Blocks */}
            <div className="pt-3 border-t border-[#EEEBE6] space-y-3">
              <span className="text-[11px] font-mono uppercase font-bold text-[#1A1A1A]">
                Reusable Saved Sections ({reusableSections.length})
              </span>

              {reusableSections.map((rs) => (
                <div key={rs.id} className="p-3 border border-[#EEEBE6] bg-[#FAF9F6] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase text-[#888]">
                      {rs.category}
                    </span>
                    <span className="text-[9px] font-mono text-[#AAA]">
                      {new Date(rs.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h6 className="text-xs font-semibold text-[#1A1A1A]">
                    {rs.title}
                  </h6>
                  <button
                    type="button"
                    onClick={() => addSection(rs.section)}
                    className="w-full py-1 bg-white border border-[#DDD] hover:border-black text-[10px] font-mono uppercase tracking-wider text-black cursor-pointer"
                  >
                    + Sisipkan Ke Halaman
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GLOBAL DESIGN SYSTEM */}
      {activeTab === 'global' && (
        <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#C62828] font-bold">
              Global Design System
            </span>
            <h4 className="text-sm font-serif font-normal text-[#1A1A1A]">
              Gaya & Identitas Visual Situs
            </h4>
          </div>

          {/* Color Palette */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#1A1A1A] block">
              Palet Warna Utama
            </label>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#666]">Primary Monochrome</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px]">{globalDesign.colors.primary}</span>
                  <input
                    type="color"
                    value={globalDesign.colors.primary}
                    onChange={(e) => updateGlobalDesign({ colors: { ...globalDesign.colors, primary: e.target.value } })}
                    className="w-6 h-6 p-0 border border-neutral-300 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#666]">Accent Color (Fuji Red)</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px]">{globalDesign.colors.accent}</span>
                  <input
                    type="color"
                    value={globalDesign.colors.accent}
                    onChange={(e) => updateGlobalDesign({ colors: { ...globalDesign.colors, accent: e.target.value } })}
                    className="w-6 h-6 p-0 border border-neutral-300 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#666]">Canvas Background</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px]">{globalDesign.colors.background}</span>
                  <input
                    type="color"
                    value={globalDesign.colors.background}
                    onChange={(e) => updateGlobalDesign({ colors: { ...globalDesign.colors, background: e.target.value } })}
                    className="w-6 h-6 p-0 border border-neutral-300 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-3 pt-3 border-t border-[#EEEBE6]">
            <label className="text-xs font-bold text-[#1A1A1A] block">
              Tipografi Editorial
            </label>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[#666] block mb-1">Heading Serif Font</span>
                <select
                  value={globalDesign.typography.headingFont}
                  onChange={(e) => updateGlobalDesign({ typography: { ...globalDesign.typography, headingFont: e.target.value } })}
                  className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] text-xs font-serif"
                >
                  <option value="Playfair Display">Playfair Display (Default Editorial)</option>
                  <option value="Newsreader">Newsreader (Classic Journal)</option>
                  <option value="Cinzel">Cinzel (Luxury & Precise)</option>
                </select>
              </div>

              <div>
                <span className="text-[#666] block mb-1">Body Text Font</span>
                <select
                  value={globalDesign.typography.bodyFont}
                  onChange={(e) => updateGlobalDesign({ typography: { ...globalDesign.typography, bodyFont: e.target.value } })}
                  className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] text-xs font-sans"
                >
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans (Ultra-Clean)</option>
                  <option value="Inter">Inter (Functional)</option>
                  <option value="DM Sans">DM Sans (Editorial Modern)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Buttons & Cards Preset */}
          <div className="space-y-3 pt-3 border-t border-[#EEEBE6]">
            <label className="text-xs font-bold text-[#1A1A1A] block">
              Tombol & Sudut Kartu
            </label>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <button
                type="button"
                onClick={() => updateGlobalDesign({ buttons: { ...globalDesign.buttons, borderRadius: 0 }, cards: { ...globalDesign.cards, borderRadius: 0 } })}
                className={`p-2 border cursor-pointer ${
                  globalDesign.buttons.borderRadius === 0 ? 'border-black bg-neutral-100 font-semibold' : 'border-[#DDD]'
                }`}
              >
                0px (Square Editorial)
              </button>
              <button
                type="button"
                onClick={() => updateGlobalDesign({ buttons: { ...globalDesign.buttons, borderRadius: 4 }, cards: { ...globalDesign.cards, borderRadius: 4 } })}
                className={`p-2 border cursor-pointer ${
                  globalDesign.buttons.borderRadius === 4 ? 'border-black bg-neutral-100 font-semibold' : 'border-[#DDD]'
                }`}
              >
                4px (Subtle)
              </button>
              <button
                type="button"
                onClick={() => updateGlobalDesign({ buttons: { ...globalDesign.buttons, borderRadius: 8 }, cards: { ...globalDesign.cards, borderRadius: 8 } })}
                className={`p-2 border cursor-pointer ${
                  globalDesign.buttons.borderRadius === 8 ? 'border-black bg-neutral-100 font-semibold' : 'border-[#DDD]'
                }`}
              >
                8px (Soft)
              </button>
            </div>
          </div>

          {/* Reset button */}
          <div className="pt-4 border-t border-[#EEEBE6]">
            <button
              type="button"
              onClick={resetGlobalDesign}
              className="w-full py-2 border border-neutral-300 hover:border-black text-[11px] font-mono text-[#555] uppercase cursor-pointer"
            >
              Reset Ke Standar Editorial
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
