import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Breakpoint,
  BuilderBlock,
  BuilderPage,
  BuilderRevision,
  BuilderSection,
  BuilderTemplate,
  GlobalDesignSystem,
  PluginBuilderWidgetDef,
  ReusableSection,
  WidgetType,
  PageType,
} from '../types/builderTypes';
import {
  DEFAULT_GLOBAL_DESIGN,
  INITIAL_BUILDER_PAGES,
  DEFAULT_REUSABLE_SECTIONS,
  PREBUILT_TEMPLATES,
  DEFAULT_LANDING_SECTIONS,
} from './defaultBuilderData';
import { pluginWidgetRegistry, initializeCorePluginWidgets } from './pluginWidgetRegistry';
import { usePluginSystem } from '../plugins/PluginContext';

const STORAGE_KEYS = {
  PAGES: 'fujifinder_builder_pages_v2',
  GLOBAL_DESIGN: 'fujifinder_builder_global_design_v2',
  REUSABLE_SECTIONS: 'fujifinder_builder_reusable_sections_v2',
  REVISIONS: 'fujifinder_builder_revisions_v2',
};

interface BuilderContextType {
  pages: BuilderPage[];
  activePageId: string;
  activePage: BuilderPage;
  setActivePageId: (id: string) => void;
  breakpoint: Breakpoint;
  setBreakpoint: (bp: Breakpoint) => void;
  selectedSectionId: string | null;
  setSelectedSectionId: (id: string | null) => void;
  selectedBlockId: string | null;
  setSelectedBlockId: (id: string | null) => void;
  selectedBlock: BuilderBlock | null;
  selectedSection: BuilderSection | null;

  // Global Design System
  globalDesign: GlobalDesignSystem;
  updateGlobalDesign: (updated: Partial<GlobalDesignSystem>) => void;
  resetGlobalDesign: () => void;

  // Reusable Sections & Templates
  reusableSections: ReusableSection[];
  saveReusableSection: (section: BuilderSection, title: string, category: string) => void;
  deleteReusableSection: (id: string) => void;
  templates: BuilderTemplate[];
  applyTemplate: (template: BuilderTemplate) => void;

  // Revisions & Autosave
  revisions: BuilderRevision[];
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isDirty: boolean;
  lastSavedText: string;
  saveDraft: () => void;
  publishPage: () => void;
  togglePagePublished: (pageId: string) => void;
  toggleUseBuilderLayout: (pageId: string) => void;
  revertToRevision: (revisionId: string) => void;

  // Page Management
  createNewPage: (title: string, slug: string, type: PageType, templateId?: string) => string;
  duplicatePage: (pageId: string) => string;
  deletePage: (pageId: string) => void;
  updatePageMeta: (pageId: string, meta: Partial<BuilderPage>) => void;

  // Section Management
  addSection: (sectionData?: Partial<BuilderSection>, insertIndex?: number) => void;
  updateSection: (sectionId: string, updated: Partial<BuilderSection>) => void;
  deleteSection: (sectionId: string) => void;
  moveSection: (sectionId: string, direction: 'up' | 'down') => void;
  duplicateSection: (sectionId: string) => void;

  // Block Management
  addBlock: (sectionId: string, widgetType: WidgetType, pluginWidgetId?: string, insertIndex?: number) => void;
  updateBlock: (blockId: string, updated: Partial<BuilderBlock>) => void;
  deleteBlock: (blockId: string) => void;
  moveBlock: (blockId: string, direction: 'up' | 'down') => void;
  duplicateBlock: (blockId: string) => void;

  // Registered Plugin Widgets
  pluginWidgets: PluginBuilderWidgetDef[];

  // Full Screen Preview
  previewMode: boolean;
  setPreviewMode: (on: boolean) => void;
}

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

