import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useData } from '../context/DataContext';

interface BreadcrumbItem {
  label: string;
  view?: string;
  slug?: string;
  active?: boolean;
}

export const Breadcrumbs: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  const { navigateTo } = useData();

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-[#7A746C] py-2 overflow-x-auto whitespace-nowrap">
      <button
        onClick={() => navigateTo('landing')}
        className="flex items-center gap-1 hover:text-[#1A1918] transition-colors cursor-pointer"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </button>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3 h-3 text-[#B8B1A7] mx-2 shrink-0" />
          {item.active || !item.view ? (
            <span className="font-medium text-[#1A1918] truncate max-w-xs">{item.label}</span>
          ) : (
            <button
              onClick={() => navigateTo(item.view!, item.slug)}
              className="hover:text-[#1A1918] hover:underline transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
