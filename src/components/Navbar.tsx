import React, { useState } from 'react';
import { 
  Search, 
  Menu, 
  X, 
  Camera, 
  Sliders, 
  Compass, 
  BookOpen, 
  Layers, 
  Settings, 
  ChevronRight,
  Sparkles,
  Lock,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useData } from '../context/DataContext';

export const Navbar: React.FC = () => {
  const { 
    currentView, 
    navigateTo, 
    siteSettings,
    setSearchModalOpen, 
    setSelectedCategory,
    isAdminLoggedIn,
    adminUser,
    logoutAdmin
  } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const homeSlug = (siteSettings.homeSlug || '').replace(/^\/+|\/+$/g, '');
  const camerasSlug = (siteSettings.camerasSlug || 'cameras').replace(/^\/+|\/+$/g, '');
  const blogSlug = (siteSettings.blogSlug || 'blog').replace(/^\/+|\/+$/g, '');

  const navLinks = [
    { label: 'Home', view: 'landing', slug: homeSlug || 'home' },
    { 
      label: 'Blog', 
      view: 'blog', 
      slug: blogSlug,
      onClick: () => {
        setSelectedCategory(null);
        navigateTo('blog');
      }
    },
  ];

  const handleNavClick = (link: typeof navLinks[0]) => {
    if (link.onClick) {
      link.onClick();
    } else {
      navigateTo(link.view);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EEEBE6] transition-all">
      {/* Top Editorial Bar */}
      <div className="bg-[#1A1A1A] text-[#FAF9F6] text-[10px] py-1.5 px-4 sm:px-8 tracking-widest uppercase flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-2 text-[#999]">
          <span className="inline-block w-1.5 h-1.5 bg-[#4ADE80] rounded-full"></span>
          <span>Independent Camera Journal & Lab Reviews</span>
        </div>
        <div className="mx-auto sm:mx-0 text-[#CCC] font-medium tracking-wider">
          Field Guide: Mirrorless, Compacts & Lenses for Creators
        </div>
        <div className="flex items-center gap-3">
          {isAdminLoggedIn ? (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigateTo('admin')}
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer text-[10px] uppercase tracking-widest font-semibold"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Log</span>
              </button>
              <button
                onClick={logoutAdmin}
                className="text-[#888] hover:text-red-400 transition-colors cursor-pointer text-[10px] uppercase tracking-wider flex items-center gap-1"
                title="Keluar dari akun admin"
              >
                <LogOut className="w-3 h-3" />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigateTo('admin')}
              className="flex items-center gap-1 text-[#CCC] hover:text-white transition-colors cursor-pointer text-[10px] uppercase tracking-widest"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span className="font-semibold underline decoration-dotted">Login Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-[68px] flex items-center justify-between gap-4">
        {/* Logo */}
        <div 
          onClick={() => navigateTo('landing')}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center group-hover:bg-neutral-200 transition-colors">
            <Camera className="w-4 h-4 text-[#1A1A1A]" />
          </div>
          <span className="font-sans text-xl font-bold tracking-tight text-[#1A1A1A] group-hover:opacity-85 transition-opacity">
            FujiFinder
          </span>
        </div>

        {/* Navigation Links: Home & Blog only */}
        <nav className="hidden sm:flex items-center space-x-6 sm:space-x-8 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = 
              link.view === 'landing' 
                ? currentView === 'landing' 
                : (currentView === 'blog' || currentView === 'article-detail');

            return (
              <button
                key={link.label}
                id={`nav-link-${link.label.toLowerCase()}`}
                onClick={() => handleNavClick(link)}
                className={`relative py-2 transition-colors cursor-pointer text-sm ${
                  isActive
                    ? 'text-neutral-900 font-bold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-neutral-900 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Search & CTA */}
        <div className="hidden sm:flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setSearchModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-full border border-neutral-200 transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-neutral-100 border border-neutral-200 rounded font-mono text-neutral-500">
              ⌘K
            </kbd>
          </button>

          <button
            id="nav-explore-cameras-cta"
            onClick={() => navigateTo('cameras')}
            className="bg-neutral-900 text-white hover:bg-black px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <span>Explore Cameras</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Menu & Search triggers */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={() => setSearchModalOpen(true)}
            className="p-2 text-[#1A1A1A] hover:bg-[#F9F8F6] border border-[#EEEBE6]"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#1A1A1A] hover:bg-[#F9F8F6] border border-[#EEEBE6] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-[#EEEBE6] px-5 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link)}
                className="w-full text-left py-2.5 px-2 font-medium text-xs uppercase tracking-widest text-[#1A1A1A] hover:bg-[#F9F8F6] flex items-center justify-between border-b border-[#EEEBE6]"
              >
                <span>{link.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#888]" />
              </button>
            ))}
          </div>

          <div className="pt-2 space-y-2">
            <button
              onClick={() => {
                navigateTo('cameras');
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-[0.2em] font-semibold text-center"
            >
              Katalog Review Kamera
            </button>
            {isAdminLoggedIn ? (
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    navigateTo('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 bg-emerald-950/20 border border-emerald-500/40 text-emerald-800 text-[10px] uppercase tracking-widest font-semibold text-center flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Log
                </button>
                <button
                  onClick={() => {
                    logoutAdmin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-center text-xs text-red-600 hover:underline flex items-center justify-center gap-1 font-medium"
                >
                  <LogOut className="w-3 h-3" />
                  Keluar dari Admin
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  navigateTo('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 border border-[#EEEBE6] text-[10px] uppercase tracking-widest text-[#666] hover:border-black text-center flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                Masuk ke Admin CMS
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
