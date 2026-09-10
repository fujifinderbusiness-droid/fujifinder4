import React, { useState } from 'react';
import { useSiteBuilder } from '../BuilderContext';
import { Breakpoint } from '../../types/builderTypes';
import {
  Settings,
  Sliders,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  BookmarkPlus,
  Monitor,
  Tablet,
  Smartphone,
  ChevronDown,
  Layers,
  Palette,
  ExternalLink,
  Save,
} from 'lucide-react';

export const RightSettingsPanel: React.FC = () => {
  const {
    activePage,
    selectedSection,
    selectedBlock,
    breakpoint,
    setBreakpoint,
    updateBlock,
    deleteBlock,
    duplicateBlock,
    updateSection,
    deleteSection,
    duplicateSection,
    saveReusableSection,
    updatePageMeta,
    toggleUseBuilderLayout,
    togglePagePublished,
  } = useSiteBuilder();

  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'advanced'>('content');
  const [reusableTitle, setReusableTitle] = useState('');
  const [reusableCategory, setReusableCategory] = useState('Marketing');
  const [showSaveReusableModal, setShowSaveReusableModal] = useState(false);

  // Helper to handle responsive style changes
  const handlePaddingChange = (side: 'top' | 'right' | 'bottom' | 'left', value: number) => {
    if (!selectedBlock) return;
    const currentPadding = selectedBlock.style.padding?.[breakpoint] || { top: 0, right: 0, bottom: 0, left: 0 };
    const updatedPadding = { ...currentPadding, [side]: value };
    updateBlock(selectedBlock.id, {
      style: {
        ...selectedBlock.style,
        padding: {
          ...selectedBlock.style.padding,
          [breakpoint]: updatedPadding,
        },
      },
    });
  };

  const handleMarginChange = (side: 'top' | 'right' | 'bottom' | 'left', value: number) => {
    if (!selectedBlock) return;
    const currentMargin = selectedBlock.style.margin?.[breakpoint] || { top: 0, right: 0, bottom: 0, left: 0 };
    const updatedMargin = { ...currentMargin, [side]: value };
    updateBlock(selectedBlock.id, {
      style: {
        ...selectedBlock.style,
        margin: {
          ...selectedBlock.style.margin,
          [breakpoint]: updatedMargin,
        },
      },
    });
  };

  const handleSectionPaddingYChange = (value: number) => {
    if (!selectedSection) return;
    const currentPaddingY = selectedSection.style.paddingY || { desktop: 48, tablet: 36, mobile: 24 };
    updateSection(selectedSection.id, {
      style: {
        ...selectedSection.style,
        paddingY: {
          ...currentPaddingY,
          [breakpoint]: value,
        },
      },
    });
  };

  return (
    <aside className="w-80 h-full bg-white border-l border-[#EEEBE6] flex flex-col shrink-0 select-none">
      {/* HEADER WITH CONTEXT TITLE */}
      <div className="p-3.5 border-b border-[#EEEBE6] bg-[#FAF9F6] flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <Sliders className="w-4 h-4 text-[#1A1A1A] shrink-0" />
          <div className="overflow-hidden">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#888] block">
              {selectedBlock
                ? 'Pengaturan Widget'
                : selectedSection
                ? 'Pengaturan Section'
                : 'Pengaturan Halaman'}
            </span>
            <h4 className="text-xs font-serif font-bold text-[#1A1A1A] truncate">
              {selectedBlock
                ? selectedBlock.label
                : selectedSection
                ? selectedSection.name
                : activePage.title}
            </h4>
          </div>
        </div>

        {/* Quick Breakpoint Switcher */}
        <div className="flex items-center gap-0.5 bg-neutral-200/80 p-0.5 rounded-xs">
          <button
            type="button"
            onClick={() => setBreakpoint('desktop')}
            title="Tampilan Desktop"
            className={`p-1 cursor-pointer transition-colors ${
              breakpoint === 'desktop' ? 'bg-white text-black shadow-xs' : 'text-[#777] hover:text-black'
            }`}
          >
            <Monitor className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => setBreakpoint('tablet')}
            title="Tampilan Tablet"
            className={`p-1 cursor-pointer transition-colors ${
              breakpoint === 'tablet' ? 'bg-white text-black shadow-xs' : 'text-[#777] hover:text-black'
            }`}
          >
            <Tablet className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => setBreakpoint('mobile')}
            title="Tampilan Mobile"
            className={`p-1 cursor-pointer transition-colors ${
              breakpoint === 'mobile' ? 'bg-white text-black shadow-xs' : 'text-[#777] hover:text-black'
            }`}
          >
            <Smartphone className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* TAB NAVIGATION FOR BLOCK/SECTION */}
      {(selectedBlock || selectedSection) && (
        <div className="flex border-b border-[#EEEBE6] bg-white text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`flex-1 py-2.5 text-center font-semibold uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
              activeTab === 'content'
                ? 'border-black text-black'
                : 'border-transparent text-[#777] hover:text-black'
            }`}
          >
            Content
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('style')}
            className={`flex-1 py-2.5 text-center font-semibold uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
              activeTab === 'style'
                ? 'border-black text-black'
                : 'border-transparent text-[#777] hover:text-black'
            }`}
          >
            Style
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('advanced')}
            className={`flex-1 py-2.5 text-center font-semibold uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
              activeTab === 'advanced'
                ? 'border-black text-black'
                : 'border-transparent text-[#777] hover:text-black'
            }`}
          >
            Advanced
          </button>
        </div>
      )}

      {/* PANEL CONTENT SCROLL AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* CASE 1: SELECTED BLOCK CONFIG */}
        {selectedBlock && (
          <>
            {/* CONTENT TAB */}
            {activeTab === 'content' && (
              <div className="space-y-4 text-xs">
                {/* HERO BLOCK CONTENT */}
                {selectedBlock.type === 'hero' && (
                  <>
                    <div className="space-y-1">
                      <label className="font-semibold text-[#1A1A1A]">Headline</label>
                      <textarea
                        rows={2}
                        value={selectedBlock.content.headline || ''}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            content: { ...selectedBlock.content, headline: e.target.value },
                          })
                        }
                        className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] focus:border-black outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[#1A1A1A]">Subtitle / Deskripsi</label>
                      <textarea
                        rows={3}
                        value={selectedBlock.content.subtitle || ''}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            content: { ...selectedBlock.content, subtitle: e.target.value },
                          })
                        }
                        className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] focus:border-black outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[#1A1A1A]">Badge Label</label>
                      <input
                        type="text"
                        value={selectedBlock.content.badge || ''}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            content: { ...selectedBlock.content, badge: e.target.value },
                          })
                        }
                        className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] focus:border-black outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[#1A1A1A]">Background Image URL</label>
                      <input
                        type="text"
                        value={selectedBlock.content.backgroundImage || ''}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            content: { ...selectedBlock.content, backgroundImage: e.target.value },
                          })
                        }
                        className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] focus:border-black outline-hidden font-mono text-[11px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-[#1A1A1A] block mb-1">Alignment</label>
                        <select
                          value={selectedBlock.content.alignment || 'left'}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, alignment: e.target.value },
                            })
                          }
                          className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] outline-hidden"
                        >
                          <option value="left">Kiri (Left)</option>
                          <option value="center">Tengah (Center)</option>
                          <option value="right">Kanan (Right)</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-semibold text-[#1A1A1A] block mb-1">Min Height (px)</label>
                        <input
                          type="number"
                          value={selectedBlock.content.minHeight || 480}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, minHeight: parseInt(e.target.value) || 400 },
                            })
                          }
                          className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[#1A1A1A]">Tombol Utama (Text & Link)</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          placeholder="Label Tombol"
                          value={selectedBlock.content.primaryBtnText || ''}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, primaryBtnText: e.target.value },
                            })
                          }
                          className="p-1.5 bg-[#FAF9F6] border border-[#DDD] outline-hidden"
                        />
                        <input
                          type="text"
                          placeholder="#link"
                          value={selectedBlock.content.primaryBtnLink || ''}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, primaryBtnLink: e.target.value },
                            })
                          }
                          className="p-1.5 bg-[#FAF9F6] border border-[#DDD] outline-hidden font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[#1A1A1A]">Tombol Kedua / CTA Subscribe (Text & Link)</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          placeholder="e.g. Langganan Newsletter"
                          value={selectedBlock.content.secondaryBtnText || ''}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, secondaryBtnText: e.target.value },
                            })
                          }
                          className="p-1.5 bg-[#FAF9F6] border border-[#DDD] outline-hidden"
                        />
                        <input
                          type="text"
                          placeholder="#newsletter"
                          value={selectedBlock.content.secondaryBtnLink || ''}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, secondaryBtnLink: e.target.value },
                            })
                          }
                          className="p-1.5 bg-[#FAF9F6] border border-[#DDD] outline-hidden font-mono"
                        />
                      </div>
                      <p className="text-[10px] text-neutral-500">Gunakan link <code>#newsletter</code> untuk scroll otomatis ke formulir email di bawah.</p>
                    </div>
                  </>
                )}

                {/* ARTICLE GRID / LIST CONTENT */}
                {(selectedBlock.type === 'article-grid' || selectedBlock.type === 'article-list') && (
                  <>
                    <div className="space-y-1">
                      <label className="font-semibold text-[#1A1A1A]">Filter Kategori</label>
                      <select
                        value={selectedBlock.content.category || 'all'}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            content: { ...selectedBlock.content, category: e.target.value },
                          })
                        }
                        className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] outline-hidden"
                      >
                        <option value="all">Semua Kategori (All)</option>
                        <option value="Review">Review Kamera</option>
                        <option value="Guide">Panduan / Guide</option>
                        <option value="Comparison">Komparasi Spek</option>
                        <option value="Recipe">Simulasi Film / Recipes</option>
                        <option value="News">Berita & Rilis</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-[#1A1A1A] block mb-1">Jumlah Artikel</label>
                        <input
                          type="number"
                          min={1}
                          max={18}
                          value={selectedBlock.content.count || 6}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, count: parseInt(e.target.value) || 6 },
                            })
                          }
                          className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] outline-hidden"
                        />
                      </div>

                      {selectedBlock.type === 'article-grid' && (
                        <div>
                          <label className="font-semibold text-[#1A1A1A] block mb-1">Kolom Grid</label>
                          <select
                            value={selectedBlock.content.columns || 3}
                            onChange={(e) =>
                              updateBlock(selectedBlock.id, {
                                content: { ...selectedBlock.content, columns: parseInt(e.target.value) || 3 },
                              })
                            }
                            className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] outline-hidden"
                          >
                            <option value={1}>1 Kolom</option>
                            <option value={2}>2 Kolom</option>
                            <option value={3}>3 Kolom</option>
                            <option value={4}>4 Kolom</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#EEEBE6]">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBlock.content.showExcerpt !== false}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, showExcerpt: e.target.checked },
                            })
                          }
                        />
                        <span>Tampilkan Ringkasan (Excerpt)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBlock.content.showBadge !== false}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, showBadge: e.target.checked },
                            })
                          }
                        />
                        <span>Tampilkan Badge Kategori</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBlock.content.showAuthor !== false}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, showAuthor: e.target.checked },
                            })
                          }
                        />
                        <span>Tampilkan Nama Penulis</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBlock.content.showReadTime !== false}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, showReadTime: e.target.checked },
                            })
                          }
                        />
                        <span>Tampilkan Estimasi Baca (Min)</span>
                      </label>
                    </div>
                  </>
                )}

                {/* PRODUCT CARDS CONTENT */}
                {selectedBlock.type === 'product-cards' && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-[#1A1A1A] block mb-1">Jumlah Kamera</label>
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={selectedBlock.content.count || 6}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, count: parseInt(e.target.value) || 6 },
                            })
                          }
                          className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-[#1A1A1A] block mb-1">Kolom</label>
                        <select
                          value={selectedBlock.content.columns || 3}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, columns: parseInt(e.target.value) || 3 },
                            })
                          }
                          className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] outline-hidden"
                        >
                          <option value={2}>2 Kolom</option>
                          <option value={3}>3 Kolom</option>
                          <option value={4}>4 Kolom</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#EEEBE6]">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBlock.content.showScores !== false}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, showScores: e.target.checked },
                            })
                          }
                        />
                        <span>Tampilkan Skor Lab (0-100)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBlock.content.showAffiliateBtn !== false}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, showAffiliateBtn: e.target.checked },
                            })
                          }
                        />
                        <span>Tampilkan Tombol Affiliate</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBlock.content.showCompareBtn !== false}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, showCompareBtn: e.target.checked },
                            })
                          }
                        />
                        <span>Tampilkan Tombol Bandingkan</span>
                      </label>
                    </div>
                  </>
                )}

                {/* TEXT CONTENT */}
                {selectedBlock.type === 'text' && (
                  <>
                    <div className="space-y-1">
                      <label className="font-semibold text-[#1A1A1A]">Eyebrow (Label Kecil)</label>
                      <input
                        type="text"
                        value={selectedBlock.content.eyebrow || ''}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            content: { ...selectedBlock.content, eyebrow: e.target.value },
                          })
                        }
                        className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] focus:border-black outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[#1A1A1A]">Judul (Title)</label>
                      <input
                        type="text"
                        value={selectedBlock.content.title || ''}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            content: { ...selectedBlock.content, title: e.target.value },
                          })
                        }
                        className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] focus:border-black outline-hidden font-serif"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[#1A1A1A]">Deskripsi</label>
                      <textarea
                        rows={3}
                        value={selectedBlock.content.description || ''}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            content: { ...selectedBlock.content, description: e.target.value },
                          })
                        }
                        className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] focus:border-black outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-[#1A1A1A] block mb-1">HTML Heading Tag</label>
                        <select
                          value={selectedBlock.content.tag || 'h2'}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, tag: e.target.value },
                            })
                          }
                          className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] outline-hidden font-mono"
                        >
                          <option value="h1">H1 (Hero Principal)</option>
                          <option value="h2">H2 (Section Header)</option>
                          <option value="h3">H3 (Sub-section)</option>
                          <option value="h4">H4 (Card Title)</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-semibold text-[#1A1A1A] block mb-1">Alignment</label>
                        <select
                          value={selectedBlock.content.align || 'left'}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, align: e.target.value },
                            })
                          }
                          className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] outline-hidden"
                        >
                          <option value="left">Rata Kiri</option>
                          <option value="center">Rata Tengah</option>
                          <option value="right">Rata Kanan</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* AFFILIATE CTA BANNER CONTENT */}
                {selectedBlock.type === 'affiliate-product-cta' && (
                  <>
                    <div className="space-y-1">
                      <label className="font-semibold text-[#1A1A1A]">Judul Penawaran</label>
                      <input
                        type="text"
                        value={selectedBlock.content.title || ''}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            content: { ...selectedBlock.content, title: e.target.value },
                          })
                        }
                        className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[#1A1A1A]">Deskripsi</label>
                      <textarea
                        rows={2}
                        value={selectedBlock.content.description || ''}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            content: { ...selectedBlock.content, description: e.target.value },
                          })
                        }
                        className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-[#1A1A1A] block mb-1">Label Tombol</label>
                        <input
                          type="text"
                          value={selectedBlock.content.btnText || ''}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, btnText: e.target.value },
                            })
                          }
                          className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-[#1A1A1A] block mb-1">Badge Tag</label>
                        <input
                          type="text"
                          value={selectedBlock.content.badge || ''}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, badge: e.target.value },
                            })
                          }
                          className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] outline-hidden"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* IMAGE BLOCK CONTENT */}
                {selectedBlock.type === 'image' && (
                  <>
                    <div className="space-y-1">
                      <label className="font-semibold text-[#1A1A1A]">Image URL</label>
                      <input
                        type="text"
                        value={selectedBlock.content.url || ''}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            content: { ...selectedBlock.content, url: e.target.value },
                          })
                        }
                        className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] outline-hidden font-mono text-[11px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[#1A1A1A]">Caption / Keterangan</label>
                      <input
                        type="text"
                        value={selectedBlock.content.caption || ''}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            content: { ...selectedBlock.content, caption: e.target.value },
                          })
                        }
                        className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] outline-hidden"
                      />
                    </div>
                  </>
                )}

                {/* VIDEO BLOCK CONTENT */}
                {selectedBlock.type === 'video' && (
                  <>
                    <div className="space-y-1">
                      <label className="font-semibold text-[#1A1A1A]">YouTube Embed URL</label>
                      <input
                        type="text"
                        value={selectedBlock.content.embedUrl || ''}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            content: { ...selectedBlock.content, embedUrl: e.target.value },
                          })
                        }
                        placeholder="https://www.youtube.com/embed/..."
                        className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] outline-hidden font-mono text-[11px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-[#1A1A1A]">Judul Video</label>
                      <input
                        type="text"
                        value={selectedBlock.content.title || ''}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            content: { ...selectedBlock.content, title: e.target.value },
                          })
                        }
                        className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] outline-hidden"
                      />
                    </div>
                  </>
                )}

                {/* SPACER CONTENT */}
                {selectedBlock.type === 'spacer' && (
                  <div className="space-y-1">
                    <label className="font-semibold text-[#1A1A1A]">Tinggi Ruang (px)</label>
                    <input
                      type="number"
                      min={8}
                      max={200}
                      value={selectedBlock.content.height || 48}
                      onChange={(e) =>
                        updateBlock(selectedBlock.id, {
                          content: { ...selectedBlock.content, height: parseInt(e.target.value) || 48 },
                        })
                      }
                      className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] outline-hidden"
                    />
                  </div>
                )}
              </div>
            )}

            {/* STYLE TAB */}
            {activeTab === 'style' && (
              <div className="space-y-5 text-xs">
                {/* Max Container Width */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#1A1A1A] block">Lebar Maksimal Kontainer</label>
                  <select
                    value={selectedBlock.style.maxWidth || '1280px'}
                    onChange={(e) =>
                      updateBlock(selectedBlock.id, {
                        style: { ...selectedBlock.style, maxWidth: e.target.value },
                      })
                    }
                    className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] outline-hidden"
                  >
                    <option value="full">Full Width (100%)</option>
                    <option value="1440px">Wide Display (1440px)</option>
                    <option value="1280px">Default Editorial (1280px)</option>
                    <option value="1140px">Medium Box (1140px)</option>
                    <option value="960px">Compact Article (960px)</option>
                    <option value="768px">Narrow Focus (768px)</option>
                  </select>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#EEEBE6]">
                  <div>
                    <label className="font-semibold text-[#1A1A1A] block mb-1">Background</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={selectedBlock.style.backgroundColor || '#FFFFFF'}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            style: { ...selectedBlock.style, backgroundColor: e.target.value },
                          })
                        }
                        className="w-6 h-6 p-0 border border-neutral-300 rounded cursor-pointer"
                      />
                      <span className="font-mono text-[10px] text-[#666]">
                        {selectedBlock.style.backgroundColor || 'None'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-[#1A1A1A] block mb-1">Text Color</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={selectedBlock.style.textColor || '#1A1A1A'}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            style: { ...selectedBlock.style, textColor: e.target.value },
                          })
                        }
                        className="w-6 h-6 p-0 border border-neutral-300 rounded cursor-pointer"
                      />
                      <span className="font-mono text-[10px] text-[#666]">
                        {selectedBlock.style.textColor || 'Inherit'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Padding Control */}
                <div className="space-y-2 pt-2 border-t border-[#EEEBE6]">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-[#1A1A1A]">Padding (px) [{breakpoint}]</label>
                    <span className="text-[10px] font-mono text-[#888] uppercase">{breakpoint}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div>
                      <span className="text-[9px] text-[#888] block">Top</span>
                      <input
                        type="number"
                        min={0}
                        value={selectedBlock.style.padding?.[breakpoint]?.top || 0}
                        onChange={(e) => handlePaddingChange('top', parseInt(e.target.value) || 0)}
                        className="w-full p-1 bg-[#FAF9F6] border border-[#DDD] text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-[#888] block">Right</span>
                      <input
                        type="number"
                        min={0}
                        value={selectedBlock.style.padding?.[breakpoint]?.right || 0}
                        onChange={(e) => handlePaddingChange('right', parseInt(e.target.value) || 0)}
                        className="w-full p-1 bg-[#FAF9F6] border border-[#DDD] text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-[#888] block">Bottom</span>
                      <input
                        type="number"
                        min={0}
                        value={selectedBlock.style.padding?.[breakpoint]?.bottom || 0}
                        onChange={(e) => handlePaddingChange('bottom', parseInt(e.target.value) || 0)}
                        className="w-full p-1 bg-[#FAF9F6] border border-[#DDD] text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-[#888] block">Left</span>
                      <input
                        type="number"
                        min={0}
                        value={selectedBlock.style.padding?.[breakpoint]?.left || 0}
                        onChange={(e) => handlePaddingChange('left', parseInt(e.target.value) || 0)}
                        className="w-full p-1 bg-[#FAF9F6] border border-[#DDD] text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Margin Control */}
                <div className="space-y-2 pt-2 border-t border-[#EEEBE6]">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-[#1A1A1A]">Margin (px) [{breakpoint}]</label>
                    <span className="text-[10px] font-mono text-[#888] uppercase">{breakpoint}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div>
                      <span className="text-[9px] text-[#888] block">Top</span>
                      <input
                        type="number"
                        value={selectedBlock.style.margin?.[breakpoint]?.top || 0}
                        onChange={(e) => handleMarginChange('top', parseInt(e.target.value) || 0)}
                        className="w-full p-1 bg-[#FAF9F6] border border-[#DDD] text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-[#888] block">Right</span>
                      <input
                        type="number"
                        value={selectedBlock.style.margin?.[breakpoint]?.right || 0}
                        onChange={(e) => handleMarginChange('right', parseInt(e.target.value) || 0)}
                        className="w-full p-1 bg-[#FAF9F6] border border-[#DDD] text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-[#888] block">Bottom</span>
                      <input
                        type="number"
                        value={selectedBlock.style.margin?.[breakpoint]?.bottom || 0}
                        onChange={(e) => handleMarginChange('bottom', parseInt(e.target.value) || 0)}
                        className="w-full p-1 bg-[#FAF9F6] border border-[#DDD] text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-[#888] block">Left</span>
                      <input
                        type="number"
                        value={selectedBlock.style.margin?.[breakpoint]?.left || 0}
                        onChange={(e) => handleMarginChange('left', parseInt(e.target.value) || 0)}
                        className="w-full p-1 bg-[#FAF9F6] border border-[#DDD] text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ADVANCED TAB */}
            {activeTab === 'advanced' && (
              <div className="space-y-5 text-xs">
                {/* Responsive Device Visibility */}
                <div className="space-y-2">
                  <label className="font-semibold text-[#1A1A1A] block">
                    Visibilitas Berdasarkan Perangkat
                  </label>
                  <div className="space-y-1.5">
                    <label className="flex items-center justify-between p-2 bg-[#FAF9F6] border border-[#EEEBE6] cursor-pointer">
                      <span className="flex items-center gap-2">
                        <Monitor className="w-3.5 h-3.5 text-[#666]" />
                        <span>Tampilkan di Desktop</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedBlock.visibility.desktop}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            visibility: { ...selectedBlock.visibility, desktop: e.target.checked },
                          })
                        }
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 bg-[#FAF9F6] border border-[#EEEBE6] cursor-pointer">
                      <span className="flex items-center gap-2">
                        <Tablet className="w-3.5 h-3.5 text-[#666]" />
                        <span>Tampilkan di Tablet</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedBlock.visibility.tablet}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            visibility: { ...selectedBlock.visibility, tablet: e.target.checked },
                          })
                        }
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 bg-[#FAF9F6] border border-[#EEEBE6] cursor-pointer">
                      <span className="flex items-center gap-2">
                        <Smartphone className="w-3.5 h-3.5 text-[#666]" />
                        <span>Tampilkan di Mobile</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedBlock.visibility.mobile}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            visibility: { ...selectedBlock.visibility, mobile: e.target.checked },
                          })
                        }
                      />
                    </label>
                  </div>
                </div>

                {/* Custom CSS & HTML IDs */}
                <div className="space-y-2 pt-2 border-t border-[#EEEBE6]">
                  <div>
                    <label className="font-semibold text-[#1A1A1A] block mb-1">HTML ID Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. #hero-slider"
                      value={selectedBlock.customId || ''}
                      onChange={(e) => updateBlock(selectedBlock.id, { customId: e.target.value })}
                      className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] font-mono text-[11px] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#1A1A1A] block mb-1">Custom CSS Class</label>
                    <input
                      type="text"
                      placeholder="e.g. custom-glow shadow-editorial"
                      value={selectedBlock.customClass || ''}
                      onChange={(e) => updateBlock(selectedBlock.id, { customClass: e.target.value })}
                      className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] font-mono text-[11px] outline-hidden"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-[#EEEBE6] space-y-2">
                  <button
                    type="button"
                    onClick={() => duplicateBlock(selectedBlock.id)}
                    className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Duplikasi Widget</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteBlock(selectedBlock.id)}
                    className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Widget Ini</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* CASE 2: SELECTED SECTION CONFIG */}
        {!selectedBlock && selectedSection && (
          <div className="space-y-5 text-xs">
            {activeTab === 'content' && (
              <>
                <div className="space-y-1">
                  <label className="font-semibold text-[#1A1A1A]">Nama Section (Label Admin)</label>
                  <input
                    type="text"
                    value={selectedSection.name}
                    onChange={(e) => updateSection(selectedSection.id, { name: e.target.value })}
                    className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] focus:border-black outline-hidden font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1A1A1A]">Background Image URL</label>
                  <input
                    type="text"
                    value={selectedSection.style.backgroundImage || ''}
                    onChange={(e) =>
                      updateSection(selectedSection.id, {
                        style: { ...selectedSection.style, backgroundImage: e.target.value },
                      })
                    }
                    placeholder="https://..."
                    className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] outline-hidden font-mono text-[11px]"
                  />
                </div>
              </>
            )}

            {activeTab === 'style' && (
              <>
                <div className="space-y-1">
                  <label className="font-semibold text-[#1A1A1A]">Warna Background Section</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedSection.style.backgroundColor || '#FFFFFF'}
                      onChange={(e) =>
                        updateSection(selectedSection.id, {
                          style: { ...selectedSection.style, backgroundColor: e.target.value },
                        })
                      }
                      className="w-8 h-8 p-0 border border-neutral-300 rounded cursor-pointer"
                    />
                    <span className="font-mono text-xs text-[#555]">
                      {selectedSection.style.backgroundColor || '#FFFFFF'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#EEEBE6]">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-[#1A1A1A]">Vertical Padding (px) [{breakpoint}]</label>
                    <span className="font-mono text-[10px] text-[#888] uppercase">{breakpoint}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={120}
                    step={4}
                    value={selectedSection.style.paddingY?.[breakpoint] || 48}
                    onChange={(e) => handleSectionPaddingYChange(parseInt(e.target.value) || 48)}
                    className="w-full cursor-pointer accent-black"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#888]">
                    <span>0px</span>
                    <span className="font-bold text-black">{selectedSection.style.paddingY?.[breakpoint] || 48}px</span>
                    <span>120px</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#EEEBE6]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSection.style.borderTop || false}
                      onChange={(e) =>
                        updateSection(selectedSection.id, {
                          style: { ...selectedSection.style, borderTop: e.target.checked },
                        })
                      }
                    />
                    <span>Garis Pemisah Atas (Border Top)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSection.style.borderBottom || false}
                      onChange={(e) =>
                        updateSection(selectedSection.id, {
                          style: { ...selectedSection.style, borderBottom: e.target.checked },
                        })
                      }
                    />
                    <span>Garis Pemisah Bawah (Border Bottom)</span>
                  </label>
                </div>
              </>
            )}

            {activeTab === 'advanced' && (
              <>
                <div className="space-y-2">
                  <label className="font-semibold text-[#1A1A1A] block">
                    Visibilitas Section Perangkat
                  </label>
                  <div className="space-y-1.5">
                    <label className="flex items-center justify-between p-2 bg-[#FAF9F6] border border-[#EEEBE6] cursor-pointer">
                      <span>Desktop</span>
                      <input
                        type="checkbox"
                        checked={selectedSection.visibility.desktop}
                        onChange={(e) =>
                          updateSection(selectedSection.id, {
                            visibility: { ...selectedSection.visibility, desktop: e.target.checked },
                          })
                        }
                      />
                    </label>
                    <label className="flex items-center justify-between p-2 bg-[#FAF9F6] border border-[#EEEBE6] cursor-pointer">
                      <span>Tablet</span>
                      <input
                        type="checkbox"
                        checked={selectedSection.visibility.tablet}
                        onChange={(e) =>
                          updateSection(selectedSection.id, {
                            visibility: { ...selectedSection.visibility, tablet: e.target.checked },
                          })
                        }
                      />
                    </label>
                    <label className="flex items-center justify-between p-2 bg-[#FAF9F6] border border-[#EEEBE6] cursor-pointer">
                      <span>Mobile</span>
                      <input
                        type="checkbox"
                        checked={selectedSection.visibility.mobile}
                        onChange={(e) =>
                          updateSection(selectedSection.id, {
                            visibility: { ...selectedSection.visibility, mobile: e.target.checked },
                          })
                        }
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#EEEBE6] space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowSaveReusableModal(true)}
                    className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5 text-amber-700" />
                    <span>Simpan Ke Pustaka Reusable</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => duplicateSection(selectedSection.id)}
                    className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Duplikasi Section</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteSection(selectedSection.id)}
                    className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Section Ini</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* CASE 3: NO SELECTION (PAGE-LEVEL SETTINGS) */}
        {!selectedBlock && !selectedSection && (
          <div className="space-y-6 text-xs">
            <div className="p-3 bg-[#FAF9F6] border border-[#EEEBE6] space-y-2">
              <span className="text-[10px] font-mono uppercase text-[#C62828] font-bold">
                Status Tata Letak Halaman
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-[#1A1A1A]">
                    Aktifkan Builder Layout
                  </div>
                  <p className="text-[11px] text-[#666] leading-relaxed">
                    Jika aktif, frontend publik akan menampilkan tata letak visual builder ini.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleUseBuilderLayout(activePage.id)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase font-bold tracking-wider cursor-pointer transition-colors ${
                    activePage.useBuilderLayout
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-300 text-neutral-700'
                  }`}
                >
                  {activePage.useBuilderLayout ? 'Aktif' : 'Nonaktif'}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-[#1A1A1A] block mb-1">Judul Halaman</label>
                <input
                  type="text"
                  value={activePage.title}
                  onChange={(e) => updatePageMeta(activePage.id, { title: e.target.value })}
                  className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] focus:border-black outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1A1A1A] block mb-1">Slug URL</label>
                <div className="flex items-center">
                  <span className="p-2 bg-neutral-100 border border-r-0 border-[#DDD] text-[#888] font-mono text-[11px]">
                    /
                  </span>
                  <input
                    type="text"
                    value={activePage.slug}
                    onChange={(e) => updatePageMeta(activePage.id, { slug: e.target.value })}
                    className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] font-mono text-[11px] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#1A1A1A] block mb-1">Tipe Halaman</label>
                <select
                  value={activePage.type}
                  onChange={(e) => updatePageMeta(activePage.id, { type: e.target.value as any })}
                  className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] outline-hidden font-mono uppercase text-[11px]"
                >
                  <option value="landing">Landing Page (Front Page)</option>
                  <option value="blog">Blog Archive Hub</option>
                  <option value="article">Article Template</option>
                  <option value="camera-detail">Product Detail Page</option>
                  <option value="category">Category Archive</option>
                  <option value="custom">Custom Standalone Page</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#1A1A1A] block mb-1">Deskripsi Ringkas</label>
                <textarea
                  rows={2}
                  value={activePage.description || ''}
                  onChange={(e) => updatePageMeta(activePage.id, { description: e.target.value })}
                  className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] outline-hidden"
                />
              </div>

              <div className="pt-2 border-t border-[#EEEBE6] flex items-center justify-between">
                <span className="text-[#666]">Status Publikasi:</span>
                <button
                  type="button"
                  onClick={() => togglePagePublished(activePage.id)}
                  className={`px-3 py-1 text-xs font-mono uppercase font-bold cursor-pointer ${
                    activePage.status === 'published'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {activePage.status}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SAVE REUSABLE SECTION MODAL */}
      {showSaveReusableModal && selectedSection && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 space-y-4 border border-black shadow-2xl">
            <h3 className="text-base font-serif font-bold text-[#1A1A1A]">
              Simpan Section Sebagai Reusable Library
            </h3>
            <p className="text-xs text-[#666]">
              Section ini akan disimpan ke pustaka dan dapat digunakan berulang kali di halaman lain.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#1A1A1A] block mb-1">Nama Reusable Section</label>
                <input
                  type="text"
                  placeholder="e.g. Newsletter Box Gelap"
                  value={reusableTitle || selectedSection.name}
                  onChange={(e) => setReusableTitle(e.target.value)}
                  className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1A1A1A] block mb-1">Kategori</label>
                <select
                  value={reusableCategory}
                  onChange={(e) => setReusableCategory(e.target.value)}
                  className="w-full p-2 bg-[#FAF9F6] border border-[#DDD] outline-hidden"
                >
                  <option value="Marketing">Marketing / CTA</option>
                  <option value="Editorial">Editorial / Jurnal</option>
                  <option value="Gear">Gear & Review</option>
                  <option value="Layout">Layout & Header</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSaveReusableModal(false)}
                className="px-4 py-2 border border-[#DDD] text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  saveReusableSection(
                    selectedSection,
                    reusableTitle || selectedSection.name,
                    reusableCategory
                  );
                  setShowSaveReusableModal(false);
                }}
                className="px-5 py-2 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Simpan Ke Pustaka
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
