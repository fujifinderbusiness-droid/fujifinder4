import React, { useState, useMemo } from 'react';
import { Search, Filter, Clock, ArrowRight, Tag, BookOpen } from 'lucide-react';
import { useData } from '../context/DataContext';
import { ArticleCategory } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const BlogPage: React.FC = () => {
  const { articles, selectedCategory, setSelectedCategory, navigateTo } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);

  const categories: ('All' | ArticleCategory)[] = [
    'All',
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
  ];

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      // Only show published articles to public readers
      if (art.status !== 'published') return false;

      const matchesCat = 
        !selectedCategory || 
        selectedCategory === 'All' || 
        art.category.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'Mirrorless' && art.category.toLowerCase().includes('mirrorless'));

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.excerpt.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q) ||
        art.author.name.toLowerCase().includes(q) ||
        (art.seo?.focusKeyword && art.seo.focusKeyword.toLowerCase().includes(q)) ||
        art.blocks.some((b) => b.text && b.text.toLowerCase().includes(q));

      return matchesCat && matchesSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  const featuredArticle = useMemo(() => {
    return (
      articles.find((a) => a.status === 'published' && (a.isFeaturedStory || a.isFeaturedContent || a.featured)) ||
      articles.find((a) => a.status === 'published')
    );
  }, [articles]);
  const listArticles = filteredArticles.filter((a) => a.id !== featuredArticle?.id || selectedCategory || searchQuery);

  const displayedArticles = listArticles.slice(0, visibleCount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 text-left">
      <Breadcrumbs items={[{ label: 'Editorial Journal & Guides', active: true }]} />

      {/* Hero Header */}
      <div className="border-b border-[#EEEBE6] pb-8">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#888]">
          FujiFinder Editorial Journal
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#1A1A1A] mt-1">
          Camera Intelligence, Field Tests & Guides
        </h1>
        <p className="text-sm sm:text-base text-[#666] mt-2 max-w-2xl leading-relaxed">
          Deep-dive reviews, head-to-head comparisons, and practical techniques to help you choose and master your photography gear.
        </p>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 pb-2 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = (!selectedCategory && cat === 'All') || selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === 'All' ? null : cat)}
                className={`px-4 py-2 text-[11px] uppercase tracking-wider font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                  isSelected
                    ? 'bg-[#1A1A1A] text-white border-black'
                    : 'bg-white text-[#666] border-[#EEEBE6] hover:border-black'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Cover Story (when no filter active) */}
      {!selectedCategory && !searchQuery && featuredArticle && (
        <div 
          onClick={() => navigateTo('article-detail', featuredArticle.slug)}
          className="group bg-white border border-[#EEEBE6] hover:border-black transition-all duration-200 cursor-pointer grid grid-cols-1 lg:grid-cols-12"
        >
          <div className="lg:col-span-7 h-72 sm:h-96 lg:h-[440px] overflow-hidden bg-[#E5E2DD] relative">
            <img
              src={featuredArticle.coverImage}
              alt={featuredArticle.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute top-4 left-4 bg-[#1A1A1A] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1">
              Cover Story • {featuredArticle.category}
            </div>
          </div>

          <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#888] mb-2 font-medium">
                <span>{featuredArticle.publishedAt}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {featuredArticle.readTimeMinutes} min read
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#1A1A1A] group-hover:text-black transition-colors leading-tight">
                {featuredArticle.title}
              </h2>

              <p className="text-xs sm:text-sm text-[#666] mt-3 leading-relaxed line-clamp-4">
                {featuredArticle.excerpt}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-[#EEEBE6] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={featuredArticle.author.avatar}
                  alt={featuredArticle.author.name}
                  className="w-8 h-8 object-cover border border-[#EEEBE6]"
                />
                <div>
                  <div className="text-xs font-semibold text-[#1A1A1A]">{featuredArticle.author.name}</div>
                  <div className="text-[10px] text-[#888]">{featuredArticle.author.role}</div>
                </div>
              </div>

              <span className="text-[11px] uppercase tracking-[0.15em] font-semibold text-[#1A1A1A] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Read Issue <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Article Search & Results Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#888] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles & guides..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#FDFCFB] border border-[#EEEBE6] focus:outline-none focus:border-black text-[#1A1A1A] placeholder-[#888]"
          />
        </div>

        <div className="text-xs text-[#888]">
          Showing <strong className="text-[#1A1A1A]">{displayedArticles.length}</strong> of <strong className="text-[#1A1A1A]">{filteredArticles.length}</strong> articles
        </div>
      </div>

      {/* Articles Grid */}
      {displayedArticles.length === 0 ? (
        <div className="bg-white border border-[#EEEBE6] p-12 text-center space-y-3">
          <h4 className="font-serif text-xl font-normal text-[#1A1A1A]">No articles found</h4>
          <p className="text-xs text-[#666]">
            No stories match your current query or category selection.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory(null);
            }}
            className="px-5 py-2.5 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-wider font-semibold hover:opacity-85 cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {listArticles.length > visibleCount && (
        <div className="pt-8 text-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + 6)}
            className="px-7 py-3 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-[0.15em] font-semibold hover:opacity-85 transition-opacity cursor-pointer"
          >
            Load More Stories ({listArticles.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
};
