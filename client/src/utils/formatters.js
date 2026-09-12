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
