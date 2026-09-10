import React from 'react';
import {
  BuilderPage,
  BuilderSection,
  BuilderBlock,
  Breakpoint,
  GlobalDesignSystem,
} from '../../types/builderTypes';
import { BuilderWidgetRenderer } from './BuilderWidgetRenderer';
import {
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  BookmarkPlus,
  Plus,
  Move,
  Settings,
} from 'lucide-react';

interface BuilderPageRendererProps {
  page: BuilderPage;
  breakpoint: Breakpoint;
  isEditor?: boolean;
  selectedSectionId?: string | null;
  selectedBlockId?: string | null;
  onSelectSection?: (sectionId: string) => void;
  onSelectBlock?: (blockId: string) => void;
  onMoveSection?: (sectionId: string, direction: 'up' | 'down') => void;
  onDuplicateSection?: (sectionId: string) => void;
  onDeleteSection?: (sectionId: string) => void;
  onSaveReusableSection?: (section: BuilderSection) => void;
  onMoveBlock?: (blockId: string, direction: 'up' | 'down') => void;
  onDuplicateBlock?: (blockId: string) => void;
  onDeleteBlock?: (blockId: string) => void;
  onOpenWidgetPicker?: (sectionId: string) => void;
  globalDesign?: GlobalDesignSystem;
}

