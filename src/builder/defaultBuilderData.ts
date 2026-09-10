import {
  BuilderPage,
  BuilderSection,
  BuilderTemplate,
  GlobalDesignSystem,
  ReusableSection,
} from '../types/builderTypes';

export const DEFAULT_GLOBAL_DESIGN: GlobalDesignSystem = {
  enabled: true,
  colors: {
    primary: '#1A1A1A',
    accent: '#C62828',
    background: '#FDFCFB',
    cardBackground: '#FFFFFF',
    textPrimary: '#1A1A1A',
    textMuted: '#666666',
    border: '#EEEBE6',
    badgeBackground: '#FAF9F6',
  },
  typography: {
    headingFont: 'Playfair Display',
    bodyFont: 'Plus Jakarta Sans',
    baseFontSize: 16,
    scaleRatio: 1.25,
    headingWeight: 'normal',
  },
  buttons: {
    style: 'editorial-flat',
    borderRadius: 0,
    paddingPreset: 'normal',
    uppercase: true,
    letterSpacing: 'wider',
  },
  cards: {
    borderRadius: 0,
    shadow: 'border-only',
    containerMaxWidth: '1280px',
    borderStyle: 'solid',
  },
  header: {
    style: 'editorial-classic',
    transparentOnTop: false,
    showCategoryNav: true,
  },
  footer: {
    theme: 'dark',
    showNewsletter: true,
    showSocialIcons: true,
    copyrightText: '© 2026 FujiFinder Lab & Journal. All rights reserved.',
  },
};

