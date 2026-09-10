import { Article, CameraProduct, SEOData, SiteSettings } from '../types';

// Stopwords to filter out when generating clean, concise URL slugs
const STOPWORDS = new Set([
  // Indonesian stopwords
  'yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'pada', 'adalah', 'ini', 'itu',
  'dengan', 'atau', 'dalam', 'bisa', 'akan', 'oleh', 'juga', 'karena', 'tentang',
  'sebagai', 'lebih', 'sudah', 'secara', 'saat', 'para', 'bila', 'jika', 'bagi',
  'serta', 'dapat', 'setelah', 'sebelum', 'antara', 'tanpa', 'kembali',
  // English stopwords
  'a', 'an', 'the', 'and', 'or', 'for', 'with', 'in', 'on', 'of', 'to', 'at',
  'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
  'has', 'had', 'do', 'does', 'did', 'but', 'if', 'then', 'else', 'when',
  'up', 'down', 'out', 'over', 'under', 'again', 'further', 'about', 'such',
  'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
  'some', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
  'very', 'can', 'will', 'just', 'should', 'now', 'your', 'my', 'our', 'their'
]);

/**
 * Generates a clean, concise, keyword-rich URL slug
 */
export function generateCleanSlug(input: string, removeStopwords = true): string {
  if (!input) return '';

  let text = input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s-]/g, ' ') // remove special chars
    .trim();

  if (removeStopwords) {
    const words = text.split(/\s+/).filter(w => w.length > 0 && !STOPWORDS.has(w));
    if (words.length > 0) {
      text = words.join(' ');
    }
  }

  return text
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 65);
}

/**
 * Strips HTML tags and collapses whitespace
 */
