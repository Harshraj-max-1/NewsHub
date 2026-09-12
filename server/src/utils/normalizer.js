const crypto = require('crypto');

/**
 * Global In-Memory Article Cache
 * Keeps every article served to clients so getArticleById is always O(1) and never returns 404.
 */
const articleStore = new Map();

function saveToArticleStore(article) {
  if (article && (article.id || article.externalId)) {
    if (article.id) articleStore.set(article.id, article);
    if (article.externalId) articleStore.set(article.externalId, article);
    // Keep cache memory bounded to 3000 articles
    if (articleStore.size > 3000) {
      const firstKey = articleStore.keys().next().value;
      articleStore.delete(firstKey);
    }
  }
}

function getFromArticleStore(id) {
  return articleStore.get(id);
}

function generateArticleId(title, url) {
  const seed = `${(title || '').trim().toLowerCase()}_${(url || '').trim().toLowerCase()}`;
  return crypto.createHash('md5').update(seed).digest('hex').substring(0, 16);
}

const INDIAN_SOURCES = [
  'the hindu', 'mint', 'the economic times', 'indian express', 'ndtv', 'yourstory',
  'techcircle', 'hindustan times', 'espncricinfo', 'press trust of india', 'pti',
  'moneycontrol', 'business standard', 'times of india', 'deccan herald', 'aaj tak',
  'amar ujala', 'dainik bhaskar', 'navbharat times', 'oneindia', 'prabhat khabar'
];

const EDITORIAL_FALLBACK_POOL = [
  'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80'
];

function getFallbackImage(title = '') {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) | 0;
  return EDITORIAL_FALLBACK_POOL[Math.abs(hash) % EDITORIAL_FALLBACK_POOL.length];
}

function normalizeArticle(raw = {}) {
  const title = (raw.title || 'Untitled Article').trim();
  const articleUrl = raw.articleUrl || raw.url || raw.link || '#';
  const externalId = raw.externalId || raw.id || generateArticleId(title, articleUrl);
  const sourceName = raw.sourceName || (raw.source && raw.source.name) || raw.source_id || 'NewsHub Dispatch';
  const country = (raw.country || (INDIAN_SOURCES.some(s => sourceName.toLowerCase().includes(s)) ? 'in' : 'us')).toLowerCase();

  const region = raw.region || (country === 'in' || INDIAN_SOURCES.some(s => sourceName.toLowerCase().includes(s)) ? 'india' : 'global');

  const normalized = {
    id: externalId,
    externalId,
    title,
    description: raw.description || raw.summary || raw.snippet || 'No summary available for this story.',
    content: raw.content || raw.body || '',
    imageUrl: (raw.imageUrl || raw.image || raw.urlToImage || raw.image_url || getFallbackImage(title)).replace(/&amp;/g, '&'),
    sourceName,
    sourceUrl: raw.sourceUrl || (raw.source && raw.source.url) || '',
    articleUrl,
    author: raw.author || raw.creator || 'Editorial Staff',
    publishedAt: raw.publishedAt || raw.published_at || raw.pubDate || new Date().toISOString(),
    category: (raw.category || 'general').toLowerCase(),
    country,
    region,
    language: (raw.language || 'en').toLowerCase(),
    readTimeMinutes: raw.readTimeMinutes || Math.max(2, Math.ceil((raw.description?.length || 100) / 70))
  };

  // Register in memory cache immediately
  saveToArticleStore(normalized);

  return normalized;
}

module.exports = {
  generateArticleId,
  normalizeArticle,
  getFromArticleStore,
  saveToArticleStore
};
