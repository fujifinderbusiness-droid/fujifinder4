import React, { useState } from 'react';
import { SlidersHorizontal, Plus, X, ArrowRight, Check, Sparkles } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ComparisonTable } from '../components/ComparisonTable';
import { AffiliateDisclosureBanner } from '../components/AffiliateDisclosure';

export const ComparisonsPage: React.FC = () => {
  const { cameras, comparedCameraIds, setComparedCameraIds, navigateTo } = useData();
  const [selectorOpen, setSelectorOpen] = useState(false);

  const prebuiltMatchups = [
    {
      title: 'Sony Alpha 7 IV vs Canon EOS R6 Mark II',
      subtitle: 'The $2,400 full-frame hybrid heavyweight showdown',
      ids: ['sony-a7iv', 'canon-r6-ii'],
      articleSlug: 'sony-a7iv-vs-canon-r6-mark-ii-comparison',
    },
    {
      title: 'Fujifilm X100VI vs Ricoh GR IIIx',
      subtitle: 'Rangefinder romance vs pure pocket stealth',
      ids: ['fuji-x100vi', 'ricoh-gr-iiix'],
      articleSlug: 'best-street-photography-cameras-2026',
    },
    {
      title: 'Nikon Z f vs Fujifilm X-T5',
      subtitle: 'Vintage dials & mechanical joy: Full-Frame vs APS-C',
      ids: ['nikon-zf', 'fuji-xt5'],
    },
  ];

  const handleAddCamera = (id: string) => {
    if (comparedCameraIds.includes(id)) return;
    if (comparedCameraIds.length >= 3) {
      setComparedCameraIds([comparedCameraIds[1], comparedCameraIds[2], id]);
    } else {
      setComparedCameraIds([...comparedCameraIds, id]);
    }
    setSelectorOpen(false);
  };

  const handleRemoveCamera = (id: string) => {
    setComparedCameraIds(comparedCameraIds.filter((item) => item !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12 text-left">
      <Breadcrumbs items={[{ label: 'Camera Comparisons', active: true }]} />

      {/* Header */}
      <div className="border-b border-[#EEEBE6] pb-6">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#888]">
          Side-by-Side Lab Matrix
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#1A1A1A] mt-1">
          Interactive Camera Comparisons
        </h1>
        <p className="text-sm sm:text-base text-[#666] mt-2 max-w-2xl leading-relaxed">
          Select any two or three camera bodies from our laboratory database to directly compare sensor dimensions, stabilization stops, autofocus tracking algorithms, and verified authorized pricing.
        </p>
      </div>

      {/* Active Comparison Workspace */}
      <section className="bg-white border border-[#EEEBE6] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EEEBE6] pb-4">
          <div>
            <h3 className="font-serif text-xl font-normal text-[#1A1A1A]">
              Active Comparison Selection ({comparedCameraIds.length} of 3)
            </h3>
            <p className="text-xs text-[#888]">
              Add or remove cameras to reconfigure the comparison sheet
            </p>
          </div>

          {comparedCameraIds.length < 3 && (
            <button
              onClick={() => setSelectorOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-[0.15em] font-semibold hover:opacity-85 transition-opacity cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Camera to Compare
            </button>
          )}
        </div>

        {/* Selected Cameras Chips */}
        <div className="flex flex-wrap items-center gap-3">
          {comparedCameraIds.map((id) => {
            const cam = cameras.find((c) => c.id === id);
            if (!cam) return null;
            return (
              <div
                key={id}
                className="flex items-center gap-2.5 px-3 py-1.5 bg-[#FDFCFB] border border-[#EEEBE6]"
              >
                <img src={cam.image} alt={cam.name} className="w-6 h-6 object-cover bg-[#E5E2DD]" />
                <span className="text-xs font-semibold text-[#1A1A1A]">{cam.name}</span>
                <button
                  onClick={() => handleRemoveCamera(id)}
                  className="p-0.5 text-[#888] hover:text-black cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          {comparedCameraIds.length === 0 && (
            <span className="text-xs text-[#888] italic">
              No cameras selected yet. Choose a pre-built matchup below or click "Add Camera".
            </span>
          )}
        </div>

        {/* Camera Selector Dropdown / Modal */}
        {selectorOpen && (
          <div className="bg-white border border-[#EEEBE6] p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EEEBE6]">
              <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Select a Camera to Compare:</span>
              <button
                onClick={() => setSelectorOpen(false)}
                className="text-xs text-[#888] hover:text-black uppercase tracking-wider cursor-pointer"
              >
                ✕ Cancel
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {cameras.filter((c) => (c.status ?? 'published') === 'published').map((c) => {
                const isSelected = comparedCameraIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    disabled={isSelected}
                    onClick={() => handleAddCamera(c.id)}
                    className={`flex items-center gap-2.5 p-2 text-left text-xs transition-colors border ${
                      isSelected
                        ? 'opacity-40 bg-[#FDFCFB] border-transparent cursor-not-allowed'
                        : 'border-[#EEEBE6] hover:border-black bg-white cursor-pointer'
                    }`}
                  >
                    <img src={c.image} alt={c.name} className="w-8 h-8 object-cover bg-[#E5E2DD]" />
                    <div className="min-w-0">
                      <div className="font-semibold text-[#1A1A1A] truncate">{c.name}</div>
                      <div className="text-[10px] text-[#888]">${c.price.toLocaleString()}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Comparison Table */}
        {comparedCameraIds.length > 0 && (
          <ComparisonTable productIds={comparedCameraIds} />
        )}
      </section>

      {/* Pre-Built Popular Matchups */}
      <section className="space-y-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#888]">
            Curated Matchups
          </span>
          <h2 className="font-serif text-3xl font-normal text-[#1A1A1A]">
            Popular Camera Battles
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {prebuiltMatchups.map((match, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#EEEBE6] hover:border-black p-6 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <h3 className="font-serif text-lg font-normal text-[#1A1A1A] leading-snug">
                  {match.title}
                </h3>
                <p className="text-xs text-[#666] mt-2 leading-relaxed">
                  {match.subtitle}
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-[#EEEBE6] flex items-center justify-between">
                <button
                  onClick={() => setComparedCameraIds(match.ids)}
                  className="text-[11px] uppercase tracking-[0.15em] font-semibold text-[#1A1A1A] hover:opacity-75 flex items-center gap-1 cursor-pointer"
                >
                  Load in Matrix <ArrowRight className="w-3.5 h-3.5" />
                </button>
                {match.articleSlug && (
                  <button
                    onClick={() => navigateTo('article-detail', match.articleSlug)}
                    className="text-[10px] uppercase tracking-wider font-medium text-[#888] hover:text-black cursor-pointer"
                  >
                    Read Verdict →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <AffiliateDisclosureBanner />
    </div>
  );
};
