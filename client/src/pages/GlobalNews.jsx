import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import FeaturedArticle from '../components/news/FeaturedArticle';
import NewsGrid from '../components/news/NewsGrid';
import CategoryTabs from '../components/news/CategoryTabs';
import { FeaturedArticleSkeleton } from '../components/common/LoadingSkeleton';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { EmptyState, ErrorState, Pagination } from '../components/common/CommonStates';
import { Globe, ArrowLeft, ExternalLink, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GlobalNews() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [articles, setArticles] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchGlobalDispatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = activeCategory === 'all'
        ? `/news/top?region=global&page=${page}&limit=12`
        : `/news/category/${activeCategory}?region=global&page=${page}&limit=12`;

      const res = await api.get(endpoint);
      const data = res.data?.data;
      setArticles(data?.articles || []);
      setTotalPages(Math.ceil((data?.totalResults || 12) / 12));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch global stories');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, page]);

  useEffect(() => {
    fetchGlobalDispatches();
    window.scrollTo(0, 0);
  }, [fetchGlobalDispatches]);

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setPage(1);
  };

  const featured = articles[0];
  const remaining = articles.slice(1);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Global Mode Masthead */}
      <div className="border-b border-neutral-900 dark:border-neutral-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              <Globe size={13} className="text-blue-500" />
              <span>International Wire · Read-Only Global Edition</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-5xl font-semibold text-neutral-950 dark:text-white">
              Global Dispatches
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl mt-1">
              Curated international coverage from Reuters, Bloomberg, The Verge, Nature, and Financial Times.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 transition-colors"
          >
            <span>Switch to India Front</span>
            <span>🇮🇳</span>
          </Link>
        </div>
      </div>

      {/* Category Tabs */}
      <CategoryTabs activeCategory={activeCategory} onSelectCategory={handleCategoryChange} />

      {/* Content Stream */}
      {loading ? (
        <div className="space-y-8">
          <FeaturedArticleSkeleton />
          <LoadingSkeleton count={6} />
        </div>
      ) : error ? (
        <ErrorState onRetry={fetchGlobalDispatches} message={error} />
      ) : articles.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="No international dispatches found in this category"
          description="Explore all global categories or return to the main edition."
          actionText="View All Global News"
          actionTo="/global"
        />
      ) : (
        <>
          {page === 1 && featured && (
            <FeaturedArticle article={featured} />
          )}

          <div className="pt-2">
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {page === 1 ? 'International News Wire' : `Global Dispatches Page ${page}`}
              </h3>
              <span className="text-xs text-neutral-400">
                {articles.length} verified international stories
              </span>
            </div>
            <NewsGrid articles={page === 1 ? remaining : articles} />
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
