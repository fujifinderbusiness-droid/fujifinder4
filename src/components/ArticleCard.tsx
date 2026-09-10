import React from 'react';
import { Clock, Calendar, ArrowRight, User } from 'lucide-react';
import { Article } from '../types';
import { useData } from '../context/DataContext';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
  layout?: 'standard' | 'horizontal' | 'compact';
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, featured = false, layout = 'standard' }) => {
  const { navigateTo } = useData();

  if (layout === 'horizontal') {
    return (
      <div 
        id={`article-card-${article.id}`}
        onClick={() => navigateTo('article-detail', article.slug)}
        className="group bg-white border border-[#EEEBE6] hover:border-black p-4 sm:p-5 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row gap-5"
      >
        <div className="w-full sm:w-56 h-44 overflow-hidden bg-[#E5E2DD] shrink-0 relative">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <span className="absolute top-2.5 left-2.5 bg-white/95 text-[#1A1A1A] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border border-[#EEEBE6]">
            {article.category}
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#888] mb-1.5">
              <span>{article.publishedAt}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {article.readTimeMinutes} min read
              </span>
            </div>

            <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#1A1A1A] group-hover:opacity-75 transition-opacity leading-tight line-clamp-2">
              {article.title}
            </h3>

            <p className="text-xs sm:text-sm text-[#666] mt-2 line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#EEEBE6] text-xs">
            <div className="flex items-center gap-2">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-5 h-5 object-cover border border-[#EEEBE6]"
              />
              <span className="text-[#666] text-xs font-medium">{article.author.name}</span>
            </div>

            <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest text-[#1A1A1A] font-semibold group-hover:translate-x-1 transition-transform">
              Read Article <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Standard Magazine Card
  return (
    <div 
      id={`article-card-${article.id}`}
      onClick={() => navigateTo('article-detail', article.slug)}
      className="group bg-white border border-[#EEEBE6] hover:border-black overflow-hidden transition-all duration-200 cursor-pointer flex flex-col"
    >
      <div className="h-52 w-full overflow-hidden bg-[#E5E2DD] relative">
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-white/95 text-[#1A1A1A] text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 border border-[#EEEBE6]">
            {article.category}
          </span>
        </div>
        <div className="absolute bottom-3 right-3 bg-black/80 text-white text-[10px] px-2 py-0.5 flex items-center gap-1 font-mono">
          <Clock className="w-3 h-3" />
          <span>{article.readTimeMinutes}m</span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#888] mb-2">
            <Calendar className="w-3 h-3" />
            <span>{article.publishedAt}</span>
          </div>

          <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#1A1A1A] group-hover:opacity-75 transition-opacity leading-snug line-clamp-2">
            {article.title}
          </h3>

          <p className="text-xs sm:text-sm text-[#666] mt-2.5 line-clamp-3 leading-relaxed">
            {article.excerpt}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#EEEBE6] text-xs">
          <div className="flex items-center gap-2">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-6 h-6 object-cover border border-[#EEEBE6]"
            />
            <span className="text-[#666] text-xs font-medium truncate max-w-[130px]">{article.author.name}</span>
          </div>

          <span className="text-[#1A1A1A] text-[11px] uppercase tracking-widest font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Read <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
