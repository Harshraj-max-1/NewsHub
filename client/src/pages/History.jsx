import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { History as HistoryIcon, Trash2, Clock, ArrowRight, ExternalLink } from 'lucide-react';
import { EmptyState, ErrorState } from '../components/common/CommonStates';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { formatTimeAgo } from '../utils/formatters';

export default function History() {
  const { isAuthenticated } = useAuthStore();
  const [groupedHistory, setGroupedHistory] = useState({ today: [], yesterday: [], earlier: [] });
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/history?limit=50');
      setGroupedHistory(res.data?.grouped || { today: [], yesterday: [], earlier: [] });
      setTotalCount(res.data?.totalResults || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear your reading history?')) return;
    try {
      await api.delete('/history');
      setGroupedHistory({ today: [], yesterday: [], earlier: [] });
      setTotalCount(0);
    } catch (err) {
      alert('Failed to clear history');
    }
  };

  const handleDeleteItem = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/history/${id}`);
      fetchHistory();
    } catch (err) {
      console.warn('Failed to delete history item');
    }
  };

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={HistoryIcon}
        title="Sign in to track your reading history"
        description="View articles you opened and track your weekly journalism engagement."
        actionText="Log In / Register"
        actionTo="/login?redirect=history"
      />
    );
  }

  const renderSection = (title, items) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2">
          {title} ({items.length})
        </h3>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 p-4 flex items-center justify-between gap-4 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[11px] text-neutral-400 uppercase font-mono mb-1">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-200">{item.sourceName}</span>
                  <span>•</span>
                  <span className="capitalize">{item.category}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(item.openedAt)}</span>
                </div>
                <Link
                  to={`/article/${item.articleId}`}
                  className="font-editorial text-base sm:text-lg font-medium text-neutral-900 dark:text-neutral-100 hover:underline line-clamp-1 block"
                >
                  {item.title}
                </Link>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/article/${item.articleId}`}
                  className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                  title="Read story"
                >
                  <ArrowRight size={16} />
                </Link>
                <button
                  onClick={(e) => handleDeleteItem(item._id, e)}
                  className="p-1.5 text-neutral-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Remove from history"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-neutral-900 dark:border-neutral-100 pb-4 flex items-end justify-between">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Activity Log
          </span>
          <h1 className="font-editorial text-3xl sm:text-5xl font-semibold text-neutral-950 dark:text-white">
            Reading History
          </h1>
        </div>

        {totalCount > 0 && (
          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold uppercase tracking-wider hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <Trash2 size={13} />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : error ? (
        <ErrorState onRetry={fetchHistory} message={error} />
      ) : totalCount === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No reading history recorded yet"
          description="Stories you open will automatically be archived here."
          actionText="Explore Top News"
          actionTo="/"
        />
      ) : (
        <div className="space-y-8">
          {renderSection('Today', groupedHistory.today)}
          {renderSection('Yesterday', groupedHistory.yesterday)}
          {renderSection('Earlier', groupedHistory.earlier)}
        </div>
      )}
    </div>
  );
}
