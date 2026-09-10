import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Home,
  FileText, 
  Camera, 
  Link2, 
  Image as ImageIcon, 
  Layers, 
  Settings, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  ExternalLink, 
  ArrowLeft,
  Save,
  RotateCcw,
  Sparkles,
  Sliders,
  DollarSign,
  ChevronUp,
  ChevronDown,
  Star,
  Flame,
  Globe,
  List,
  ListOrdered,
  Tag,
  LogOut,
  User,
  ShieldCheck,
  Key,
  Upload,
  UploadCloud,
  ShoppingBag,
  X,
  Puzzle,
  Layout,
  Mail
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { usePluginSystem } from '../plugins/PluginContext';
import { PluginManager } from './PluginManager';
import { AnalyticsProDashboardWidget } from '../plugins/components/AnalyticsProDashboardWidget';
import { SeoToolkitDashboardWidget } from '../plugins/components/SeoToolkitDashboardWidget';
import { AffiliateCloakerDashboardWidget } from '../plugins/components/AffiliateCloakerDashboardWidget';
import { ImageOptimizerDashboardWidget } from '../plugins/components/ImageOptimizerDashboardWidget';
import { SeoToolkitEditorWidget } from '../plugins/components/SeoToolkitEditorWidget';
import { AffiliateCloakerEditorWidget } from '../plugins/components/AffiliateCloakerEditorWidget';
import { Article, CameraProduct, ArticleCategory, CameraCategory, ArticleBlock, MediaAsset, HomePageSettings } from '../types';
import { readFileAsOptimizedDataUrl } from '../utils/imageUtils';
import { HomeEditorCMS } from '../components/HomeEditorCMS';
import { ArticleSEOEditor } from '../components/ArticleSEOEditor';
import { SiteBuilderManager } from '../components/SiteBuilderManager';
import { NewsletterAdminManager } from '../components/NewsletterAdminManager';

