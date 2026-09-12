export function formatTimeAgo(dateString) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

export function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export function cleanArticleText(text = '', fallbackTitle = '', isHindi = false) {
  if (!text) {
    return fallbackTitle
      ? isHindi
        ? `${fallbackTitle}। ताज़ा और निष्पक्ष समाचार बुलेटिन। इस मामले के सभी पहलुओं पर विश्लेषण।`
        : `${fallbackTitle}. Verified editorial report and real-time coverage.`
      : '';
  }

  // If text contains Google News anchor lists or raw html markup
  if (text.includes('<ol') || text.includes('&lt;ol') || text.includes('href=') || text.includes('news.google.com')) {
    return fallbackTitle
      ? isHindi
        ? `${fallbackTitle}। ताज़ा और निष्पक्ष समाचार बुलेटिन। इस घटनाक्रम से जुड़ी पृष्ठभूमि, मुख्य बिंदुओं और देश-दुनिया पर पड़ने वाले प्रभावों का संपूर्ण विश्लेषण।`
        : `${fallbackTitle}. Comprehensive editorial report providing background context, analytical insights, and verified updates regarding this developing situation.`
      : '';
  }

  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&mdash;/gi, '—')
    .replace(/Google समाचार पर.*$/gi, '')
    .replace(/Google News.*$/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export const CATEGORIES = [
  { id: 'all', name: 'All News', icon: 'Globe' },
  { id: 'technology', name: 'Technology', icon: 'Cpu' },
  { id: 'ai', name: 'Artificial Intelligence', icon: 'Sparkles' },
  { id: 'business', name: 'Business & Economy', icon: 'TrendingUp' },
  { id: 'startups', name: 'Startups & Venture', icon: 'Rocket' },
  { id: 'science', name: 'Science & ISRO', icon: 'Atom' },
  { id: 'sports', name: 'Cricket & Sports', icon: 'Trophy' },
  { id: 'politics', name: 'National Policy', icon: 'Landmark' },
  { id: 'health', name: 'Health & Pharma', icon: 'Activity' },
  { id: 'entertainment', name: 'Cinema & OTT', icon: 'Film' },
  { id: 'world', name: 'World Affairs', icon: 'Compass' }
];

export const INDIA_SOURCES = [
  'The Hindu',
  'Mint',
  'The Economic Times',
  'Indian Express',
  'NDTV',
  'YourStory',
  'Business Standard',
  'Moneycontrol',
  'ESPNcricinfo',
  'Hindustan Times'
];

export const GLOBAL_SOURCES = [
  'The Verge',
  'Bloomberg',
  'Reuters',
  'Nature',
  'BBC News',
  'Wired',
  'Financial Times',
  'MIT Tech Review'
];

export const TOP_SOURCES = [
  ...INDIA_SOURCES,
  ...GLOBAL_SOURCES
];