export const BuilderPageRenderer: React.FC<BuilderPageRendererProps> = ({
  page,
  breakpoint,
  isEditor = false,
  selectedSectionId = null,
  selectedBlockId = null,
  onSelectSection,
  onSelectBlock,
  onMoveSection,
  onDuplicateSection,
  onDeleteSection,
  onSaveReusableSection,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onOpenWidgetPicker,
  globalDesign,
}) => {
  const sections = page.sections || [];

  return (
    <div className="w-full bg-[#FDFCFB] text-[#1A1A1A] font-sans">
      {sections.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <p className="text-sm text-[#888] font-serif">Halaman ini belum memiliki section.</p>
          {isEditor && onOpenWidgetPicker && (
            <button
              type="button"
              onClick={() => onOpenWidgetPicker('new')}
              className="px-4 py-2 bg-black text-white text-xs font-semibold uppercase tracking-wider"
            >
              + Tambah Section Pertama
            </button>
          )}
        </div>
      ) : (
        sections.map((section, secIndex) => {
          const isSectionVisible = section.visibility[breakpoint];
          const isSelectedSec = selectedSectionId === section.id;

          // Responsive padding for section
          const paddingY = section.style.paddingY?.[breakpoint] || section.style.paddingY?.desktop || 48;

          const sectionInlineStyle: React.CSSProperties = {
            backgroundColor: section.style.backgroundColor || undefined,
            backgroundImage: section.style.backgroundImage ? `url("${section.style.backgroundImage}")` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            paddingTop: `${paddingY}px`,
            paddingBottom: `${paddingY}px`,
            borderTop: section.style.borderTop ? '1px solid #EEEBE6' : undefined,
            borderBottom: section.style.borderBottom ? '1px solid #EEEBE6' : undefined,
            borderColor: section.style.borderColor || undefined,
            minHeight: section.style.minHeight ? `${section.style.minHeight}px` : undefined,
          };

          // If hidden on current breakpoint in frontend mode, don't render
          if (!isSectionVisible && !isEditor) {
            return null;
          }

          return (
            <section
              key={section.id}
              id={section.id}
              style={sectionInlineStyle}
              onClick={(e) => {
                if (isEditor && onSelectSection) {
                  e.stopPropagation();
                  onSelectSection(section.id);
                }
              }}
              className={`relative transition-all group/sec ${
                isEditor
                  ? `hover:outline-1 hover:outline-neutral-400 ${
                      isSelectedSec
                        ? 'outline-2 outline-black shadow-md z-10'
                        : ''
                    }`
                  : ''
              } ${!isSectionVisible && isEditor ? 'opacity-40 border-2 border-dashed border-amber-400' : ''}`}
            >
              {/* SECTION CONTROLS (Only in visual builder mode) */}
              {isEditor && (
                <div
                  className={`absolute top-0 right-4 -translate-y-1/2 z-20 flex items-center gap-1 bg-[#1A1A1A] text-white px-2 py-1 shadow-lg text-[10px] font-mono transition-opacity ${
                    isSelectedSec ? 'opacity-100' : 'opacity-0 group-hover/sec:opacity-100'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="font-semibold text-neutral-300 px-1 border-r border-[#333] max-w-[120px] truncate">
                    {section.name}
                  </span>

                  <button
                    type="button"
                    onClick={() => onMoveSection && onMoveSection(section.id, 'up')}
                    disabled={secIndex === 0}
                    title="Pindahkan Section Ke Atas"
                    className="p-1 hover:bg-[#333] disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onMoveSection && onMoveSection(section.id, 'down')}
                    disabled={secIndex === sections.length - 1}
                    title="Pindahkan Section Ke Bawah"
                    className="p-1 hover:bg-[#333] disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDuplicateSection && onDuplicateSection(section.id)}
                    title="Duplikasi Section"
                    className="p-1 hover:bg-[#333] cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onSaveReusableSection && onSaveReusableSection(section)}
                    title="Simpan Sebagai Reusable Section"
                    className="p-1 hover:bg-[#333] text-amber-400 cursor-pointer"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteSection && onDeleteSection(section.id)}
                    title="Hapus Section"
                    className="p-1 hover:bg-red-900 text-red-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* SECTION BLOCKS */}
              <div className="w-full">
                {section.blocks.length === 0 ? (
                  isEditor ? (
                    <div className="py-8 px-4 text-center border border-dashed border-neutral-300 max-w-md mx-auto my-4 space-y-2">
                      <p className="text-xs text-[#888]">Section ini masih kosong.</p>
                      {onOpenWidgetPicker && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenWidgetPicker(section.id);
                          }}
                          className="px-3 py-1.5 bg-black text-white text-[11px] uppercase font-semibold tracking-wider hover:bg-neutral-800 transition-colors flex items-center gap-1.5 mx-auto cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah Widget</span>
                        </button>
                      )}
                    </div>
                  ) : null
                ) : (
                  section.blocks.map((block, blkIndex) => {
                    const isSelectedBlock = selectedBlockId === block.id;

                    return (
                      <div
                        key={block.id}
                        id={block.customId || undefined}
                        className={`relative group/block transition-all ${
                          isEditor
                            ? `hover:outline-1 hover:outline-blue-400 ${
                                isSelectedBlock
                                  ? 'outline-2 outline-blue-600 ring-2 ring-blue-100 z-10'
                                  : ''
                              }`
                            : ''
                        }`}
                        onClick={(e) => {
                          if (isEditor && onSelectBlock) {
                            e.stopPropagation();
                            onSelectBlock(block.id);
                          }
                        }}
                      >
                        {/* INLINE BLOCK CONTROLS (Only in editor) */}
                        {isEditor && (
                          <div
                            className={`absolute -top-3 left-4 z-30 flex items-center gap-1 bg-blue-600 text-white px-2 py-0.5 rounded-xs text-[9px] font-mono shadow-md transition-opacity ${
                              isSelectedBlock ? 'opacity-100' : 'opacity-0 group-hover/block:opacity-100'
                            }`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="font-semibold uppercase tracking-wider">{block.label}</span>

                            <button
                              type="button"
                              onClick={() => onMoveBlock && onMoveBlock(block.id, 'up')}
                              disabled={blkIndex === 0}
                              title="Pindah Ke Atas"
                              className="p-0.5 hover:bg-blue-700 disabled:opacity-30 cursor-pointer"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              onClick={() => onMoveBlock && onMoveBlock(block.id, 'down')}
                              disabled={blkIndex === section.blocks.length - 1}
                              title="Pindah Ke Bawah"
                              className="p-0.5 hover:bg-blue-700 disabled:opacity-30 cursor-pointer"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              onClick={() => onDuplicateBlock && onDuplicateBlock(block.id)}
                              title="Duplikasi Widget"
                              className="p-0.5 hover:bg-blue-700 cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              onClick={() => onDeleteBlock && onDeleteBlock(block.id)}
                              title="Hapus Widget"
                              className="p-0.5 hover:bg-red-700 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        <BuilderWidgetRenderer
                          block={block}
                          breakpoint={breakpoint}
                          isInteractive={!isEditor}
                          isSelected={isSelectedBlock}
                          onSelect={() => onSelectBlock && onSelectBlock(block.id)}
                        />
                      </div>
                    );
                  })
                )}

                {/* ADD WIDGET BUTTON AT BOTTOM OF SECTION (In editor) */}
                {isEditor && onOpenWidgetPicker && section.blocks.length > 0 && (
                  <div className="pt-4 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenWidgetPicker(section.id);
                      }}
                      className="opacity-0 group-hover/sec:opacity-100 transition-opacity px-3 py-1 bg-white border border-[#DDD] hover:border-black text-[10px] font-mono text-[#444] uppercase tracking-wider inline-flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-black" />
                      <span>+ Widget Di Section Ini</span>
                    </button>
                  </div>
                )}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
};
