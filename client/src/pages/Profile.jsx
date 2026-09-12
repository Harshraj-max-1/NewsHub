import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import ReadingStatsChart from '../components/analytics/ReadingStatsChart';
import { BookOpen, Bookmark, Sparkles, Clock, SlidersHorizontal, User as UserIcon } from 'lucide-react';
import { EmptyState, ErrorState } from '../components/common/CommonStates';

export default function Profile() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=profile');
      return;
    }

    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/analytics');
        setAnalytics(res.data?.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load reading metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const stats = analytics?.stats || {
    articlesRead: 0,
    bookmarksCount: 0,
    favoriteTopicsCount: user?.interests?.length || 0,
    estimatedReadingMinutes: 0
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Profile Header */}
      <div className="bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'Reader')}`}
              alt={user?.name}
              className="w-20 h-20 rounded-full border-2 border-neutral-200 dark:border-neutral-700 shadow-xs"
            />
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                Verified Reader
              </span>
              <h1 className="font-editorial text-2xl sm:text-3xl font-semibold text-neutral-950 dark:text-white">
                {user?.name}
              </h1>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">
                {user?.email}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3 justify-center sm:justify-start">
                {(user?.interests || ['technology', 'ai', 'business']).map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-0.5 text-[10px] uppercase font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <Link
            to="/settings"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            <SlidersHorizontal size={13} />
            <span>Edit Preferences</span>
          </Link>
        </div>
      </div>

      {/* Numerical Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 p-5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Stories Read</span>
            <BookOpen size={16} />
          </div>
          <p className="font-editorial text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
            {stats.articlesRead}
          </p>
        </div>

        <div className="bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 p-5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Bookmarks</span>
            <Bookmark size={16} />
          </div>
          <p className="font-editorial text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
            {stats.bookmarksCount}
          </p>
        </div>

        <div className="bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 p-5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Followed Topics</span>
            <Sparkles size={16} />
          </div>
          <p className="font-editorial text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
            {stats.favoriteTopicsCount}
          </p>
        </div>

        <div className="bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 p-5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Reading Time</span>
            <Clock size={16} />
          </div>
          <p className="font-editorial text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
            {stats.estimatedReadingMinutes} <span className="text-sm font-sans font-normal text-neutral-500">min</span>
          </p>
        </div>
      </div>

      {/* Analytics Visualization Section */}
      <section>
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-100">
            Journalism Engagement Analytics
          </h2>
        </div>

        {loading ? (
          <div className="h-64 bg-neutral-100 dark:bg-neutral-900 animate-pulse"></div>
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <ReadingStatsChart
            weeklyActivity={analytics?.weeklyActivity || []}
            categoryDistribution={analytics?.categoryDistribution || []}
          />
        )}
      </section>
    </div>
  );
}