// Default Sections for FujiFinder Landing Page
export const DEFAULT_LANDING_SECTIONS: BuilderSection[] = [
  {
    id: 'sec-hero-main',
    name: 'Hero Editorial Showcase',
    visibility: { desktop: true, tablet: true, mobile: true },
    style: {
      backgroundColor: '#141414',
      paddingY: { desktop: 64, tablet: 48, mobile: 32 },
      fullWidth: true,
    },
    blocks: [
      {
        id: 'block-hero-1',
        type: 'hero',
        label: 'Lead Hero Story Carousel',
        content: {
          badge: 'Exclusive In-Depth Field Test',
          date: 'September 2026 • FujiFinder Lab',
          headline: 'Fujifilm X-T5 vs X-T50: Mana Kamera Hybrid 40MP Paling Layak Dipilih?',
          subtitle: 'Uji komparasi performa sensor 40.2MP X-Trans CMOS 5 HR, ketahanan bodi weather-sealed, daya tahan baterai NP-W235 vs NP-W126S, dan film simulation dial baru.',
          primaryBtnText: 'Baca Ulasan Mendalam',
          primaryBtnLink: '#reviews',
          secondaryBtnText: 'Langganan Newsletter',
          secondaryBtnLink: '#newsletter',
          backgroundImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1600&q=80',
          overlayOpacity: 0.65,
          alignment: 'left',
          minHeight: 520,
        },
        style: {
          maxWidth: '1280px',
          padding: { desktop: { top: 0, right: 24, bottom: 0, left: 24 } },
        },
        visibility: { desktop: true, tablet: true, mobile: true },
      },
    ],
  },
  {
    id: 'sec-search-quick',
    name: 'Quick Camera Finder & Search',
    visibility: { desktop: true, tablet: true, mobile: true },
    style: {
      backgroundColor: '#FFFFFF',
      paddingY: { desktop: 32, tablet: 24, mobile: 20 },
      borderBottom: true,
      borderColor: '#EEEBE6',
    },
    blocks: [
      {
        id: 'block-search-1',
        type: 'search-bar',
        label: 'Universal Search & Quick Filter',
        content: {
          placeholder: 'Cari kamera Fujifilm, sensor X-Trans, lensa X-Mount, atau panduan...',
          showQuickTags: true,
          quickTags: ['X-T5', 'X100VI', 'X-S20', 'Film Simulation', 'Medium Format GFX'],
        },
        style: {
          maxWidth: '960px',
        },
        visibility: { desktop: true, tablet: true, mobile: true },
      },
    ],
  },
  {
    id: 'sec-featured-articles',
    name: 'Featured Editorial Guides',
    visibility: { desktop: true, tablet: true, mobile: true },
    style: {
      backgroundColor: '#FDFCFB',
      paddingY: { desktop: 56, tablet: 40, mobile: 28 },
      borderBottom: true,
      borderColor: '#EEEBE6',
    },
    blocks: [
      {
        id: 'block-featured-heading',
        type: 'text',
        label: 'Section Heading',
        content: {
          tag: 'h2',
          eyebrow: 'Jurnal & Rekomendasi Utama',
          title: 'Liputan Lab & Ulasan Terhangat',
          description: 'Pengujian mandiri tanpa intervensi komersial dari tim fotografer dan videografer profesional FujiFinder.',
          align: 'left',
        },
        style: {
          maxWidth: '1280px',
          margin: { desktop: { top: 0, right: 0, bottom: 32, left: 0 } },
        },
        visibility: { desktop: true, tablet: true, mobile: true },
      },
      {
        id: 'block-articles-grid-1',
        type: 'article-grid',
        label: 'Editorial Articles Grid',
        content: {
          category: 'all',
          count: 6,
          columns: 3,
          showExcerpt: true,
          showBadge: true,
          showAuthor: true,
          showReadTime: true,
          sortBy: 'date',
        },
        style: {
          maxWidth: '1280px',
          gap: 24,
        },
        visibility: { desktop: true, tablet: true, mobile: true },
      },
    ],
  },
  {
    id: 'sec-category-showcase',
    name: 'Visual Category Explorer',
    visibility: { desktop: true, tablet: true, mobile: true },
    style: {
      backgroundColor: '#FAF9F6',
      paddingY: { desktop: 48, tablet: 36, mobile: 24 },
      borderBottom: true,
      borderColor: '#EEEBE6',
    },
    blocks: [
      {
        id: 'block-cat-cards-1',
        type: 'category-cards',
        label: 'Category Visual Cards',
        content: {
          title: 'Jelajahi Berdasarkan Kebutuhan Anda',
          subtitle: 'Dari kamera saku jalanan hingga kamera medium format studio komersial.',
          columns: 4,
        },
        style: {
          maxWidth: '1280px',
        },
        visibility: { desktop: true, tablet: true, mobile: true },
      },
    ],
  },
  {
    id: 'sec-camera-catalog',
    name: 'Reviewed Gear & Lab Benchmark',
    visibility: { desktop: true, tablet: true, mobile: true },
    style: {
      backgroundColor: '#FFFFFF',
      paddingY: { desktop: 56, tablet: 40, mobile: 28 },
      borderBottom: true,
      borderColor: '#EEEBE6',
    },
    blocks: [
      {
        id: 'block-gear-heading',
        type: 'text',
        label: 'Gear Catalog Heading',
        content: {
          tag: 'h2',
          eyebrow: '100% Pengujian Independen',
          title: 'Katalog Kamera Fujifilm Teruji',
          description: 'Setiap unit kami uji langsung di lab dan lapangan nyata untuk mengevaluasi ketajaman sensor, sistem autofokus, stabilisasi gambar, serta kehandalan ergonomi bodi.',
          align: 'left',
        },
        style: {
          maxWidth: '1280px',
          margin: { desktop: { top: 0, right: 0, bottom: 32, left: 0 } },
        },
        visibility: { desktop: true, tablet: true, mobile: true },
      },
      {
        id: 'block-product-cards-1',
        type: 'product-cards',
        label: 'Product Cards Grid',
        content: {
          count: 6,
          columns: 3,
          showScores: true,
          showAffiliateBtn: true,
          showCompareBtn: true,
          filterCategory: 'all',
        },
        style: {
          maxWidth: '1280px',
          gap: 24,
        },
        visibility: { desktop: true, tablet: true, mobile: true },
      },
    ],
  },
  {
    id: 'sec-affiliate-cta',
    name: 'Affiliate Deal & Trust Banner',
    visibility: { desktop: true, tablet: true, mobile: true },
    style: {
      backgroundColor: '#1A1A1A',
      paddingY: { desktop: 48, tablet: 36, mobile: 24 },
    },
    blocks: [
      {
        id: 'block-aff-cta-1',
        type: 'affiliate-product-cta',
        label: 'Editorial Deal Banner',
        content: {
          title: 'Dapatkan Harga & Garansi Resmi Terbaik di Retailer Terpercaya',
          description: 'Kami bermitra dengan retailer resmi (B&H, Amazon, Adorama) untuk memantau fluktuasi stok dan diskon harga terbaik setiap hari.',
          badge: 'Penawaran Terverifikasi Resmi',
          btnText: 'Lihat Semua Penawaran Gear',
          btnLink: '#cameras',
          trustNote: 'Komisi affiliate kecil yang kami peroleh tidak mempengaruhi skor ulasan teknis kami.',
        },
        style: {
          maxWidth: '1140px',
          textAlign: 'center',
        },
        visibility: { desktop: true, tablet: true, mobile: true },
      },
    ],
  },
  {
    id: 'sec-newsletter',
    name: 'Newsletter Subscription',
    visibility: { desktop: true, tablet: true, mobile: true },
    style: {
      backgroundColor: '#FDFCFB',
      paddingY: { desktop: 56, tablet: 40, mobile: 32 },
    },
    blocks: [
      {
        id: 'block-news-1',
        type: 'newsletter-signup',
        label: 'Newsletter Box',
        content: {
          title: 'The FujiFinder Dispatch',
          subtitle: 'Bergabunglah dengan 24.000+ pembaca untuk evaluasi sensor independen, uji lab kamera, dan rekomendasi gear mingguan.',
          btnText: 'Langganan Dispatch',
          note: 'Privasi Anda terjamin. Berhenti berlangganan kapan saja dalam satu klik.',
        },
        style: {
          maxWidth: '768px',
          textAlign: 'center',
        },
        visibility: { desktop: true, tablet: true, mobile: true },
      },
    ],
  },
];

