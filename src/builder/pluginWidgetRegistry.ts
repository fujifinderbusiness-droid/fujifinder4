import { PluginBuilderWidgetDef } from '../types/builderTypes';

class PluginWidgetRegistry {
  private widgets: Map<string, PluginBuilderWidgetDef> = new Map();
  private listeners: Set<() => void> = new Set();

  register(widget: PluginBuilderWidgetDef): void {
    this.widgets.set(widget.id, widget);
    this.notify();
  }

  unregister(widgetId: string): void {
    if (this.widgets.has(widgetId)) {
      this.widgets.delete(widgetId);
      this.notify();
    }
  }

  getAll(): PluginBuilderWidgetDef[] {
    return Array.from(this.widgets.values());
  }

  getByPluginId(pluginId: string): PluginBuilderWidgetDef[] {
    return Array.from(this.widgets.values()).filter((w) => w.pluginId === pluginId);
  }

  get(widgetId: string): PluginBuilderWidgetDef | undefined {
    return this.widgets.get(widgetId);
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('PluginWidgetRegistry listener error:', e);
      }
    });
  }
}

export const pluginWidgetRegistry = new PluginWidgetRegistry();

// Initialize default registered widgets from active core plugins
export function initializeCorePluginWidgets(): void {
  // 1. SEO Toolkit
  pluginWidgetRegistry.register({
    id: 'plugin-widget-seo-box',
    pluginId: 'fujifinder-seo-toolkit',
    name: 'SEO Score & Google SERP Preview',
    description: 'Menampilkan skor kelayakan SEO dan pratinjau cuplikan Google SERP secara langsung di halaman.',
    iconName: 'Search',
    category: 'plugins',
    defaultContent: {
      title: 'SEO Performance & Readability Snapshot',
      showScore: true,
      targetKeyword: 'Fujifilm X-T5 Review',
      snippetTitle: 'Fujifilm X-T5 Uji Lapangan Lengkap | FujiFinder Lab',
      snippetDesc: 'Hasil pengujian komprehensif sensor 40MP, autofokus AI, dan simulasi film terbaru.',
    },
    defaultStyle: {
      maxWidth: '960px',
    },
  });

  // 2. Affiliate Cloaker & Monetizer
  pluginWidgetRegistry.register({
    id: 'plugin-widget-affiliate-deal',
    pluginId: 'fujifinder-affiliate-cloaker',
    name: 'Cloaked Affiliate Best Price Banner',
    description: 'Kotak penawaran harga terbaik dengan tautan redirect terlindungi dan logo retailer resmi.',
    iconName: 'Link2',
    category: 'plugins',
    defaultContent: {
      title: 'Dapatkan Harga Spesial Hari Ini',
      productId: 'cam-xt5',
      badge: 'Harga Terendah Terverifikasi',
      ctaText: 'Cek Ketersediaan Stok',
      retailer: 'B&H Photo',
      discountNote: 'Stok terbatas • Garansi Distributor Resmi 1 Tahun',
    },
    defaultStyle: {
      maxWidth: '960px',
    },
  });

  // 3. Analytics Pro Live Meter
  pluginWidgetRegistry.register({
    id: 'plugin-widget-analytics-counter',
    pluginId: 'fujifinder-analytics-pro',
    name: 'Live Readers & Trending Meter',
    description: 'Menampilkan jumlah pembaca aktif dan indikator topik kamera yang sedang trending.',
    iconName: 'BarChart2',
    category: 'plugins',
    defaultContent: {
      label: 'Sedang Dibaca Oleh',
      activeUsers: 142,
      trendingCamera: 'Fujifilm X100VI',
      timeframe: 'dalam 15 menit terakhir',
    },
    defaultStyle: {
      maxWidth: '680px',
    },
  });

  // 4. Image Optimizer Film Simulation Gallery
  pluginWidgetRegistry.register({
    id: 'plugin-widget-film-simulation',
    pluginId: 'fujifinder-image-optimizer',
    name: 'Fujifilm Film Simulation Compare Slider',
    description: 'Widget interaktif perbandingan simulasi film (Classic Chrome vs Reala Ace vs Provia).',
    iconName: 'Sparkles',
    category: 'plugins',
    defaultContent: {
      title: 'Perbandingan Karakter Film Simulation',
      subtitle: 'Lihat bagaimana tone warna Classic Chrome, Reala Ace, dan Acros memproses foto yang sama.',
      simulationA: 'Classic Chrome',
      simulationB: 'Reala Ace',
      imageA: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
      imageB: 'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=1200&q=80',
    },
    defaultStyle: {
      maxWidth: '1140px',
    },
  });
}
