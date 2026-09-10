import React from 'react';
import { 
  Camera, 
  ShieldCheck, 
  Mail, 
  Sparkles, 
  Settings,
  Heart
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { NewsletterSubscribeBox } from './NewsletterSubscribeBox';

export const Footer: React.FC = () => {
  const { navigateTo, setSelectedCategory, resetToDemoData } = useData();

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    navigateTo('blog');
  };

  return (
    <footer className="bg-[#1A1A1A] text-[#EEEBE6] pt-16 pb-12 border-t border-[#2A2A2A] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        {/* Top Newsletter & Mission Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-[#2A2A2A]">
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <span className="font-sans text-xl font-bold tracking-tight text-white">
                FujiFinder
              </span>
            </div>
            <p className="text-[#999] text-xs leading-relaxed max-w-md">
              A premium camera publication and gear discovery platform. We test mirrorless systems, lenses, and action gear in real light to help you discover the tools that inspire your creative storytelling.
            </p>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#888] pt-2">
              <ShieldCheck className="w-4 h-4 text-[#4ADE80]" />
              <span>100% Un-Sponsored Field Testing & Transparent Affiliate Curation</span>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-center">
            <h4 className="font-sans text-base font-bold text-white">
              The FujiFinder Dispatch
            </h4>
            <p className="text-xs text-[#888] mt-1 mb-4">
              Bi-weekly camera analysis, sensor comparisons, and early pricing drop notifications. Zero spam, unsubscribe anytime.
            </p>

            <NewsletterSubscribeBox source="footer" variant="compact-footer" />
          </div>
        </div>

        {/* Quick Links Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-[#2A2A2A] text-xs">
          <div>
            <h5 className="font-semibold text-white uppercase tracking-[0.2em] text-[10px] mb-3">
              Explore Cameras
            </h5>
            <ul className="space-y-2 text-[#888] text-xs">
              <li>
                <button onClick={() => navigateTo('cameras')} className="hover:text-white transition-colors cursor-pointer">
                  All Mirrorless Bodies
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('camera-detail', 'fujifilm-x100vi')} className="hover:text-white transition-colors cursor-pointer">
                  Fujifilm X100VI
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('camera-detail', 'sony-alpha-7-iv')} className="hover:text-white transition-colors cursor-pointer">
                  Sony Alpha 7 IV
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('camera-detail', 'canon-eos-r6-mark-ii')} className="hover:text-white transition-colors cursor-pointer">
                  Canon EOS R6 Mark II
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('camera-detail', 'leica-q3')} className="hover:text-white transition-colors cursor-pointer">
                  Leica Q3
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('camera-detail', 'nikon-z-f')} className="hover:text-white transition-colors cursor-pointer">
                  Nikon Z f
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-white uppercase tracking-[0.2em] text-[10px] mb-3">
              Editorial Categories
            </h5>
            <ul className="space-y-2 text-[#888] text-xs">
              {['Camera Guides', 'Reviews', 'Comparisons', 'Photography', 'Videography', 'Beginner Guides'].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => handleCategoryClick(cat)}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-white uppercase tracking-[0.2em] text-[10px] mb-3">
              Comparison Tools
            </h5>
            <ul className="space-y-2 text-[#888] text-xs">
              <li>
                <button onClick={() => navigateTo('comparisons')} className="hover:text-white transition-colors cursor-pointer">
                  Side-by-Side Matrix
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('article-detail', 'sony-a7iv-vs-canon-r6-mark-ii-comparison')} className="hover:text-white transition-colors cursor-pointer">
                  Sony A7 IV vs Canon R6 II
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('article-detail', 'best-street-photography-cameras-2026')} className="hover:text-white transition-colors cursor-pointer">
                  Street Camera Shootout
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-white uppercase tracking-[0.2em] text-[10px] mb-3">
              Platform & Governance
            </h5>
            <ul className="space-y-2 text-[#888] text-xs">
              <li>
                <button onClick={() => navigateTo('admin')} className="hover:text-white text-[#DDD] flex items-center gap-1 cursor-pointer">
                  <Settings className="w-3.5 h-3.5" /> Site Admin CMS
                </button>
              </li>
              <li>
                <button onClick={resetToDemoData} className="hover:text-white text-[#888] cursor-pointer">
                  Reset Demo Data
                </button>
              </li>
              <li>
                <span className="text-[#666] block pt-1">Amazon Associate ID: fujifinder-20</span>
              </li>
              <li>
                <span className="text-[#666] block">FTC Disclosure Compliant</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Affiliate Disclosure & Bottom Bar */}
        <div className="pt-8 text-[11px] text-[#777] leading-relaxed">
          <p className="max-w-4xl">
            <strong>FTC Affiliate Statement:</strong> FujiFinder participates in affiliate advertising programs including the Amazon Services LLC Associates Program, B&H Photo Video Affiliates, Adorama, and MPB. As an Amazon Associate, we earn from qualifying purchases. This means if you click through and make a purchase, we may receive a small commission at no additional cost to you. Our ratings and editorial conclusions remain 100% objective and independent.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#2A2A2A]">
            <div>
              © {new Date().getFullYear()} FujiFinder. All rights reserved. Clean Minimal Editorial.
            </div>
            <div className="flex items-center gap-4 text-[#888] text-[11px]">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Editorial Guidelines</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
