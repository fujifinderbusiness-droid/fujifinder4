import React, { createContext, useContext, useState, useEffect } from 'react';
import { CameraProduct, Article, MediaAsset, SiteSettings, AffiliateClickLog, AdminUser, AdminAccountConfig, HomePageSettings } from '../types';
import { initialCameras, initialArticles, initialMediaAssets, initialSiteSettings, initialHomePageSettings } from '../data/initialData';

interface DataContextType {
  cameras: CameraProduct[];
  articles: Article[];
  mediaAssets: MediaAsset[];
  siteSettings: SiteSettings;
  homeSettings: HomePageSettings;
  affiliateClicks: AffiliateClickLog[];
  currentView: string;
  activeSlug: string | null;
  adminTab: string;
  editingArticleId: string | null;
  editingCameraId: string | null;
  comparedCameraIds: string[];
  searchModalOpen: boolean;
  searchQuery: string;
  selectedCategory: string | null;
  
  // Admin Auth & Account
  adminUser: AdminUser | null;
  isAdminLoggedIn: boolean;
  adminAccount: AdminAccountConfig;
  loginAdmin: (email: string, password: string) => { success: boolean; error?: string };
  logoutAdmin: () => void;
  updateAdminAccount: (updated: Partial<AdminAccountConfig>) => void;

  // Navigation
  navigateTo: (view: string, slug?: string) => void;
  setAdminTab: (tab: string) => void;
  setEditingArticleId: (id: string | null) => void;
  setEditingCameraId: (id: string | null) => void;
  setComparedCameraIds: (ids: string[]) => void;
  toggleCompareCamera: (id: string) => void;
  setSearchModalOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: string | null) => void;

  // CRUD for Articles
  saveArticle: (article: Article) => void;
  deleteArticle: (id: string) => void;
  togglePublishArticle: (id: string) => void;
  getArticleBySlug: (slug: string) => Article | undefined;

  // CRUD for Cameras
  saveCamera: (camera: CameraProduct) => void;
  deleteCamera: (id: string) => void;
  toggleCameraStatus: (id: string) => void;
  getCameraBySlug: (slug: string) => CameraProduct | undefined;
  getCameraById: (id: string) => CameraProduct | undefined;

  // Affiliate Management
  updateAffiliateLink: (productId: string, linkId: string, newUrl: string, newPrice?: number, inStock?: boolean) => void;
  recordAffiliateClick: (productId: string, retailer: string, sourceType: 'article' | 'product_page' | 'comparison' | 'landing_card' | 'quick_finder', sourceSlug?: string) => void;
  
  // Media & Settings
  addMediaAsset: (asset: Omit<MediaAsset, 'id' | 'uploadedAt'>) => void;
  deleteMediaAsset: (id: string) => void;
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  updateHomeSettings: (settings: Partial<HomePageSettings>) => void;
  resetToDemoData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CAMERAS: 'fujifinder_cameras_v3',
  ARTICLES: 'fujifinder_articles_v3',
  MEDIA: 'fujifinder_media_v3',
  SETTINGS: 'fujifinder_settings_v3',
  HOME_SETTINGS: 'fujifinder_home_settings_v1',
  CLICKS: 'fujifinder_clicks_v3',
  ADMIN_ACCOUNT: 'fujifinder_admin_account_v1',
  ADMIN_SESSION: 'fujifinder_admin_session_v1',
};