export const DEFAULT_REUSABLE_SECTIONS: ReusableSection[] = [
  {
    id: 'reusable-newsletter-dark',
    title: 'Newsletter Box (Dark Theme)',
    category: 'Marketing',
    createdAt: '2026-09-01T10:00:00Z',
    section: {
      id: 'sec-reusable-news-dark',
      name: 'Dark Theme Newsletter',
      isReusable: true,
      visibility: { desktop: true, tablet: true, mobile: true },
      style: {
        backgroundColor: '#141414',
        paddingY: { desktop: 56, tablet: 40, mobile: 28 },
      },
      blocks: [
        {
          id: 'block-reusable-news-1',
          type: 'newsletter-signup',
          label: 'Dark Newsletter Block',
          content: {
            title: 'The FujiFinder Dispatch',
            subtitle: 'Wawasan teknis independen, uji lab kamera mendalam, dan ulasan gear objektif langsung di inbox Anda.',
            btnText: 'Langganan Dispatch',
            theme: 'dark',
          },
          style: {
            maxWidth: '680px',
            textAlign: 'center',
          },
          visibility: { desktop: true, tablet: true, mobile: true },
        },
      ],
    },
  },
  {
    id: 'reusable-trust-disclosure',
    title: 'Editorial Trust & Affiliate Disclosure',
    category: 'Content',
    createdAt: '2026-09-02T12:00:00Z',
    section: {
      id: 'sec-reusable-trust',
      name: 'Trust & Independence Notice',
      isReusable: true,
      visibility: { desktop: true, tablet: true, mobile: true },
      style: {
        backgroundColor: '#FAF9F6',
        paddingY: { desktop: 24, tablet: 20, mobile: 16 },
        borderTop: true,
        borderBottom: true,
        borderColor: '#EEEBE6',
      },
      blocks: [
        {
          id: 'block-reusable-trust-1',
          type: 'text',
          label: 'Editorial Disclosure Note',
          content: {
            tag: 'p',
            eyebrow: 'Pemberitahuan Transparansi Editorial',
            title: '100% Pengujian Independen',
            description: 'FujiFinder adalah media ulasan independen. Kami tidak menjual kamera dan tidak menerima kompensasi pabrikan untuk mengubah penilaian skor uji lab. Tautan affiliate membantu mendanai fasilitas pengujian kami.',
            align: 'center',
          },
          style: {
            maxWidth: '960px',
            textAlign: 'center',
          },
          visibility: { desktop: true, tablet: true, mobile: true },
        },
      ],
    },
  },
  {
    id: 'reusable-comparison-matrix',
    title: 'Flagship Camera Comparison Matrix',
    category: 'Gear',
    createdAt: '2026-09-03T14:30:00Z',
    section: {
      id: 'sec-reusable-comp',
      name: 'Interactive Comparison Block',
      isReusable: true,
      visibility: { desktop: true, tablet: true, mobile: true },
      style: {
        backgroundColor: '#FFFFFF',
        paddingY: { desktop: 48, tablet: 36, mobile: 24 },
      },
      blocks: [
        {
          id: 'block-comp-matrix-1',
          type: 'camera-comparison',
          label: 'Direct Spec Comparison',
          content: {
            title: 'Perbandingan Head-to-Head Flagship',
            subtitle: 'Pilih kamera Fujifilm untuk mengadu spesifikasi sensor, autofokus, dan video.',
            defaultCameraA: 'cam-xt5',
            defaultCameraB: 'cam-x100vi',
          },
          style: {
            maxWidth: '1280px',
          },
          visibility: { desktop: true, tablet: true, mobile: true },
        },
      ],
    },
  },
];

