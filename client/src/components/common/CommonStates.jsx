import React from 'react';
import { Newspaper, Compass, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EmptyState({
  icon: Icon = Newspaper,
  title = 'No stories found',
  description = 'Try exploring other categories or adjusting your search filters.',
  actionText = 'Explore Top News',
  actionTo = '/'
}) {
  return (
    <div className="py-16 px-6 text-center border border-dashed border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/30 my-6">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 mb-4">
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-editorial font-medium text-neutral-900 dark:text-neutral-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6">
        {description}
      </p>
      {actionTo && (
        <Link
          to={actionTo}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity"
        >
          <Compass size={14} />
          {actionText}
        </Link>
      )}
    </div>
  );
}

export function ErrorState({
  title = 'Unable to load news',
  message = 'We encountered an issue fetching stories. Please check your connection and try again.',
  onRetry
}) {
  return (
    <div className="py-14 px-6 text-center border border-neutral-200 dark:border-neutral-800 bg-red-50/40 dark:bg-red-950/10 my-6">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 mb-3">
        <AlertCircle size={20} />
      </div>
      <h3 className="text-lg font-editorial font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
        {title}
      </h3>
      <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md mx-auto mb-4">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity"
        >
          <RefreshCw size={13} />
          Try Again
        </button>
      )}
    </div>
  );
}

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-10 pb-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3.5 py-1.5 text-xs uppercase tracking-wider font-medium border border-neutral-300 dark:border-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        Previous
      </button>
      <span className="px-3 text-xs text-neutral-500 dark:text-neutral-400">
        Page <span className="font-semibold text-neutral-900 dark:text-neutral-100">{currentPage}</span> of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3.5 py-1.5 text-xs uppercase tracking-wider font-medium border border-neutral-300 dark:border-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        Next
      </button>
    </div>
  );
}
