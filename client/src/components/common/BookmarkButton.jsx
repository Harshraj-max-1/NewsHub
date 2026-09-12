import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useBookmarkStore } from '../../store/bookmarkStore';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function BookmarkButton({ article, size = 18, className = '' }) {
  const { isBookmarked, toggleBookmark } = useBookmarkStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [animating, setAnimating] = useState(false);

  const articleId = article.id || article.externalId;
  const bookmarked = isBookmarked(articleId);

  const handleClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login?redirect=bookmarks');
      return;
    }

    setAnimating(true);
    await toggleBookmark(article);
    setTimeout(() => setAnimating(false), 300);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={bookmarked ? 'Remove bookmark' : 'Save article'}
      className={`p-1.5 rounded-full transition-all duration-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/80 focus:outline-none focus:ring-1 focus:ring-neutral-400 ${
        animating ? 'scale-125' : 'scale-100'
      } ${
        bookmarked
          ? 'text-neutral-900 dark:text-neutral-100 fill-neutral-900 dark:fill-neutral-100'
          : 'text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300'
      } ${className}`}
      aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark story'}
    >
      <Bookmark
        size={size}
        className={`transition-colors ${bookmarked ? 'fill-current' : ''}`}
      />
    </button>
  );
}
