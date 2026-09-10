import React, { useState, useMemo } from 'react';
import { 
  Filter, 
  Search, 
  Grid, 
  List, 
  SlidersHorizontal, 
  RotateCcw, 
  ArrowUpDown,
  Star,
  Check
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { CameraCard } from '../components/CameraCard';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { AffiliateDisclosureBanner } from '../components/AffiliateDisclosure';

export const CamerasPage: React.FC = () => {
  const { cameras, navigateTo, comparedCameraIds } = useData();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSensor, setSelectedSensor] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(6500);
  const [sortBy, setSortBy] = useState<'rating' | 'price-asc' | 'price-desc' | 'newest'>('rating');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'horizontal'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const publishedCameras = useMemo(() => {
    return cameras.filter((c) => (c.status ?? 'published') === 'published');
  }, [cameras]);

  // Filter lists extracted dynamically
  const brands = useMemo(() => ['all', ...Array.from(new Set(publishedCameras.map((c) => c.brand)))], [publishedCameras]);
  const categories = useMemo(() => ['all', ...Array.from(new Set(publishedCameras.map((c) => c.category)))], [publishedCameras]);
  const sensorFormats = useMemo(() => ['all', 'Full-Frame', 'APS-C'], []);

  const filteredCameras = useMemo(() => {
    return publishedCameras
      .filter((cam) => {
        const matchesSearch = 
          cam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cam.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cam.idealUseCase.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesBrand = selectedBrand === 'all' || cam.brand === selectedBrand;
        const matchesCategory = selectedCategory === 'all' || cam.category === selectedCategory;
        const matchesSensor = selectedSensor === 'all' || cam.specs.sensorFormat === selectedSensor;
        const matchesPrice = cam.price <= maxPrice;

        return matchesSearch && matchesBrand && matchesCategory && matchesSensor && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'newest') return b.releaseYear - a.releaseYear;
        return 0;
      });
  }, [cameras, searchQuery, selectedBrand, selectedCategory, selectedSensor, maxPrice, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedBrand('all');
    setSelectedCategory('all');
    setSelectedSensor('all');
    setMaxPrice(6500);
    setSortBy('rating');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 text-left">
      <Breadcrumbs items={[{ label: 'Cameras & Gear Database', active: true }]} />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#EEEBE6]">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#888]">
            Editorial Gear Directory
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#1A1A1A] mt-1">
            Camera Finder & Price Intelligence
          </h1>
          <p className="text-sm text-[#666] mt-2 max-w-2xl leading-relaxed">
            Every camera below has been lab-inspected and field-tested by our editorial team. Filter by sensor architecture, price, and intended discipline.
          </p>
        </div>

        {/* Compare Floating Action */}
        {comparedCameraIds.length > 0 && (
          <button
            onClick={() => navigateTo('comparisons')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-[0.15em] font-semibold hover:opacity-85 transition-opacity"
          >
            <span>Compare Selected ({comparedCameraIds.length})</span>
          </button>
        )}
      </div>

      {/* Editorial Transparency & Affiliate Checkout Notice */}
      <div className="bg-[#FAF9F6] border border-[#E5E2DD] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#666]">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
          <div>
            <strong className="text-[#1A1A1A]">Pemberitahuan Transparansi:</strong> FujiFinder adalah platform ulasan gear independen dan <em>tidak menjual produk kamera secara langsung</em>. Tombol <strong>"Checkout"</strong> pada kartu kamera menghubungkan Anda langsung ke mitra ritel resmi (Amazon, B&H Photo, dll.) melalui tautan afiliasi terverifikasi.
          </div>
        </div>
      </div>

      {/* Search & Layout Control Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white border border-[#EEEBE6] p-3 sm:p-4">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#888] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by camera name, brand, or use case (e.g. Street, Video, Landscape)..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#FDFCFB] border border-[#EEEBE6] text-[#1A1A1A] placeholder-[#888] focus:outline-none focus:border-black"
          />
        </div>

        {/* Right Toolbar Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#888]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-[#EEEBE6] px-3 py-1.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-black"
            >
              <option value="rating">Sort: Highest Rating</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Release: Newest First</option>
            </select>
          </div>

          {/* Grid / List Toggle */}
          <div className="flex items-center border border-[#EEEBE6] overflow-hidden bg-white">
            <button
              onClick={() => setLayoutMode('grid')}
              className={`p-2 transition-colors cursor-pointer ${
                layoutMode === 'grid' ? 'bg-[#1A1A1A] text-white' : 'text-[#888] hover:bg-[#FDFCFB]'
              }`}
              title="Grid Layout"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayoutMode('horizontal')}
              className={`p-2 transition-colors cursor-pointer ${
                layoutMode === 'horizontal' ? 'bg-[#1A1A1A] text-white' : 'text-[#888] hover:bg-[#FDFCFB]'
              }`}
              title="List Layout"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden p-2 border border-[#EEEBE6] text-[#1A1A1A] bg-white flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Catalog Layout (Sidebar Filters + Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Filters */}
        <aside
          className={`lg:col-span-3 space-y-6 bg-white border border-[#EEEBE6] p-5 ${
            mobileFilterOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#EEEBE6]">
            <h3 className="font-serif text-lg font-normal text-[#1A1A1A] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#888]" />
              Filter Gear
            </h3>
            <button
              onClick={resetFilters}
              className="text-[10px] uppercase tracking-wider text-[#888] hover:text-black flex items-center gap-1 cursor-pointer font-medium"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#888] mb-2">
              Brand / Manufacturer
            </label>
            <div className="flex flex-wrap gap-1.5">
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`px-3 py-1 text-[11px] font-medium transition-colors cursor-pointer border ${
                    selectedBrand === b
                      ? 'bg-[#1A1A1A] text-white border-black'
                      : 'bg-white text-[#666] border-[#EEEBE6] hover:border-black'
                  }`}
                >
                  {b === 'all' ? 'All Brands' : b}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#888] mb-2">
              System Category
            </label>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer flex items-center justify-between border ${
                    selectedCategory === cat
                      ? 'bg-[#1A1A1A] text-white border-black'
                      : 'border-transparent text-[#666] hover:bg-[#FDFCFB] hover:text-black'
                  }`}
                >
                  <span>{cat === 'all' ? 'All Categories' : cat}</span>
                  {selectedCategory === cat && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>

          {/* Sensor Format Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#888] mb-2">
              Sensor Size
            </label>
            <div className="flex flex-wrap gap-1.5">
              {sensorFormats.map((sensor) => (
                <button
                  key={sensor}
                  onClick={() => setSelectedSensor(sensor)}
                  className={`px-3 py-1 text-[11px] font-medium transition-colors cursor-pointer border ${
                    selectedSensor === sensor
                      ? 'bg-[#1A1A1A] text-white border-black'
                      : 'bg-white text-[#666] border-[#EEEBE6] hover:border-black'
                  }`}
                >
                  {sensor === 'all' ? 'Any Format' : sensor}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#888]">Maximum Price</span>
              <span className="font-serif font-normal text-[#1A1A1A]">${maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="900"
              max="6500"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#1A1A1A] cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-[#888] mt-1">
              <span>$900</span>
              <span>$6,500+</span>
            </div>
          </div>
        </aside>

        {/* Results Column */}
        <main className="lg:col-span-9 space-y-6">
          <div className="flex items-center justify-between text-xs text-[#888]">
            <span>
              Showing <strong className="text-[#1A1A1A]">{filteredCameras.length}</strong> matching cameras
            </span>
            {(selectedBrand !== 'all' || selectedCategory !== 'all' || selectedSensor !== 'all' || searchQuery) && (
              <button
                onClick={resetFilters}
                className="underline hover:text-black cursor-pointer text-[11px] uppercase tracking-wider"
              >
                Clear active filters
              </button>
            )}
          </div>

          {filteredCameras.length === 0 ? (
            <div className="bg-white border border-[#EEEBE6] p-12 text-center space-y-3">
              <h4 className="font-serif text-xl font-normal text-[#1A1A1A]">No camera models found</h4>
              <p className="text-xs text-[#666] max-w-sm mx-auto">
                Try widening your price range or clearing specific brand filters to view other recommendations.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-wider font-semibold hover:opacity-85 cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : layoutMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCameras.map((camera) => (
                <CameraCard key={camera.id} camera={camera} layout="grid" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCameras.map((camera) => (
                <CameraCard key={camera.id} camera={camera} layout="horizontal" />
              ))}
            </div>
          )}
        </main>
      </div>

      <AffiliateDisclosureBanner compact />
    </div>
  );
};