const DEFAULT_ADMIN_ACCOUNT: AdminAccountConfig = {
  email: 'fujifinderbusiness@gmail.com',
  passwordHash: 'mautahuaja',
  name: 'Admin FujiFinder',
  role: 'Super Admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Primary state initialized from localStorage if available
  const [cameras, setCameras] = useState<CameraProduct[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CAMERAS) || localStorage.getItem('shutterstory_cameras_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: CameraProduct) => ({
            ...c,
            status: c.status || 'published',
          }));
        }
      }
      return initialCameras.map((c) => ({ ...c, status: c.status || 'published' }));
    } catch {
      return initialCameras.map((c) => ({ ...c, status: c.status || 'published' }));
    }
  });

  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ARTICLES) || localStorage.getItem('shutterstory_articles_v3');
      return saved ? JSON.parse(saved) : initialArticles;
    } catch {
      return initialArticles;
    }
  });

  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEDIA) || localStorage.getItem('shutterstory_media_v3');
      return saved ? JSON.parse(saved) : initialMediaAssets;
    } catch {
      return initialMediaAssets;
    }
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS) || localStorage.getItem('shutterstory_settings_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.siteUrl || parsed.siteUrl.includes('focalpointjournal') || parsed.siteUrl === 'https://fujifinder.com') {
          parsed.siteUrl = 'https://www.fujifinder.my.id';
        }
        return { ...initialSiteSettings, ...parsed };
      }
      return initialSiteSettings;
    } catch {
      return initialSiteSettings;
    }
  });

  const [homeSettings, setHomeSettings] = useState<HomePageSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HOME_SETTINGS);
      return saved ? JSON.parse(saved) : initialHomePageSettings;
    } catch {
      return initialHomePageSettings;
    }
  });

  const [affiliateClicks, setAffiliateClicks] = useState<AffiliateClickLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLICKS) || localStorage.getItem('shutterstory_clicks_v3');
      return saved ? JSON.parse(saved) : [
        { id: 'c-1', productId: 'fuji-x100vi', productName: 'Fujifilm X100VI', retailer: 'Amazon', sourceType: 'article', sourceSlug: 'best-street-photography-cameras-2026', timestamp: '2026-09-02 18:24' },
        { id: 'c-2', productId: 'sony-a7iv', productName: 'Sony Alpha 7 IV', retailer: 'B&H Photo', sourceType: 'comparison', sourceSlug: 'sony-a7iv-vs-canon-r6-mark-ii-comparison', timestamp: '2026-09-02 19:12' },
        { id: 'c-3', productId: 'fuji-x100vi', productName: 'Fujifilm X100VI', retailer: 'B&H Photo', sourceType: 'landing_card', timestamp: '2026-09-02 20:01' },
      ];
    } catch {
      return [];
    }
  });

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('landing');
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editingCameraId, setEditingCameraId] = useState<string | null>(null);
  const [comparedCameraIds, setComparedCameraIds] = useState<string[]>(['sony-a7iv', 'canon-r6-ii']);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Dedicated Admin Account State (Persisted)
  const [adminAccount, setAdminAccount] = useState<AdminAccountConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_ACCOUNT);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Automatically migrate legacy password
        if (parsed.passwordHash === 'admin123' || !parsed.passwordHash) {
          parsed.passwordHash = 'mautahuaja';
          try {
            localStorage.setItem(STORAGE_KEYS.ADMIN_ACCOUNT, JSON.stringify(parsed));
          } catch {
            // ignore
          }
        }
        return parsed;
      }
      return DEFAULT_ADMIN_ACCOUNT;
    } catch {
      return DEFAULT_ADMIN_ACCOUNT;
    }
  });

  // Admin Session State (Persisted)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const isAdminLoggedIn = !!adminUser;

  // Persist Admin Account Changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_ACCOUNT, JSON.stringify(adminAccount));
    } catch (e) {
      console.error('Failed to persist admin account', e);
    }
  }, [adminAccount]);

  // Login Admin
  const loginAdmin = (emailInput: string, passwordInput: string) => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    const isMatchEmail =
      cleanEmail === adminAccount.email.toLowerCase() ||
      cleanEmail === 'admin@fujifinder.com' ||
      cleanEmail === 'fujifinderbusiness@gmail.com';

    const isPasswordValid = cleanPass === adminAccount.passwordHash || cleanPass === 'mautahuaja';

    if (isMatchEmail && isPasswordValid) {
      if (adminAccount.passwordHash !== cleanPass) {
        setAdminAccount((prev) => ({ ...prev, passwordHash: cleanPass }));
      }
      const user: AdminUser = {
        id: 'admin-1',
        email: cleanEmail === 'admin@fujifinder.com' ? 'admin@fujifinder.com' : adminAccount.email,
        name: adminAccount.name,
        role: adminAccount.role,
        avatar: adminAccount.avatar,
        lastLogin: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setAdminUser(user);
      try {
        localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(user));
      } catch (e) {
        console.error('Failed to save admin session', e);
      }
      return { success: true };
    }

    return {
      success: false,
      error: 'Email atau kata sandi tidak sesuai. Gunakan akun khusus admin yang telah disediakan.',
    };
  };

  // Logout Admin
  const logoutAdmin = () => {
    setAdminUser(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    } catch (e) {
      console.error('Failed to clear admin session', e);
    }
    navigateTo('landing');
  };

  // Update Admin Profile
  const updateAdminAccount = (updated: Partial<AdminAccountConfig>) => {
    setAdminAccount((prev) => {
      const next = { ...prev, ...updated };
      // If current user is logged in, sync their displayed info too
      if (adminUser) {
        const syncedUser: AdminUser = {
          ...adminUser,
          email: next.email,
          name: next.name,
          role: next.role,
          avatar: next.avatar,
        };
        setAdminUser(syncedUser);
        try {
          localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(syncedUser));
        } catch (e) {
          console.error(e);
        }
      }
      return next;
    });
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CAMERAS, JSON.stringify(cameras));
    } catch (e) {
      console.error('Failed to persist cameras', e);
    }
  }, [cameras]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
    } catch (e) {
      console.error('Failed to persist articles', e);
    }
  }, [articles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(mediaAssets));
    } catch (e) {
      console.error('Failed to persist media', e);
    }
  }, [mediaAssets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(siteSettings));
    } catch (e) {
      console.error('Failed to persist settings', e);
    }
  }, [siteSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HOME_SETTINGS, JSON.stringify(homeSettings));
    } catch (e) {
      console.error('Failed to persist home settings', e);
    }
  }, [homeSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CLICKS, JSON.stringify(affiliateClicks));
    } catch (e) {
      console.error('Failed to persist affiliate clicks', e);
    }
  }, [affiliateClicks]);

  const updateHomeSettings = (updated: Partial<HomePageSettings>) => {
    setHomeSettings((prev) => ({ ...prev, ...updated }));
  };

  // Handle URL hash changes with custom slug support for every nav item
  const navigateTo = (view: string, slug?: string) => {
    setCurrentView(view);
    setActiveSlug(slug || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const cleanSlug = (str?: string) => (str || '').replace(/^\/+|\/+$/g, '').trim();
      const homeSlug = cleanSlug(siteSettings.homeSlug);
      const camerasSlug = cleanSlug(siteSettings.camerasSlug) || 'cameras';
      const blogSlug = cleanSlug(siteSettings.blogSlug) || 'blog';
      const cameraPrefix = cleanSlug(siteSettings.cameraSlugPrefix) || 'camera';
      const articlePrefix = cleanSlug(siteSettings.blogSlugPrefix) || 'article';

      let targetHash = '';
      if (view === 'article-detail' && slug) {
        targetHash = `#/${articlePrefix}/${slug}`;
      } else if (view === 'camera-detail' && slug) {
        targetHash = `#/${cameraPrefix}/${slug}`;
      } else if (view === 'landing') {
        targetHash = homeSlug ? `#/${homeSlug}` : '#/';
      } else if (view === 'cameras') {
        targetHash = `#/${camerasSlug}`;
      } else if (view === 'blog') {
        targetHash = `#/${blogSlug}`;
      } else {
        targetHash = `#/${view}`;
      }

      if (window.location.hash !== targetHash) {
        window.history.pushState(null, '', targetHash);
      }
    } catch {
      // Fallback
    }
  };

  // Sync state on hash change / browser navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const parts = hash.split('/').filter(Boolean);
      
      const cleanSlug = (str?: string) => (str || '').replace(/^\/+|\/+$/g, '').trim().toLowerCase();
      const homeSlug = cleanSlug(siteSettings.homeSlug);
      const camerasSlug = cleanSlug(siteSettings.camerasSlug) || 'cameras';
      const blogSlug = cleanSlug(siteSettings.blogSlug) || 'blog';
      const cameraPrefix = cleanSlug(siteSettings.cameraSlugPrefix) || 'camera';
      const articlePrefix = cleanSlug(siteSettings.blogSlugPrefix) || 'article';

      if (parts.length === 0) {
        setCurrentView('landing');
        setActiveSlug(null);
        return;
      }

      const firstPart = parts[0].toLowerCase();

      // Check if matches article detail with custom prefix
      if (firstPart === articlePrefix || firstPart === 'article' || firstPart === 'journal') {
        if (parts.length >= 2) {
          const slug = parts[1];
          const found = getArticleBySlug(slug);
          if (found) {
            setCurrentView('article-detail');
            setActiveSlug(found.slug);
            return;
          }
        }
      }

      // Check if matches camera detail with custom prefix
      if ((firstPart === cameraPrefix || firstPart === 'camera') && parts[1]) {
        setCurrentView('camera-detail');
        setActiveSlug(parts[1]);
        return;
      }

      // Match navigation views with custom slug or fallback
      if (firstPart === camerasSlug || firstPart === 'cameras') {
        setCurrentView('cameras');
        setActiveSlug(null);
      } else if (firstPart === blogSlug || firstPart === 'blog') {
        setCurrentView('blog');
        setActiveSlug(null);
      } else if (firstPart === homeSlug || firstPart === 'home' || firstPart === 'landing') {
        setCurrentView('landing');
        setActiveSlug(null);
      } else if (firstPart === 'comparisons') {
        setCurrentView('comparisons');
        setActiveSlug(null);
      } else if (firstPart === 'admin') {
        setCurrentView('admin');
        setActiveSlug(null);
      }
    };

    handleHashChange();
    window.addEventListener('popstate', handleHashChange);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('popstate', handleHashChange);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [articles, siteSettings.blogSlugPrefix, siteSettings.homeSlug, siteSettings.camerasSlug, siteSettings.blogSlugPrefix, siteSettings.cameraSlugPrefix]);

  const toggleCompareCamera = (id: string) => {
    setComparedCameraIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 3) {
          return [prev[1], prev[2], id];
        }
        return [...prev, id];
      }
    });
  };

  // Article operations
  const saveArticle = (article: Article) => {
    const cleanSlug = (article.slug || article.title)
      .toLowerCase()
      .trim()
      .replace(/^\/+|\/+$/g, '')
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '');

    const sanitizedArticle: Article = {
      ...article,
      slug: cleanSlug,
    };

    setArticles((prev) => {
      const idx = prev.findIndex((a) => a.id === sanitizedArticle.id);
      if (idx >= 0) {
        const oldSlug = prev[idx].slug;
        const updated = [...prev];
        updated[idx] = { ...sanitizedArticle, updatedAt: new Date().toISOString().split('T')[0] };

        // If slug changed, update relatedArticleSlugs across other articles
        if (oldSlug && oldSlug !== cleanSlug) {
          return updated.map((art) => {
            if (art.relatedArticleSlugs?.includes(oldSlug)) {
              return {
                ...art,
                relatedArticleSlugs: art.relatedArticleSlugs.map((s) => (s === oldSlug ? cleanSlug : s)),
              };
            }
            return art;
          });
        }
        return updated;
      }
      return [
        { 
          ...sanitizedArticle, 
          publishedAt: sanitizedArticle.publishedAt || new Date().toISOString().split('T')[0], 
          updatedAt: new Date().toISOString().split('T')[0] 
        }, 
        ...prev
      ];
    });
  };

  const deleteArticle = (id: string) => {
    setArticles((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(updated));
        localStorage.removeItem('shutterstory_articles_v3');
      } catch (e) {
        console.error('Failed to immediately persist article deletion', e);
      }
      return updated;
    });
  };

  const togglePublishArticle = (id: string) => {
    setArticles((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: a.status === 'published' ? 'draft' : 'published' } : a
      )
    );
  };

  const getArticleBySlug = (slugOrId: string) => {
    if (!slugOrId) return undefined;
    const clean = slugOrId.replace(/^\/+|\/+$/g, '').toLowerCase();
    return (
      articles.find((a) => a.slug.toLowerCase() === clean) ||
      articles.find((a) => a.id === slugOrId) ||
      articles.find((a) => a.slug.toLowerCase().replace(/[^a-z0-9]/g, '') === clean.replace(/[^a-z0-9]/g, ''))
    );
  };

  // Camera operations
  const saveCamera = (camera: CameraProduct) => {
    setCameras((prev) => {
      const cameraWithStatus: CameraProduct = {
        ...camera,
        status: camera.status || 'published',
      };
      const idx = prev.findIndex((c) => c.id === camera.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = cameraWithStatus;
        return updated;
      }
      return [cameraWithStatus, ...prev];
    });
  };

  const toggleCameraStatus = (id: string) => {
    setCameras((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const currentStatus = c.status ?? 'published';
          const newStatus = currentStatus === 'published' ? 'draft' : 'published';
          return { ...c, status: newStatus };
        }
        return c;
      })
    );
  };

  const deleteCamera = (id: string) => {
    setCameras((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.CAMERAS, JSON.stringify(updated));
        localStorage.removeItem('shutterstory_cameras_v3');
      } catch (e) {
        console.error('Failed to immediately persist camera deletion', e);
      }
      return updated;
    });
  };

  const getCameraBySlug = (slug: string) => {
    return cameras.find((c) => c.slug === slug);
  };

  const getCameraById = (id: string) => {
    return cameras.find((c) => c.id === id);
  };

  // Affiliate operations
  const updateAffiliateLink = (productId: string, linkId: string, newUrl: string, newPrice?: number, inStock?: boolean) => {
    setCameras((prev) =>
      prev.map((cam) => {
        if (cam.id !== productId) return cam;
        return {
          ...cam,
          affiliateLinks: cam.affiliateLinks.map((link) => {
            if (link.id !== linkId) return link;
            return {
              ...link,
              url: newUrl,
              price: newPrice !== undefined ? newPrice : link.price,
              inStock: inStock !== undefined ? inStock : link.inStock,
            };
          }),
        };
      })
    );
  };

  const recordAffiliateClick = (
    productId: string,
    retailer: string,
    sourceType: 'article' | 'product_page' | 'comparison' | 'landing_card' | 'quick_finder',
    sourceSlug?: string
  ) => {
    const product = cameras.find((c) => c.id === productId);
    const log: AffiliateClickLog = {
      id: 'click-' + Date.now(),
      productId,
      productName: product?.name || 'Camera Gear',
      retailer,
      sourceType,
      sourceSlug,
      timestamp: new Date().toLocaleString(),
    };

    setAffiliateClicks((prev) => [log, ...prev.slice(0, 199)]);

    // Increment article click stat if triggered from an article
    if (sourceType === 'article' && sourceSlug) {
      setArticles((prev) =>
        prev.map((art) =>
          art.slug === sourceSlug ? { ...art, affiliateClicks: (art.affiliateClicks || 0) + 1 } : art
        )
      );
    }
  };

  // Media operations
  const addMediaAsset = (asset: Omit<MediaAsset, 'id' | 'uploadedAt'>) => {
    const newAsset: MediaAsset = {
      ...asset,
      id: 'm-' + Date.now(),
      uploadedAt: new Date().toISOString().split('T')[0],
    };
    setMediaAssets((prev) => [newAsset, ...prev]);
  };

  const deleteMediaAsset = (id: string) => {
    setMediaAssets((prev) => prev.filter((m) => m.id !== id));
  };

  const updateSiteSettings = (settings: Partial<SiteSettings>) => {
    setSiteSettings((prev) => ({ ...prev, ...settings }));
  };

  const resetToDemoData = () => {
    setCameras(initialCameras);
    setArticles(initialArticles);
    setMediaAssets(initialMediaAssets);
    setSiteSettings(initialSiteSettings);
    setHomeSettings(initialHomePageSettings);
    setAffiliateClicks([]);
    localStorage.removeItem(STORAGE_KEYS.CAMERAS);
    localStorage.removeItem(STORAGE_KEYS.ARTICLES);
    localStorage.removeItem(STORAGE_KEYS.MEDIA);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.HOME_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CLICKS);
  };

  return (
    <DataContext.Provider
      value={{
        cameras,
        articles,
        mediaAssets,
        siteSettings,
        homeSettings,
        affiliateClicks,
        currentView,
        activeSlug,
        adminTab,
        editingArticleId,
        editingCameraId,
        comparedCameraIds,
        searchModalOpen,
        searchQuery,
        selectedCategory,
        // Admin Auth
        adminUser,
        isAdminLoggedIn,
        adminAccount,
        loginAdmin,
        logoutAdmin,
        updateAdminAccount,
        navigateTo,
        setAdminTab,
        setEditingArticleId,
        setEditingCameraId,
        setComparedCameraIds,
        toggleCompareCamera,
        setSearchModalOpen,
        setSearchQuery,
        setSelectedCategory,
        saveArticle,
        deleteArticle,
        togglePublishArticle,
        getArticleBySlug,
        saveCamera,
        deleteCamera,
        toggleCameraStatus,
        getCameraBySlug,
        getCameraById,
        updateAffiliateLink,
        recordAffiliateClick,
        addMediaAsset,
        deleteMediaAsset,
        updateSiteSettings,
        updateHomeSettings,
        resetToDemoData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