export const AdminCMS: React.FC = () => {
  const { 
    cameras, 
    articles, 
    mediaAssets, 
    siteSettings, 
    homeSettings,
    updateHomeSettings,
    affiliateClicks,
    adminTab, 
    setAdminTab,
    editingArticleId,
    setEditingArticleId,
    editingCameraId,
    setEditingCameraId,
    saveArticle,
    deleteArticle,
    togglePublishArticle,
    saveCamera,
    deleteCamera,
    toggleCameraStatus,
    updateAffiliateLink,
    addMediaAsset,
    deleteMediaAsset,
    updateSiteSettings,
    resetToDemoData,
    navigateTo,
    adminUser,
    logoutAdmin,
    adminAccount,
    updateAdminAccount
  } = useData();

  const { activePluginsCount, availableUpdatesCount } = usePluginSystem();

  // Admin Account Settings state
  const [adminNameEdit, setAdminNameEdit] = useState(adminAccount.name);
  const [adminEmailEdit, setAdminEmailEdit] = useState(adminAccount.email);
  const [adminPasswordEdit, setAdminPasswordEdit] = useState(adminAccount.passwordHash);
  const [adminSaveSuccess, setAdminSaveSuccess] = useState(false);

  // In-app Delete Confirmation Modal State (Reliable across iframe sandboxes)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'article' | 'camera';
    id: string;
    title: string;
  } | null>(null);
  const [deleteSuccessToast, setDeleteSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    setAdminNameEdit(adminAccount.name);
    setAdminEmailEdit(adminAccount.email);
    setAdminPasswordEdit(adminAccount.passwordHash);
  }, [adminAccount]);

  // Search & Filter state in CMS
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilterStatus, setActiveFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [activeFilterCategory, setActiveFilterCategory] = useState<'all' | ArticleCategory>('all');

  // New/Editing Article Form State
  const defaultArticle: Article = {
    id: 'art-' + Date.now(),
    title: '',
    slug: '',
    subtitle: '',
    excerpt: '',
    category: 'Mirrorless',
    coverImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Editorial Staff',
      role: 'Staff Writer & Gear Analyst',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'FujiFinder editorial lab researcher and field tester.',
    },
    publishedAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    readTimeMinutes: 7,
    featured: false,
    showOnLandingPage: true,
    isHeroFeatured: false,
    isFeaturedStory: false,
    isTrending: false,
    isPopularNow: false,
    isFeaturedContent: false,
    isLatest: true,
    status: 'published',
    views: 120,
    affiliateClicks: 0,
    seo: {
      metaTitle: '',
      metaDescription: '',
      focusKeyword: '',
    },
    blocks: [
      { id: 'b1', type: 'paragraph', text: 'Write your editorial overview and field test introduction here...' },
      { id: 'b2', type: 'heading2', text: 'Hardware Design & Ergonomics' },
      { id: 'b3', type: 'paragraph', text: 'Detail the tactile feel of the physical dials, grip depth, and chassis materials.' },
    ],
    featuredCameraIds: ['fuji-x100vi'],
    relatedArticleSlugs: [],
  };

  const [articleForm, setArticleForm] = useState<Article>(() => {
    if (editingArticleId) {
      const found = articles.find((a) => a.id === editingArticleId);
      if (found) return JSON.parse(JSON.stringify(found));
    }
    return defaultArticle;
  });

  // Image Upload State & Handlers for Article Cover & Author Avatar
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    setCoverUploadError(null);
    try {
      const dataUrl = await readFileAsOptimizedDataUrl(file, 1600, 1600, 0.85);
      setArticleForm((prev) => ({ ...prev, coverImage: dataUrl }));
      addMediaAsset({
        title: file.name.replace(/\.[^/.]+$/, '') || 'Cover Image',
        url: dataUrl,
        category: 'editorial',
      });
    } catch (err: any) {
      setCoverUploadError(err.message || 'Gagal membaca file gambar.');
    } finally {
      setIsUploadingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  };

  const handleCoverDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCover(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    setCoverUploadError(null);
    try {
      const dataUrl = await readFileAsOptimizedDataUrl(file, 1600, 1600, 0.85);
      setArticleForm((prev) => ({ ...prev, coverImage: dataUrl }));
      addMediaAsset({
        title: file.name.replace(/\.[^/.]+$/, '') || 'Cover Image',
        url: dataUrl,
        category: 'editorial',
      });
    } catch (err: any) {
      setCoverUploadError(err.message || 'Gagal membaca file gambar.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    setAvatarUploadError(null);
    try {
      const dataUrl = await readFileAsOptimizedDataUrl(file, 400, 400, 0.9);
      setArticleForm((prev) => ({
        ...prev,
        author: {
          ...prev.author,
          avatar: dataUrl,
        },
      }));
    } catch (err: any) {
      setAvatarUploadError(err.message || 'Gagal membaca file avatar.');
    } finally {
      setIsUploadingAvatar(false);
      if (avatarFileInputRef.current) avatarFileInputRef.current.value = '';
    }
  };

  // Image Upload State for Camera Primary Image
  const cameraImageFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingCameraImage, setIsUploadingCameraImage] = useState(false);
  const [cameraImageUploadError, setCameraImageUploadError] = useState<string | null>(null);
  const [isDraggingCameraImage, setIsDraggingCameraImage] = useState(false);

  // Home Page Settings Editor State
  const [homeForm, setHomeForm] = useState<HomePageSettings>(homeSettings);
  const [homeSaveSuccess, setHomeSaveSuccess] = useState(false);
  const [selectedHomeSlideIndex, setSelectedHomeSlideIndex] = useState(0);

  useEffect(() => {
    if (homeSettings) {
      setHomeForm(homeSettings);
    }
  }, [homeSettings]);

  // New/Editing Camera Form State
  const defaultCamera: CameraProduct = {
    id: 'cam-' + Date.now(),
    name: '',
    slug: '',
    brand: 'Fujifilm',
    category: 'APS-C Mirrorless',
    price: 1499,
    priceRange: '$1,499 – $1,599',
    rating: 9.0,
    scoreBreakdown: {
      imageQuality: 9.2,
      autofocus: 9.0,
      buildErgonomics: 9.1,
      videoFeatures: 8.8,
      valueForMoney: 8.9,
    },
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
    secondaryImages: [],
    idealUseCase: 'Everyday, Travel & Street Photography',
    shortDescription: 'High resolution sensor in a lightweight weather-sealed body.',
    editorialOverview: 'A comprehensive field-tested tool that balances tactile physical dials with modern subject detection autofocus.',
    whoIsThisFor: 'Creative photographers seeking an inspiring everyday camera without unnecessary bulk.',
    pros: ['Stunning color fidelity', 'Fast subject detection autofocus', 'Tactile control dials'],
    cons: ['Single memory card slot', 'Modest battery life under continuous burst'],
    specs: {
      sensor: '26.1MP APS-C X-Trans CMOS',
      sensorFormat: 'APS-C',
      mount: 'Fujifilm X-Mount',
      megapixels: 26.1,
      isoRange: 'ISO 160–12,800',
      autofocus: 'Hybrid Phase Detection AF',
      ibis: '5-Axis In-Body Stabilization',
      continuousShooting: '15 fps mechanical',
      videoSpecs: '4K 60p 10-bit',
      viewfinder: '2.36m-Dot OLED EVF',
      rearDisplay: '3.0-inch Vari-angle Touchscreen',
      batteryLife: 'Approx. 400 frames',
      weight: '478 g with battery',
      dimensions: '126 x 85 x 65 mm',
      weatherSealing: 'Dust and moisture resistant',
      memorySlots: '1x SD (UHS-II)',
      connectivity: 'Wi-Fi, Bluetooth, USB-C, Micro-HDMI',
    },
    affiliateLinks: [
      {
        id: 'aff-' + Date.now(),
        retailer: 'Amazon',
        url: 'https://www.amazon.com?tag=fujifinder-20',
        price: 1499,
        currency: '$',
        inStock: true,
        badge: 'Authorized Stock',
      },
    ],
    featured: false,
    editorsChoice: false,
    releaseYear: 2024,
    relatedArticleSlugs: [],
    relatedProductIds: [],
    status: 'published',
  };

  const [cameraForm, setCameraForm] = useState<CameraProduct>(() => {
    if (editingCameraId) {
      const found = cameras.find((c) => c.id === editingCameraId);
      if (found) return JSON.parse(JSON.stringify(found));
    }
    return defaultCamera;
  });

  const handleCameraImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCameraImage(true);
    setCameraImageUploadError(null);
    try {
      const dataUrl = await readFileAsOptimizedDataUrl(file, 1600, 1200, 0.85);
      setCameraForm((prev) => ({ ...prev, image: dataUrl }));
      addMediaAsset({
        title: `${cameraForm.name || 'Camera'} Primary Image`,
        url: dataUrl,
        category: 'camera',
      });
    } catch (err: any) {
      setCameraImageUploadError(err.message || 'Gagal membaca file gambar kamera.');
    } finally {
      setIsUploadingCameraImage(false);
      if (cameraImageFileInputRef.current) cameraImageFileInputRef.current.value = '';
    }
  };

  const handleCameraImageDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCameraImage(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setIsUploadingCameraImage(true);
    setCameraImageUploadError(null);
    try {
      const dataUrl = await readFileAsOptimizedDataUrl(file, 1600, 1200, 0.85);
      setCameraForm((prev) => ({ ...prev, image: dataUrl }));
      addMediaAsset({
        title: `${cameraForm.name || 'Camera'} Primary Image`,
        url: dataUrl,
        category: 'camera',
      });
    } catch (err: any) {
      setCameraImageUploadError(err.message || 'Gagal membaca file gambar kamera.');
    } finally {
      setIsUploadingCameraImage(false);
    }
  };

  // Media upload input state
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaTitle, setNewMediaTitle] = useState('');
  const [newMediaCategory, setNewMediaCategory] = useState<'camera' | 'article' | 'sample_shot'>('camera');

  // Stats for Dashboard
  const totalArticles = articles.length;
  const publishedArticles = articles.filter((a) => a.status === 'published').length;
  const draftArticles = articles.filter((a) => a.status === 'draft').length;
  const totalCameras = cameras.length;
  const publishedCamerasCount = cameras.filter((c) => (c.status ?? 'published') === 'published').length;
  const draftCamerasCount = cameras.filter((c) => c.status === 'draft').length;
  const totalClicks = affiliateClicks.length;

  // Filter state for Cameras tab
  const [cameraSearchTerm, setCameraSearchTerm] = useState('');
  const [cameraFilterStatus, setCameraFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [cameraFilterBrand, setCameraFilterBrand] = useState<string>('all');

  // Handlers for Articles
  const handleStartCreateArticle = () => {
    setEditingArticleId(null);
    setArticleForm({
      ...defaultArticle,
      id: 'art-' + Date.now(),
      publishedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    });
    setAdminTab('article-edit');
  };

  const handleStartEditArticle = (art: Article) => {
    setEditingArticleId(art.id);
    setArticleForm(JSON.parse(JSON.stringify(art)));
    setAdminTab('article-edit');
  };

  const sanitizeSlug = (val: string) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-');
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleForm.title) {
      alert('Please enter an article title.');
      return;
    }
    const rawSlug = (articleForm.slug || articleForm.title).trim();
    const cleanSlug = rawSlug
      .toLowerCase()
      .replace(/^\/+|\/+$/g, '')
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '');

    const toSave: Article = {
      ...articleForm,
      slug: cleanSlug,
      updatedAt: new Date().toISOString().split('T')[0],
      seo: {
        ...articleForm.seo,
        metaTitle: articleForm.seo.metaTitle || articleForm.title,
        metaDescription: articleForm.seo.metaDescription || articleForm.excerpt,
        focusKeyword: articleForm.seo.focusKeyword || articleForm.title.split(' ').slice(0, 3).join(' '),
      },
    };
    saveArticle(toSave);
    alert('Article saved successfully!');
    setAdminTab('articles');
  };

  // Block insertion helper for article editor
  const handleAddBlock = (type: ArticleBlock['type'], extraProps: Partial<ArticleBlock> = {}) => {
    let initialText: string | undefined = undefined;
    let items: string[] | undefined = undefined;
    let imageUrl: string | undefined = undefined;
    let imageCaption: string | undefined = undefined;

    if (type === 'heading2') initialText = 'Section Heading';
    else if (type === 'heading3') initialText = 'Sub-heading';
    else if (type === 'paragraph') initialText = 'Add paragraph text here...';
    else if (type === 'quote') initialText = 'Add memorable editorial quote here...';
    else if (type === 'callout') initialText = 'Pro Tip: Always lock your exposure before framing fast action.';
    else if (type === 'bullet_list' || type === 'numbered_list') {
      items = ['Key observation or specification', 'Real-world field test result'];
    } else if (type === 'image') {
      imageUrl = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80';
      imageCaption = 'Field test demonstration with continuous eye-AF tracking.';
    }

    const newBlock: ArticleBlock = {
      id: 'b-' + Date.now(),
      type,
      text: initialText,
      items,
      imageUrl,
      imageCaption,
      ...extraProps,
    };
    setArticleForm((prev) => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
  };

  const handleUpdateBlock = (blockId: string, updates: Partial<ArticleBlock>) => {
    setArticleForm((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b)),
    }));
  };

  const handleRemoveBlock = (blockId: string) => {
    setArticleForm((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((b) => b.id !== blockId),
    }));
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    setArticleForm((prev) => {
      const newBlocks = [...prev.blocks];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newBlocks.length) return prev;
      const temp = newBlocks[index];
      newBlocks[index] = newBlocks[targetIndex];
      newBlocks[targetIndex] = temp;
      return { ...prev, blocks: newBlocks };
    });
  };

  const handleGenerateSlug = () => {
    if (!articleForm.title) return;
    const generated = sanitizeSlug(articleForm.title)
      .replace(/^-+|-+$/g, '');
    setArticleForm((prev) => ({ ...prev, slug: generated }));
  };

  // Handlers for Cameras
  const handleStartCreateCamera = () => {
    setEditingCameraId(null);
    setCameraForm({
      ...defaultCamera,
      id: 'cam-' + Date.now(),
      status: 'published',
    });
    setAdminTab('camera-edit');
  };

  const handleStartEditCamera = (cam: CameraProduct) => {
    setEditingCameraId(cam.id);
    setCameraForm({
      ...JSON.parse(JSON.stringify(cam)),
      status: cam.status ?? 'published',
    });
    setAdminTab('camera-edit');
  };

  const handleSaveCamera = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cameraForm.name) {
      alert('Please enter a camera name.');
      return;
    }
    const slug = cameraForm.slug || cameraForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const toSave: CameraProduct = {
      ...cameraForm,
      status: cameraForm.status ?? 'published',
      slug,
    };
    saveCamera(toSave);
    alert('Camera product saved successfully!');
    setAdminTab('cameras');
  };

  // Add media asset
  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaUrl) return;
    addMediaAsset({
      title: newMediaTitle || 'Camera Asset',
      url: newMediaUrl,
      category: newMediaCategory,
      dimensions: '1920x1080',
      fileSize: '1.5 MB',
    });
    setNewMediaUrl('');
    setNewMediaTitle('');
    alert('Media asset added to library!');
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] flex flex-col md:flex-row text-left">
      {/* CMS SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#1A1A1A] text-white p-5 shrink-0 flex flex-col justify-between border-r border-[#262626]">
        <div className="space-y-6">
          {/* Brand & Exit */}
          <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white text-[#1A1A1A] flex items-center justify-center font-bold text-sm">
                F
              </div>
              <div>
                <span className="font-serif font-normal text-base text-white">FujiFinder</span>
                <span className="block text-[10px] text-[#888] uppercase tracking-[0.2em] font-medium">
                  Editor CMS
                </span>
              </div>
            </div>

            <button
              onClick={() => navigateTo('landing')}
              className="text-xs text-[#888] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              title="Return to Public Website"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Site
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-medium">
            {[
              { id: 'dashboard', label: 'Log', icon: LayoutDashboard },
              { id: 'site-builder', label: 'Site Builder (Visual Canvas)', icon: Layout, highlightBadge: 'Visual' },
              { id: 'home', label: 'Home Page Editor', icon: Home },
              { id: 'articles', label: 'Article & Guide Manager', icon: FileText, count: totalArticles },
              { id: 'cameras', label: 'Camera Gear Catalog', icon: Camera, count: totalCameras },
              { id: 'newsletter', label: 'Email & Newsletter', icon: Mail, highlightBadge: 'Pro' },
              { id: 'affiliates', label: 'Affiliate Links Hub', icon: Link2 },
              { 
                id: 'plugins', 
                label: 'Plugins & Addons', 
                icon: Puzzle, 
                count: activePluginsCount, 
                updateBadge: availableUpdatesCount > 0 ? availableUpdatesCount : undefined 
              },
              { id: 'media', label: 'Media Asset Library', icon: ImageIcon },
              { id: 'categories', label: 'Taxonomy & Categories', icon: Layers },
              { id: 'settings', label: 'Platform & SEO Settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = adminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setAdminTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-white text-black font-semibold'
                      : 'text-[#888] hover:bg-[#262626] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.highlightBadge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 bg-rose-600 text-white font-bold rounded-xs">
                        {item.highlightBadge}
                      </span>
                    )}
                    {item.updateBadge !== undefined && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 bg-amber-500 text-black font-bold rounded-full">
                        {item.updateBadge}
                      </span>
                    )}
                    {item.count !== undefined && (
                      <span className={`text-[10px] px-2 py-0.5 ${isActive ? 'bg-[#1A1A1A] text-white' : 'bg-[#262626] text-[#888]'}`}>
                        {item.count}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Admin Account & Quick Footer Action */}
        <div className="pt-5 border-t border-[#262626] text-xs space-y-3">
          {/* Active Admin Profile Card */}
          <div className="bg-[#222] p-3 rounded-lg border border-[#2E2E2E] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white text-[#1A1A1A] flex items-center justify-center font-bold text-xs">
                  {adminUser?.name?.charAt(0) || 'A'}
                </div>
                <div className="overflow-hidden">
                  <div className="text-white text-xs font-semibold truncate leading-tight">
                    {adminUser?.name || 'Admin FujiFinder'}
                  </div>
                  <div className="text-[10px] text-[#888] truncate">
                    {adminUser?.email || adminAccount.email}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#2A2A2A]">
              <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400 font-medium uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {adminUser?.role || 'Super Admin'}
              </span>

              <button
                onClick={logoutAdmin}
                className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer transition-colors font-medium"
                title="Keluar dari Admin Dashboard"
              >
                <LogOut className="w-3 h-3" />
                <span>Keluar</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#888] px-1">
            <span>Affiliate Clicks Logged:</span>
            <span className="font-bold text-white">{totalClicks}</span>
          </div>

          <button
            onClick={resetToDemoData}
            className="w-full py-2 px-3 bg-[#262626] text-[#AAA] hover:text-white text-center flex items-center justify-center gap-1.5 cursor-pointer text-[11px] uppercase tracking-wider transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset Demo Data
          </button>
        </div>
      </aside>

      {/* MAIN CMS CONTENT AREA */}
      <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full overflow-y-auto">
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {adminTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EEEBE6]">
              <div>
                <h1 className="font-serif text-3xl font-normal text-[#1A1A1A]">Platform Command Center</h1>
                <p className="text-xs text-[#666] mt-1">Live editorial metrics, content production status, and affiliate revenue signals</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartCreateArticle}
                  className="px-4 py-2 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-wider font-semibold hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Write Article
                </button>
                <button
                  onClick={handleStartCreateCamera}
                  className="px-4 py-2 border border-[#EEEBE6] bg-white text-black text-[11px] uppercase tracking-wider font-semibold hover:border-black flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" /> Add Camera
                </button>
              </div>
            </div>

            {/* Metric Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 border border-[#EEEBE6]">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#888]">
                  <span>Total Articles</span>
                  <FileText className="w-4 h-4 text-[#888]" />
                </div>
                <div className="font-serif text-3xl font-normal text-[#1A1A1A] mt-2">{totalArticles}</div>
                <div className="text-[11px] text-[#2E7D32] mt-1">
                  {publishedArticles} published • {draftArticles} drafts
                </div>
              </div>

              <div className="bg-white p-5 border border-[#EEEBE6]">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#888]">
                  <span>Tested Cameras</span>
                  <Camera className="w-4 h-4 text-[#888]" />
                </div>
                <div className="font-serif text-3xl font-normal text-[#1A1A1A] mt-2">{totalCameras}</div>
                <div className="text-[11px] text-[#666] mt-1">Active in gear database</div>
              </div>

              <div className="bg-white p-5 border border-[#EEEBE6]">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#888]">
                  <span>Affiliate Clicks</span>
                  <TrendingUp className="w-4 h-4 text-[#2E7D32]" />
                </div>
                <div className="font-serif text-3xl font-normal text-[#1A1A1A] mt-2">{totalClicks}</div>
                <div className="text-[11px] text-[#2E7D32] mt-1">Outbound retail referrals</div>
              </div>

              <div className="bg-white p-5 border border-[#EEEBE6]">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#888]">
                  <span>Top Retail Partner</span>
                  <DollarSign className="w-4 h-4 text-[#D97706]" />
                </div>
                <div className="font-serif text-2xl font-normal text-[#1A1A1A] mt-2">Amazon / B&H</div>
                <div className="text-[11px] text-[#666] mt-1">Tag: {siteSettings.amazonAssociateTag}</div>
              </div>
            </div>

            {/* Recent Content & Affiliate Click Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Recently Published Articles */}
              <div className="lg:col-span-7 bg-white p-6 border border-[#EEEBE6] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#EEEBE6]">
                  <h3 className="font-serif text-lg font-normal text-[#1A1A1A]">Recent Editorial Articles</h3>
                  <button onClick={() => setAdminTab('articles')} className="text-xs text-[#888] hover:text-black">
                    Manage All →
                  </button>
                </div>
                <div className="space-y-3">
                  {articles.slice(0, 4).map((art) => (
                    <div key={art.id} className="flex items-center justify-between p-3 bg-[#FDFCFB] border border-[#EEEBE6]">
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="flex items-center gap-2 text-[10px] text-[#888]">
                          <span className="font-semibold uppercase tracking-wider">{art.category}</span>
                          <span>•</span>
                          <span>{art.publishedAt}</span>
                        </div>
                        <h4 className="font-serif text-sm font-normal text-[#1A1A1A] truncate mt-0.5">{art.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEditArticle(art)}
                          className="p-1.5 text-xs border border-[#EEEBE6] bg-white hover:border-black transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5 text-[#666]" />
                        </button>
                        <button
                          onClick={() => navigateTo('article-detail', art.slug)}
                          className="p-1.5 text-xs border border-[#EEEBE6] bg-white hover:border-black transition-colors"
                          title="View on Site"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#666]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time Affiliate Click Tracker */}
              <div className="lg:col-span-5 bg-white p-6 border border-[#EEEBE6] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#EEEBE6]">
                  <h3 className="font-serif text-lg font-normal text-[#1A1A1A]">Live Outbound Clicks</h3>
                  <span className="text-[10px] bg-[#E8F5E9] text-[#2E7D32] px-2 py-0.5 font-bold uppercase tracking-wider">
                    Active Tracking
                  </span>
                </div>

                {affiliateClicks.length === 0 ? (
                  <p className="text-xs text-[#888] py-4 text-center">No affiliate clicks logged yet. Click any "Check Price" button to test.</p>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto">
                    {affiliateClicks.slice(0, 6).map((log) => (
                      <div key={log.id} className="p-2.5 border border-[#EEEBE6] bg-[#FDFCFB] text-xs flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-[#1A1A1A] truncate">{log.productName}</div>
                          <div className="text-[10px] text-[#888]">
                            to <strong>{log.retailer}</strong> from {log.sourceType}
                          </div>
                        </div>
                        <span className="text-[10px] text-[#888] shrink-0 ml-2">{log.timestamp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Plugin Extension: Active Dashboard Widgets */}
            <div className="space-y-4 pt-4 border-t border-[#EEEBE6]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Puzzle className="w-4 h-4 text-[#888]" />
                  <h3 className="font-serif text-lg font-normal text-[#1A1A1A]">
                    Active Plugin Extensions & Telemetry
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAdminTab('plugins')}
                  className="text-xs text-[#888] hover:text-black hover:underline cursor-pointer"
                >
                  Manage Plugins ({activePluginsCount} active) &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AnalyticsProDashboardWidget />
                <SeoToolkitDashboardWidget />
                <AffiliateCloakerDashboardWidget />
                <ImageOptimizerDashboardWidget />
              </div>
            </div>
          </div>
        )}

        {/* TAB: SITE BUILDER (VISUAL PAGE BUILDER & LAYOUT STUDIO) */}
        {adminTab === 'site-builder' && <SiteBuilderManager />}

        {/* TAB: HOME PAGE VISUAL EDITOR */}
        {adminTab === 'home' && (
          <HomeEditorCMS
            homeForm={homeForm}
            setHomeForm={setHomeForm}
            onSave={() => {
              updateHomeSettings(homeForm);
              setHomeSaveSuccess(true);
              setTimeout(() => setHomeSaveSuccess(false), 3500);
            }}
            homeSaveSuccess={homeSaveSuccess}
            cameras={cameras}
            articles={articles}
            siteSettings={siteSettings}
            updateSiteSettings={updateSiteSettings}
            addMediaAsset={addMediaAsset}
            navigateTo={navigateTo}
          />
        )}

        {/* TAB 2: ARTICLE MANAGEMENT */}
        {adminTab === 'articles' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EEEBE6]">
              <div>
                <h1 className="font-serif text-3xl font-normal text-[#1A1A1A]">Articles & Guides Management</h1>
                <p className="text-xs text-[#666] mt-1">Publish, edit, preview, and optimize camera articles for SEO and affiliate conversion</p>
              </div>
              <button
                onClick={handleStartCreateArticle}
                className="px-4 py-2 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-wider font-semibold hover:opacity-90 flex items-center gap-1.5 cursor-pointer self-start"
              >
                <Plus className="w-3.5 h-3.5" /> Create New Article
              </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 border border-[#EEEBE6]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search articles by title, excerpt, slug, or keywords..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Category Filter */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[11px] text-[#888] uppercase tracking-wider font-medium">Category:</span>
                  <select
                    value={activeFilterCategory}
                    onChange={(e) => setActiveFilterCategory(e.target.value as any)}
                    className="px-2.5 py-1 text-xs border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                  >
                    <option value="all">All Categories</option>
                    {[
                      'Mirrorless',
                      'DSLR',
                      'Compact',
                      'Action Camera',
                      'Vlogging',
                      'Accessories',
                      'Camera Guides',
                      'Reviews',
                      'Comparisons',
                      'Photography',
                      'Videography',
                      'Beginner Guides',
                    ].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1">
                  {(['all', 'published', 'draft'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setActiveFilterStatus(st)}
                      className={`px-3 py-1 text-[11px] uppercase tracking-wider font-medium cursor-pointer transition-colors ${
                        activeFilterStatus === st ? 'bg-[#1A1A1A] text-white' : 'text-[#666] hover:bg-[#EEEBE6]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Articles Table */}
            <div className="bg-white border border-[#EEEBE6] overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[760px]">
                <thead className="bg-[#FDFCFB] border-b border-[#EEEBE6] text-[#888] uppercase tracking-[0.15em] font-medium text-[10px]">
                  <tr>
                    <th className="p-4">Article & Details</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Placements</th>
                    <th className="p-4">Author & Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEBE6]">
                  {articles
                    .filter((a) => {
                      const matchesSearch = 
                        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        a.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        a.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesStatus = activeFilterStatus === 'all' || a.status === activeFilterStatus;
                      const matchesCategory = activeFilterCategory === 'all' || a.category === activeFilterCategory;
                      return matchesSearch && matchesStatus && matchesCategory;
                    })
                    .map((art) => (
                      <tr key={art.id} className="hover:bg-[#FDFCFB] transition-colors">
                        <td className="p-4 max-w-sm">
                          <div className="flex items-center gap-3">
                            <img src={art.coverImage} alt="" className="w-14 h-11 object-cover bg-[#EEEBE6] shrink-0 border border-[#EEEBE6] rounded-xs" />
                            <div className="min-w-0">
                              <h4 className="font-serif font-normal text-sm text-[#1A1A1A] line-clamp-1">{art.title}</h4>
                              <p className="text-[10px] text-[#888] font-mono truncate">{siteSettings.blogSlugPrefix || '/article/'}{art.slug}</p>
                              <p className="text-[11px] text-[#666] line-clamp-1 mt-0.5">{art.excerpt}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-[#666] font-medium whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-neutral-100 text-neutral-800 text-[10px] font-semibold tracking-wider uppercase rounded-xs">
                            {art.category}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {art.isHeroFeatured && (
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 text-[9px] font-bold uppercase rounded-xs flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Hero
                              </span>
                            )}
                            {art.isPopularNow && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[9px] font-bold uppercase rounded-xs">
                                Popular
                              </span>
                            )}
                            {art.isFeaturedContent && (
                              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase rounded-xs">
                                Spotlight
                              </span>
                            )}
                            {art.isTrending && (
                              <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 text-[9px] font-bold uppercase rounded-xs flex items-center gap-0.5">
                                <Flame className="w-2.5 h-2.5 text-rose-600" /> Trend
                              </span>
                            )}
                            {art.showOnLandingPage && (
                              <span className="px-1.5 py-0.5 bg-neutral-200 text-neutral-800 text-[9px] font-medium uppercase rounded-xs">
                                Home
                              </span>
                            )}
                            {!art.isHeroFeatured && !art.isPopularNow && !art.isFeaturedContent && !art.isTrending && !art.showOnLandingPage && (
                              <span className="text-[10px] text-neutral-400">Standard</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-[#666] whitespace-nowrap">
                          <div className="text-[11px] font-medium text-neutral-900">{art.author.name}</div>
                          <div className="text-[10px] text-neutral-400">{art.publishedAt} · {art.readTimeMinutes}m read</div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <button
                            onClick={() => togglePublishArticle(art.id)}
                            className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest cursor-pointer ${
                              art.status === 'published'
                                ? 'bg-[#E8F5E9] text-[#2E7D32]'
                                : 'bg-[#FFF3E0] text-[#E65100]'
                            }`}
                          >
                            {art.status}
                          </button>
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleStartEditArticle(art)}
                              className="p-1.5 text-xs border border-[#EEEBE6] bg-white hover:border-black transition-colors"
                              title="Edit Article & Placement"
                            >
                              <Edit className="w-3.5 h-3.5 text-[#666]" />
                            </button>
                            <button
                              onClick={() => navigateTo('article-detail', art.slug)}
                              className="p-1.5 text-xs border border-[#EEEBE6] bg-white hover:border-black transition-colors"
                              title="Preview Article on Site"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#666]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteModal({ isOpen: true, type: 'article', id: art.id, title: art.title })}
                              className="p-1.5 text-xs border border-[#EEEBE6] text-[#C62828] bg-white hover:border-[#C62828] hover:bg-red-50 transition-colors cursor-pointer"
                              title="Hapus Artikel"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ARTICLE EDITOR (RICH CONTENT + SEO + DYNAMIC PRODUCT BOXES) */}
        {adminTab === 'article-edit' && (
          <form onSubmit={handleSaveArticle} className="space-y-8 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EEEBE6]">
              <div>
                <button
                  type="button"
                  onClick={() => setAdminTab('articles')}
                  className="text-xs text-[#888] hover:text-black flex items-center gap-1 mb-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Articles
                </button>
                <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#1A1A1A]">
                  {editingArticleId ? 'Edit Editorial Article' : 'Compose New Article'}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setArticleForm((prev) => ({ ...prev, status: prev.status === 'published' ? 'draft' : 'published' }))}
                  className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold cursor-pointer ${
                    articleForm.status === 'published' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFF3E0] text-[#E65100]'
                  }`}
                >
                  Status: {articleForm.status}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-wider font-semibold hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Save Article
                </button>
              </div>
            </div>

            {/* 1. ARTICLE PLACEMENT CONTROLS */}
            <div className="bg-white p-6 border border-[#EEEBE6] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-normal text-[#1A1A1A] flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-neutral-700" />
                    Article Placement Controls
                  </h3>
                  <p className="text-xs text-[#666] mt-0.5">
                    Determine where this published article appears across FujiFinder's homepage, hero carousel, and sections.
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 bg-neutral-100 text-neutral-700">
                  Homepage & Discovery
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs">
                {/* Hero Featured Story */}
                <label className={`p-3.5 border cursor-pointer transition-all flex items-start gap-3 rounded-xs ${
                  articleForm.isHeroFeatured 
                    ? 'border-amber-400 bg-amber-50/50' 
                    : 'border-[#EEEBE6] bg-[#FDFCFB] hover:border-neutral-400'
                }`}>
                  <input
                    type="checkbox"
                    checked={!!articleForm.isHeroFeatured}
                    onChange={(e) => setArticleForm({ ...articleForm, isHeroFeatured: e.target.checked })}
                    className="mt-0.5 rounded text-black focus:ring-black cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                      <Star className={`w-3.5 h-3.5 ${articleForm.isHeroFeatured ? 'fill-amber-500 text-amber-500' : 'text-neutral-400'}`} />
                      <span>Featured Hero Story</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-snug">
                      Top cinematic hero slide on the homepage with full-width cover image.
                    </p>
                  </div>
                </label>

                {/* Popular Now Grid */}
                <label className={`p-3.5 border cursor-pointer transition-all flex items-start gap-3 rounded-xs ${
                  articleForm.isPopularNow 
                    ? 'border-blue-400 bg-blue-50/50' 
                    : 'border-[#EEEBE6] bg-[#FDFCFB] hover:border-neutral-400'
                }`}>
                  <input
                    type="checkbox"
                    checked={!!articleForm.isPopularNow}
                    onChange={(e) => setArticleForm({ ...articleForm, isPopularNow: e.target.checked })}
                    className="mt-0.5 rounded text-black focus:ring-black cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <div className="font-semibold text-neutral-900">
                      Popular Now Shelf
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-snug">
                      Highlighted in the 4-card "Popular Now" grid with large image cards.
                    </p>
                  </div>
                </label>

                {/* Featured Guide Spotlight */}
                <label className={`p-3.5 border cursor-pointer transition-all flex items-start gap-3 rounded-xs ${
                  articleForm.isFeaturedContent 
                    ? 'border-emerald-400 bg-emerald-50/50' 
                    : 'border-[#EEEBE6] bg-[#FDFCFB] hover:border-neutral-400'
                }`}>
                  <input
                    type="checkbox"
                    checked={!!articleForm.isFeaturedContent}
                    onChange={(e) => setArticleForm({ ...articleForm, isFeaturedContent: e.target.checked })}
                    className="mt-0.5 rounded text-black focus:ring-black cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <div className="font-semibold text-neutral-900">
                      Featured Guide Spotlight
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-snug">
                      Featured Guide showcase card on the homepage, paired with the author bio card.
                    </p>
                  </div>
                </label>

                {/* Trending Story Flag */}
                <label className={`p-3.5 border cursor-pointer transition-all flex items-start gap-3 rounded-xs ${
                  articleForm.isTrending 
                    ? 'border-rose-400 bg-rose-50/50' 
                    : 'border-[#EEEBE6] bg-[#FDFCFB] hover:border-neutral-400'
                }`}>
                  <input
                    type="checkbox"
                    checked={!!articleForm.isTrending}
                    onChange={(e) => setArticleForm({ ...articleForm, isTrending: e.target.checked })}
                    className="mt-0.5 rounded text-black focus:ring-black cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                      <Flame className={`w-3.5 h-3.5 ${articleForm.isTrending ? 'text-rose-600' : 'text-neutral-400'}`} />
                      <span>Trending Story Badge</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-snug">
                      Tags the story with a high-engagement "Trending" badge across listing cards.
                    </p>
                  </div>
                </label>

                {/* Show on Landing Page */}
                <label className={`p-3.5 border cursor-pointer transition-all flex items-start gap-3 rounded-xs ${
                  articleForm.showOnLandingPage 
                    ? 'border-neutral-900 bg-neutral-50' 
                    : 'border-[#EEEBE6] bg-[#FDFCFB] hover:border-neutral-400'
                }`}>
                  <input
                    type="checkbox"
                    checked={!!articleForm.showOnLandingPage}
                    onChange={(e) => setArticleForm({ ...articleForm, showOnLandingPage: e.target.checked })}
                    className="mt-0.5 rounded text-black focus:ring-black cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-neutral-700" />
                      <span>Show on Landing Page</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-snug">
                      Enables general visibility across the public homepage discovery rows.
                    </p>
                  </div>
                </label>

                {/* Include in Latest Stream */}
                <label className={`p-3.5 border cursor-pointer transition-all flex items-start gap-3 rounded-xs ${
                  articleForm.isLatest 
                    ? 'border-neutral-700 bg-neutral-50' 
                    : 'border-[#EEEBE6] bg-[#FDFCFB] hover:border-neutral-400'
                }`}>
                  <input
                    type="checkbox"
                    checked={articleForm.isLatest !== false}
                    onChange={(e) => setArticleForm({ ...articleForm, isLatest: e.target.checked })}
                    className="mt-0.5 rounded text-black focus:ring-black cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <div className="font-semibold text-neutral-900">
                      Latest Feed Feed
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-snug">
                      Display in the chronological feed and recent articles sidebar.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* 2. ESSENTIAL ARTICLE METADATA */}
            <div className="bg-white p-6 border border-[#EEEBE6] space-y-5">
              <h3 className="font-serif text-lg font-normal text-[#1A1A1A]">Essential Article Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                {/* Title */}
                <div className="md:col-span-8">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] uppercase tracking-wider text-[#666] font-medium">Headline / Title *</label>
                    <button
                      type="button"
                      onClick={handleGenerateSlug}
                      className="text-[10px] text-neutral-500 hover:text-black font-semibold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Auto-generate Slug
                    </button>
                  </div>
                  <input
                    type="text"
                    value={articleForm.title}
                    onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                    placeholder="e.g. The Complete Guide to Choosing Your First Mirrorless Camera"
                    className="w-full px-3 py-2 text-sm border border-[#EEEBE6] bg-[#FDFCFB] font-serif focus:outline-none focus:border-black"
                    required
                  />
                </div>

                {/* Category */}
                <div className="md:col-span-4">
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">Category</label>
                  <select
                    value={articleForm.category}
                    onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value as ArticleCategory })}
                    className="w-full px-3 py-2 text-xs border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black font-medium"
                  >
                    {[
                      'Mirrorless',
                      'DSLR',
                      'Compact',
                      'Action Camera',
                      'Vlogging',
                      'Accessories',
                      'Camera Guides',
                      'Reviews',
                      'Comparisons',
                      'Photography',
                      'Videography',
                      'Beginner Guides',
                    ].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Slug */}
                <div className="md:col-span-6">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] uppercase tracking-wider text-[#666] font-medium">URL Slug</label>
                    <span className="text-[10px] text-neutral-400 font-mono">Format: kebab-case</span>
                  </div>
                  <div className="flex items-center border border-[#EEEBE6] bg-[#FDFCFB] focus-within:border-black">
                    <span className="pl-3 pr-1 text-[11px] text-neutral-500 font-mono select-none">
                      {siteSettings.blogSlugPrefix || '/article/'}
                    </span>
                    <input
                      type="text"
                      value={articleForm.slug}
                      onChange={(e) => setArticleForm({ ...articleForm, slug: sanitizeSlug(e.target.value) })}
                      placeholder="the-complete-guide-to-mirrorless-cameras"
                      className="w-full px-2 py-2 text-xs bg-transparent font-mono focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-[#888] font-mono mt-1 truncate">
                    Preview URL: <span className="text-black font-medium">{siteSettings.siteUrl || 'https://www.fujifinder.my.id'}{siteSettings.blogSlugPrefix || '/article/'}{articleForm.slug || 'judul-artikel'}</span>
                  </p>
                </div>

                {/* Subtitle */}
                <div className="md:col-span-6">
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">Subtitle / Dek</label>
                  <input
                    type="text"
                    value={articleForm.subtitle || ''}
                    onChange={(e) => setArticleForm({ ...articleForm, subtitle: e.target.value })}
                    placeholder="Supporting editorial subhead"
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                  />
                </div>

                {/* Excerpt */}
                <div className="md:col-span-12">
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">Excerpt / Short Summary</label>
                  <textarea
                    rows={2}
                    value={articleForm.excerpt}
                    onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                    placeholder="A brief 1-2 sentence overview for cards, RSS, and search snippets..."
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black leading-relaxed"
                  />
                </div>

                {/* Cover Image */}
                <div className="md:col-span-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] uppercase tracking-wider text-[#666] font-medium flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-neutral-700" />
                      <span>Cover Image (Foto Sampul Artikel)</span>
                    </label>
                    <span className="text-[10px] text-neutral-400 font-mono">Bisa upload file / tempel URL</span>
                  </div>

                  {/* Drag-and-drop / Upload Container */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingCover(true); }}
                    onDragLeave={() => setIsDraggingCover(false)}
                    onDrop={handleCoverDrop}
                    className={`border-2 border-dashed rounded p-3 transition-all ${
                      isDraggingCover 
                        ? 'border-black bg-neutral-100' 
                        : 'border-[#DDD8D0] bg-[#FDFCFB] hover:border-neutral-400'
                    }`}
                  >
                    {articleForm.coverImage ? (
                      <div className="space-y-2.5">
                        <div className="relative rounded overflow-hidden border border-[#E5E2DC] bg-neutral-900 group">
                          <img
                            src={articleForm.coverImage}
                            alt="Cover Preview"
                            className="w-full h-36 object-cover object-center"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                            <button
                              type="button"
                              onClick={() => coverFileInputRef.current?.click()}
                              className="px-2.5 py-1.5 bg-white text-black text-xs font-medium rounded shadow hover:bg-neutral-100 flex items-center gap-1.5 cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              Ganti File
                            </button>
                            <button
                              type="button"
                              onClick={() => setArticleForm({ ...articleForm, coverImage: '' })}
                              className="px-2.5 py-1.5 bg-red-600 text-white text-xs font-medium rounded shadow hover:bg-red-700 flex items-center gap-1.5 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Hapus
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => coverFileInputRef.current?.click()}
                              className="px-2.5 py-1 bg-neutral-900 text-white hover:bg-black text-[11px] font-medium rounded flex items-center gap-1.5 cursor-pointer"
                            >
                              <Upload className="w-3 h-3" />
                              Upload / Ganti File Gambar
                            </button>
                            <button
                              type="button"
                              onClick={() => setArticleForm({ ...articleForm, coverImage: '' })}
                              className="px-2 py-1 border border-neutral-300 hover:border-red-400 hover:text-red-600 text-neutral-600 text-[11px] rounded cursor-pointer"
                            >
                              Hapus
                            </button>
                          </div>
                          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            ✓ Gambar Terpasang
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 px-3 space-y-2">
                        <div className="w-10 h-10 mx-auto rounded-full bg-neutral-100 border border-[#DDD] flex items-center justify-center text-neutral-500">
                          <UploadCloud className="w-5 h-5 text-neutral-600" />
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => coverFileInputRef.current?.click()}
                            className="px-3.5 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Pilih File Gambar dari Komputer / HP
                          </button>
                          <p className="text-[11px] text-neutral-500 mt-1">
                            atau tarik & lepas file gambar di sini (JPG, PNG, WebP)
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Hidden file input */}
                    <input
                      ref={coverFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverFileUpload}
                      className="hidden"
                      id="cover-file-input"
                    />

                    {/* URL input fallback */}
                    <div className="mt-2.5 pt-2 border-t border-[#EEEBE6] space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-neutral-500 font-medium">
                        <span>Atau masukkan URL gambar langsung:</span>
                        <span className="text-neutral-400 font-mono">https://...</span>
                      </div>
                      <div className="flex items-center border border-[#EEEBE6] bg-white focus-within:border-black rounded-xs">
                        <input
                          type="text"
                          value={articleForm.coverImage}
                          onChange={(e) => setArticleForm({ ...articleForm, coverImage: e.target.value })}
                          placeholder="https://images.unsplash.com/... atau tempel URL gambar"
                          className="w-full px-2.5 py-1.5 text-xs bg-transparent focus:outline-none font-mono"
                        />
                        {articleForm.coverImage && (
                          <button
                            type="button"
                            onClick={() => setArticleForm({ ...articleForm, coverImage: '' })}
                            className="px-2 text-neutral-400 hover:text-black cursor-pointer"
                            title="Kosongkan"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {isUploadingCover && (
                      <div className="mt-1.5 text-xs text-neutral-600 flex items-center gap-1.5 animate-pulse">
                        <span className="inline-block w-2 h-2 rounded-full bg-neutral-800"></span>
                        Memproses file gambar...
                      </div>
                    )}

                    {coverUploadError && (
                      <div className="mt-1.5 p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                        {coverUploadError}
                      </div>
                    )}
                  </div>

                  {/* Media Library Quick Pick */}
                  {mediaAssets.length > 0 && (
                    <div className="pt-0.5">
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">
                        Pilih Cepat dari Galeri Media:
                      </span>
                      <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
                        {mediaAssets.slice(0, 7).map((asset) => (
                          <button
                            key={asset.id}
                            type="button"
                            onClick={() => setArticleForm({ ...articleForm, coverImage: asset.url })}
                            className={`shrink-0 border rounded overflow-hidden transition-all cursor-pointer ${
                              articleForm.coverImage === asset.url
                                ? 'border-black ring-2 ring-black'
                                : 'border-neutral-200 hover:border-neutral-500'
                            }`}
                            title={asset.title}
                          >
                            <img src={asset.url} alt={asset.title} className="w-10 h-8 object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Publication Date */}
                <div className="md:col-span-3">
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">Publication Date</label>
                  <input
                    type="date"
                    value={articleForm.publishedAt}
                    onChange={(e) => setArticleForm({ ...articleForm, publishedAt: e.target.value })}
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                  />
                </div>

                {/* Read Time */}
                <div className="md:col-span-3">
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">Est. Read Time (Minutes)</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={articleForm.readTimeMinutes}
                    onChange={(e) => setArticleForm({ ...articleForm, readTimeMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                  />
                </div>

                {/* Author Info Group */}
                <div className="md:col-span-12 pt-3 border-t border-neutral-100">
                  <span className="text-[11px] font-semibold text-neutral-900 uppercase tracking-wider block mb-2">
                    Author Profile
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-3">
                      <label className="block text-[10px] uppercase tracking-wider text-[#888] mb-1">Author Name</label>
                      <input
                        type="text"
                        value={articleForm.author.name}
                        onChange={(e) => setArticleForm({ ...articleForm, author: { ...articleForm.author, name: e.target.value } })}
                        className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black text-xs"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-[10px] uppercase tracking-wider text-[#888] mb-1">Author Role</label>
                      <input
                        type="text"
                        value={articleForm.author.role}
                        onChange={(e) => setArticleForm({ ...articleForm, author: { ...articleForm.author, role: e.target.value } })}
                        placeholder="Camera Reviewer & Photographer"
                        className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black text-xs"
                      />
                    </div>

                    {/* Author Avatar with Manual File Upload & URL */}
                    <div className="md:col-span-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] uppercase tracking-wider text-[#888] font-medium">
                          Foto Avatar Penulis
                        </label>
                        <span className="text-[9px] text-neutral-400 font-mono">File / URL</span>
                      </div>

                      <div className="flex items-center gap-2.5 bg-[#FDFCFB] p-2 border border-[#EEEBE6] rounded-xs">
                        {/* Avatar Circle / Click to upload */}
                        <div
                          onClick={() => avatarFileInputRef.current?.click()}
                          className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-neutral-300 bg-neutral-100 cursor-pointer group flex items-center justify-center"
                          title="Klik untuk pilih file foto avatar"
                        >
                          {articleForm.author.avatar ? (
                            <img
                              src={articleForm.author.avatar}
                              alt={articleForm.author.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-neutral-400" />
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Upload className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => avatarFileInputRef.current?.click()}
                              className="px-2 py-0.5 bg-neutral-900 hover:bg-black text-white text-[10px] font-medium rounded flex items-center gap-1 cursor-pointer"
                            >
                              <Upload className="w-2.5 h-2.5" />
                              Pilih File Foto
                            </button>
                            {articleForm.author.avatar && (
                              <button
                                type="button"
                                onClick={() => setArticleForm({ ...articleForm, author: { ...articleForm.author, avatar: '' } })}
                                className="px-1.5 py-0.5 text-[10px] text-red-600 hover:bg-red-50 border border-red-200 rounded cursor-pointer"
                              >
                                Hapus
                              </button>
                            )}
                          </div>

                          <input
                            ref={avatarFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarFileUpload}
                            className="hidden"
                            id="avatar-file-input"
                          />

                          <input
                            type="text"
                            value={articleForm.author.avatar}
                            onChange={(e) => setArticleForm({ ...articleForm, author: { ...articleForm.author, avatar: e.target.value } })}
                            placeholder="Atau URL gambar..."
                            className="w-full px-1.5 py-0.5 border border-[#EEEBE6] bg-white focus:outline-none focus:border-black text-[10px] font-mono"
                          />
                        </div>
                      </div>

                      {isUploadingAvatar && (
                        <span className="text-[10px] text-neutral-500 animate-pulse block">Memproses avatar...</span>
                      )}
                      {avatarUploadError && (
                        <span className="text-[10px] text-red-600 block">{avatarUploadError}</span>
                      )}
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-[10px] uppercase tracking-wider text-[#888] mb-1">Author Bio</label>
                      <input
                        type="text"
                        value={articleForm.author.bio}
                        onChange={(e) => setArticleForm({ ...articleForm, author: { ...articleForm.author, bio: e.target.value } })}
                        placeholder="Sharing honest reviews and practical tips to help you create better."
                        className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. STRUCTURED CONTENT BLOCK EDITOR */}
            <div className="bg-white p-6 border border-[#EEEBE6] space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EEEBE6]">
                <div>
                  <h3 className="font-serif text-lg font-normal text-[#1A1A1A]">Article Body Content Blocks</h3>
                  <p className="text-xs text-[#666]">Build rich text paragraphs, headings, image callouts, lists, quotes, and interactive camera comparison cards</p>
                </div>

                {/* Insertion Tools Bar */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => handleAddBlock('paragraph')}
                    className="px-2.5 py-1.5 bg-[#FDFCFB] border border-[#EEEBE6] hover:border-black text-[11px] uppercase tracking-wider font-medium transition-colors"
                  >
                    + Paragraph
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock('heading2')}
                    className="px-2.5 py-1.5 bg-[#FDFCFB] border border-[#EEEBE6] hover:border-black text-[11px] uppercase tracking-wider font-medium transition-colors"
                  >
                    + H2 Heading
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock('heading3')}
                    className="px-2.5 py-1.5 bg-[#FDFCFB] border border-[#EEEBE6] hover:border-black text-[11px] uppercase tracking-wider font-medium transition-colors"
                  >
                    + H3 Heading
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock('bullet_list')}
                    className="px-2.5 py-1.5 bg-[#FDFCFB] border border-[#EEEBE6] hover:border-black text-[11px] uppercase tracking-wider font-medium transition-colors flex items-center gap-1"
                  >
                    <List className="w-3 h-3" /> Bullet List
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock('numbered_list')}
                    className="px-2.5 py-1.5 bg-[#FDFCFB] border border-[#EEEBE6] hover:border-black text-[11px] uppercase tracking-wider font-medium transition-colors flex items-center gap-1"
                  >
                    <ListOrdered className="w-3 h-3" /> Numbered List
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock('quote')}
                    className="px-2.5 py-1.5 bg-[#FDFCFB] border border-[#EEEBE6] hover:border-black text-[11px] uppercase tracking-wider font-medium transition-colors"
                  >
                    + Quote
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock('callout')}
                    className="px-2.5 py-1.5 bg-[#FDFCFB] border border-[#EEEBE6] hover:border-black text-[11px] uppercase tracking-wider font-medium transition-colors"
                  >
                    + Pro Tip Box
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock('image')}
                    className="px-2.5 py-1.5 bg-[#FDFCFB] border border-[#EEEBE6] hover:border-black text-[11px] uppercase tracking-wider font-medium transition-colors flex items-center gap-1"
                  >
                    <ImageIcon className="w-3 h-3" /> Image
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock('product_card', { productId: cameras[0]?.id || 'fuji-x100vi', productBadge: 'Top Recommendation' })}
                    className="px-2.5 py-1.5 bg-[#1A1A1A] text-white hover:opacity-90 text-[11px] uppercase tracking-wider font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Camera Card
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock('comparison_table', { comparedProductIds: ['fuji-x100vi', 'sony-a7iv'] })}
                    className="px-2.5 py-1.5 bg-[#FDFCFB] border border-[#EEEBE6] hover:border-black text-[11px] uppercase tracking-wider font-medium transition-colors"
                  >
                    + Comparison Matrix
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock('affiliate_cta', { 
                      productId: cameras[0]?.id || 'fuji-x100vi', 
                      subjectName: cameras[0]?.name || 'Fujifilm X100VI',
                      linkUrl: cameras[0]?.affiliateLinks?.[0]?.url || 'https://www.tokopedia.com',
                      ctaText: 'Check Current Price & Stock',
                      ctaSubtext: 'Bandingkan ketersediaan stok & harga promo resmi'
                    })}
                    className="px-2.5 py-1.5 bg-[#FDFCFB] border border-[#EEEBE6] hover:border-black text-[11px] uppercase tracking-wider font-medium transition-colors"
                  >
                    + Affiliate CTA
                  </button>
                </div>
              </div>

              {/* Blocks List */}
              <div className="space-y-4">
                {articleForm.blocks.map((block, idx) => (
                  <div key={block.id} className="p-4 border border-[#EEEBE6] bg-[#FDFCFB] relative group space-y-3 rounded-xs">
                    {/* Block Toolbar */}
                    <div className="flex items-center justify-between text-[10px] text-[#888] uppercase tracking-[0.15em] font-medium border-b border-[#EEEBE6] pb-2">
                      <span className="font-semibold text-neutral-800">
                        Block #{idx + 1}: <span className="text-neutral-500 font-normal">{block.type.replace('_', ' ')}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Move Up */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveBlock(idx, 'up')}
                          className={`p-1 hover:bg-neutral-200 rounded ${idx === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                          title="Move Block Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          disabled={idx === articleForm.blocks.length - 1}
                          onClick={() => handleMoveBlock(idx, 'down')}
                          className={`p-1 hover:bg-neutral-200 rounded ${idx === articleForm.blocks.length - 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                          title="Move Block Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => handleRemoveBlock(block.id)}
                          className="text-[#C62828] hover:underline cursor-pointer ml-2 flex items-center gap-0.5"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>

                    {/* PARAGRAPH BLOCK */}
                    {block.type === 'paragraph' && (
                      <textarea
                        rows={3}
                        value={block.text || ''}
                        onChange={(e) => handleUpdateBlock(block.id, { text: e.target.value })}
                        className="w-full p-2.5 text-xs sm:text-sm bg-white border border-[#EEEBE6] focus:outline-none focus:border-black leading-relaxed"
                        placeholder="Write body paragraph text..."
                      />
                    )}

                    {/* HEADING 2 BLOCK */}
                    {block.type === 'heading2' && (
                      <input
                        type="text"
                        value={block.text || ''}
                        onChange={(e) => handleUpdateBlock(block.id, { text: e.target.value })}
                        className="w-full p-2 text-sm font-serif font-bold bg-white border border-[#EEEBE6] focus:outline-none focus:border-black"
                        placeholder="Section Heading (H2)..."
                      />
                    )}

                    {/* HEADING 3 BLOCK */}
                    {block.type === 'heading3' && (
                      <input
                        type="text"
                        value={block.text || ''}
                        onChange={(e) => handleUpdateBlock(block.id, { text: e.target.value })}
                        className="w-full p-2 text-xs font-semibold bg-white border border-[#EEEBE6] focus:outline-none focus:border-black uppercase tracking-wider"
                        placeholder="Subheading (H3)..."
                      />
                    )}

                    {/* BULLET LIST BLOCK */}
                    {block.type === 'bullet_list' && (
                      <div className="space-y-2 bg-white p-3 border border-[#EEEBE6]">
                        <span className="text-[11px] font-semibold text-neutral-800 uppercase tracking-wider block">
                          Bullet Points:
                        </span>
                        <div className="space-y-1.5">
                          {(block.items || []).map((item, itemIdx) => (
                            <div key={itemIdx} className="flex items-center gap-2">
                              <span className="text-neutral-400">•</span>
                              <input
                                type="text"
                                value={item}
                                onChange={(e) => {
                                  const newItems = [...(block.items || [])];
                                  newItems[itemIdx] = e.target.value;
                                  handleUpdateBlock(block.id, { items: newItems });
                                }}
                                className="w-full p-1.5 text-xs border border-neutral-200 bg-[#FDFCFB]"
                                placeholder={`Item ${itemIdx + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newItems = (block.items || []).filter((_, i) => i !== itemIdx);
                                  handleUpdateBlock(block.id, { items: newItems });
                                }}
                                className="text-red-500 hover:text-red-700 text-xs px-1"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = [...(block.items || []), ''];
                            handleUpdateBlock(block.id, { items: newItems });
                          }}
                          className="text-[10px] text-neutral-600 hover:text-black font-semibold uppercase tracking-wider pt-1"
                        >
                          + Add Bullet Point
                        </button>
                      </div>
                    )}

                    {/* NUMBERED LIST BLOCK */}
                    {block.type === 'numbered_list' && (
                      <div className="space-y-2 bg-white p-3 border border-[#EEEBE6]">
                        <span className="text-[11px] font-semibold text-neutral-800 uppercase tracking-wider block">
                          Numbered List Steps:
                        </span>
                        <div className="space-y-1.5">
                          {(block.items || []).map((item, itemIdx) => (
                            <div key={itemIdx} className="flex items-center gap-2">
                              <span className="text-neutral-500 text-xs font-semibold w-4">{itemIdx + 1}.</span>
                              <input
                                type="text"
                                value={item}
                                onChange={(e) => {
                                  const newItems = [...(block.items || [])];
                                  newItems[itemIdx] = e.target.value;
                                  handleUpdateBlock(block.id, { items: newItems });
                                }}
                                className="w-full p-1.5 text-xs border border-neutral-200 bg-[#FDFCFB]"
                                placeholder={`Step ${itemIdx + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newItems = (block.items || []).filter((_, i) => i !== itemIdx);
                                  handleUpdateBlock(block.id, { items: newItems });
                                }}
                                className="text-red-500 hover:text-red-700 text-xs px-1"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = [...(block.items || []), ''];
                            handleUpdateBlock(block.id, { items: newItems });
                          }}
                          className="text-[10px] text-neutral-600 hover:text-black font-semibold uppercase tracking-wider pt-1"
                        >
                          + Add Step
                        </button>
                      </div>
                    )}

                    {/* IMAGE BLOCK */}
                    {block.type === 'image' && (
                      <div className="space-y-2 bg-white p-3 border border-[#EEEBE6]">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          {block.imageUrl ? (
                            <img
                              src={block.imageUrl}
                              alt={block.imageCaption || 'Block illustration'}
                              className="w-24 h-16 object-cover rounded border border-neutral-200 shrink-0 bg-neutral-100"
                            />
                          ) : (
                            <div className="w-24 h-16 rounded border border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 shrink-0 bg-neutral-50">
                              <ImageIcon className="w-6 h-6 text-neutral-400" />
                            </div>
                          )}
                          <div className="w-full space-y-1.5 flex-1">
                            <div className="flex items-center justify-between">
                              <label className="block text-[10px] uppercase tracking-wider text-neutral-500">Image Source (File / URL)</label>
                              <label className="text-[10px] font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded cursor-pointer inline-flex items-center gap-1 border border-neutral-200">
                                <Upload className="w-2.5 h-2.5" />
                                <span>Pilih File Gambar</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                      const dataUrl = await readFileAsOptimizedDataUrl(file, 1400, 1400, 0.85);
                                      handleUpdateBlock(block.id, { imageUrl: dataUrl });
                                    } catch (err: any) {
                                      alert(err.message || 'Gagal membaca gambar');
                                    }
                                  }}
                                />
                              </label>
                            </div>
                            <input
                              type="text"
                              value={block.imageUrl || ''}
                              onChange={(e) => handleUpdateBlock(block.id, { imageUrl: e.target.value })}
                              placeholder="https://images.unsplash.com/... atau tempel URL"
                              className="w-full p-1.5 text-xs border border-neutral-200 bg-[#FDFCFB]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-neutral-500">Caption</label>
                          <input
                            type="text"
                            value={block.imageCaption || ''}
                            onChange={(e) => handleUpdateBlock(block.id, { imageCaption: e.target.value })}
                            placeholder="e.g. Field testing in adverse weather conditions"
                            className="w-full p-1.5 text-xs border border-neutral-200 bg-[#FDFCFB]"
                          />
                        </div>
                      </div>
                    )}

                    {/* QUOTE BLOCK */}
                    {block.type === 'quote' && (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={block.text || ''}
                          onChange={(e) => handleUpdateBlock(block.id, { text: e.target.value })}
                          className="w-full p-2 text-xs sm:text-sm italic font-serif bg-white border border-[#EEEBE6] focus:outline-none focus:border-black"
                          placeholder="Quotation text..."
                        />
                        <input
                          type="text"
                          value={block.authorQuote || ''}
                          onChange={(e) => handleUpdateBlock(block.id, { authorQuote: e.target.value })}
                          className="w-full p-1.5 text-xs bg-white border border-[#EEEBE6] focus:outline-none focus:border-black"
                          placeholder="Attribution / Author name..."
                        />
                      </div>
                    )}

                    {/* CALLOUT / PRO TIP BLOCK */}
                    {block.type === 'callout' && (
                      <div className="bg-white p-3 border border-[#EEEBE6] space-y-1">
                        <label className="block text-[10px] uppercase tracking-wider text-amber-700 font-semibold">
                          Pro Tip / Callout Note
                        </label>
                        <textarea
                          rows={2}
                          value={block.text || ''}
                          onChange={(e) => handleUpdateBlock(block.id, { text: e.target.value })}
                          className="w-full p-2 text-xs bg-[#FDFCFB] border border-amber-200 focus:outline-none focus:border-black"
                          placeholder="Pro Tip or important takeaway for photographers..."
                        />
                      </div>
                    )}

                    {/* DYNAMIC PRODUCT RECOMMENDATION CARD INSERTION */}
                    {block.type === 'product_card' && (
                      <div className="p-3 bg-white border border-[#EEEBE6] space-y-3">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-medium text-[#1A1A1A]">Select Camera from Database:</span>
                          <select
                            value={block.productId || ''}
                            onChange={(e) => handleUpdateBlock(block.id, { productId: e.target.value })}
                            className="px-3 py-1 text-xs border border-[#EEEBE6] bg-[#FDFCFB] font-medium"
                          >
                            {cameras.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name} (${c.price.toLocaleString()}) — {c.brand}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="block text-[10px] text-[#888] uppercase tracking-wider font-medium">Custom Badge</label>
                            <input
                              type="text"
                              value={block.productBadge || ''}
                              onChange={(e) => handleUpdateBlock(block.id, { productBadge: e.target.value })}
                              placeholder="e.g. Editor’s Top Pick"
                              className="w-full p-1.5 text-xs border border-[#EEEBE6] bg-[#FDFCFB]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-[#888] uppercase tracking-wider font-medium">Editorial Note</label>
                            <input
                              type="text"
                              value={block.productNote || ''}
                              onChange={(e) => handleUpdateBlock(block.id, { productNote: e.target.value })}
                              placeholder="e.g. Best choice for street and travel shooters"
                              className="w-full p-1.5 text-xs border border-[#EEEBE6] bg-[#FDFCFB]"
                            />
                          </div>
                        </div>

                        <p className="text-[11px] text-[#2E7D32]">
                          ✓ Dynamically linked: If you update this camera's affiliate link or price in the Product Manager, it automatically reflects here!
                        </p>
                      </div>
                    )}

                    {/* COMPARISON BLOCK */}
                    {block.type === 'comparison_table' && (
                      <div className="p-3 bg-white border border-[#EEEBE6] text-xs space-y-2">
                        <span className="font-medium text-[#1A1A1A]">Side-by-Side Comparison Matrix</span>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {cameras.map((c) => {
                            const isIncluded = block.comparedProductIds?.includes(c.id);
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  const cur = block.comparedProductIds || [];
                                  const updated = isIncluded ? cur.filter((id) => id !== c.id) : [...cur, c.id];
                                  handleUpdateBlock(block.id, { comparedProductIds: updated });
                                }}
                                className={`px-3 py-1 text-[11px] uppercase tracking-wider font-medium cursor-pointer transition-colors ${
                                  isIncluded ? 'bg-[#1A1A1A] text-white' : 'border border-[#EEEBE6] text-[#666] bg-[#FDFCFB]'
                                }`}
                              >
                                {isIncluded ? '✓ ' : '+ '} {c.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* AFFILIATE CTA BLOCK */}
                    {block.type === 'affiliate_cta' && (
                      <div className="p-4 bg-white border border-[#EEEBE6] space-y-3 text-xs rounded-xs">
                        {/* URL Link Input Manual */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[11px] font-semibold text-[#1A1A1A] uppercase tracking-wider flex items-center gap-1.5">
                              <Link2 className="w-3.5 h-3.5 text-neutral-600" />
                              URL Link Produk / Affiliate (Input Manual):
                            </label>
                            <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono font-medium flex items-center gap-1">
                              <ExternalLink className="w-2.5 h-2.5" /> Buka di Tab/Halaman Baru (_blank)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <input
                                type="url"
                                value={block.linkUrl || ''}
                                onChange={(e) => handleUpdateBlock(block.id, { linkUrl: e.target.value })}
                                placeholder="https://tokopedia.link/... atau https://shopee.co.id/... atau link affiliate lainnya"
                                className="w-full pl-8 pr-3 py-2 text-xs border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black font-mono"
                              />
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs opacity-40">🔗</span>
                            </div>
                            {block.linkUrl ? (
                              <a
                                href={block.linkUrl}
                                target="_blank"
                                rel="noopener noreferrer nofollow"
                                className="px-3 py-2 text-[11px] font-medium bg-[#1A1A1A] hover:bg-black text-white flex items-center gap-1.5 shrink-0 transition-colors"
                                title="Uji coba link di tab baru"
                              >
                                <span>Test Link</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : null}
                          </div>
                          <p className="text-[10px] text-[#777] mt-1">
                            Link manual affiliate produk (Tokopedia, Shopee, B&H, Blibli, Amazon, dll). Tombol CTA akan <strong>selalu membuka link ini di halaman/tab baru</strong> (<code className="text-neutral-800 font-mono">target="_blank"</code>).
                          </p>
                        </div>

                        {/* Product Name & Database Camera Autofill */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2.5 border-t border-[#EEEBE6]">
                          <div>
                            <label className="block text-[11px] font-medium text-[#1A1A1A] mb-1 uppercase tracking-wider">
                              Nama Produk (Label):
                            </label>
                            <input
                              type="text"
                              value={block.subjectName || ''}
                              onChange={(e) => handleUpdateBlock(block.id, { subjectName: e.target.value })}
                              placeholder="e.g. Fujifilm X100VI / Aksesoris"
                              className="w-full px-3 py-1.5 text-xs border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-[#666] mb-1 uppercase tracking-wider">
                              Atau Pilih dari Database Kamera (Auto-fill):
                            </label>
                            <select
                              value={block.productId || ''}
                              onChange={(e) => {
                                const selectedId = e.target.value;
                                const selectedCam = cameras.find((c) => c.id === selectedId);
                                if (selectedCam) {
                                  handleUpdateBlock(block.id, {
                                    productId: selectedId,
                                    subjectName: selectedCam.name,
                                    linkUrl: selectedCam.affiliateLinks?.[0]?.url || block.linkUrl || '',
                                    ctaText: block.ctaText || `Check Current Price & Stock for ${selectedCam.name}`,
                                    ctaSubtext: block.ctaSubtext || `Lihat penawaran harga resmi di ${selectedCam.affiliateLinks?.[0]?.retailer || 'Authorized Retailer'}`
                                  });
                                } else {
                                  handleUpdateBlock(block.id, { productId: '' });
                                }
                              }}
                              className="w-full px-3 py-1.5 text-xs border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black cursor-pointer"
                            >
                              <option value="">-- Gunakan Input Manual / Pilih Kamera --</option>
                              {cameras.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* CTA Text & Subtext */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-medium text-[#1A1A1A] mb-1 uppercase tracking-wider">
                              Teks Tombol CTA:
                            </label>
                            <input
                              type="text"
                              value={block.ctaText || ''}
                              onChange={(e) => handleUpdateBlock(block.id, { ctaText: e.target.value })}
                              placeholder="e.g. Check Current Price & Stock"
                              className="w-full px-3 py-1.5 text-xs border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-[#1A1A1A] mb-1 uppercase tracking-wider">
                              Subteks Penawaran (Opsional):
                            </label>
                            <input
                              type="text"
                              value={block.ctaSubtext || ''}
                              onChange={(e) => handleUpdateBlock(block.id, { ctaSubtext: e.target.value })}
                              placeholder="e.g. Bandingkan ketersediaan stok & garansi resmi"
                              className="w-full px-3 py-1.5 text-xs border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                            />
                          </div>
                        </div>

                        {/* Live Visual Preview of CTA */}
                        <div className="pt-2 border-t border-[#EEEBE6]">
                          <div className="text-[10px] uppercase tracking-wider text-[#888] font-medium mb-1 flex items-center justify-between">
                            <span>Live Preview di Artikel:</span>
                            <span className="text-emerald-700 font-mono">Buka di tab baru: Aktif</span>
                          </div>
                          <div className="p-3.5 bg-[#1A1A1A] text-white flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xs text-left">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.5 border border-emerald-800">
                                  Affiliate CTA
                                </span>
                                {(block.subjectName || cameras.find((c) => c.id === block.productId)?.name) && (
                                  <span className="text-xs text-neutral-300 font-medium">
                                    {block.subjectName || cameras.find((c) => c.id === block.productId)?.name}
                                  </span>
                                )}
                              </div>
                              <h5 className="font-serif text-sm font-normal text-white mt-1">
                                {block.ctaText || 'Check Current Price & Stock'}
                              </h5>
                              <p className="text-[10px] text-[#BBB] mt-0.5">
                                {block.ctaSubtext || 'Bandingkan ketersediaan stok dan harga penawaran resmi'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={block.linkUrl || cameras.find((c) => c.id === block.productId)?.affiliateLinks?.[0]?.url || '#'}
                                target="_blank"
                                rel="noopener noreferrer nofollow"
                                onClick={(e) => {
                                  const targetUrl = block.linkUrl || cameras.find((c) => c.id === block.productId)?.affiliateLinks?.[0]?.url;
                                  if (!targetUrl || targetUrl === '#') {
                                    e.preventDefault();
                                    alert('Masukkan URL link manual terlebih dahulu.');
                                  }
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-[#1A1A1A] hover:bg-[#E5DFD5] text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                                title="Klik untuk uji coba buka di tab baru"
                              >
                                <ShoppingBag className="w-3 h-3 text-[#1A1A1A]" />
                                <span>{block.ctaText || 'Check Price'}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Intelligent Real-Time SEO & Social Meta Configuration Panel */}
            <ArticleSEOEditor
              articleForm={articleForm}
              setArticleForm={setArticleForm}
              connectedCameras={cameras}
              allArticles={articles}
              siteSettings={siteSettings}
              sanitizeSlug={sanitizeSlug}
            />

            {/* Active Plugin Editor Extensions (rendered if respective plugins are active) */}
            <div className="space-y-6 pt-4 border-t border-[#EEEBE6]">
              <SeoToolkitEditorWidget
                title={articleForm.title}
                focusKeyword={articleForm.seo?.focusKeyword || articleForm.title.split(' ')[0] || ''}
                contentSnippet={
                  articleForm.blocks?.map((b) => b.text || b.headingText || b.quoteText || '').join(' ') ||
                  articleForm.excerpt ||
                  ''
                }
                metaTitle={articleForm.seo?.metaTitle}
                metaDesc={articleForm.seo?.metaDescription}
                slug={articleForm.slug}
              />

              <AffiliateCloakerEditorWidget
                content={
                  articleForm.blocks?.map((b) => b.text || b.headingText || b.quoteText || '').join(' ') ||
                  articleForm.excerpt ||
                  ''
                }
                onInsertCta={(productName, suggestedUrl) => {
                  handleAddBlock('affiliate_cta');
                  setTimeout(() => {
                    setArticleForm((prev) => {
                      const blocks = [...prev.blocks];
                      const lastIdx = blocks.length - 1;
                      if (lastIdx >= 0 && blocks[lastIdx].type === 'affiliate_cta') {
                        blocks[lastIdx] = {
                          ...blocks[lastIdx],
                          subjectName: productName,
                          linkUrl: suggestedUrl,
                          ctaText: `Check Best Price for ${productName}`,
                          ctaSubtext: 'In stock at authorized dealer with direct international warranty',
                        };
                      }
                      return { ...prev, blocks };
                    });
                  }, 50);
                }}
              />
            </div>

            {/* Bottom Save Action */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EEEBE6]">
              <button
                type="button"
                onClick={() => setAdminTab('articles')}
                className="px-4 py-2 text-xs font-medium text-[#666] hover:text-black uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-wider font-semibold hover:opacity-90 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Article Changes
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: CAMERA CATALOG MANAGEMENT */}
        {adminTab === 'cameras' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EEEBE6]">
              <div>
                <h1 className="font-serif text-3xl font-normal text-[#1A1A1A]">Camera Gear Catalog</h1>
                <p className="text-xs text-[#666] mt-1">Manage camera products, retail prices, specifications, pros/cons, and affiliate URLs</p>
              </div>
              <button
                onClick={handleStartCreateCamera}
                className="px-4 py-2 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-wider font-semibold hover:opacity-90 flex items-center gap-1.5 cursor-pointer self-start"
              >
                <Plus className="w-3.5 h-3.5" /> Add Camera Model
              </button>
            </div>

            {/* Search & Status Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 border border-[#EEEBE6]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cameraSearchTerm}
                  onChange={(e) => setCameraSearchTerm(e.target.value)}
                  placeholder="Cari kamera berdasarkan model, brand, atau sensor..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[11px] text-[#888] uppercase tracking-wider font-medium">Brand:</span>
                  <select
                    value={cameraFilterBrand}
                    onChange={(e) => setCameraFilterBrand(e.target.value)}
                    className="px-2.5 py-1 text-xs border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                  >
                    <option value="all">All Brands</option>
                    {Array.from(new Set(cameras.map((c) => c.brand))).map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  {(['all', 'published', 'draft'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setCameraFilterStatus(st)}
                      className={`px-3 py-1 text-[11px] uppercase tracking-wider font-semibold transition-colors cursor-pointer ${
                        cameraFilterStatus === st
                          ? 'bg-[#1A1A1A] text-white'
                          : 'bg-[#FDFCFB] text-[#666] border border-[#EEEBE6] hover:text-black'
                      }`}
                    >
                      {st === 'all'
                        ? `All (${totalCameras})`
                        : st === 'published'
                        ? `Published (${publishedCamerasCount})`
                        : `Draft (${draftCamerasCount})`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cameras Table */}
            {(() => {
              const filteredCams = cameras.filter((cam) => {
                const query = cameraSearchTerm.toLowerCase();
                const matchesSearch =
                  !query ||
                  cam.name.toLowerCase().includes(query) ||
                  cam.brand.toLowerCase().includes(query) ||
                  cam.specs?.sensor?.toLowerCase().includes(query);
                const matchesBrand = cameraFilterBrand === 'all' || cam.brand === cameraFilterBrand;
                const camStatus = cam.status ?? 'published';
                const matchesStatus = cameraFilterStatus === 'all' || camStatus === cameraFilterStatus;
                return matchesSearch && matchesBrand && matchesStatus;
              });

              if (filteredCams.length === 0) {
                return (
                  <div className="bg-white border border-[#EEEBE6] p-12 text-center text-[#888]">
                    <Camera className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">No camera models found matching your search and filter criteria.</p>
                  </div>
                );
              }

              return (
                <div className="bg-white border border-[#EEEBE6] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FDFCFB] border-b border-[#EEEBE6] text-[#888] uppercase tracking-[0.15em] font-medium text-[10px]">
                      <tr>
                        <th className="p-4">Camera</th>
                        <th className="p-4">Brand</th>
                        <th className="p-4">Format</th>
                        <th className="p-4">Base Price</th>
                        <th className="p-4">Rating</th>
                        <th className="p-4">Primary Affiliate</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEEBE6]">
                      {filteredCams.map((cam) => (
                        <tr key={cam.id} className="hover:bg-[#FDFCFB] transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={cam.image} alt="" className="w-12 h-10 object-cover bg-[#EEEBE6] shrink-0 border border-[#EEEBE6]" />
                              <div>
                                <h4 className="font-serif font-normal text-sm text-[#1A1A1A]">{cam.name}</h4>
                                <span className="text-[10px] text-[#888]">{cam.specs.megapixels}MP</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-medium text-[#666]">{cam.brand}</td>
                          <td className="p-4 text-[#666]">{cam.specs.sensorFormat}</td>
                          <td className="p-4 font-serif font-normal text-[#1A1A1A]">${cam.price.toLocaleString()}</td>
                          <td className="p-4 font-medium text-black">★ {cam.rating.toFixed(1)}</td>
                          <td className="p-4">
                            {cam.affiliateLinks[0] ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 font-medium">
                                {cam.affiliateLinks[0].retailer} (${cam.affiliateLinks[0].price.toLocaleString()})
                              </span>
                            ) : (
                              <span className="text-xs text-[#888]">None</span>
                            )}
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => toggleCameraStatus(cam.id)}
                              className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest cursor-pointer transition-colors ${
                                (cam.status ?? 'published') === 'published'
                                  ? 'bg-[#E8F5E9] text-[#2E7D32] hover:bg-emerald-100'
                                  : 'bg-[#FFF3E0] text-[#E65100] hover:bg-amber-100'
                              }`}
                              title="Klik untuk ubah status Published / Draft"
                            >
                              {(cam.status ?? 'published') === 'published' ? 'published' : 'draft'}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleStartEditCamera(cam)}
                                className="p-1.5 text-xs border border-[#EEEBE6] bg-white hover:border-black transition-colors"
                                title="Edit Camera"
                              >
                                <Edit className="w-3.5 h-3.5 text-[#666]" />
                              </button>
                              <button
                                onClick={() => navigateTo('camera-detail', cam.slug)}
                                className="p-1.5 text-xs border border-[#EEEBE6] bg-white hover:border-black transition-colors"
                                title="View Public Page"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#666]" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteModal({ isOpen: true, type: 'camera', id: cam.id, title: cam.name })}
                                className="p-1.5 text-xs border border-[#EEEBE6] text-[#C62828] bg-white hover:border-[#C62828] hover:bg-red-50 transition-colors cursor-pointer"
                                title="Hapus Kamera"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 5: CAMERA PRODUCT EDITOR */}
        {adminTab === 'camera-edit' && (
          <form onSubmit={handleSaveCamera} className="space-y-8 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EEEBE6]">
              <div>
                <button
                  type="button"
                  onClick={() => setAdminTab('cameras')}
                  className="text-xs text-[#888] hover:text-black flex items-center gap-1 mb-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Cameras
                </button>
                <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#1A1A1A]">
                  {editingCameraId ? `Edit ${cameraForm.name}` : 'Add New Camera Model'}
                </h1>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    setCameraForm((prev) => ({
                      ...prev,
                      status: (prev.status ?? 'published') === 'published' ? 'draft' : 'published',
                    }))
                  }
                  className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer border ${
                    (cameraForm.status ?? 'published') === 'published'
                      ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]'
                      : 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]'
                  }`}
                  title="Klik untuk ubah status Publikasi"
                >
                  {(cameraForm.status ?? 'published') === 'published' ? '● Published' : '○ Draft'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-wider font-semibold hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Save Camera Product
                </button>
              </div>
            </div>

            {/* General Info */}
            <div className="bg-white p-6 border border-[#EEEBE6] space-y-4 text-xs">
              <h3 className="font-serif text-lg font-normal text-[#1A1A1A]">Camera Identification & Category</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">Model Name *</label>
                  <input
                    type="text"
                    value={cameraForm.name}
                    onChange={(e) => setCameraForm({ ...cameraForm, name: e.target.value })}
                    placeholder="e.g. Fujifilm X100VI"
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">Brand</label>
                  <select
                    value={cameraForm.brand}
                    onChange={(e) => setCameraForm({ ...cameraForm, brand: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                  >
                    {['Fujifilm', 'Sony', 'Canon', 'Nikon', 'Leica', 'Panasonic', 'Ricoh'].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">Category</label>
                  <select
                    value={cameraForm.category}
                    onChange={(e) => setCameraForm({ ...cameraForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                  >
                    {[
                      'Full-Frame Mirrorless',
                      'APS-C Mirrorless',
                      'Compact & Street',
                      'Medium Format',
                      'Cinema & Video',
                    ].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">Starting Price ($ USD)</label>
                  <input
                    type="number"
                    value={cameraForm.price}
                    onChange={(e) => setCameraForm({ ...cameraForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">Overall Editorial Rating (1-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={cameraForm.rating}
                    onChange={(e) => setCameraForm({ ...cameraForm, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">Publication Status</label>
                  <select
                    value={cameraForm.status ?? 'published'}
                    onChange={(e) => setCameraForm({ ...cameraForm, status: e.target.value as 'published' | 'draft' })}
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                  >
                    <option value="published">Published (Live di website & pencarian)</option>
                    <option value="draft">Draft (Disembunyikan dari publik)</option>
                  </select>
                </div>
                <div className="sm:col-span-3 bg-[#FDFCFB] p-4 border border-[#EEEBE6] rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#1A1A1A] font-semibold">
                        Primary Camera Image (Foto Utama Kamera) *
                      </label>
                      <p className="text-[11px] text-[#777]">
                        Upload file gambar langsung dari perangkat Anda (PNG, JPG, WebP) atau masukkan link gambar web
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => cameraImageFileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-medium rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File Gambar</span>
                      </button>

                      {cameraForm.image && (
                        <button
                          type="button"
                          onClick={() => setCameraForm({ ...cameraForm, image: '' })}
                          className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded-lg cursor-pointer transition-colors"
                        >
                          Hapus Foto
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    ref={cameraImageFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCameraImageFileUpload}
                    className="hidden"
                    id="camera-primary-image-file-input"
                  />

                  {/* Dropzone & Preview Area */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    {/* Visual Preview */}
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingCameraImage(true); }}
                      onDragLeave={() => setIsDraggingCameraImage(false)}
                      onDrop={handleCameraImageDrop}
                      onClick={() => cameraImageFileInputRef.current?.click()}
                      className={`md:col-span-1 aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all relative overflow-hidden group ${
                        isDraggingCameraImage
                          ? 'border-neutral-900 bg-neutral-100'
                          : 'border-neutral-300 hover:border-neutral-900 bg-white'
                      }`}
                    >
                      {cameraForm.image ? (
                        <>
                          <img
                            src={cameraForm.image}
                            alt={cameraForm.name || 'Preview Kamera'}
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 p-2">
                            <UploadCloud className="w-6 h-6" />
                            <span className="text-[11px] font-medium">Klik untuk ganti file gambar</span>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-1.5 p-2">
                          <div className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-500 mx-auto flex items-center justify-center">
                            <Camera className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-semibold text-neutral-800 block">Tarik & Lepas File Gambar</span>
                          <span className="text-[10px] text-neutral-500 block">atau klik untuk browse dari komputer</span>
                        </div>
                      )}
                    </div>

                    {/* Manual Link Input & Helper Details */}
                    <div className="md:col-span-2 space-y-3">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#666] mb-1 font-medium">
                          Atau Masukkan Link URL Gambar:
                        </label>
                        <div className="flex items-center border border-neutral-300 bg-white rounded-lg focus-within:border-black overflow-hidden">
                          <span className="pl-3 pr-2 text-neutral-400">
                            <Link2 className="w-3.5 h-3.5" />
                          </span>
                          <input
                            type="text"
                            value={cameraForm.image}
                            onChange={(e) => setCameraForm({ ...cameraForm, image: e.target.value })}
                            placeholder="https://images.unsplash.com/... atau data:image/..."
                            className="w-full px-2 py-2 text-xs font-mono bg-transparent focus:outline-none"
                          />
                        </div>
                      </div>

                      {isUploadingCameraImage && (
                        <div className="p-2.5 bg-neutral-100 border border-neutral-200 rounded-lg flex items-center gap-2 text-xs text-neutral-700 animate-pulse">
                          <Upload className="w-4 h-4 text-neutral-900 animate-spin" />
                          <span>Mengoptimasi dan memuat file gambar kamera...</span>
                        </div>
                      )}

                      {cameraImageUploadError && (
                        <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                          {cameraImageUploadError}
                        </div>
                      )}

                      <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-[11px] text-neutral-600 space-y-1">
                        <div className="font-semibold text-neutral-800">Tips Format Gambar Kamera:</div>
                        <ul className="list-disc list-inside space-y-0.5 text-neutral-500 text-[10px]">
                          <li>Gunakan foto kamera berlatar bersih atau transparan untuk hasil terbaik di kartu produk & komparasi.</li>
                          <li>Ukuran file otomatis dikompresi menjadi WebP/JPEG ringan agar website tetap cepat dimuat.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">Ideal Use Case</label>
                  <input
                    type="text"
                    value={cameraForm.idealUseCase}
                    onChange={(e) => setCameraForm({ ...cameraForm, idealUseCase: e.target.value })}
                    placeholder="e.g. Street, Travel, Everyday Carry"
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">Short Description</label>
                  <textarea
                    rows={2}
                    value={cameraForm.shortDescription}
                    onChange={(e) => setCameraForm({ ...cameraForm, shortDescription: e.target.value })}
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* Specifications Quick Sheet */}
            <div className="bg-white p-6 border border-[#EEEBE6] space-y-4 text-xs">
              <h3 className="font-serif text-lg font-normal text-[#1A1A1A]">Key Technical Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">Sensor Description</label>
                  <input
                    type="text"
                    value={cameraForm.specs.sensor}
                    onChange={(e) => setCameraForm({ ...cameraForm, specs: { ...cameraForm.specs, sensor: e.target.value } })}
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">Megapixels</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cameraForm.specs.megapixels}
                    onChange={(e) => setCameraForm({ ...cameraForm, specs: { ...cameraForm.specs, megapixels: Number(e.target.value) } })}
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">IBIS (Image Stabilization)</label>
                  <input
                    type="text"
                    value={cameraForm.specs.ibis}
                    onChange={(e) => setCameraForm({ ...cameraForm, specs: { ...cameraForm.specs, ibis: e.target.value } })}
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">Video Recording</label>
                  <input
                    type="text"
                    value={cameraForm.specs.videoSpecs}
                    onChange={(e) => setCameraForm({ ...cameraForm, specs: { ...cameraForm.specs, videoSpecs: e.target.value } })}
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">Weight</label>
                  <input
                    type="text"
                    value={cameraForm.specs.weight}
                    onChange={(e) => setCameraForm({ ...cameraForm, specs: { ...cameraForm.specs, weight: e.target.value } })}
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">Lens Mount</label>
                  <input
                    type="text"
                    value={cameraForm.specs.mount}
                    onChange={(e) => setCameraForm({ ...cameraForm, specs: { ...cameraForm.specs, mount: e.target.value } })}
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* Affiliate Links Management for This Camera */}
            <div className="bg-white p-6 border border-[#EEEBE6] space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-normal text-[#1A1A1A]">Affiliate Retailer Links</h3>
                <button
                  type="button"
                  onClick={() => {
                    const newLink = {
                      id: 'aff-' + Date.now(),
                      retailer: 'Amazon',
                      url: 'https://www.amazon.com?tag=fujifinder-20',
                      price: cameraForm.price,
                      currency: '$',
                      inStock: true,
                      badge: 'Authorized Stock',
                    };
                    setCameraForm((prev) => ({ ...prev, affiliateLinks: [...prev.affiliateLinks, newLink] }));
                  }}
                  className="px-3 py-1.5 bg-[#FDFCFB] border border-[#EEEBE6] hover:border-black text-[11px] uppercase tracking-wider font-medium transition-colors cursor-pointer"
                >
                  + Add Retailer
                </button>
              </div>

              <div className="space-y-3">
                {cameraForm.affiliateLinks.length === 0 ? (
                  <div className="p-4 border border-dashed border-[#EEEBE6] text-center text-[#888] bg-[#FAF9F6]">
                    <p className="font-medium text-neutral-700">Belum ada retailer affiliate link untuk kamera ini.</p>
                    <p className="text-[11px] mt-1 text-neutral-500">Klik "+ Add Retailer" di atas untuk menambahkan link toko online (Amazon, B&H, Tokopedia, Shopee, Blibli, dsb).</p>
                  </div>
                ) : (
                  cameraForm.affiliateLinks.map((link, idx) => {
                    const PRESET_RETAILERS = ['Amazon', 'B&H Photo', 'Adorama', 'Moment', 'MPB (Used)'];
                    const isPreset = PRESET_RETAILERS.includes(link.retailer);

                    return (
                      <div key={link.id || idx} className="p-3.5 bg-[#FDFCFB] border border-[#EEEBE6] space-y-2.5">
                        <div className="flex items-center justify-between pb-1 border-b border-[#EEEBE6]">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[#888] uppercase tracking-wider">
                              Retailer #{idx + 1}
                            </span>
                            {link.retailer ? (
                              <span className="px-2 py-0.5 text-[10px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
                                {link.retailer}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                Harap tentukan nama platform
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = cameraForm.affiliateLinks.filter((_, i) => i !== idx);
                              setCameraForm({ ...cameraForm, affiliateLinks: updated });
                            }}
                            className="p-1 px-2 text-[10px] text-[#C62828] hover:bg-red-50 border border-transparent hover:border-[#FFCDD2] transition-colors cursor-pointer flex items-center gap-1 font-medium"
                            title="Hapus retailer link ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start pt-1">
                          <div className="sm:col-span-4 space-y-1.5">
                            <label className="block text-[10px] text-[#888] uppercase tracking-wider font-medium">
                              Retailer / Platform
                            </label>
                            <select
                              value={isPreset ? link.retailer : 'Other'}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = [...cameraForm.affiliateLinks];
                                if (val === 'Other') {
                                  // Switch to manual custom entry; clear if it was a preset
                                  updated[idx].retailer = isPreset ? '' : updated[idx].retailer;
                                } else {
                                  updated[idx].retailer = val;
                                }
                                setCameraForm({ ...cameraForm, affiliateLinks: updated });
                              }}
                              className="w-full p-1.5 border border-[#EEEBE6] bg-white text-xs focus:outline-none focus:border-black"
                            >
                              {PRESET_RETAILERS.map((r) => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                              <option value="Other">Others / Platform Lain (Ketik Manual)...</option>
                            </select>

                            {(!isPreset || link.retailer === '') && (
                              <div className="space-y-1">
                                <input
                                  type="text"
                                  placeholder="Ketik nama platform (cth: Tokopedia, Shopee, Blibli)"
                                  value={link.retailer}
                                  onChange={(e) => {
                                    const updated = [...cameraForm.affiliateLinks];
                                    updated[idx].retailer = e.target.value;
                                    setCameraForm({ ...cameraForm, affiliateLinks: updated });
                                  }}
                                  className="w-full p-1.5 border border-black bg-white text-xs placeholder:text-neutral-400 focus:outline-none"
                                  autoFocus={link.retailer === ''}
                                />
                                <span className="text-[10px] text-neutral-500 block">
                                  Bisa diisi platform lokal atau internasional lainnya.
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="sm:col-span-5 space-y-1.5">
                            <label className="block text-[10px] text-[#888] uppercase tracking-wider font-medium">
                              Affiliate Destination URL
                            </label>
                            <input
                              type="text"
                              placeholder="https://..."
                              value={link.url}
                              onChange={(e) => {
                                const updated = [...cameraForm.affiliateLinks];
                                updated[idx].url = e.target.value;
                                setCameraForm({ ...cameraForm, affiliateLinks: updated });
                              }}
                              className="w-full p-1.5 border border-[#EEEBE6] bg-white text-xs font-mono focus:outline-none focus:border-black"
                            />
                          </div>

                          <div className="sm:col-span-3 space-y-1.5">
                            <label className="block text-[10px] text-[#888] uppercase tracking-wider font-medium">
                              Price ($ USD)
                            </label>
                            <input
                              type="number"
                              value={link.price}
                              onChange={(e) => {
                                const updated = [...cameraForm.affiliateLinks];
                                updated[idx].price = Number(e.target.value);
                                setCameraForm({ ...cameraForm, affiliateLinks: updated });
                              }}
                              className="w-full p-1.5 border border-[#EEEBE6] bg-white text-xs focus:outline-none focus:border-black"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EEEBE6]">
              <button
                type="button"
                onClick={() => setAdminTab('cameras')}
                className="px-4 py-2 text-xs font-medium text-[#666] hover:text-black uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-wider font-semibold hover:opacity-90 cursor-pointer"
              >
                Save Camera
              </button>
            </div>
          </form>
        )}

        {/* TAB 6: CENTRAL AFFILIATE LINKS MANAGEMENT */}
        {adminTab === 'affiliates' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="pb-4 border-b border-[#EEEBE6]">
              <h1 className="font-serif text-3xl font-normal text-[#1A1A1A]">Central Affiliate Link Hub</h1>
              <p className="text-xs text-[#666] mt-1">
                Manage all partner tracking links in one place. Any URL update here automatically propagates across all camera cards, comparison charts, and embedded article product boxes!
              </p>
            </div>

            <div className="bg-white border border-[#EEEBE6] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FDFCFB] border-b border-[#EEEBE6] text-[#888] uppercase tracking-[0.15em] font-medium text-[10px]">
                  <tr>
                    <th className="p-4">Camera Product</th>
                    <th className="p-4">Retailer</th>
                    <th className="p-4">Affiliate URL</th>
                    <th className="p-4">Live Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEBE6]">
                  {cameras.flatMap((cam) =>
                    cam.affiliateLinks.map((link) => (
                      <tr key={link.id} className="hover:bg-[#FDFCFB] transition-colors">
                        <td className="p-4 font-serif font-normal text-[#1A1A1A]">{cam.name}</td>
                        <td className="p-4 font-medium text-[#666]">{link.retailer}</td>
                        <td className="p-4 max-w-xs truncate font-mono text-[11px] text-[#666]">
                          <input
                            type="text"
                            defaultValue={link.url}
                            onBlur={(e) => {
                              if (e.target.value !== link.url) {
                                updateAffiliateLink(cam.id, link.id, e.target.value);
                              }
                            }}
                            className="w-full px-2 py-1 bg-[#FDFCFB] border border-[#EEEBE6] focus:outline-none focus:border-black"
                          />
                        </td>
                        <td className="p-4 font-serif font-normal text-[#1A1A1A]">${link.price.toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${link.inStock ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#C62828]'}`}>
                            {link.inStock ? 'In Stock' : 'Backorder'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-[#1A1A1A] hover:underline inline-flex items-center gap-1"
                          >
                            Test <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: MEDIA LIBRARY */}
        {adminTab === 'media' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="pb-4 border-b border-[#EEEBE6]">
              <h1 className="font-serif text-3xl font-normal text-[#1A1A1A]">Media Asset Library</h1>
              <p className="text-xs text-[#666] mt-1">High-resolution camera photography, sample shots, and editorial banners</p>
            </div>

            {/* Upload / Add Form */}
            <form onSubmit={handleAddMedia} className="bg-white p-5 border border-[#EEEBE6] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-serif text-sm font-normal text-[#1A1A1A]">Add Image Asset</h3>
                <label className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 cursor-pointer shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File Gambar ke Library</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const dataUrl = await readFileAsOptimizedDataUrl(file, 1600, 1600, 0.85);
                        addMediaAsset({
                          title: file.name.replace(/\.[^/.]+$/, '') || 'Media Asset',
                          url: dataUrl,
                          category: 'samples',
                        });
                      } catch (err: any) {
                        alert(err.message || 'Gagal membaca gambar');
                      } finally {
                        e.target.value = '';
                      }
                    }}
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    value={newMediaTitle}
                    onChange={(e) => setNewMediaTitle(e.target.value)}
                    placeholder="Asset Title / Caption"
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                    required
                  />
                </div>
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    placeholder="Atau tempel Image URL (Unsplash, CDN, WebP)..."
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full py-2 px-3 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-wider font-semibold hover:opacity-90 cursor-pointer"
                  >
                    Add via URL
                  </button>
                </div>
              </div>
            </form>

            {/* Media Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {mediaAssets.map((media) => (
                <div key={media.id} className="bg-white border border-[#EEEBE6] overflow-hidden p-3 space-y-2">
                  <div className="h-40 overflow-hidden bg-[#EEEBE6]">
                    <img src={media.url} alt={media.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <h5 className="font-medium text-[#1A1A1A] truncate max-w-[150px]">{media.title}</h5>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(media.url);
                        alert('Image URL copied to clipboard!');
                      }}
                      className="text-[10px] text-[#888] hover:text-black underline cursor-pointer"
                    >
                      Copy URL
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#888] pt-1 border-t border-[#EEEBE6]">
                    <span>{media.dimensions}</span>
                    <button
                      onClick={() => deleteMediaAsset(media.id)}
                      className="text-[#C62828] hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: SITE & SEO SETTINGS */}
        {adminTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="pb-4 border-b border-[#EEEBE6]">
              <h1 className="font-serif text-3xl font-normal text-[#1A1A1A]">Platform & Affiliate Settings</h1>
              <p className="text-xs text-[#666] mt-1">Configure site branding, affiliate disclosure language, and merchant partner tags</p>
            </div>

            {/* Blog URL & Slug Permalink Settings Card */}
            <div className="bg-white p-6 border border-[#EEEBE6] space-y-5 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#EEEBE6]">
                <div>
                  <h2 className="font-serif text-lg font-normal text-[#1A1A1A] flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-neutral-800" />
                    <span>Struktur URL & Slug Blog (Permalink Settings)</span>
                  </h2>
                  <p className="text-xs text-[#666] mt-0.5">
                    Konfigurasi awalan slug (URL path prefix) untuk semua ulasan, panduan editorial, dan artikel blog
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-neutral-100 text-neutral-800 text-[10px] font-mono font-bold tracking-wider rounded">
                  {siteSettings.blogSlugPrefix || '/article/'}:slug
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">
                    URL Domain Situs (Canonical Site URL)
                  </label>
                  <input
                    type="text"
                    value={siteSettings.siteUrl}
                    onChange={(e) => updateSiteSettings({ siteUrl: e.target.value })}
                    placeholder="https://fujifinder.com"
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] font-mono focus:outline-none focus:border-black"
                  />
                  <span className="text-[10px] text-[#888] mt-1 block">Domain dasar untuk canonical SEO & salin link</span>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">
                    Awalan Slug Blog (Blog Slug Prefix)
                  </label>
                  <div className="flex items-center border border-[#EEEBE6] bg-[#FDFCFB] focus-within:border-black">
                    <input
                      type="text"
                      value={siteSettings.blogSlugPrefix || '/article/'}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (!val.startsWith('/')) val = '/' + val;
                        if (!val.endsWith('/')) val = val + '/';
                        updateSiteSettings({ blogSlugPrefix: val });
                      }}
                      placeholder="/article/"
                      className="w-full px-3 py-2 text-xs font-mono bg-transparent focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-[#888] mt-1 block">Contoh: /article/, /blog/, /journal/, /review/</span>
                </div>
              </div>

              {/* Navigation Slugs Controls */}
              <div className="pt-3 border-t border-[#EEEBE6] space-y-3">
                <span className="text-[11px] uppercase tracking-wider text-[#666] font-semibold block">
                  Slug Navigasi Utama Website:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase text-[#666] mb-1 font-medium">Slug Home (Beranda)</label>
                    <div className="flex items-center border border-[#EEEBE6] bg-[#FDFCFB] focus-within:border-black">
                      <span className="pl-2 pr-1 text-[11px] text-neutral-400 font-mono">#/</span>
                      <input
                        type="text"
                        value={siteSettings.homeSlug ?? 'home'}
                        onChange={(e) => updateSiteSettings({ homeSlug: e.target.value.toLowerCase().trim() })}
                        placeholder="home"
                        className="w-full px-1.5 py-1.5 text-xs font-mono bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-[#666] mb-1 font-medium">Slug Cameras (Katalog)</label>
                    <div className="flex items-center border border-[#EEEBE6] bg-[#FDFCFB] focus-within:border-black">
                      <span className="pl-2 pr-1 text-[11px] text-neutral-400 font-mono">#/</span>
                      <input
                        type="text"
                        value={siteSettings.camerasSlug ?? 'cameras'}
                        onChange={(e) => updateSiteSettings({ camerasSlug: e.target.value.toLowerCase().trim() })}
                        placeholder="cameras"
                        className="w-full px-1.5 py-1.5 text-xs font-mono bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-[#666] mb-1 font-medium">Slug Blog (Ulasan & Guides)</label>
                    <div className="flex items-center border border-[#EEEBE6] bg-[#FDFCFB] focus-within:border-black">
                      <span className="pl-2 pr-1 text-[11px] text-neutral-400 font-mono">#/</span>
                      <input
                        type="text"
                        value={siteSettings.blogSlug ?? 'blog'}
                        onChange={(e) => updateSiteSettings({ blogSlug: e.target.value.toLowerCase().trim() })}
                        placeholder="blog"
                        className="w-full px-1.5 py-1.5 text-xs font-mono bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase tracking-wider text-[#777] font-semibold block">
                  Pilihan Cepat Format URL Slug:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Standar (/article/)', value: '/article/' },
                    { label: 'Format Blog (/blog/)', value: '/blog/' },
                    { label: 'Format Journal (/journal/)', value: '/journal/' },
                    { label: 'Format Ulasan (/review/)', value: '/review/' },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => updateSiteSettings({ blogSlugPrefix: preset.value })}
                      className={`px-3 py-1.5 text-xs font-mono rounded border transition-colors cursor-pointer ${
                        (siteSettings.blogSlugPrefix || '/article/') === preset.value
                          ? 'bg-black text-white border-black font-semibold'
                          : 'bg-[#FDFCFB] text-[#444] border-[#EEEBE6] hover:border-black'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-3.5 bg-[#F9F8F6] border border-[#E8E5DF] rounded space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#555] tracking-wider">
                    Contoh URL Lengkap Artikel Blog:
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">✓ Sinkron otomatis</span>
                </div>
                <div className="font-mono text-xs text-neutral-900 bg-white p-2 border border-[#E0DCD5] rounded select-all break-all">
                  {siteSettings.siteUrl || 'https://www.fujifinder.my.id'}{siteSettings.blogSlugPrefix || '/article/'}best-street-photography-cameras-2026
                </div>
                <p className="text-[10px] text-[#777]">
                  Semua tombol artikel di halaman ulasan, landing page, pencarian, dan share link akan otomatis menggunakan struktur slug ini.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 border border-[#EEEBE6] space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">Publication Name</label>
                  <input
                    type="text"
                    value={siteSettings.siteName}
                    onChange={(e) => updateSiteSettings({ siteName: e.target.value })}
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">Tagline</label>
                  <input
                    type="text"
                    value={siteSettings.tagline}
                    onChange={(e) => updateSiteSettings({ tagline: e.target.value })}
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">Amazon Associates Tag</label>
                  <input
                    type="text"
                    value={siteSettings.amazonAssociateTag}
                    onChange={(e) => updateSiteSettings({ amazonAssociateTag: e.target.value })}
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">B&H Photo Affiliate ID</label>
                  <input
                    type="text"
                    value={siteSettings.bhPhotoTag}
                    onChange={(e) => updateSiteSettings({ bhPhotoTag: e.target.value })}
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">FTC Affiliate Transparency Text</label>
                  <textarea
                    rows={3}
                    value={siteSettings.affiliateDisclosureText}
                    onChange={(e) => updateSiteSettings({ affiliateDisclosureText: e.target.value })}
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#EEEBE6] flex items-center justify-between">
                <span className="text-[11px] text-[#2E7D32] font-semibold">
                  ✓ Changes are saved instantly and persisted locally
                </span>
                <button
                  onClick={resetToDemoData}
                  className="px-4 py-2 border border-[#EEEBE6] text-xs font-medium text-[#C62828] hover:border-[#C62828] bg-white cursor-pointer"
                >
                  Reset Platform to Clean Demo State
                </button>
              </div>
            </div>

            {/* Dedicated Admin Account Management */}
            <div className="bg-white p-6 border border-[#EEEBE6] space-y-5 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#EEEBE6]">
                <div>
                  <h2 className="font-serif text-lg font-normal text-[#1A1A1A] flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-500" />
                    <span>Akun Khusus Admin & Keamanan</span>
                  </h2>
                  <p className="text-xs text-[#666] mt-0.5">
                    Kelola kredensial login admin untuk mengakses Dashboard CMS FujiFinder
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-[#1A1A1A] text-white text-[10px] uppercase font-bold tracking-wider rounded">
                  Super Admin
                </span>
              </div>

              {adminSaveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center justify-between animate-in fade-in">
                  <span>✓ Kredensial akun admin berhasil diperbarui dan disimpan!</span>
                  <button onClick={() => setAdminSaveSuccess(false)} className="text-emerald-900 font-bold">×</button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">
                    Nama Admin
                  </label>
                  <input
                    type="text"
                    value={adminNameEdit}
                    onChange={(e) => setAdminNameEdit(e.target.value)}
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">
                    Email Login Admin
                  </label>
                  <input
                    type="email"
                    value={adminEmailEdit}
                    onChange={(e) => setAdminEmailEdit(e.target.value)}
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1 font-medium">
                    Kata Sandi (Password)
                  </label>
                  <input
                    type="text"
                    value={adminPasswordEdit}
                    onChange={(e) => setAdminPasswordEdit(e.target.value)}
                    className="w-full px-3 py-2 border border-[#EEEBE6] bg-[#FDFCFB] focus:outline-none focus:border-black font-mono font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#EEEBE6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-[11px] text-[#666]">
                  Akun aktif: <strong className="text-black">{adminAccount.email}</strong> • Role: <span className="text-emerald-700 font-semibold">{adminAccount.role}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateAdminAccount({
                      name: adminNameEdit,
                      email: adminEmailEdit,
                      passwordHash: adminPasswordEdit,
                    });
                    setAdminSaveSuccess(true);
                    setTimeout(() => setAdminSaveSuccess(false), 4000);
                  }}
                  className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan Akun Admin</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: TAXONOMY & CATEGORIES */}
        {adminTab === 'categories' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="pb-4 border-b border-[#EEEBE6]">
              <h1 className="font-serif text-3xl font-normal text-[#1A1A1A]">Taxonomy & Category Architecture</h1>
              <p className="text-xs text-[#666] mt-1">Manage editorial categories and camera taxonomy</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-6 border border-[#EEEBE6] space-y-4">
                <h3 className="font-serif text-lg font-normal text-[#1A1A1A]">Editorial Categories</h3>
                <ul className="space-y-2 text-xs">
                  {['Camera Guides', 'Reviews', 'Comparisons', 'Photography', 'Videography', 'Vlogging', 'Beginner Guides', 'Accessories'].map((cat) => (
                    <li key={cat} className="flex items-center justify-between p-2.5 bg-[#FDFCFB] border border-[#EEEBE6]">
                      <span className="font-medium text-[#1A1A1A]">{cat}</span>
                      <span className="text-[#888]">{articles.filter(a => a.category === cat).length} articles</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-6 border border-[#EEEBE6] space-y-4">
                <h3 className="font-serif text-lg font-normal text-[#1A1A1A]">Camera System Formats</h3>
                <ul className="space-y-2 text-xs">
                  {['Full-Frame Mirrorless', 'APS-C Mirrorless', 'Compact & Street', 'Medium Format', 'Cinema & Video'].map((fmt) => (
                    <li key={fmt} className="flex items-center justify-between p-2.5 bg-[#FDFCFB] border border-[#EEEBE6]">
                      <span className="font-medium text-[#1A1A1A]">{fmt}</span>
                      <span className="text-[#888]">{cameras.filter(c => c.category === fmt).length} cameras</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB: NEWSLETTER & EMAIL DISPATCH SYSTEM */}
        {adminTab === 'newsletter' && (
          <div className="animate-in fade-in duration-200">
            <NewsletterAdminManager />
          </div>
        )}

        {/* TAB 10: EXTENSIBLE PLUGIN MANAGEMENT SYSTEM */}
        {adminTab === 'plugins' && (
          <div className="animate-in fade-in duration-200">
            <PluginManager />
          </div>
        )}

        {/* IN-APP DELETE CONFIRMATION MODAL */}
        {deleteModal && deleteModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-[#EEEBE6] shadow-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-normal text-[#1A1A1A]">
                    Konfirmasi Hapus {deleteModal.type === 'article' ? 'Artikel' : 'Kamera'}
                  </h3>
                  <p className="text-xs text-[#666]">
                    Tindakan ini permanen dan akan menghapus data dari sistem.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF9F6] border border-[#EEEBE6] text-xs text-[#333] leading-relaxed">
                Apakah Anda yakin ingin menghapus {deleteModal.type === 'article' ? 'artikel' : 'produk kamera'}{' '}
                <strong className="text-black font-semibold">"{deleteModal.title}"</strong>?
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteModal(null)}
                  className="px-4 py-2 border border-[#DDD] text-xs font-medium text-[#555] hover:bg-neutral-100 hover:text-black transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (deleteModal.type === 'article') {
                      deleteArticle(deleteModal.id);
                      setDeleteSuccessToast(`Artikel "${deleteModal.title}" berhasil dihapus.`);
                    } else {
                      deleteCamera(deleteModal.id);
                      setDeleteSuccessToast(`Kamera "${deleteModal.title}" berhasil dihapus.`);
                    }
                    setDeleteModal(null);
                    setTimeout(() => setDeleteSuccessToast(null), 4000);
                  }}
                  className="px-4 py-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Ya, Hapus Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE SUCCESS TOAST */}
        {deleteSuccessToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A1A] text-white px-4 py-3 shadow-xl border border-[#333] text-xs flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-200">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{deleteSuccessToast}</span>
          </div>
        )}
      </main>
    </div>
  );
};
