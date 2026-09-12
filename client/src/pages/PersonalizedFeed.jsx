import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import NewsGrid from '../components/news/NewsGrid';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { EmptyState, ErrorState, Pagination } from '../components/common/CommonStates';
import { Sparkles, SlidersHorizontal, Info, CheckCircle2 } from 'lucide-react';

export default function PersonalizedFeed() {
  const { user, isAuthenticated } = useAuthStore();
  const [articles, setArticles] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFormula, setShowFormula] = useState(false);

  const fetchPersonalizedStories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/news/personalized?page=${page}&limit=12`);
      const data = res.data?.data;
      setArticles(data?.articles || []);
      setUserInterests(data?.userInterests || user?.interests || ['technology', 'ai', 'business']);
      setTotalPages(Math.ceil((data?.totalResults || 12) / 12));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate personalized feed');
    } finally {
      setLoading(false);
    }
  }, [page, user]);

  useEffect(() => {
    fetchPersonalizedStories();
  }, [fetchPersonalizedStories]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="border-b border-neutral-900 dark:border-neutral-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              <Sparkles size={12} className="text-amber-500" />
              <span>Algorithmic Editorial Curation</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-5xl font-semibold text-neutral-950 dark:text-white">
              For You
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl mt-1">
              Real-time feed ranked by your reading history, topic affinities, and source preferences.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFormula(!showFormula)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 transition-colors"
            >
              <Info size={13} />
              <span>{showFormula ? 'Hide Formula' : 'Scoring Logic'}</span>
            </button>
            {isAuthenticated ? (
              <Link
                to="/settings"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                <SlidersHorizontal size={13} />
                <span>Edit Topics</span>
              </Link>
            ) : (
              <Link
                to="/login?redirect=for-you"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-semibold uppercase tracking-wider"
              >
                <span>Log In To Tune</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Transparent Scoring Formula Banner */}
      {showFormula && (
        <div className="bg-neutral-100/90 dark:bg-neutral-900 p-5 border border-neutral-200 dark:border-neutral-800 space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
            <Sparkles size={14} className="text-amber-500" />
            <span>Transparent Recommendation Scoring Formula</span>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 font-mono text-[11px] bg-white dark:bg-neutral-950 p-3 border border-neutral-200 dark:border-neutral-800">
            Final Score = (Interest Match × 0.50) + (Recency Factor × 0.25) + (Reading History Affinity × 0.15) + (Source Preference × 0.10)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-neutral-600 dark:text-neutral-400 pt-1">
            <div className="p-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">50% Topic Affinity</span>
              Direct topic matches & keyword relevance
            </div>
            <div className="p-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">25% Freshness</span>
              Decay curve prioritizing dispatches under 2h
            </div>
            <div className="p-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">15% Reading Habit</span>
              Boosts categories you read frequently
            </div>
            <div className="p-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">10% Source Trust</span>
              Your preferred and bookmarked publications
            </div>
          </div>
        </div>
      )}

      {/* Active User Interests Badges */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="font-semibold uppercase tracking-wider text-neutral-500 text-[11px]">
          Targeted Topics:
        </span>
        {userInterests.map((interest) => (
          <span
            key={interest}
            className="px-2.5 py-1 bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 uppercase font-semibold text-[10px] tracking-wider"
          >
            {interest}
          </span>
        ))}
      </div>

      {/* Main Grid */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : error ? (
        <ErrorState onRetry={fetchPersonalizedStories} message={error} />
      ) : articles.length === 0 ? (
        <EmptyState
          title="No recommendations generated yet"
          description="Try updating your topics in settings to see personalized recommendations."
        />
      ) : (
        <>
          <NewsGrid articles={articles} showRecommendation={true} />
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
