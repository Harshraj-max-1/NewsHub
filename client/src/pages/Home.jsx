import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useEditionStore } from '../store/editionStore';
import { useAuthStore } from '../store/authStore';
import FeaturedArticle from '../components/news/FeaturedArticle';
import ArticleCard from '../components/news/ArticleCard';
import NewsGrid from '../components/news/NewsGrid';
import BreakingTicker from '../components/news/BreakingTicker';
import CategoryTabs from '../components/news/CategoryTabs';
import { FeaturedArticleSkeleton } from '../components/common/LoadingSkeleton';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { EmptyState, ErrorState, Pagination } from '../components/common/CommonStates';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Compass, ArrowRight, Globe, SlidersHorizontal } from 'lucide-react';
import { INDIA_SOURCES, GLOBAL_SOURCES } from '../utils/formatters';

export default function Home() {
  const { edition, setEdition } = useEditionStore();
  const { isAuthenticated, user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [articles, setArticles] = useState([]);
  const [personalized, setPersonalized] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHeadlines = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = activeCategory === 'all'
        ? `/news/top?region=${edition}&page=${page}&limit=12`
        : `/news/category/${activeCategory}?region=${edition}&page=${page}&limit=12`;

      const [headlinesRes, personalizedRes] = await Promise.allSettled([
        api.get(endpoint),
        api.get(`/news/personalized?region=${edition}&limit=3`)
      ]);

      if (headlinesRes.status === 'fulfilled') {
        const data = headlinesRes.value.data?.data;
        const fetched = data?.articles || [];
        setArticles(fetched);
        setTotalPages(Math.max(1, Math.ceil((data?.totalResults || fetched.length || 12) / 12)));
      }

      if (personalizedRes.status === 'fulfilled') {
        setPersonalized(personalizedRes.value.data?.data?.articles || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch stories.');
    } finally {
      setLoading(false);
    }
  }, [edition, activeCategory, page]);

  useEffect(() => {
    fetchHeadlines();
  }, [fetchHeadlines]);

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setPage(1);
  };

  const featured = articles[0];
  const secondary = articles.slice(1, 3);
  const remaining = articles.slice(3);

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Breaking News Ticker */}
      <BreakingTicker articles={articles} />

      {/* Hero Header Strip with Region Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-4 border-b border-neutral-900 dark:border-neutral-100 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              {edition === 'india' ? '🇮🇳 India Edition · National & Regional Wire' : edition === 'global' ? '🌐 International Wire · Global Edition' : 'Global & National Synthesis'}
            </span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-5xl font-semibold text-neutral-950 dark:text-white tracking-tight">
            {edition === 'india' ? 'India Front Page' : edition === 'global' ? 'Global Dispatches' : "Today's Front Page"}
          </h1>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider flex-wrap">
          <Link
            to="/global"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-100 text-neutral-800 dark:text-neutral-200 transition-colors"
          >
            <Globe size={13} className="text-blue-500" />
            <span>Global Wire</span>
          </Link>
          <Link
            to="/hindi"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors"
          >
            <span>🕉️</span>
            <span>हिंदी समाचार</span>
          </Link>
          <Link
            to="/for-you"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity"
          >
            <Sparkles size={13} className="text-amber-400 dark:text-amber-600 fill-current" />
            <span>Personalized For You</span>
          </Link>
        </div>
      </div>

      {/* Category Tabs */}
      <CategoryTabs activeCategory={activeCategory} onSelectCategory={handleCategoryChange} />

      {/* Main Content Area */}
      {loading ? (
        <div className="space-y-8">
          <FeaturedArticleSkeleton />
          <LoadingSkeleton count={6} />
        </div>
      ) : error ? (
        <ErrorState onRetry={fetchHeadlines} message={error} />
      ) : articles.length === 0 ? (
        <div className="py-12 text-center space-y-4">
          <EmptyState
            title={`No stories found for ${activeCategory}`}
            description="Try switching between India and Global editions or explore other topics."
          />
          {page > 1 && (
            <button
              onClick={() => setPage(1)}
              className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              ← Return to Page 1
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Featured Lead Story (Only on page 1) */}
          {page === 1 && featured && (
            <FeaturedArticle article={featured} />
          )}

          {/* ================= PROMINENT "CURATED FOR YOU" SECTION ================= */}
          {page === 1 && personalized.length > 0 && (
            <section className="p-6 sm:p-7 bg-neutral-100/80 dark:bg-[#181818] border border-neutral-300/80 dark:border-neutral-800 my-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-neutral-300 dark:border-neutral-750 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                    <Sparkles size={16} className="text-amber-400 dark:text-amber-600 fill-amber-400 dark:fill-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-950 dark:text-white">
                      Curated For You · Algorithmic Recommendations
                    </h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Tailored based on your reading habits, followed topics, and source trust.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to="/for-you"
                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 hover:underline"
                  >
                    <span>View All Recommendations</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {personalized.map((art) => (
                  <ArticleCard key={art.id || art.externalId} article={art} showRecommendation={true} />
                ))}
              </div>
            </section>
          )}

          {/* Secondary Lead Row on Page 1 */}
          {page === 1 && secondary.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center justify-between pb-3 mb-6 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {edition === 'india' ? 'Top National Developments' : 'Major World Stories'}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {secondary.map((art) => (
                  <ArticleCard key={art.id || art.externalId} article={art} />
                ))}
              </div>
            </div>
          )}

          {/* All Remaining Latest News Grid */}
          <div className="pt-2">
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {page === 1 ? (edition === 'india' ? 'Latest India Dispatches' : 'Latest International Wire') : `Page ${page} Dispatches`}
              </h3>
              <span className="text-xs text-neutral-400">
                Showing {articles.length} verified stories
              </span>
            </div>
            <NewsGrid articles={page === 1 ? remaining : articles} />
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => {
              setPage(p);
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }}
          />

          {/* Featured Publisher Network Strip */}
          <div className="mt-16 pt-10 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-neutral-700 dark:text-neutral-300" />
                <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-100">
                  {edition === 'india' ? 'Indian Journalism Network' : 'Global Publisher Network'}
                </h4>
              </div>
              <Link to="/discover" className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1">
                <span>View all</span>
                <ArrowRight size={12} />
              </Link>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
              {(edition === 'india' ? INDIA_SOURCES : GLOBAL_SOURCES).map((source) => (
                <Link
                  key={source}
                  to={`/search?source=${encodeURIComponent(source)}`}
                  className="px-3.5 py-2 bg-white dark:bg-[#181818] border border-neutral-200/90 dark:border-neutral-800 text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:border-neutral-400 dark:hover:border-neutral-600 whitespace-nowrap transition-colors"
                >
                  {source}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