export const BuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activePlugins, isPluginActive } = usePluginSystem();

  // Initialize Core Plugin Widgets once
  useEffect(() => {
    initializeCorePluginWidgets();
  }, []);

  // Load Pages
  const [pages, setPages] = useState<BuilderPage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PAGES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((p) => ({
            ...p,
            sections: p.sections?.map((sec: any) => ({
              ...sec,
              blocks: sec.blocks?.map((blk: any) => {
                if (blk.type === 'hero' && blk.content) {
                  if (blk.content.secondaryBtnText === 'Bandingkan Spesifikasi' || blk.content.secondaryBtnLink === '#compare') {
                    return {
                      ...blk,
                      content: {
                        ...blk.content,
                        secondaryBtnText: 'Langganan Newsletter',
                        secondaryBtnLink: '#newsletter',
                      },
                    };
                  }
                }
                if (blk.type === 'newsletter-signup' && blk.content) {
                  const needsTitleUpdate = !blk.content.title || blk.content.title.includes('Resep Simulasi');
                  const needsSubtitleUpdate = !blk.content.subtitle || blk.content.subtitle.toLowerCase().includes('resep');
                  if (needsTitleUpdate || needsSubtitleUpdate) {
                    return {
                      ...blk,
                      content: {
                        ...blk.content,
                        title: needsTitleUpdate ? 'The FujiFinder Dispatch' : blk.content.title,
                        subtitle: needsSubtitleUpdate
                          ? 'Wawasan teknis independen, uji lab kamera mendalam, dan panduan gear mingguan langsung di inbox Anda.'
                          : blk.content.subtitle,
                        btnText: blk.content.btnText || 'Langganan Dispatch',
                      },
                    };
                  }
                }
                return blk;
              }),
            })),
          }));
        }
      }
    } catch (e) {
      console.error('Error loading builder pages:', e);
    }
    return INITIAL_BUILDER_PAGES;
  });

  const [activePageId, setActivePageId] = useState<string>(() => {
    return pages[0]?.id || 'page-landing';
  });

  // Load Global Design System
  const [globalDesign, setGlobalDesign] = useState<GlobalDesignSystem>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GLOBAL_DESIGN);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading global design:', e);
    }
    return DEFAULT_GLOBAL_DESIGN;
  });

  // Load Reusable Sections
  const [reusableSections, setReusableSections] = useState<ReusableSection[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REUSABLE_SECTIONS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading reusable sections:', e);
    }
    return DEFAULT_REUSABLE_SECTIONS;
  });

  // Load Revisions
  const [revisions, setRevisions] = useState<BuilderRevision[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REVISIONS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading builder revisions:', e);
    }
    return [
      {
        id: 'rev-init-landing',
        pageId: 'page-landing',
        timestamp: new Date().toISOString(),
        author: 'Admin FujiFinder',
        description: 'Initial FujiFinder Editorial Layout',
        sections: DEFAULT_LANDING_SECTIONS,
      },
    ];
  });

  // UI States
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());

  // History Stack for Undo/Redo
  const [historyStack, setHistoryStack] = useState<BuilderSection[][]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);

  // Active registered plugin widgets
  const [allPluginWidgets, setAllPluginWidgets] = useState<PluginBuilderWidgetDef[]>(() => {
    return pluginWidgetRegistry.getAll();
  });

  useEffect(() => {
    const unsub = pluginWidgetRegistry.subscribe(() => {
      setAllPluginWidgets(pluginWidgetRegistry.getAll());
    });
    return unsub;
  }, []);

  // Filter plugin widgets to only those whose plugin is currently active!
  const pluginWidgets = useMemo(() => {
    return allPluginWidgets.filter((w) => isPluginActive(w.pluginId));
  }, [allPluginWidgets, activePlugins, isPluginActive]);

  // Active Page Reference
  const activePage = useMemo(() => {
    return pages.find((p) => p.id === activePageId) || pages[0] || INITIAL_BUILDER_PAGES[0];
  }, [pages, activePageId]);

  // Selected Block & Section references
  const selectedSection = useMemo(() => {
    if (!selectedSectionId) return null;
    return activePage?.sections.find((s) => s.id === selectedSectionId) || null;
  }, [activePage, selectedSectionId]);

  const selectedBlock = useMemo(() => {
    if (!selectedBlockId) return null;
    for (const sec of activePage?.sections || []) {
      const found = sec.blocks.find((b) => b.id === selectedBlockId);
      if (found) return found;
    }
    return null;
  }, [activePage, selectedBlockId]);

  // Push new state to history for undo/redo
  const pushHistory = useCallback((sections: BuilderSection[]) => {
    setHistoryStack((prev) => {
      const current = prev.slice(0, historyPointer + 1);
      return [...current, JSON.parse(JSON.stringify(sections))];
    });
    setHistoryPointer((prev) => prev + 1);
    setIsDirty(true);
  }, [historyPointer]);

  // Initialize history when changing active page
  useEffect(() => {
    if (activePage) {
      setHistoryStack([JSON.parse(JSON.stringify(activePage.sections))]);
      setHistoryPointer(0);
      setIsDirty(false);
      // Select first section by default if none selected
      if (!selectedSectionId && activePage.sections.length > 0) {
        setSelectedSectionId(activePage.sections[0].id);
      }
    }
  }, [activePageId]);

  // Save Pages to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(pages));
    } catch (e) {
      console.error('Failed to persist builder pages', e);
    }
  }, [pages]);

  // Save Global Design to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GLOBAL_DESIGN, JSON.stringify(globalDesign));
    } catch (e) {
      console.error('Failed to persist global design', e);
    }
  }, [globalDesign]);

  // Save Reusable Sections to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REUSABLE_SECTIONS, JSON.stringify(reusableSections));
    } catch (e) {
      console.error('Failed to persist reusable sections', e);
    }
  }, [reusableSections]);

  // Save Revisions to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REVISIONS, JSON.stringify(revisions));
    } catch (e) {
      console.error('Failed to persist revisions', e);
    }
  }, [revisions]);

  // Helper to update sections of active page
  const updateActivePageSections = useCallback((newSections: BuilderSection[], recordHistory: boolean = true) => {
    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id === activePageId) {
          return {
            ...page,
            sections: newSections,
            lastModified: new Date().toISOString(),
          };
        }
        return page;
      })
    );
    if (recordHistory) {
      pushHistory(newSections);
    }
  }, [activePageId, pushHistory]);

  // Undo / Redo
  const canUndo = historyPointer > 0;
  const canRedo = historyPointer < historyStack.length - 1;

  const undo = useCallback(() => {
    if (canUndo) {
      const newPointer = historyPointer - 1;
      const targetSections = historyStack[newPointer];
      if (targetSections) {
        setHistoryPointer(newPointer);
        updateActivePageSections(JSON.parse(JSON.stringify(targetSections)), false);
        setIsDirty(true);
      }
    }
  }, [canUndo, historyPointer, historyStack, updateActivePageSections]);

  const redo = useCallback(() => {
    if (canRedo) {
      const newPointer = historyPointer + 1;
      const targetSections = historyStack[newPointer];
      if (targetSections) {
        setHistoryPointer(newPointer);
        updateActivePageSections(JSON.parse(JSON.stringify(targetSections)), false);
        setIsDirty(true);
      }
    }
  }, [canRedo, historyPointer, historyStack, updateActivePageSections]);

  // Save Draft & Publish
  const saveDraft = useCallback(() => {
    const now = new Date();
    setLastSaved(now);
    setIsDirty(false);

    // Create a revision record
    const newRev: BuilderRevision = {
      id: `rev-${Date.now()}`,
      pageId: activePageId,
      timestamp: now.toISOString(),
      author: 'Admin FujiFinder',
      description: `Draft Saved (${activePage.sections.length} sections, ${activePage.sections.reduce((acc, s) => acc + s.blocks.length, 0)} blocks)`,
      sections: JSON.parse(JSON.stringify(activePage.sections)),
    };

    setRevisions((prev) => [newRev, ...prev.slice(0, 49)]); // Keep last 50
  }, [activePageId, activePage]);

  const publishPage = useCallback(() => {
    const now = new Date();
    setLastSaved(now);
    setIsDirty(false);

    setPages((prev) =>
      prev.map((p) => {
        if (p.id === activePageId) {
          return {
            ...p,
            status: 'published',
            useBuilderLayout: true,
            publishedAt: now.toISOString(),
            lastModified: now.toISOString(),
          };
        }
        return p;
      })
    );

    // Create a revision record
    const newRev: BuilderRevision = {
      id: `rev-pub-${Date.now()}`,
      pageId: activePageId,
      timestamp: now.toISOString(),
      author: 'Admin FujiFinder',
      description: `Published Version (${activePage.title})`,
      sections: JSON.parse(JSON.stringify(activePage.sections)),
    };

    setRevisions((prev) => [newRev, ...prev.slice(0, 49)]);
  }, [activePageId, activePage]);

  const togglePagePublished = useCallback((pageId: string) => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.id === pageId) {
          const newStatus = p.status === 'published' ? 'draft' : 'published';
          return { ...p, status: newStatus, lastModified: new Date().toISOString() };
        }
        return p;
      })
    );
  }, []);

  const toggleUseBuilderLayout = useCallback((pageId: string) => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.id === pageId) {
          return { ...p, useBuilderLayout: !p.useBuilderLayout, lastModified: new Date().toISOString() };
        }
        return p;
      })
    );
  }, []);

  // Autosave periodically every 30s when dirty
  useEffect(() => {
    if (!isDirty) return;
    const timer = setTimeout(() => {
      saveDraft();
    }, 30000);
    return () => clearTimeout(timer);
  }, [isDirty, saveDraft]);

  const lastSavedText = useMemo(() => {
    const diffSeconds = Math.floor((new Date().getTime() - lastSaved.getTime()) / 1000);
    if (diffSeconds < 5) return 'Baru saja disimpan';
    if (diffSeconds < 60) return `${diffSeconds} detik lalu`;
    const mins = Math.floor(diffSeconds / 60);
    return `${mins} menit lalu`;
  }, [lastSaved, isDirty]);

  // Revert to revision
  const revertToRevision = useCallback((revisionId: string) => {
    const target = revisions.find((r) => r.id === revisionId);
    if (!target) return;
    updateActivePageSections(JSON.parse(JSON.stringify(target.sections)), true);
    setIsDirty(true);
  }, [revisions, updateActivePageSections]);

  // Page Management
  const createNewPage = useCallback((title: string, slug: string, type: PageType, templateId?: string): string => {
    const newId = `page-${Date.now()}`;
    let initialSections: BuilderSection[] = [];

    if (templateId) {
      const tpl = PREBUILT_TEMPLATES.find((t) => t.id === templateId);
      if (tpl) {
        initialSections = JSON.parse(JSON.stringify(tpl.sections));
      }
    }

    if (initialSections.length === 0) {
      initialSections = [
        {
          id: `sec-${Date.now()}`,
          name: 'Section Baru',
          visibility: { desktop: true, tablet: true, mobile: true },
          style: {
            backgroundColor: '#FFFFFF',
            paddingY: { desktop: 48, tablet: 36, mobile: 24 },
          },
          blocks: [],
        },
      ];
    }

    const newPage: BuilderPage = {
      id: newId,
      title,
      slug: slug.replace(/^\/+/, ''),
      type,
      status: 'draft',
      lastModified: new Date().toISOString(),
      author: 'Admin FujiFinder',
      sections: initialSections,
      useBuilderLayout: true,
    };

    setPages((prev) => [newPage, ...prev]);
    setActivePageId(newId);
    return newId;
  }, []);

  const duplicatePage = useCallback((pageId: string): string => {
    const original = pages.find((p) => p.id === pageId);
    if (!original) return '';

    const newId = `page-${Date.now()}`;
    const duplicated: BuilderPage = {
      ...JSON.parse(JSON.stringify(original)),
      id: newId,
      title: `${original.title} (Salinan)`,
      slug: `${original.slug}-copy-${Date.now().toString().slice(-4)}`,
      status: 'draft',
      lastModified: new Date().toISOString(),
      publishedAt: undefined,
      isDefaultCorePage: false,
    };

    setPages((prev) => [duplicated, ...prev]);
    setActivePageId(newId);
    return newId;
  }, [pages]);

  const deletePage = useCallback((pageId: string) => {
    setPages((prev) => {
      const filtered = prev.filter((p) => p.id !== pageId);
      if (activePageId === pageId && filtered.length > 0) {
        setActivePageId(filtered[0].id);
      }
      return filtered;
    });
  }, [activePageId]);

  const updatePageMeta = useCallback((pageId: string, meta: Partial<BuilderPage>) => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.id === pageId) {
          return { ...p, ...meta, lastModified: new Date().toISOString() };
        }
        return p;
      })
    );
  }, []);

  const applyTemplate = useCallback((template: BuilderTemplate) => {
    const clonedSections = JSON.parse(JSON.stringify(template.sections));
    // Assign fresh IDs to prevent collisions
    const refreshedSections = clonedSections.map((sec: BuilderSection) => ({
      ...sec,
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      blocks: sec.blocks.map((blk: BuilderBlock) => ({
        ...blk,
        id: `blk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      })),
    }));

    updateActivePageSections(refreshedSections, true);
    if (refreshedSections.length > 0) {
      setSelectedSectionId(refreshedSections[0].id);
    }
  }, [updateActivePageSections]);

  // Section CRUD
  const addSection = useCallback((sectionData?: Partial<BuilderSection>, insertIndex?: number) => {
    const newSection: BuilderSection = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: sectionData?.name || `Section Baru #${(activePage?.sections.length || 0) + 1}`,
      visibility: { desktop: true, tablet: true, mobile: true },
      style: {
        backgroundColor: '#FFFFFF',
        paddingY: { desktop: 48, tablet: 36, mobile: 24 },
        ...sectionData?.style,
      },
      blocks: sectionData?.blocks ? JSON.parse(JSON.stringify(sectionData.blocks)) : [],
      ...sectionData,
    };

    const currentSections = [...(activePage?.sections || [])];
    if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= currentSections.length) {
      currentSections.splice(insertIndex, 0, newSection);
    } else {
      currentSections.push(newSection);
    }

    updateActivePageSections(currentSections, true);
    setSelectedSectionId(newSection.id);
  }, [activePage, updateActivePageSections]);

  const updateSection = useCallback((sectionId: string, updated: Partial<BuilderSection>) => {
    const updatedSections = (activePage?.sections || []).map((sec) => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          ...updated,
          style: { ...sec.style, ...(updated.style || {}) },
          visibility: { ...sec.visibility, ...(updated.visibility || {}) },
        };
      }
      return sec;
    });
    updateActivePageSections(updatedSections, true);
  }, [activePage, updateActivePageSections]);

  const deleteSection = useCallback((sectionId: string) => {
    const updatedSections = (activePage?.sections || []).filter((s) => s.id !== sectionId);
    updateActivePageSections(updatedSections, true);
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(updatedSections[0]?.id || null);
    }
  }, [activePage, selectedSectionId, updateActivePageSections]);

  const moveSection = useCallback((sectionId: string, direction: 'up' | 'down') => {
    const sections = [...(activePage?.sections || [])];
    const index = sections.findIndex((s) => s.id === sectionId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const temp = sections[index];
      sections[index] = sections[index - 1];
      sections[index - 1] = temp;
      updateActivePageSections(sections, true);
    } else if (direction === 'down' && index < sections.length - 1) {
      const temp = sections[index];
      sections[index] = sections[index + 1];
      sections[index + 1] = temp;
      updateActivePageSections(sections, true);
    }
  }, [activePage, updateActivePageSections]);

  const duplicateSection = useCallback((sectionId: string) => {
    const sections = [...(activePage?.sections || [])];
    const index = sections.findIndex((s) => s.id === sectionId);
    if (index === -1) return;

    const source = sections[index];
    const cloned: BuilderSection = {
      ...JSON.parse(JSON.stringify(source)),
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: `${source.name} (Salinan)`,
      blocks: source.blocks.map((blk) => ({
        ...JSON.parse(JSON.stringify(blk)),
        id: `blk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      })),
    };

    sections.splice(index + 1, 0, cloned);
    updateActivePageSections(sections, true);
    setSelectedSectionId(cloned.id);
  }, [activePage, updateActivePageSections]);

  // Reusable Section Save
  const saveReusableSection = useCallback((section: BuilderSection, title: string, category: string) => {
    const newReusable: ReusableSection = {
      id: `reusable-${Date.now()}`,
      title,
      category: category || 'Custom',
      createdAt: new Date().toISOString(),
      section: JSON.parse(JSON.stringify(section)),
    };
    setReusableSections((prev) => [newReusable, ...prev]);
  }, []);

  const deleteReusableSection = useCallback((id: string) => {
    setReusableSections((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // Block CRUD
  const addBlock = useCallback((sectionId: string, widgetType: WidgetType, pluginWidgetId?: string, insertIndex?: number) => {
    let defaultContent: Record<string, any> = {};
    let defaultStyle: Record<string, any> = {};
    let blockLabel = 'Widget';

    if (widgetType === 'plugin-widget' && pluginWidgetId) {
      const pw = pluginWidgetRegistry.get(pluginWidgetId);
      if (pw) {
        blockLabel = pw.name;
        defaultContent = JSON.parse(JSON.stringify(pw.defaultContent));
        defaultStyle = JSON.parse(JSON.stringify(pw.defaultStyle || {}));
      }
    } else {
      switch (widgetType) {
        case 'hero':
          blockLabel = 'Hero Banner Showcase';
          defaultContent = {
            headline: 'Judul Utama Hero Fujifilm',
            subtitle: 'Subjudul atau pengantar ulasan teknis dengan detail pengujian sensor.',
            badge: 'Ulasan Eksklusif',
            primaryBtnText: 'Pelajari Selengkapnya',
            primaryBtnLink: '#',
            backgroundImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
            overlayOpacity: 0.6,
            alignment: 'left',
            minHeight: 480,
          };
          break;
        case 'article-grid':
          blockLabel = 'Grid Artikel Editorial';
          defaultContent = {
            category: 'all',
            count: 6,
            columns: 3,
            showExcerpt: true,
            showBadge: true,
            showAuthor: true,
            showReadTime: true,
            sortBy: 'date',
          };
          break;
        case 'article-list':
          blockLabel = 'Daftar Artikel Ringkas';
          defaultContent = {
            category: 'all',
            count: 5,
            showThumbnails: true,
          };
          break;
        case 'featured-articles':
          blockLabel = 'Artikel Pilihan Editor';
          defaultContent = {
            headline: 'Liputan Paling Banyak Dibaca',
            count: 3,
          };
          break;
        case 'product-cards':
          blockLabel = 'Katalog Kamera Teruji';
          defaultContent = {
            count: 6,
            columns: 3,
            showScores: true,
            showAffiliateBtn: true,
            showCompareBtn: true,
            filterCategory: 'all',
          };
          break;
        case 'product-recommendation':
          blockLabel = 'Rekomendasi Kamera Lab';
          defaultContent = {
            title: 'Kamera Terbaik Rekomendasi Editor',
            showRatings: true,
            showProsCons: true,
            showDirectAffiliateBtn: true,
          };
          break;
        case 'camera-comparison':
          blockLabel = 'Tabel Komparasi Kamera';
          defaultContent = {
            title: 'Perbandingan Head-to-Head Kamera',
            subtitle: 'Pilih kamera Fujifilm untuk menguji kecocokan spesifikasi Anda.',
          };
          break;
        case 'affiliate-product-cta':
          blockLabel = 'Banner Penawaran Affiliate';
          defaultContent = {
            title: 'Dapatkan Harga Resmi Terbaik Hari Ini',
            description: 'Garansi resmi distributor dan penawaran bundling lensa terbaik.',
            btnText: 'Lihat Promo Retailer',
            btnLink: '#cameras',
            badge: 'Penawaran Terverifikasi',
          };
          break;
        case 'category-cards':
          blockLabel = 'Kartu Kategori Kamera';
          defaultContent = {
            title: 'Eksplorasi Format Kamera',
            columns: 4,
          };
          break;
        case 'newsletter-signup':
          blockLabel = 'Formulir Langganan Newsletter';
          defaultContent = {
            title: 'Langganan Jurnal Mingguan FujiFinder',
            subtitle: 'Resep simulasi film eksklusif dan ulasan firmware terkini.',
            btnText: 'Langganan Sekarang',
          };
          break;
        case 'search-bar':
          blockLabel = 'Bilah Pencarian Cepat';
          defaultContent = {
            placeholder: 'Cari kamera, lensa, atau panduan...',
            showQuickTags: true,
            quickTags: ['X-T5', 'X100VI', 'X-S20', 'Film Simulation'],
          };
          break;
        case 'text':
          blockLabel = 'Blok Teks / Judul';
          defaultContent = {
            tag: 'h2',
            eyebrow: 'Kategori Liputan',
            title: 'Judul Bagian Yang Menarik',
            description: 'Paragraf penjelasan detail tentang isi bagian ini.',
            align: 'left',
          };
          break;
        case 'rich-text':
          blockLabel = 'Konten Rich Text';
          defaultContent = {
            body: '<p>Tuliskan panduan mendalam atau catatan teknis di sini. Mendukung pemformatan teks, tautan, dan kutipan editorial.</p>',
          };
          break;
        case 'image':
          blockLabel = 'Gambar Responsif';
          defaultContent = {
            url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
            caption: 'Fujifilm X-T5 dengan lensa XF 33mm f/1.4 R LM WR.',
            aspectRatio: '16:9',
          };
          break;
        case 'video':
          blockLabel = 'Embed Video Uji Lapangan';
          defaultContent = {
            embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            title: 'Uji Autofokus AI & Video 6.2K',
          };
          break;
        case 'button':
          blockLabel = 'Tombol Tindakan (CTA)';
          defaultContent = {
            text: 'Jelajahi Kamera Fujifilm',
            link: '#cameras',
            variant: 'primary',
            alignment: 'center',
          };
          break;
        case 'divider':
          blockLabel = 'Garis Pemisah (Divider)';
          defaultContent = {
            style: 'solid',
            width: '100%',
          };
          break;
        case 'spacer':
          blockLabel = 'Ruang Kosong (Spacer)';
          defaultContent = {
            height: 48,
          };
          break;
        case 'social-links':
          blockLabel = 'Tautan Media Sosial';
          defaultContent = {
            instagram: 'https://instagram.com/fujifinder',
            youtube: 'https://youtube.com',
            twitter: 'https://twitter.com',
          };
          break;
        case 'author-profile':
          blockLabel = 'Profil Penulis & Reviewer';
          defaultContent = {
            name: 'Raden P. & Tim Lab FujiFinder',
            role: 'Lead Gear Tester & Fotografer Komersial',
            bio: 'Menguji kamera digital sejak 2012 dengan lebih dari 80 ulasan bodi dan lensa X-Mount.',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          };
          break;
        case 'advertisement-block':
          blockLabel = 'Slot Banner Sponsor / Iklan';
          defaultContent = {
            title: 'Slot Iklan Terverifikasi',
            badge: 'Sponsor Resmi',
            link: '#',
            imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
          };
          break;
        case 'custom-html':
          blockLabel = 'Kustom HTML / Script Embed';
          defaultContent = {
            htmlCode: '<div class="p-4 bg-neutral-100 text-center font-mono text-xs border border-dashed border-neutral-300">Custom HTML Container</div>',
          };
          break;
        default:
          blockLabel = widgetType;
      }
    }

    const newBlock: BuilderBlock = {
      id: `blk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type: widgetType,
      label: blockLabel,
      pluginWidgetId,
      content: defaultContent,
      style: {
        maxWidth: '1280px',
        ...defaultStyle,
      },
      visibility: { desktop: true, tablet: true, mobile: true },
    };

    const updatedSections = (activePage?.sections || []).map((sec) => {
      if (sec.id === sectionId) {
        const blocks = [...sec.blocks];
        if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= blocks.length) {
          blocks.splice(insertIndex, 0, newBlock);
        } else {
          blocks.push(newBlock);
        }
        return { ...sec, blocks };
      }
      return sec;
    });

    updateActivePageSections(updatedSections, true);
    setSelectedBlockId(newBlock.id);
  }, [activePage, updateActivePageSections]);

  const updateBlock = useCallback((blockId: string, updated: Partial<BuilderBlock>) => {
    const updatedSections = (activePage?.sections || []).map((sec) => {
      const blockIndex = sec.blocks.findIndex((b) => b.id === blockId);
      if (blockIndex !== -1) {
        const currentBlock = sec.blocks[blockIndex];
        const newBlock = {
          ...currentBlock,
          ...updated,
          content: { ...currentBlock.content, ...(updated.content || {}) },
          style: { ...currentBlock.style, ...(updated.style || {}) },
          visibility: { ...currentBlock.visibility, ...(updated.visibility || {}) },
        };
        const newBlocks = [...sec.blocks];
        newBlocks[blockIndex] = newBlock;
        return { ...sec, blocks: newBlocks };
      }
      return sec;
    });

    updateActivePageSections(updatedSections, true);
  }, [activePage, updateActivePageSections]);

  const deleteBlock = useCallback((blockId: string) => {
    const updatedSections = (activePage?.sections || []).map((sec) => {
      return {
        ...sec,
        blocks: sec.blocks.filter((b) => b.id !== blockId),
      };
    });
    updateActivePageSections(updatedSections, true);
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  }, [activePage, selectedBlockId, updateActivePageSections]);

  const moveBlock = useCallback((blockId: string, direction: 'up' | 'down') => {
    const updatedSections = (activePage?.sections || []).map((sec) => {
      const index = sec.blocks.findIndex((b) => b.id === blockId);
      if (index === -1) return sec;

      const blocks = [...sec.blocks];
      if (direction === 'up' && index > 0) {
        const temp = blocks[index];
        blocks[index] = blocks[index - 1];
        blocks[index - 1] = temp;
        return { ...sec, blocks };
      } else if (direction === 'down' && index < blocks.length - 1) {
        const temp = blocks[index];
        blocks[index] = blocks[index + 1];
        blocks[index + 1] = temp;
        return { ...sec, blocks };
      }
      return sec;
    });

    updateActivePageSections(updatedSections, true);
  }, [activePage, updateActivePageSections]);

  const duplicateBlock = useCallback((blockId: string) => {
    const updatedSections = (activePage?.sections || []).map((sec) => {
      const index = sec.blocks.findIndex((b) => b.id === blockId);
      if (index === -1) return sec;

      const source = sec.blocks[index];
      const cloned: BuilderBlock = {
        ...JSON.parse(JSON.stringify(source)),
        id: `blk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        label: `${source.label} (Salinan)`,
      };

      const blocks = [...sec.blocks];
      blocks.splice(index + 1, 0, cloned);
      return { ...sec, blocks };
    });

    updateActivePageSections(updatedSections, true);
  }, [activePage, updateActivePageSections]);

  // Global Design system updates
  const updateGlobalDesign = useCallback((updated: Partial<GlobalDesignSystem>) => {
    setGlobalDesign((prev) => ({
      ...prev,
      ...updated,
      colors: { ...prev.colors, ...(updated.colors || {}) },
      typography: { ...prev.typography, ...(updated.typography || {}) },
      buttons: { ...prev.buttons, ...(updated.buttons || {}) },
      cards: { ...prev.cards, ...(updated.cards || {}) },
      header: { ...prev.header, ...(updated.header || {}) },
      footer: { ...prev.footer, ...(updated.footer || {}) },
    }));
  }, []);

  const resetGlobalDesign = useCallback(() => {
    setGlobalDesign(DEFAULT_GLOBAL_DESIGN);
  }, []);

  return (
    <BuilderContext.Provider
      value={{
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
        selectedBlock,
        selectedSection,
        globalDesign,
        updateGlobalDesign,
        resetGlobalDesign,
        reusableSections,
        saveReusableSection,
        deleteReusableSection,
        templates: PREBUILT_TEMPLATES,
        applyTemplate,
        revisions,
        undo,
        redo,
        canUndo,
        canRedo,
        isDirty,
        lastSavedText,
        saveDraft,
        publishPage,
        togglePagePublished,
        toggleUseBuilderLayout,
        revertToRevision,
        createNewPage,
        duplicatePage,
        deletePage,
        updatePageMeta,
        addSection,
        updateSection,
        deleteSection,
        moveSection,
        duplicateSection,
        addBlock,
        updateBlock,
        deleteBlock,
        moveBlock,
        duplicateBlock,
        pluginWidgets,
        previewMode,
        setPreviewMode,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
};

export const useSiteBuilder = (): BuilderContextType => {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useSiteBuilder must be used within a BuilderProvider');
  }
  return context;
};