export const PREBUILT_TEMPLATES: BuilderTemplate[] = [
  {
    id: 'tpl-landing-magazine',
    title: 'FujiFinder Editorial Magazine Landing',
    description: 'Tata letak publikasi premium dengan slider hero, kategori visual, ulasan kamera teratas, perbandingan spec, dan form langganan.',
    category: 'landing',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=75',
    sections: DEFAULT_LANDING_SECTIONS,
  },
  {
    id: 'tpl-blog-magazine',
    title: 'Blog & Article Hub Layout',
    description: 'Halaman arsip artikel dengan featured hero post, tab filter kategori instan, grid artikel 3 kolom, dan kolom pencarian.',
    category: 'blog',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=75',
    sections: [
      {
        id: 'tpl-sec-blog-hero',
        name: 'Blog Archive Header',
        visibility: { desktop: true, tablet: true, mobile: true },
        style: {
          backgroundColor: '#1A1A1A',
          paddingY: { desktop: 56, tablet: 40, mobile: 28 },
          fullWidth: true,
        },
        blocks: [
          {
            id: 'b-blog-hero-text',
            type: 'text',
            label: 'Blog Header Text',
            content: {
              eyebrow: 'FujiFinder Dispatch & Journal',
              title: 'Panduan, Ulasan & Resep Simulasi Film',
              description: 'Artikel teknis mendalam dan tutorial fotografi langsung dari lapangan nyata.',
              align: 'center',
            },
            style: {
              maxWidth: '800px',
              textColor: '#FFFFFF',
              textAlign: 'center',
            },
            visibility: { desktop: true, tablet: true, mobile: true },
          },
        ],
      },
      {
        id: 'tpl-sec-blog-grid',
        name: 'All Articles Grid Feed',
        visibility: { desktop: true, tablet: true, mobile: true },
        style: {
          backgroundColor: '#FFFFFF',
          paddingY: { desktop: 48, tablet: 36, mobile: 24 },
        },
        blocks: [
          {
            id: 'b-blog-grid',
            type: 'article-grid',
            label: 'Complete Article Grid',
            content: {
              category: 'all',
              count: 9,
              columns: 3,
              showExcerpt: true,
              showAuthor: true,
              showBadge: true,
              showReadTime: true,
            },
            style: {
              maxWidth: '1280px',
              gap: 24,
            },
            visibility: { desktop: true, tablet: true, mobile: true },
          },
        ],
      },
    ],
  },
  {
    id: 'tpl-affiliate-gear',
    title: 'High-Converting Affiliate Deal Page',
    description: 'Dioptimalkan untuk konversi klik affiliate dengan perbandingan harga 3 kamera terbaik, callout diskon resmi, dan review rating.',
    category: 'affiliate',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=75',
    sections: [
      {
        id: 'tpl-aff-hero',
        name: 'Deal Landing Hero',
        visibility: { desktop: true, tablet: true, mobile: true },
        style: {
          backgroundColor: '#FAF9F6',
          paddingY: { desktop: 48, tablet: 36, mobile: 24 },
          borderBottom: true,
          borderColor: '#EEEBE6',
        },
        blocks: [
          {
            id: 'b-aff-hero-text',
            type: 'text',
            label: 'Deal Hero Title',
            content: {
              eyebrow: 'Pantauan Harga & Promo Resmi 2026',
              title: 'Rekomendasi Kamera Fujifilm Terbaik Sesuai Budget',
              description: 'Temukan penawaran harga terendah dari retailer resmi terverifikasi dengan garansi utuh.',
              align: 'center',
            },
            style: {
              maxWidth: '860px',
              textAlign: 'center',
            },
            visibility: { desktop: true, tablet: true, mobile: true },
          },
        ],
      },
      {
        id: 'tpl-aff-picks',
        name: 'Top 3 Recommended Gear Picks',
        visibility: { desktop: true, tablet: true, mobile: true },
        style: {
          backgroundColor: '#FFFFFF',
          paddingY: { desktop: 56, tablet: 40, mobile: 28 },
        },
        blocks: [
          {
            id: 'b-aff-picks-grid',
            type: 'product-recommendation',
            label: 'Curated Camera Recommendations',
            content: {
              title: '3 Pilihan Kamera Terbaik Uji Lab',
              showRatings: true,
              showProsCons: true,
              showDirectAffiliateBtn: true,
            },
            style: {
              maxWidth: '1140px',
              gap: 24,
            },
            visibility: { desktop: true, tablet: true, mobile: true },
          },
        ],
      },
    ],
  },
  {
    id: 'tpl-camera-comparison',
    title: 'Camera Comparison & Spec Battle',
    description: 'Halaman adu spesifikasi kamera Fujifilm dengan perbandingan tabel dinamis, sensor, autofokus, video, dan tombol affiliate.',
    category: 'comparison',
    thumbnailUrl: 'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=600&q=75',
    sections: [
      {
        id: 'tpl-comp-sec-1',
        name: 'Comparison Hub Block',
        visibility: { desktop: true, tablet: true, mobile: true },
        style: {
          backgroundColor: '#FFFFFF',
          paddingY: { desktop: 48, tablet: 36, mobile: 24 },
        },
        blocks: [
          {
            id: 'b-comp-head',
            type: 'text',
            label: 'Comparison Header',
            content: {
              eyebrow: 'Lab Benchmark & Side-by-Side Specs',
              title: 'Adu Spesifikasi Kamera Fujifilm',
              description: 'Bandingkan sensor, prosesor, autofokus, berat, dan harga antar model kamera Fujifilm secara objektif.',
              align: 'left',
            },
            style: {
              maxWidth: '1280px',
              margin: { desktop: { top: 0, right: 0, bottom: 32, left: 0 } },
            },
            visibility: { desktop: true, tablet: true, mobile: true },
          },
          {
            id: 'b-comp-table',
            type: 'camera-comparison',
            label: 'Interactive Comparison Widget',
            content: {
              showDetailedSpecs: true,
              showAffiliateButtons: true,
            },
            style: {
              maxWidth: '1280px',
            },
            visibility: { desktop: true, tablet: true, mobile: true },
          },
        ],
      },
    ],
  },
];