function cleanText(text?: string): string {
  if (!text) return '';
  return text.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Extracts all textual content from an article for on-page SEO analysis
 */
export function extractArticleContent(article: Article): {
  fullText: string;
  headingsText: string[];
  introText: string;
  imageAltTexts: string[];
  links: string[];
  wordCount: number;
} {
  const parts: string[] = [];
  const headingsText: string[] = [];
  const imageAltTexts: string[] = [];
  const links: string[] = [];

  if (article.title) parts.push(article.title);
  if (article.subtitle) parts.push(article.subtitle);
  if (article.excerpt) parts.push(article.excerpt);

  const introText = cleanText(article.excerpt || (article.blocks?.[0]?.text ?? ''));

  if (Array.isArray(article.blocks)) {
    article.blocks.forEach((b) => {
      if (b.type === 'heading2' || b.type === 'heading3') {
        if (b.text) {
          parts.push(b.text);
          headingsText.push(b.text.toLowerCase());
        }
      } else if (b.type === 'paragraph' || b.type === 'quote' || b.type === 'callout') {
        if (b.text) parts.push(b.text);
      } else if (b.type === 'bullet_list' || b.type === 'numbered_list') {
        if (b.items) parts.push(b.items.join(' '));
      } else if (b.type === 'pros_cons') {
        if (b.pros) parts.push(b.pros.join(' '));
        if (b.cons) parts.push(b.cons.join(' '));
      } else if (b.type === 'image') {
        if (b.imageAlt) {
          imageAltTexts.push(b.imageAlt.toLowerCase());
          parts.push(b.imageAlt);
        }
        if (b.imageCaption) parts.push(b.imageCaption);
      } else if (b.type === 'product_card') {
        if (b.productNote) parts.push(b.productNote);
      }

      if (b.linkUrl) links.push(b.linkUrl);
    });
  }

  const fullText = parts.join(' ');
  const words = fullText.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;

  return {
    fullText,
    headingsText,
    introText,
    imageAltTexts,
    links,
    wordCount,
  };
}

export interface SEOCheckItem {
  id: string;
  category: 'keyword' | 'content' | 'links' | 'structure' | 'affiliate';
  title: string;
  status: 'pass' | 'warning' | 'fail';
  description: string;
  recommendation?: string;
  score: number;
  maxScore: number;
}

export interface SEOAnalysisReport {
  score: number;
  ratingLabel: string;
  ratingColor: string;
  checks: SEOCheckItem[];
  stats: {
    wordCount: number;
    keywordOccurrences: number;
    keywordDensityPercent: number;
    headingsCount: { h2: number; h3: number };
    internalLinksCount: number;
    externalLinksCount: number;
    imagesWithAltCount: number;
    connectedProductsCount: number;
  };
  suggestedKeywords: string[];
}

/**
 * Performs on-page SEO analysis of an article
 */
export function analyzeArticleSEO(
  article: Article,
  connectedCameras: CameraProduct[],
  siteUrl: string = 'https://www.fujifinder.my.id'
): SEOAnalysisReport {
  const { fullText, headingsText, introText, imageAltTexts, links, wordCount } = extractArticleContent(article);

  const focusKeyword = (article.seo?.primaryKeyword || article.seo?.focusKeyword || '').toLowerCase().trim();
  const metaTitle = (article.seo?.metaTitle || '').trim();
  const metaDesc = (article.seo?.metaDescription || '').trim();
  const slug = (article.slug || '').toLowerCase().trim();
  const title = (article.title || '').toLowerCase().trim();

  // Connected cameras
  const featuredCameraIds = article.featuredCameraIds || [];
  const primaryCamera = connectedCameras.find((c) => featuredCameraIds.includes(c.id)) || connectedCameras[0];

  // Derive suggested keywords from cameras & title
  const suggestedKeywords: string[] = [];
  if (primaryCamera) {
    suggestedKeywords.push(`${primaryCamera.name.toLowerCase()} review`);
    suggestedKeywords.push(`${primaryCamera.name.toLowerCase()} field test`);
    suggestedKeywords.push(`${primaryCamera.brand.toLowerCase()} ${primaryCamera.specs.sensorFormat.toLowerCase()}`);
    suggestedKeywords.push(`${primaryCamera.name.toLowerCase()} specs`);
  }
  suggestedKeywords.push('camera review 2026', 'sensor lab test', 'street photography gear');

  const checks: SEOCheckItem[] = [];

  // 1. Primary Keyword Defined
  if (!focusKeyword) {
    checks.push({
      id: 'kw-defined',
      category: 'keyword',
      title: 'Focus / Primary Keyword',
      status: 'fail',
      description: 'Focus keyword belum ditentukan.',
      recommendation: 'Tentukan satu Primary Keyword utama (misal: "fujifilm x100vi review") agar sistem dapat mengukur optimasi on-page.',
      score: 0,
      maxScore: 10,
    });
  } else {
    checks.push({
      id: 'kw-defined',
      category: 'keyword',
      title: 'Focus Keyword Ditetapkan',
      status: 'pass',
      description: `Target keyword: "${focusKeyword}"`,
      score: 10,
      maxScore: 10,
    });
  }

  // 2. Keyword in Meta Title
  if (!focusKeyword) {
    checks.push({
      id: 'kw-in-meta-title',
      category: 'keyword',
      title: 'Keyword di Meta Title',
      status: 'fail',
      description: 'Tentukan focus keyword terlebih dahulu.',
      score: 0,
      maxScore: 12,
    });
  } else if (!metaTitle) {
    checks.push({
      id: 'kw-in-meta-title',
      category: 'keyword',
      title: 'Keyword di Meta Title',
      status: 'fail',
      description: 'Meta Title masih kosong.',
      recommendation: `Buat Meta Title (50–60 karakter) yang memuat kata kunci "${focusKeyword}" di awal.`,
      score: 0,
      maxScore: 12,
    });
  } else if (metaTitle.toLowerCase().includes(focusKeyword)) {
    checks.push({
      id: 'kw-in-meta-title',
      category: 'keyword',
      title: 'Keyword di Meta Title',
      status: 'pass',
      description: `Primary keyword ditemukan di Meta Title (${metaTitle.length} karakter).`,
      score: 12,
      maxScore: 12,
    });
  } else {
    checks.push({
      id: 'kw-in-meta-title',
      category: 'keyword',
      title: 'Keyword di Meta Title',
      status: 'warning',
      description: 'Primary keyword belum ditemukan persis di Meta Title.',
      recommendation: `Sisipkan "${focusKeyword}" secara natural ke dalam Meta Title untuk rasio klik (CTR) Google yang lebih tinggi.`,
      score: 4,
      maxScore: 12,
    });
  }

  // 3. Meta Title Length (50-60 chars is optimal)
  const titleLen = metaTitle.length;
  if (titleLen === 0) {
    checks.push({
      id: 'meta-title-length',
      category: 'content',
      title: 'Panjang Meta Title',
      status: 'fail',
      description: 'Meta Title belum diisi.',
      score: 0,
      maxScore: 8,
    });
  } else if (titleLen >= 45 && titleLen <= 62) {
    checks.push({
      id: 'meta-title-length',
      category: 'content',
      title: 'Panjang Meta Title Optimal',
      status: 'pass',
      description: `${titleLen} karakter — Pas dan tidak terpotong di hasil pencarian Google.`,
      score: 8,
      maxScore: 8,
    });
  } else if (titleLen > 62) {
    checks.push({
      id: 'meta-title-length',
      category: 'content',
      title: 'Meta Title Terlalu Panjang',
      status: 'warning',
      description: `${titleLen} karakter (Disarankan 50–60 karakter). Judul berpotensi terpotong di SERP Google.`,
      recommendation: 'Perpendek Meta Title agar informasi kunci tetap terbaca penuh di layar smartphone.',
      score: 5,
      maxScore: 8,
    });
  } else {
    checks.push({
      id: 'meta-title-length',
      category: 'content',
      title: 'Meta Title Terlalu Pendek',
      status: 'warning',
      description: `${titleLen} karakter (Disarankan 50–60 karakter).`,
      recommendation: 'Manfaatkan ruang judul untuk menambahkan tahun pengujian (2026) atau nama media (| FujiFinder).',
      score: 5,
      maxScore: 8,
    });
  }

  // 4. Keyword in H1 / Article Title
  if (focusKeyword && title.includes(focusKeyword)) {
    checks.push({
      id: 'kw-in-h1',
      category: 'keyword',
      title: 'Keyword di Judul Artikel (H1)',
      status: 'pass',
      description: `Primary keyword ditemukan di judul utama artikel.`,
      score: 10,
      maxScore: 10,
    });
  } else {
    checks.push({
      id: 'kw-in-h1',
      category: 'keyword',
      title: 'Keyword di Judul Artikel (H1)',
      status: focusKeyword ? 'warning' : 'fail',
      description: focusKeyword ? `Keyword "${focusKeyword}" tidak ditemukan di judul artikel.` : 'Focus keyword belum ditentukan.',
      recommendation: 'Sertakan kata kunci utama pada judul artikel agar relevansi halaman dinilai tinggi oleh search engine.',
      score: focusKeyword ? 4 : 0,
      maxScore: 10,
    });
  }

  // 5. Keyword in URL Slug
  const keywordSlug = focusKeyword.replace(/\s+/g, '-');
  const slugWords = focusKeyword.split(/\s+/).filter((w) => w.length > 2);
  const slugHasPartial = slugWords.length > 0 && slugWords.every((w) => slug.includes(w));

  if (focusKeyword && (slug.includes(keywordSlug) || slugHasPartial)) {
    checks.push({
      id: 'kw-in-slug',
      category: 'keyword',
      title: 'Keyword di URL Slug',
      status: 'pass',
      description: `URL Slug bersih dan memuat kata kunci ("${slug}").`,
      score: 8,
      maxScore: 8,
    });
  } else {
    checks.push({
      id: 'kw-in-slug',
      category: 'keyword',
      title: 'Keyword di URL Slug',
      status: 'warning',
      description: 'Kata kunci utama belum tampak di struktur slug URL.',
      recommendation: `Sesuaikan slug menjadi lebih ringkas dan memuat kata kunci, misal: "/article/${generateCleanSlug(focusKeyword || title)}".`,
      score: 3,
      maxScore: 8,
    });
  }

  // 6. Meta Description Length & Keyword
  const descLen = metaDesc.length;
  const descHasKw = focusKeyword && metaDesc.toLowerCase().includes(focusKeyword);

  if (descLen === 0) {
    checks.push({
      id: 'meta-desc-check',
      category: 'content',
      title: 'Meta Description',
      status: 'fail',
      description: 'Meta Description masih kosong.',
      recommendation: 'Tulis ringkasan ulasan antara 140–160 karakter untuk menarik pengunjung dari Google.',
      score: 0,
      maxScore: 10,
    });
  } else if (descLen >= 120 && descLen <= 165 && descHasKw) {
    checks.push({
      id: 'meta-desc-check',
      category: 'content',
      title: 'Meta Description Optimal',
      status: 'pass',
      description: `${descLen} karakter & memuat kata kunci utama secara alami.`,
      score: 10,
      maxScore: 10,
    });
  } else if (descLen > 165) {
    checks.push({
      id: 'meta-desc-check',
      category: 'content',
      title: 'Meta Description Terlalu Panjang',
      status: 'warning',
      description: `${descLen} karakter. Teks di atas 160 karakter akan terpotong (...) di hasil Google.`,
      recommendation: 'Perpendek deskripsi menjadi 140–160 karakter dengan ajakan bertindak (CTA).',
      score: 6,
      maxScore: 10,
    });
  } else {
    checks.push({
      id: 'meta-desc-check',
      category: 'content',
      title: 'Optimasi Meta Description',
      status: 'warning',
      description: `${descLen} karakter${!descHasKw && focusKeyword ? ', namun belum memuat kata kunci utama' : ''}.`,
      recommendation: `Tambahkan "${focusKeyword}" ke dalam deskripsi dan usahakan panjang 140–160 karakter.`,
      score: 5,
      maxScore: 10,
    });
  }

  // 7. Keyword in Introduction
  if (focusKeyword && introText.toLowerCase().includes(focusKeyword)) {
    checks.push({
      id: 'kw-in-intro',
      category: 'keyword',
      title: 'Keyword di Paragraf Pembuka',
      status: 'pass',
      description: 'Primary keyword muncul secara alami di paragraf awal / ringkasan artikel.',
      score: 8,
      maxScore: 8,
    });
  } else {
    checks.push({
      id: 'kw-in-intro',
      category: 'keyword',
      title: 'Keyword di Paragraf Pembuka',
      status: 'warning',
      description: 'Primary keyword belum terdeteksi di paragraf pengantar artikel.',
      recommendation: 'Sebutkan kata kunci fokus pada 100 kata pertama artikel untuk menegaskan topik pembahasan bagi Google.',
      score: 3,
      maxScore: 8,
    });
  }

  // 8. Keyword in Headings (H2/H3)
  const headingHasKw = focusKeyword && headingsText.some((h) => h.includes(focusKeyword) || slugWords.some((sw) => h.includes(sw)));
  const h2Count = article.blocks?.filter((b) => b.type === 'heading2').length || 0;
  const h3Count = article.blocks?.filter((b) => b.type === 'heading3').length || 0;

  if (headingHasKw) {
    checks.push({
      id: 'kw-in-headings',
      category: 'structure',
      title: 'Keyword di Sub-Heading (H2/H3)',
      status: 'pass',
      description: `Ditemukan sub-heading yang relevan dengan fokus topik (${h2Count} H2, ${h3Count} H3).`,
      score: 6,
      maxScore: 6,
    });
  } else {
    checks.push({
      id: 'kw-in-headings',
      category: 'structure',
      title: 'Keyword di Sub-Heading (H2/H3)',
      status: h2Count > 0 ? 'warning' : 'fail',
      description: h2Count > 0 ? 'Belum ada sub-heading yang memuat kata kunci fokus.' : 'Artikel belum memiliki sub-heading (H2).',
      recommendation: 'Gunakan H2/H3 yang memuat variasi kata kunci (misal: "Hasil Uji Sensor", "Kelebihan & Kekurangan").',
      score: h2Count > 0 ? 3 : 0,
      maxScore: 6,
    });
  }

  // 9. Keyword Density & Natural Frequency
  let kwOccurrences = 0;
  if (focusKeyword) {
    const escaped = focusKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    kwOccurrences = (fullText.match(regex) || []).length;
  }

  const kwDensity = wordCount > 0 && kwOccurrences > 0 ? (kwOccurrences * focusKeyword.split(/\s+/).length / wordCount) * 100 : 0;
  const kwDensityFormatted = Number(kwDensity.toFixed(2));

  if (!focusKeyword || kwOccurrences === 0) {
    checks.push({
      id: 'kw-density',
      category: 'keyword',
      title: 'Kepadatan Kata Kunci (Keyword Density)',
      status: 'warning',
      description: 'Kata kunci fokus belum ditemukan di isi artikel.',
      recommendation: 'Gunakan kata kunci utama secara alami 3–8 kali di seluruh teks tanpa memaksakannya.',
      score: 2,
      maxScore: 8,
    });
  } else if (kwDensity >= 0.4 && kwDensity <= 2.5) {
    checks.push({
      id: 'kw-density',
      category: 'keyword',
      title: 'Kepadatan Kata Kunci Alami',
      status: 'pass',
      description: `Muncul ${kwOccurrences} kali (${kwDensityFormatted}%). Proporsi ideal dan bebas dari keyword stuffing.`,
      score: 8,
      maxScore: 8,
    });
  } else if (kwDensity > 2.5) {
    checks.push({
      id: 'kw-density',
      category: 'keyword',
      title: 'Penggunaan Keyword Berlebih (Potensi Stuffing)',
      status: 'warning',
      description: `Densitas ${kwDensityFormatted}% (${kwOccurrences} kali). Frekuensi terlalu tinggi berisiko penalti Google.`,
      recommendation: 'Kurangi pengulangan kata kunci. Gunakan variasi sinonim dan bahasa ulasan yang alami bagi pembaca.',
      score: 4,
      maxScore: 8,
    });
  } else {
    checks.push({
      id: 'kw-density',
      category: 'keyword',
      title: 'Kepadatan Kata Kunci Cukup',
      status: 'pass',
      description: `Muncul ${kwOccurrences} kali (${kwDensityFormatted}%). Cukup alami untuk ulasan.`,
      score: 6,
      maxScore: 8,
    });
  }

  // 10. Content Word Count Benchmark
  if (wordCount >= 800) {
    checks.push({
      id: 'content-length',
      category: 'content',
      title: 'Kedalaman Isi Artikel (Word Count)',
      status: 'pass',
      description: `${wordCount} kata — Sangat komprehensif untuk ulasan lab kamera dan panduan belanja.`,
      score: 10,
      maxScore: 10,
    });
  } else if (wordCount >= 400) {
    checks.push({
      id: 'content-length',
      category: 'content',
      title: 'Panjang Konten Memadai',
      status: 'pass',
      description: `${wordCount} kata — Cukup baik untuk ulasan ringkas, namun artikel mendalam (800+ kata) cenderung berperingkat lebih tinggi di Google.`,
      score: 7,
      maxScore: 10,
    });
  } else {
    checks.push({
      id: 'content-length',
      category: 'content',
      title: 'Konten Terlalu Pendek (Thin Content)',
      status: 'warning',
      description: `Baru terkumpul ${wordCount} kata. Google memprioritaskan artikel dengan pembahasan lengkap.`,
      recommendation: 'Perluas pembahasan ergonomi bodi, kualitas sensor, perbandingan ISO, atau rekomendasi lensa.',
      score: 3,
      maxScore: 10,
    });
  }

  // 11. Internal Links
  const internalLinks = links.filter((l) => l.startsWith('/') || l.startsWith('#') || l.includes('fujifinder') || l.includes('article') || l.includes('camera'));
  const relatedSlugsCount = article.relatedArticleSlugs?.length || 0;
  const totalInternalLinks = internalLinks.length + relatedSlugsCount;

  if (totalInternalLinks >= 1) {
    checks.push({
      id: 'internal-links',
      category: 'links',
      title: 'Tautan Internal (Internal Links)',
      status: 'pass',
      description: `Terdeteksi tautan ke ulasan terkait dan katalog kamera (${totalInternalLinks} koneksi internal).`,
      score: 6,
      maxScore: 6,
    });
  } else {
    checks.push({
      id: 'internal-links',
      category: 'links',
      title: 'Belum Ada Tautan Internal',
      status: 'warning',
      description: 'Tidak ada link internal ke ulasan gear lain, panduan belanja, atau alat komparasi.',
      recommendation: 'Tambahkan link ke ulasan kamera lain atau halaman kategori untuk mendistribusikan page authority dan menurunkan bounce rate.',
      score: 1,
      maxScore: 6,
    });
  }

  // 12. Image Alt Text Optimization
  const hasCover = Boolean(article.coverImage);
  const imagesWithAlt = imageAltTexts.filter((alt) => alt.length > 5).length;
  const imageBlocksCount = article.blocks?.filter((b) => b.type === 'image').length || 0;

  if (hasCover && (imageBlocksCount === 0 || imagesWithAlt > 0)) {
    checks.push({
      id: 'image-optimization',
      category: 'content',
      title: 'Optimasi Gambar & Alt Text',
      status: 'pass',
      description: 'Foto cover terpasang dan atribut alt text tersedia untuk Google Image Search.',
      score: 4,
      maxScore: 4,
    });
  } else {
    checks.push({
      id: 'image-optimization',
      category: 'content',
      title: 'Optimasi Gambar & Alt Text',
      status: 'warning',
      description: 'Beberapa gambar belum memiliki deskripsi Alt Text yang jelas.',
      recommendation: 'Tambahkan deskripsi pada setiap foto pengujian untuk meningkatkan peringkat pencarian gambar Google.',
      score: 2,
      maxScore: 4,
    });
  }

  // 13. Camera Product Link / Affiliate Conversion Opportunity
  if (featuredCameraIds.length > 0) {
    const camNames = featuredCameraIds
      .map((id) => connectedCameras.find((c) => c.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    checks.push({
      id: 'product-conversion',
      category: 'affiliate',
      title: 'Kamera Produk Terhubung (Affiliate Readiness)',
      status: 'pass',
      description: `Terhubung dengan ${featuredCameraIds.length} kamera (${camNames || 'Katalog'}). Buy-box & link retailer aktif.`,
      score: 6,
      maxScore: 6,
    });
  } else {
    checks.push({
      id: 'product-conversion',
      category: 'affiliate',
      title: 'Belum Menghubungkan Kamera',
      status: 'warning',
      description: 'Artikel belum terhubung dengan kamera di katalog untuk konversi komisi afiliasi.',
      recommendation: 'Pilih kamera terkait di bagian "Featured Cameras" di bawah agar tombol Checkout ritel resmi (Amazon, B&H) otomatis tampil di artikel.',
      score: 1,
      maxScore: 6,
    });
  }

  // Calculate Total Score (Scale 0 - 100)
  const totalEarned = checks.reduce((acc, c) => acc + c.score, 0);
  const totalMax = checks.reduce((acc, c) => acc + c.maxScore, 0);
  const rawScore = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;
  const score = Math.min(100, Math.max(0, rawScore));

  let ratingLabel = 'Perlu Optimasi';
  let ratingColor = 'text-amber-600 bg-amber-50 border-amber-200';

  if (score >= 80) {
    ratingLabel = 'SEO Optimal & Siap Terbit';
    ratingColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  } else if (score < 50) {
    ratingLabel = 'SEO Belum Lengkap';
    ratingColor = 'text-rose-700 bg-rose-50 border-rose-200';
  }

  return {
    score,
    ratingLabel,
    ratingColor,
    checks,
    stats: {
      wordCount,
      keywordOccurrences: kwOccurrences,
      keywordDensityPercent: kwDensityFormatted,
      headingsCount: { h2: h2Count, h3: h3Count },
      internalLinksCount: totalInternalLinks,
      externalLinksCount: links.filter((l) => l.startsWith('http') && !l.includes('fujifinder')).length,
      imagesWithAltCount: imagesWithAlt,
      connectedProductsCount: featuredCameraIds.length,
    },
    suggestedKeywords,
  };
}

/**
 * Intelligent generator for SEO metadata from article contents
 */
export function autoGenerateSEOMetadata(
  article: Article,
  connectedCameras: CameraProduct[],
  siteSettings: SiteSettings
): {
  focusKeyword: string;
  secondaryKeywords: string[];
  metaTitle: string;
  metaDescription: string;
  slug: string;
  ogTitle: string;
  ogDescription: string;
  schemaType: 'Article' | 'Review' | 'TechArticle';
} {
  const currentTitle = article.title || 'Ulasan Kamera';
  const category = article.category || 'Reviews';
  const featuredCameraIds = article.featuredCameraIds || [];
  const primaryCamera = connectedCameras.find((c) => featuredCameraIds.includes(c.id));

  // Determine Focus Keyword
  let focusKeyword = '';
  if (primaryCamera) {
    if (category.toLowerCase().includes('guide') || category.toLowerCase().includes('buying')) {
      focusKeyword = `${primaryCamera.name.toLowerCase()} buying guide`;
    } else {
      focusKeyword = `${primaryCamera.name.toLowerCase()} review`;
    }
  } else {
    // Extract subject from title
    const cleanTitle = currentTitle.replace(/[:–—|].*$/, '').trim();
    focusKeyword = cleanTitle.toLowerCase();
  }

  // Determine Secondary Keywords
  const secondaryKeywords: string[] = [];
  if (primaryCamera) {
    secondaryKeywords.push(
      `${primaryCamera.brand.toLowerCase()} ${primaryCamera.name.toLowerCase()}`,
      `${primaryCamera.name.toLowerCase()} specs`,
      `uji lab ${primaryCamera.name.toLowerCase()}`,
      `${primaryCamera.specs.sensorFormat.toLowerCase()} mirrorless 2026`
    );
  } else {
    secondaryKeywords.push('camera review 2026', 'uji lab sensor', 'rekomendasi kamera jalanan');
  }

  // Determine Clean Slug
  const slug = generateCleanSlug(focusKeyword || currentTitle, true);

  // Determine Meta Title (~52 - 58 characters)
  const brandSuffix = ` | ${siteSettings.siteName || 'FujiFinder'}`;
  const maxTitleBaseLen = 60 - brandSuffix.length;
  let baseTitle = currentTitle;
  if (baseTitle.length > maxTitleBaseLen) {
    baseTitle = baseTitle.substring(0, maxTitleBaseLen - 3) + '...';
  }
  const metaTitle = `${baseTitle}${brandSuffix}`;

  // Determine Meta Description (~145 - 155 characters)
  let metaDescription = '';
  if (article.excerpt && article.excerpt.length >= 80 && article.excerpt.length <= 160) {
    metaDescription = article.excerpt.trim();
  } else if (primaryCamera) {
    metaDescription = `Uji komprehensif kamera ${primaryCamera.name}: evaluasi sensor ${primaryCamera.specs.megapixels}MP, performa autofocus, dan ergonomi lapangan. Baca ulasan lab FujiFinder.`;
  } else {
    const textSnippet = article.blocks?.find((b) => b.type === 'paragraph')?.text || '';
    if (textSnippet.length >= 80) {
      metaDescription = textSnippet.substring(0, 150).replace(/\s+[^\s]*$/, '') + '... Baca ulasan lengkap di FujiFinder.';
    } else {
      metaDescription = `Analisis mendalam ${currentTitle}. Simak perbandingan sensor, hasil uji lab independen, dan rekomendasi gear fotografi di FujiFinder.`;
    }
  }

  // Schema Type
  const isReview = category.toLowerCase().includes('review') || featuredCameraIds.length > 0;
  const schemaType = isReview ? 'Review' : 'Article';

  return {
    focusKeyword,
    secondaryKeywords,
    metaTitle,
    metaDescription,
    slug,
    ogTitle: metaTitle,
    ogDescription: metaDescription,
    schemaType,
  };
}

/**
 * Generates Schema.org JSON-LD structured data for article or camera review
 */
export function generateArticleSchemaJson(
  article: Article,
  connectedCameras: CameraProduct[],
  siteSettings: SiteSettings
): object {
  const domain = (siteSettings.siteUrl || 'https://www.fujifinder.my.id').replace(/\/+$/, '');
  const slugPrefix = (siteSettings.blogSlugPrefix || '/article/').replace(/^\/+|\/+$/g, '');
  const articleUrl = `${domain}/${slugPrefix}/${article.slug || 'article-slug'}`;

  const featuredCameraIds = article.featuredCameraIds || [];
  const primaryCamera = connectedCameras.find((c) => featuredCameraIds.includes(c.id));
  const isReview = article.seo?.schemaType === 'Review' || Boolean(primaryCamera);

  if (isReview && primaryCamera) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Review',
      headline: article.seo?.metaTitle || article.title,
      name: article.title,
      description: article.seo?.metaDescription || article.excerpt,
      url: articleUrl,
      image: article.seo?.ogImage || article.coverImage,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt || article.publishedAt,
      author: {
        '@type': 'Person',
        name: article.author?.name || 'FujiFinder Editorial Team',
        jobTitle: article.author?.role || 'Senior Camera Tester',
      },
      publisher: {
        '@type': 'Organization',
        name: siteSettings.siteName || 'FujiFinder',
        url: domain,
        logo: {
          '@type': 'ImageObject',
          url: `${domain}/icon.png`,
        },
      },
      itemReviewed: {
        '@type': 'Product',
        name: primaryCamera.name,
        image: primaryCamera.image,
        brand: {
          '@type': 'Brand',
          name: primaryCamera.brand,
        },
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'USD',
          lowPrice: primaryCamera.price,
          highPrice: primaryCamera.price + 100,
          offerCount: primaryCamera.affiliateLinks?.length || 1,
          availability: 'https://schema.org/InStock',
        },
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: primaryCamera.rating,
        bestRating: 10,
        worstRating: 1,
      },
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': article.seo?.schemaType || 'Article',
    headline: article.seo?.metaTitle || article.title,
    description: article.seo?.metaDescription || article.excerpt,
    url: articleUrl,
    image: article.seo?.ogImage || article.coverImage,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      '@type': 'Person',
      name: article.author?.name || 'FujiFinder Editorial Team',
      jobTitle: article.author?.role || 'Camera Tech Journalist',
    },
    publisher: {
      '@type': 'Organization',
      name: siteSettings.siteName || 'FujiFinder',
      url: domain,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
  };
}

/**
 * Builds canonical URL conforming to production domain guidelines
 */
export function buildCanonicalUrl(
  siteSettings: SiteSettings,
  slug: string,
  canonicalOverride?: string
): string {
  if (canonicalOverride && canonicalOverride.trim().length > 0) {
    return canonicalOverride.trim();
  }
  const domain = (siteSettings.siteUrl || 'https://www.fujifinder.my.id').replace(/\/+$/, '');
  const prefix = (siteSettings.blogSlugPrefix || '/article/').replace(/^\/+|\/+$/g, '');
  const cleanSlug = (slug || 'article').replace(/^\/+|\/+$/g, '');
  return `${domain}/${prefix}/${cleanSlug}`;
}

/**
 * Serializes Schema.org JSON-LD to formatted string for injection in script tags
 */
export function generateArticleSchemaJsonString(
  article: Article,
  connectedCameras: CameraProduct[],
  siteSettings: SiteSettings
): string {
  return JSON.stringify(generateArticleSchemaJson(article, connectedCameras, siteSettings), null, 2);
}
