import React, { useState } from 'react';
import { useSiteBuilder } from './BuilderContext';
import { LeftComponentPanel } from './panels/LeftComponentPanel';
import { RightSettingsPanel } from './panels/RightSettingsPanel';
import { BuilderPageRenderer } from './renderers/BuilderPageRenderer';
import { Breakpoint, PageType, WidgetType } from '../types/builderTypes';
import {
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Save,
  Check,
  Globe,
  Eye,
  EyeOff,
  History,
  Plus,
  ArrowLeft,
  ChevronDown,
  Layers,
  Sparkles,
  ExternalLink,
  Copy,
  Trash2,
  X,
  FilePlus,
  Sliders,
} from 'lucide-react';

interface PageBuilderProps {
  onExit: () => void;
}

export const PageBuilder: React.FC<PageBuilderProps> = ({ onExit }) => {
  const {
    pages,
    activePageId,
    activePage,
    setActivePageId,
    breakpoint,
    setBreakpoint,
    selectedSectionId,
    setSelectedSectionId,
    selectedBlockId,
    setSelectedBlockId,
    canUndo,
    canRedo,
    undo,
    redo,
    isDirty,
    lastSavedText,
    saveDraft,
    publishPage,
    revisions,
    revertToRevision,
    createNewPage,
    duplicatePage,
    deletePage,
    templates,
    addSection,
    addBlock,
    moveSection,
    duplicateSection,
    deleteSection,
    saveReusableSection,
    moveBlock,
    duplicateBlock,
    deleteBlock,
    previewMode,
    setPreviewMode,
    globalDesign,
  } = useSiteBuilder();

  // Modals
  const [showPageSwitcher, setShowPageSwitcher] = useState(false);
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [showRevisionsModal, setShowRevisionsModal] = useState(false);
  const [showWidgetPickerModal, setShowWidgetPickerModal] = useState<string | null>(null);

  // New Page Form State
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [newPageType, setNewPageType] = useState<PageType>('custom');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveDraft = () => {
    saveDraft();
    showToast('Draft berhasil disimpan!');
  };

  const handlePublish = () => {
    publishPage();
    showToast('Halaman berhasil dipublikasikan ke frontend situs!');
  };

  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim()) return;

    const slug = newPageSlug.trim() || newPageTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const newId = createNewPage(newPageTitle.trim(), slug, newPageType, selectedTemplateId || undefined);

    setShowNewPageModal(false);
    setNewPageTitle('');
    setNewPageSlug('');
    setSelectedTemplateId('');
    showToast(`Halaman "${newPageTitle}" berhasil dibuat!`);
  };

  // Viewport widths based on active breakpoint
  const getCanvasWidthClass = () => {
    if (breakpoint === 'mobile') {
      return 'w-[375px] my-6 shadow-2xl rounded-sm border border-neutral-300 ring-8 ring-neutral-900/10';
    }
    if (breakpoint === 'tablet') {
      return 'w-[768px] my-6 shadow-2xl rounded-sm border border-neutral-300 ring-8 ring-neutral-900/10';
    }
    return 'w-full max-w-[1440px] my-0 shadow-xs border-x border-[#EEEBE6]';
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F4F3F0] flex flex-col font-sans select-none overflow-hidden">
      {/* 1. TOP BUILDER TOOLBAR */}
      <header className="h-14 bg-[#141414] text-white flex items-center justify-between px-4 shrink-0 border-b border-[#2A2A2A] z-40">
        {/* Left Section: Back, Page Switcher */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            className="p-1.5 hover:bg-[#2A2A2A] text-neutral-300 hover:text-white rounded-xs transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider cursor-pointer"
            title="Keluar dari Site Builder dan kembali ke CMS"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Admin CMS</span>
          </button>

          <div className="h-4 w-px bg-[#333]" />

          {/* Page Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPageSwitcher(!showPageSwitcher)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#222] hover:bg-[#2C2C2C] border border-[#3A3A3A] text-xs text-white rounded-xs transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-rose-500" />
              <span className="font-semibold max-w-[180px] sm:max-w-[240px] truncate">
                {activePage.title}
              </span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 uppercase font-bold ${
                  activePage.status === 'published' ? 'bg-emerald-900 text-emerald-300' : 'bg-amber-900 text-amber-300'
                }`}
              >
                {activePage.status}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#888]" />
            </button>

            {/* Page switcher popup */}
            {showPageSwitcher && (
              <div className="absolute top-full left-0 mt-1 w-80 bg-[#1A1A1A] border border-[#333] shadow-2xl rounded-xs py-2 z-50 text-xs">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-[#888] flex items-center justify-between border-b border-[#2A2A2A]">
                  <span>Halaman Tersedia ({pages.length})</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPageSwitcher(false);
                      setShowNewPageModal(true);
                    }}
                    className="text-[#C62828] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Buat Baru
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-[#2A2A2A]">
                  {pages.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setActivePageId(p.id);
                        setShowPageSwitcher(false);
                      }}
                      className={`px-3 py-2 flex items-center justify-between hover:bg-[#252525] cursor-pointer ${
                        p.id === activePageId ? 'bg-[#2A2A2A] text-white font-semibold' : 'text-neutral-300'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate">{p.title}</div>
                        <div className="text-[10px] font-mono text-[#777]">
                          /{p.slug || '(beranda)'}
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 uppercase shrink-0 ${
                          p.status === 'published' ? 'text-emerald-400 bg-emerald-950' : 'text-amber-400 bg-amber-950'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Section: Responsive Breakpoint Simulator */}
        <div className="hidden md:flex items-center gap-1 bg-[#222] p-1 border border-[#333] rounded-xs">
          <button
            type="button"
            onClick={() => setBreakpoint('desktop')}
            title="Desktop Mode (Fluid 1280px+)"
            className={`flex items-center gap-1 px-3 py-1 text-xs uppercase font-mono tracking-wider transition-colors cursor-pointer ${
              breakpoint === 'desktop' ? 'bg-white text-black font-bold shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="text-[11px]">Desktop</span>
          </button>

          <button
            type="button"
            onClick={() => setBreakpoint('tablet')}
            title="Tablet Mode (768px)"
            className={`flex items-center gap-1 px-3 py-1 text-xs uppercase font-mono tracking-wider transition-colors cursor-pointer ${
              breakpoint === 'tablet' ? 'bg-white text-black font-bold shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="text-[11px]">Tablet</span>
          </button>

          <button
            type="button"
            onClick={() => setBreakpoint('mobile')}
            title="Mobile Mode (375px)"
            className={`flex items-center gap-1 px-3 py-1 text-xs uppercase font-mono tracking-wider transition-colors cursor-pointer ${
              breakpoint === 'mobile' ? 'bg-white text-black font-bold shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="text-[11px]">Mobile</span>
          </button>
        </div>

        {/* Right Section: Undo/Redo, Revisions, Preview, Save, Publish */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center bg-[#222] border border-[#333] rounded-xs">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              title="Undo Perubahan (Ctrl+Z)"
              className="p-1.5 text-neutral-300 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              title="Redo Perubahan (Ctrl+Y)"
              className="p-1.5 text-neutral-300 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Revisions Button */}
          <button
            type="button"
            onClick={() => setShowRevisionsModal(true)}
            title="Riwayat Revisi Halaman"
            className="p-1.5 bg-[#222] hover:bg-[#2C2C2C] border border-[#333] text-neutral-300 hover:text-white rounded-xs transition-colors cursor-pointer"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Preview Toggle */}
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            title={previewMode ? 'Kembali ke Editor' : 'Pratinjau Layar Penuh'}
            className={`p-1.5 border rounded-xs transition-colors cursor-pointer ${
              previewMode
                ? 'bg-amber-400 text-black border-amber-400 font-bold'
                : 'bg-[#222] hover:bg-[#2C2C2C] text-neutral-300 border-[#333]'
            }`}
          >
            {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Autosave Indicator */}
          <span className="hidden xl:inline-block text-[11px] font-mono text-neutral-400">
            {isDirty ? (
              <span className="text-amber-400">● Belum Disimpan</span>
            ) : (
              <span>✓ {lastSavedText}</span>
            )}
          </span>

          {/* Save Draft */}
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-3 py-1.5 bg-[#2C2C2C] hover:bg-[#383838] border border-[#444] text-xs font-semibold uppercase tracking-wider text-white transition-colors cursor-pointer"
          >
            Simpan Draft
          </button>

          {/* Publish / Update */}
          <button
            type="button"
            onClick={handlePublish}
            className="px-4 py-1.5 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Publish</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE CONTAINER (3-COLUMN ELEMENTOR/WP STYLE) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT COMPONENT & WIDGET PANEL */}
        {!previewMode && <LeftComponentPanel />}

        {/* CENTRAL LIVE CANVAS WORKSPACE */}
        <main
          onClick={() => {
            // Deselect block and section when clicking empty canvas margin
            setSelectedBlockId(null);
            setSelectedSectionId(null);
          }}
          className="flex-1 overflow-y-auto flex flex-col items-center bg-[#EFECE6] relative p-2 sm:p-6 transition-all"
        >
          {/* Responsive Viewport Label */}
          {breakpoint !== 'desktop' && (
            <div className="mb-2 px-3 py-1 bg-black/80 text-white text-[10px] font-mono uppercase tracking-widest rounded-full shadow-md">
              Pratinjau {breakpoint === 'tablet' ? 'Tablet (768px)' : 'Mobile (375px)'}
            </div>
          )}

          {/* Canvas Wrapper */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`transition-all duration-300 bg-white min-h-[85vh] ${getCanvasWidthClass()}`}
          >
            <BuilderPageRenderer
              page={activePage}
              breakpoint={breakpoint}
              isEditor={!previewMode}
              selectedSectionId={selectedSectionId}
              selectedBlockId={selectedBlockId}
              onSelectSection={(secId) => {
                setSelectedSectionId(secId);
                setSelectedBlockId(null);
              }}
              onSelectBlock={(blkId) => {
                setSelectedBlockId(blkId);
              }}
              onMoveSection={moveSection}
              onDuplicateSection={duplicateSection}
              onDeleteSection={deleteSection}
              onSaveReusableSection={saveReusableSection}
              onMoveBlock={moveBlock}
              onDuplicateBlock={duplicateBlock}
              onDeleteBlock={deleteBlock}
              onOpenWidgetPicker={(secId) => setShowWidgetPickerModal(secId)}
              globalDesign={globalDesign}
            />

            {/* Quick Add Section Button at Bottom of Canvas */}
            {!previewMode && (
              <div className="py-8 bg-[#FAF9F6] border-t border-dashed border-[#DDD] text-center">
                <button
                  type="button"
                  onClick={() => addSection()}
                  className="px-5 py-2.5 bg-white border-2 border-black hover:bg-black hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Section Baru Ke Halaman</span>
                </button>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT SETTINGS PANEL */}
        {!previewMode && <RightSettingsPanel />}
      </div>

      {/* 3. WIDGET PICKER MODAL */}
      {showWidgetPickerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full p-6 border border-black shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEEBE6]">
              <div>
                <h3 className="text-base font-serif font-bold text-[#1A1A1A]">
                  Pilih Widget Untuk Ditambahkan
                </h3>
                <p className="text-xs text-[#666]">
                  Klik widget untuk memasukkannya ke section yang dipilih.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowWidgetPickerModal(null)}
                className="p-1 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5 text-[#888]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { type: 'hero' as WidgetType, label: 'Hero Showcase' },
                { type: 'search-bar' as WidgetType, label: 'Search Bar' },
                { type: 'featured-articles' as WidgetType, label: 'Artikel Pilihan' },
                { type: 'article-grid' as WidgetType, label: 'Grid Artikel' },
                { type: 'product-cards' as WidgetType, label: 'Katalog Kamera' },
                { type: 'product-recommendation' as WidgetType, label: 'Rekomendasi Lab' },
                { type: 'camera-comparison' as WidgetType, label: 'Adu Spesifikasi' },
                { type: 'affiliate-product-cta' as WidgetType, label: 'Banner Affiliate' },
                { type: 'category-cards' as WidgetType, label: 'Kartu Kategori' },
                { type: 'text' as WidgetType, label: 'Judul / Teks' },
                { type: 'image' as WidgetType, label: 'Gambar Lab' },
                { type: 'video' as WidgetType, label: 'Embed Video' },
                { type: 'newsletter-signup' as WidgetType, label: 'Newsletter Box' },
                { type: 'author-profile' as WidgetType, label: 'Profil Penulis' },
                { type: 'button' as WidgetType, label: 'Tombol CTA' },
                { type: 'spacer' as WidgetType, label: 'Spacer (Ruang)' },
              ].map((w) => (
                <div
                  key={w.type}
                  onClick={() => {
                    const secId = showWidgetPickerModal === 'new' ? undefined : showWidgetPickerModal;
                    if (secId) {
                      addBlock(secId, w.type);
                    } else {
                      addSection();
                    }
                    setShowWidgetPickerModal(null);
                  }}
                  className="p-3 border border-[#EEEBE6] hover:border-black hover:bg-[#FAF9F6] transition-all cursor-pointer text-center space-y-1"
                >
                  <div className="text-xs font-semibold text-[#1A1A1A]">{w.label}</div>
                  <div className="text-[10px] font-mono text-[#888]">{w.type}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. REVISIONS HISTORY MODAL */}
      {showRevisionsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 border border-black shadow-2xl max-h-[80vh] flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEEBE6]">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#C62828]" />
                <div>
                  <h3 className="text-base font-serif font-bold text-[#1A1A1A]">
                    Riwayat Revisi & Versi
                  </h3>
                  <p className="text-xs text-[#666]">
                    Pulihkan versi tata letak sebelumnya kapan saja.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRevisionsModal(false)}
                className="p-1 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5 text-[#888]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {revisions.length === 0 ? (
                <p className="text-xs text-[#888] text-center py-6">Belum ada riwayat revisi.</p>
              ) : (
                revisions.map((rev, idx) => (
                  <div
                    key={rev.id}
                    className="p-3 border border-[#EEEBE6] bg-[#FAF9F6] flex items-center justify-between hover:border-black transition-colors"
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#1A1A1A]">
                        {rev.description || `Revisi #${revisions.length - idx}`}
                      </div>
                      <div className="text-[10px] font-mono text-[#888]">
                        {new Date(rev.timestamp).toLocaleString()} • {rev.author}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        revertToRevision(rev.id);
                        setShowRevisionsModal(false);
                        showToast('Berhasil memulihkan ke versi revisi terpilih!');
                      }}
                      className="px-3 py-1 bg-white border border-[#DDD] hover:border-black text-[10px] font-mono uppercase font-semibold cursor-pointer"
                    >
                      Pulihkan Versi Ini
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. CREATE NEW PAGE MODAL */}
      {showNewPageModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreatePage}
            className="bg-white max-w-md w-full p-6 border border-black shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#EEEBE6]">
              <h3 className="text-base font-serif font-bold text-[#1A1A1A]">
                Buat Halaman Baru
              </h3>
              <button
                type="button"
                onClick={() => setShowNewPageModal(false)}
                className="p-1 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5 text-[#888]" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1A1A1A] block">Judul Halaman</label>
              <input
                type="text"
                required
                placeholder="e.g. Ulasan Lensa X-Mount Terbaik 2026"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] focus:border-black outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1A1A1A] block">Slug URL</label>
              <input
                type="text"
                placeholder="e.g. lensa-x-mount-terbaik"
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
                  <option value="article">Article Guide</option>
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
                onClick={() => setShowNewPageModal(false)}
                className="px-4 py-2 border border-[#DDD] text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Buat Halaman
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A1A] text-white px-4 py-3 shadow-2xl border border-neutral-700 text-xs font-mono flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