export const INITIAL_BUILDER_PAGES: BuilderPage[] = [
  {
    id: 'page-landing',
    slug: '',
    title: 'Landing Page (Front Page)',
    description: 'Halaman beranda utama website FujiFinder.',
    type: 'landing',
    status: 'published',
    lastModified: '2026-09-08T01:00:00Z',
    publishedAt: '2026-09-01T08:00:00Z',
    author: 'Admin FujiFinder',
    isDefaultCorePage: true,
    useBuilderLayout: false, // Can be toggled on/off
    sections: DEFAULT_LANDING_SECTIONS,
  },
  {
    id: 'page-custom-gear-guide',
    slug: 'panduan-memilih-kamera-fujifilm-2026',
    title: 'Panduan Memilih Kamera Fujifilm 2026',
    description: 'Landing page khusus panduan komprehensif bagi fotografer pemula hingga profesional.',
    type: 'custom',
    status: 'published',
    lastModified: '2026-09-07T16:00:00Z',
    publishedAt: '2026-09-07T16:00:00Z',
    author: 'Admin FujiFinder',
    useBuilderLayout: true,
    sections: [
      {
        id: 'sec-custom-hero',
        name: 'Guide Hero Banner',
        visibility: { desktop: true, tablet: true, mobile: true },
        style: {
          backgroundColor: '#1A1A1A',
          paddingY: { desktop: 60, tablet: 40, mobile: 28 },
          fullWidth: true,
        },
        blocks: [
          {
            id: 'b-cust-hero',
            type: 'hero',
            label: 'Guide Hero',
            content: {
              badge: 'Panduan Pembelian Lengkap',
              date: 'Edisi 2026',
              headline: 'Panduan Lengkap Memilih Kamera Fujifilm Sesuai Budget & Kebutuhan',
              subtitle: 'Pelajari perbedaan lini X100, X-T series, X-S series, X-H series, dan GFX Medium Format.',
              alignment: 'center',
              minHeight: 380,
              primaryBtnText: 'Mulai Membaca',
              primaryBtnLink: '#overview',
            },
            style: {
              maxWidth: '960px',
              textAlign: 'center',
            },
            visibility: { desktop: true, tablet: true, mobile: true },
          },
        ],
      },
      {
        id: 'sec-custom-picks',
        name: 'Top Camera Recommendation',
        visibility: { desktop: true, tablet: true, mobile: true },
        style: {
          backgroundColor: '#FFFFFF',
          paddingY: { desktop: 48, tablet: 36, mobile: 24 },
        },
        blocks: [
          {
            id: 'b-cust-rec',
            type: 'product-recommendation',
            label: 'Curated Gear Box',
            content: {
              title: 'Kamera Rekomendasi Utama',
              subtitle: 'Keseimbangan terbaik antara ukuran bodi, resolusi 40MP, dan stabilisasi IBIS.',
            },
            style: {
              maxWidth: '1140px',
            },
            visibility: { desktop: true, tablet: true, mobile: true },
          },
          {
            id: 'b-cust-articles',
            type: 'article-list',
            label: 'Related In-Depth Articles',
            content: {
              title: 'Artikel Uji Coba Terkait',
              count: 4,
            },
            style: {
              maxWidth: '960px',
            },
            visibility: { desktop: true, tablet: true, mobile: true },
          },
        ],
      },
    ],
  },
];
