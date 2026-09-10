import React, { useState } from 'react';
import { useSiteBuilder } from '../builder/BuilderContext';
import { PageBuilder } from '../builder/PageBuilder';
import { useData } from '../context/DataContext';
import {
  Layout,
  Plus,
  ExternalLink,
  Edit,
  Trash2,
  Copy,
  Sparkles,
  Globe,
  Sliders,
  Check,
  FileText,
  Layers,
  Palette,
  Eye,
  BookmarkPlus,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Monitor,
  ShoppingBag,
} from 'lucide-react';
import { PageType } from '../types/builderTypes';

export const SiteBuilderManager: React.FC = () => {
  const {
    pages,
    activePageId,
    setActivePageId,
    createNewPage,
    duplicatePage,
    deletePage,
    togglePagePublished,
    toggleUseBuilderLayout,
    templates,
    reusableSections,
    deleteReusableSection,
    pluginWidgets,
    globalDesign,
  } = useSiteBuilder();

  const { navigateTo } = useData();

  // Fullscreen page builder open state
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  // Active tab within the Site Builder CMS section
  const [activeTab, setActiveTab] = useState<'pages' | 'templates' | 'reusable' | 'design' | 'plugins'>('pages');

  // New Page Modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [newPageType, setNewPageType] = useState<PageType>('custom');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const openBuilderForPage = (pageId: string) => {
    setActivePageId(pageId);
    setIsBuilderOpen(true);
  };

  const handleCreateNewPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim()) return;

    const slug = newPageSlug.trim() || newPageTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const newId = createNewPage(newPageTitle.trim(), slug, newPageType, selectedTemplateId || undefined);

    setShowNewModal(false);
    setNewPageTitle('');
    setNewPageSlug('');
    setSelectedTemplateId('');
    openBuilderForPage(newId);
  };

  // If user opens the visual builder, show the full-screen 3-panel visual canvas!
  if (isBuilderOpen) {
    return <PageBuilder onExit={() => setIsBuilderOpen(false)} />;
  }

  return (
    <div className="space-y-8">
      {/* 1. HERO HEADER WITH PRIMARY ACTION */}
      <div className="bg-[#141414] text-white p-6 md:p-8 border border-[#2A2A2A] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-950/80 text-rose-400 border border-rose-800 text-[10px] font-mono uppercase font-bold tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>WordPress / Elementor-Style Page Builder</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-normal text-white">
              Visual Site Builder & Layout Studio
            </h2>
            <p className="text-xs md:text-sm text-neutral-400 font-light leading-relaxed">
              Rancang, ubah urutan section, kustomisasi blok konten, dan kelola tata letak halaman Landing Page, Blog, Kategori, dan ulasan kamera secara visual tanpa perlu menulis kode.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => openBuilderForPage(activePageId || pages[0]?.id)}
              className="px-6 py-3 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Edit className="w-4 h-4" />
              <span>Buka Visual Page Builder</span>
            </button>

            <button
              type="button"
              onClick={() => setShowNewModal(true)}
              className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer border border-neutral-700"
            >
              <Plus className="w-4 h-4" />
              <span>Halaman Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS & METRIC STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#EEEBE6] p-4 space-y-1">
          <div className="text-[10px] font-mono uppercase text-[#888]">Total Halaman Terkelola</div>
          <div className="text-2xl font-serif font-bold text-[#1A1A1A]">{pages.length}</div>
          <div className="text-[11px] text-[#666]">
            {pages.filter((p) => p.status === 'published').length} Dipublikasikan
          </div>
        </div>

        <div className="bg-white border border-[#EEEBE6] p-4 space-y-1">
          <div className="text-[10px] font-mono uppercase text-[#888]">Tata Letak Builder Aktif</div>
          <div className="text-2xl font-serif font-bold text-emerald-700">
            {pages.filter((p) => p.useBuilderLayout).length}
          </div>
          <div className="text-[11px] text-[#666]">Mengontrol tampilan publik</div>
        </div>

        <div className="bg-white border border-[#EEEBE6] p-4 space-y-1">
          <div className="text-[10px] font-mono uppercase text-[#888]">Pustaka Template</div>
          <div className="text-2xl font-serif font-bold text-[#1A1A1A]">{templates.length}</div>
          <div className="text-[11px] text-[#666]">8 Desain Standar Editorial</div>
        </div>

        <div className="bg-white border border-[#EEEBE6] p-4 space-y-1">
          <div className="text-[10px] font-mono uppercase text-[#888]">Plugin Widgets Terintegrasi</div>
          <div className="text-2xl font-serif font-bold text-rose-700">{pluginWidgets.length}</div>
          <div className="text-[11px] text-[#666]">Tersinkronisasi dengan Plugin aktif</div>
        </div>
      </div>

      {/* 3. TABS NAVIGATION */}
      <div className="border-b border-[#EEEBE6] flex items-center gap-2 overflow-x-auto text-xs font-semibold uppercase tracking-wider">
        {[
          { id: 'pages', label: 'Daftar Halaman & Tata Letak', count: pages.length },
          { id: 'templates', label: 'Pustaka Template Desain', count: templates.length },
          { id: 'reusable', label: 'Reusable Section Blocks', count: reusableSections.length },
          { id: 'plugins', label: 'Widget Ekstensi Plugin', count: pluginWidgets.length },
          { id: 'design', label: 'Sistem Desain Global' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-4 border-b-2 cursor-pointer transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-black text-black font-bold bg-white'
                : 'border-transparent text-[#777] hover:text-black hover:bg-neutral-50'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeTab === tab.id ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 4. TAB CONTENT PANELS */}

      {/* TAB 1: PAGES LIST */}
      {activeTab === 'pages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif text-[#1A1A1A]">
              Kelola Struktur Tata Letak Setiap Halaman
            </h3>
            <button
              type="button"
              onClick={() => setShowNewModal(true)}
              className="px-3 py-1.5 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Halaman Baru</span>
            </button>
          </div>

          <div className="bg-white border border-[#EEEBE6] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#FAF9F6] border-b border-[#EEEBE6] text-[#777] font-mono uppercase text-[10px]">
                    <th className="p-4">Halaman & URL Slug</th>
                    <th className="p-4">Tipe Halaman</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Gunakan Builder</th>
                    <th className="p-4">Section & Blok</th>
                    <th className="p-4">Terakhir Diubah</th>
                    <th className="p-4 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEBE6]">
                  {pages.map((p) => {
                    const totalBlocks = p.sections.reduce((acc, s) => acc + s.blocks.length, 0);

                    return (
                      <tr key={p.id} className="hover:bg-[#FAF9F6]/60 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-sm text-[#1A1A1A] flex items-center gap-2">
                            <span>{p.title}</span>
                            {p.isDefaultCorePage && (
                              <span className="px-1.5 py-0.2 bg-neutral-100 border border-neutral-300 text-[9px] font-mono uppercase text-[#666]">
                                Default Core
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-[#888] flex items-center gap-1 mt-0.5">
                            <Globe className="w-3 h-3 text-[#AAA]" />
                            <span>/{p.slug || '(halaman utama)'}</span>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-neutral-100 text-neutral-800 font-mono text-[10px] uppercase font-medium">
                            {p.type}
                          </span>
                        </td>

                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => togglePagePublished(p.id)}
                            className={`px-2.5 py-0.5 text-[10px] font-mono uppercase font-bold cursor-pointer rounded-xs transition-colors ${
                              p.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                            title="Klik untuk mengubah status draft/published"
                          >
                            {p.status}
                          </button>
                        </td>

                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => toggleUseBuilderLayout(p.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold cursor-pointer border transition-colors ${
                              p.useBuilderLayout
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                                : 'bg-neutral-50 text-neutral-500 border-neutral-300'
                            }`}
                            title="Aktifkan tata letak Visual Builder untuk halaman ini"
                          >
                            {p.useBuilderLayout ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Aktif</span>
                              </>
                            ) : (
                              <span>Nonaktif</span>
                            )}
                          </button>
                        </td>

                        <td className="p-4 font-mono text-[11px] text-[#555]">
                          <span>{p.sections.length} Section</span>
                          <span className="text-[#888] block text-[10px]">{totalBlocks} Widget Blok</span>
                        </td>

                        <td className="p-4 text-[11px] text-[#777] font-mono">
                          {new Date(p.lastModified).toLocaleDateString()}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openBuilderForPage(p.id)}
                              className="px-3 py-1.5 bg-black text-white text-[11px] font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1"
                              title="Edit tata letak halaman ini di Visual Canvas"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Visual Builder</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => duplicatePage(p.id)}
                              className="p-1.5 bg-[#FAF9F6] border border-[#DDD] hover:border-black text-[#555] hover:text-black cursor-pointer transition-colors"
                              title="Duplikasi Halaman"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {!p.isDefaultCorePage && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Hapus halaman "${p.title}"?`)) {
                                    deletePage(p.id);
                                  }
                                }}
                                className="p-1.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 cursor-pointer transition-colors"
                                title="Hapus Halaman"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {p.type === 'landing' ? (
                              <button
                                type="button"
                                onClick={() => navigateTo('landing')}
                                className="p-1.5 bg-[#FAF9F6] border border-[#DDD] hover:border-black text-[#555] hover:text-black cursor-pointer transition-colors"
                                title="Lihat Halaman Frontend"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PREBUILT TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-serif text-[#1A1A1A]">Pustaka Template Desain Terintegrasi</h3>
            <p className="text-xs text-[#666]">
              Pilih template lengkap yang dirancang khusus untuk editorial kamera Fujifilm, panduan pembelian gear, komparasi spesifikasi, dan landing page konversi tinggi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white border border-[#EEEBE6] hover:border-black transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="aspect-16/10 overflow-hidden bg-neutral-100 relative">
                    <img
                      src={tpl.thumbnailUrl}
                      alt={tpl.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/80 text-white font-mono text-[9px] uppercase tracking-wider font-semibold">
                      {tpl.category}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="font-serif font-bold text-sm text-[#1A1A1A] line-clamp-1">
                      {tpl.title}
                    </h4>
                    <p className="text-xs text-[#666] line-clamp-3 leading-relaxed font-light">
                      {tpl.description}
                    </p>
                    <div className="text-[10px] font-mono text-[#888] pt-1">
                      {tpl.sections.length} Section • {tpl.sections.reduce((acc, s) => acc + s.blocks.length, 0)} Blok Widget
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    type="button"
                    onClick={() => {
                      const newId = createNewPage(
                        `${tpl.title} (Baru)`,
                        `halaman-${Date.now().toString().slice(-4)}`,
                        'custom',
                        tpl.id
                      );
                      openBuilderForPage(newId);
                    }}
                    className="w-full py-2 bg-[#FAF9F6] hover:bg-black hover:text-white border border-[#DDD] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer text-center"
                  >
                    Gunakan Template Ini
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REUSABLE SECTIONS */}
      {activeTab === 'reusable' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-serif text-[#1A1A1A]">Pustaka Reusable Section Blocks</h3>
            <p className="text-xs text-[#666]">
              Section yang telah Anda simpan dari Visual Page Builder dapat disisipkan secara instan ke halaman mana saja.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {reusableSections.map((rs) => (
              <div key={rs.id} className="bg-white border border-[#EEEBE6] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-[#FAF9F6] border border-[#EEEBE6] text-[10px] font-mono uppercase text-[#C62828] font-bold">
                    {rs.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteReusableSection(rs.id)}
                    className="text-neutral-400 hover:text-rose-600 cursor-pointer"
                    title="Hapus Dari Pustaka"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">
                    {rs.title}
                  </h4>
                  <div className="text-[10px] font-mono text-[#888] pt-1">
                    {rs.section.blocks.length} Blok Widget • Disimpan {new Date(rs.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openBuilderForPage(activePageId)}
                  className="w-full py-1.5 bg-[#FAF9F6] hover:bg-black hover:text-white border border-[#DDD] text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Buka di Visual Builder
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PLUGIN EXTENSION WIDGETS */}
      {activeTab === 'plugins' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-serif text-[#1A1A1A]">Widget Ekstensi Dari Plugin</h3>
            <p className="text-xs text-[#666]">
              Plugin FujiFinder yang aktif secara dinamis menambahkan komponen widget khusus ke dalam katalog Visual Page Builder.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pluginWidgets.map((pw) => (
              <div key={pw.id} className="bg-white border border-rose-200 p-5 flex items-start gap-4">
                <div className="p-3 bg-rose-50 text-[#C62828] border border-rose-200 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#C62828] font-bold">
                    Plugin: {pw.pluginId}
                  </span>
                  <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">
                    {pw.name}
                  </h4>
                  <p className="text-xs text-[#666] leading-relaxed">
                    {pw.description}
                  </p>
                  <div className="pt-2 text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Siap Digunakan di Visual Builder</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: GLOBAL DESIGN SYSTEM */}
      {activeTab === 'design' && (
        <div className="bg-white border border-[#EEEBE6] p-6 space-y-6 max-w-2xl">
          <div>
            <h3 className="text-lg font-serif text-[#1A1A1A]">Ringkasan Sistem Desain Global</h3>
            <p className="text-xs text-[#666]">
              Atur warna merek, tipografi editorial, dan bentuk elemen di panel desain Visual Page Builder.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-[#FAF9F6] border border-[#EEEBE6] space-y-1">
              <span className="text-[#888] font-mono text-[10px]">Warna Utama</span>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border border-black" style={{ backgroundColor: globalDesign.colors.primary }} />
                <span className="font-mono">{globalDesign.colors.primary}</span>
              </div>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#EEEBE6] space-y-1">
              <span className="text-[#888] font-mono text-[10px]">Warna Aksen (Fuji Red)</span>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border border-black" style={{ backgroundColor: globalDesign.colors.accent }} />
                <span className="font-mono">{globalDesign.colors.accent}</span>
              </div>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#EEEBE6] space-y-1">
              <span className="text-[#888] font-mono text-[10px]">Heading Font</span>
              <div className="font-serif font-bold text-sm">{globalDesign.typography.headingFont}</div>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#EEEBE6] space-y-1">
              <span className="text-[#888] font-mono text-[10px]">Body Font</span>
              <div className="font-sans font-medium text-sm">{globalDesign.typography.bodyFont}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openBuilderForPage(activePageId)}
            className="px-5 py-2.5 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Buka Pengaturan Desain di Visual Builder
          </button>
        </div>
      )}

      {/* CREATE NEW PAGE MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNewPage}
            className="bg-white max-w-md w-full p-6 border border-black shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#EEEBE6]">
              <h3 className="text-base font-serif font-bold text-[#1A1A1A]">
                Buat Halaman Baru
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-neutral-400 hover:text-black cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1A1A1A] block">Judul Halaman</label>
              <input
                type="text"
                required
                placeholder="e.g. Ulasan Kamera Fujifilm GFX 100 II"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] focus:border-black outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1A1A1A] block">Slug URL</label>
              <input
                type="text"
                placeholder="e.g. ulasan-fujifilm-gfx-100-ii"
                value={newPageSlug}
                onChange={(e) => setNewPageSlug(e.target.value)}
                className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] font-mono text-[11px] outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-[#1A1A1A] block mb-1">Tipe Halaman</label>
                <select
                  value={newPageType}
                  onChange={(e) => setNewPageType(e.target.value as PageType)}
                  className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] outline-hidden font-mono uppercase text-[11px]"
                >
                  <option value="custom">Custom Standalone</option>
                  <option value="landing">Landing Page</option>
                  <option value="blog">Blog Archive</option>
                  <option value="camera-detail">Camera Review</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#1A1A1A] block mb-1">Mulai Dari Template</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] outline-hidden text-[11px]"
                >
                  <option value="">Halaman Kosong</option>
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#EEEBE6]">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 border border-[#DDD] text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Buat Halaman & Buka Canvas
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
