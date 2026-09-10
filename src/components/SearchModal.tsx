import React, { useEffect, useRef } from 'react';
import { Search, X, Camera, BookOpen, Star, ArrowRight } from 'lucide-react';
import { useData } from '../context/DataContext';

export const SearchModal: React.FC = () => {
  const { 
    searchModalOpen, 
    setSearchModalOpen, 
    searchQuery, 
    setSearchQuery, 
    cameras, 
    articles, 
    navigateTo 
  } = useData();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchModalOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchModalOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchModalOpen]);

  if (!searchModalOpen) return null;

  const query = searchQuery.trim().toLowerCase();
  const publishedCameras = cameras.filter((c) => (c.status ?? 'published') === 'published');

  const matchingCameras = query
    ? publishedCameras.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.brand.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query) ||
          c.idealUseCase.toLowerCase().includes(query)
      )
    : publishedCameras.slice(0, 4);

  const matchingArticles = query
    ? articles.filter(
        (a) =>
          a.status === 'published' && (
            a.title.toLowerCase().includes(query) ||
            a.category.toLowerCase().includes(query) ||
            a.excerpt.toLowerCase().includes(query) ||
            (a.seo?.focusKeyword && a.seo.focusKeyword.toLowerCase().includes(query)) ||
            (a.author?.name && a.author.name.toLowerCase().includes(query)) ||
            a.blocks?.some((b) => b.text && b.text.toLowerCase().includes(query))
          )
      )
    : articles.filter((a) => a.status === 'published').slice(0, 3);

  const handleSelectCamera = (slug: string) => {
    setSearchModalOpen(false);
    navigateTo('camera-detail', slug);
  };

  const handleSelectArticle = (slug: string) => {
    setSearchModalOpen(false);
    navigateTo('article-detail', slug);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 pt-16 sm:pt-24 animate-in fade-in duration-200"
      onClick={() => setSearchModalOpen(false)}
    >
      <div 
        className="w-full max-w-2xl bg-white border border-[#EEEBE6] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="p-4 sm:p-5 border-b border-[#EEEBE6] flex items-center gap-3 bg-[#FDFCFB]">
          <Search className="w-4 h-4 text-[#888] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cameras, reviews, comparisons, or guides..."
            className="flex-1 bg-transparent text-[#1A1A1A] placeholder-[#888] text-sm focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs uppercase tracking-widest text-[#888] hover:text-black p-1"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setSearchModalOpen(false)}
            className="p-1 text-[#888] hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Cameras Section */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold text-[#888] uppercase tracking-widest mb-3">
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" /> Cameras & Gear ({matchingCameras.length})
              </span>
              <button
                onClick={() => {
                  setSearchModalOpen(false);
                  navigateTo('cameras');
                }}
                className="hover:text-black cursor-pointer"
              >
                Browse All
              </button>
            </div>

            {matchingCameras.length === 0 ? (
              <p className="text-xs text-[#888] italic py-2">No cameras found matching "{searchQuery}"</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matchingCameras.map((cam) => (
                  <div
                    key={cam.id}
                    onClick={() => handleSelectCamera(cam.slug)}
                    className="flex items-center gap-3 p-3 border border-[#EEEBE6] hover:border-black bg-white transition-all cursor-pointer group"
                  >
                    <img
                      src={cam.image}
                      alt={cam.name}
                      className="w-12 h-12 object-cover bg-[#E5E2DD] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] uppercase font-bold tracking-wider text-[#888]">{cam.brand}</div>
                      <h5 className="font-serif text-sm font-normal text-[#1A1A1A] group-hover:opacity-75 truncate">
                        {cam.name}
                      </h5>
                      <div className="flex items-center justify-between text-xs mt-0.5">
                        <span className="font-serif font-light text-[#1A1A1A]">${cam.price.toLocaleString()}</span>
                        <span className="text-[#1A1A1A] text-[10px] font-semibold flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-[#1A1A1A]" /> {cam.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Articles Section */}
          <div className="pt-4 border-t border-[#EEEBE6]">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#888] uppercase tracking-widest mb-3">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Editorial Articles & Guides ({matchingArticles.length})
              </span>
              <button
                onClick={() => {
                  setSearchModalOpen(false);
                  navigateTo('blog');
                }}
                className="hover:text-black cursor-pointer"
              >
                View Journal
              </button>
            </div>

            {matchingArticles.length === 0 ? (
              <p className="text-xs text-[#888] italic py-2">No articles found matching "{searchQuery}"</p>
            ) : (
              <div className="space-y-2.5">
                {matchingArticles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => handleSelectArticle(art.slug)}
                    className="flex items-center justify-between p-3 border border-[#EEEBE6] hover:border-black bg-white transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={art.coverImage}
                        alt={art.title}
                        className="w-14 h-12 object-cover bg-[#E5E2DD] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#888]">
                          {art.category}
                        </span>
                        <h5 className="font-serif text-sm font-normal text-[#1A1A1A] group-hover:opacity-75 truncate">
                          {art.title}
                        </h5>
                        <span className="text-[10px] text-[#888] uppercase tracking-wider">
                          {art.publishedAt} • {art.readTimeMinutes} min read
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#888] group-hover:text-black group-hover:translate-x-1 transition-all ml-2 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-[#FDFCFB] border-t border-[#EEEBE6] text-[10px] uppercase tracking-widest text-[#888] flex items-center justify-between px-5">
          <span>Press <strong className="text-[#1A1A1A]">ESC</strong> to close</span>
          <span>Tip: Press <strong className="text-[#1A1A1A]">⌘ + K</strong> anytime</span>
        </div>
      </div>
    </div>
  );
};
