import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useBookmarkStore } from '../store/bookmarkStore';
import { Link } from 'react-router-dom';
import ArticleCard from '../components/news/ArticleCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { EmptyState, ErrorState, Pagination } from '../components/common/CommonStates';
import { Bookmark, Search, Filter } from 'lucide-react';
import { CATEGORIES } from '../utils/formatters';

export default function Saved() {
  const { isAuthenticated } = useAuthStore();
  const { bookmarkIds } = useBookmarkStore();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBookmarks = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      params.append('page', page);
      params.append('limit', 12);

      const res = await api.get(`/bookmarks?${params.toString()}`);
      setBookmarks(res.data?.data || []);
      setTotalPages(Math.ceil((res.data?.totalResults || 12) / 12));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, searchQuery, selectedCategory, page, bookmarkIds]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={Bookmark}
        title="Sign in to view saved stories"
        description="Save your favorite articles and read them across any device."
        actionText="Log In / Register"
        actionTo="/login?redirect=saved"
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Masthead */}
      <div className="border-b border-neutral-900 dark:border-neutral-100 pb-4">
        <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          Personal Archive
        </span>
        <h1 className="font-editorial text-3xl sm:text-5xl font-semibold text-neutral-950 dark:text-white">
          Saved Dispatches
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl mt-1">
          Your bookmarked articles for offline reference and deep reading.
        </p>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search within saved articles..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-neutral-400" />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 focus:outline-none"
          >
            <option value="all">All Topics</option>
            {CATEGORIES.filter(c => c.id !== 'all').map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bookmarks List */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : error ? (
        <ErrorState onRetry={fetchBookmarks} message={error} />
      ) : bookmarks.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="You haven't saved any stories yet"
          description="Bookmark stories with the ribbon icon to build your reading list."
          actionText="Explore Top News"
          actionTo="/"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((bookmark) => (
              <ArticleCard
                key={bookmark._id || bookmark.articleId}
                article={{
                  ...bookmark,
                  id: bookmark.articleId
                }}
              />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => {
              setPage(p);
              window.scrollTo({ top: 200, behavior: 'smooth' });
            }}
          />
        </>
      )}
    </div>
  );
}
