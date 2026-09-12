import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import NewsGrid from '../components/news/NewsGrid';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { EmptyState, ErrorState, Pagination } from '../components/common/CommonStates';
import { Search as SearchIcon, SlidersHorizontal, RotateCcw, Sparkles } from 'lucide-react';
import { CATEGORIES, TOP_SOURCES } from '../utils/formatters';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialSource = searchParams.get('source') || '';
  const initialSort = searchParams.get('sortBy') || 'publishedAt';

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [source, setSource] = useState(initialSource);
  const [sortBy, setSortBy] = useState(initialSort);
  const [page, setPage] = useState(1);

  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounced API search execution
  const performSearch = useCallback(async (searchQuery, cat, src, sort, p) => {
    if (!searchQuery && !cat && !src) {
      setResults([]);
      setTotalResults(0);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (cat && cat !== 'all') params.append('category', cat);
      if (src) params.append('source', src);
      if (sort) params.append('sortBy', sort);
      params.append('page', p);
      params.append('limit', 12);

      const res = await api.get(`/news/search?${params.toString()}`);
      const data = res.data?.data;
      setResults(data?.articles || []);
      setTotalResults(data?.totalResults || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed. Please refine your query.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update URL and trigger search with debounce for typing
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = {};
      if (query) params.q = query;
      if (category) params.category = category;
      if (source) params.source = source;
      if (sortBy) params.sortBy = sortBy;
      setSearchParams(params, { replace: true });

      performSearch(query, category, source, sortBy, page);
    }, 300);

    return () => clearTimeout(handler);
  }, [query, category, source, sortBy, page, setSearchParams, performSearch]);

  const handleReset = () => {
    setQuery('');
    setCategory('');
    setSource('');
    setSortBy('publishedAt');
    setPage(1);
    setSearchParams({});
    setResults([]);
  };

  const totalPages = Math.ceil(totalResults / 12);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Search Header */}
      <div className="border-b border-neutral-900 dark:border-neutral-100 pb-4">
        <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          NewsHub Global Archive
        </span>
        <h1 className="font-editorial text-3xl sm:text-5xl font-semibold text-neutral-950 dark:text-white">
          Search Dispatches
        </h1>
      </div>

      {/* Main Search Input Form */}
      <div className="bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search keywords, events, companies, authors..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-11 pr-4 py-3 bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 text-sm md:text-base text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100"
          />
          <SearchIcon size={18} className="absolute left-4 top-3.5 text-neutral-400" />
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          {/* Region Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
              Regional Edition
            </label>
            <select
              value={searchParams.get('region') || 'all'}
              onChange={(e) => {
                const params = Object.fromEntries(searchParams.entries());
                params.region = e.target.value;
                setSearchParams(params);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 focus:outline-none"
            >
              <option value="all">All Regions</option>
              <option value="india">🇮🇳 India Edition</option>
              <option value="global">🌐 Global News</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 focus:outline-none"
            >
              <option value="">All Categories</option>
              {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
              Publisher Source
            </label>
            <select
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 focus:outline-none"
            >
              <option value="">All Sources</option>
              {TOP_SOURCES.map(src => (
                <option key={src} value={src}>{src}</option>
              ))}
            </select>
          </div>

          {/* Sort By Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
              Sort Sequence
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 focus:outline-none"
            >
              <option value="publishedAt">Latest Published</option>
              <option value="relevance">Most Relevant</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={handleReset}
              type="button"
              className="w-full py-2 px-3 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw size={13} />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      {(query || category || source) && (
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-100">
              {query ? `Results for "${query}"` : 'Filtered Stories'}
            </h2>
            <p className="text-xs text-neutral-500">
              {totalResults} verified {totalResults === 1 ? 'article' : 'articles'} found
            </p>
          </div>
        </div>
      )}

      {/* Results Content */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : error ? (
        <ErrorState message={error} />
      ) : results.length > 0 ? (
        <>
          <NewsGrid articles={results} />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => {
              setPage(p);
              window.scrollTo({ top: 200, behavior: 'smooth' });
            }}
          />
        </>
      ) : (query || category || source) ? (
        <EmptyState
          title="No matching stories found"
          description="Try broadening your keywords or clearing selected filters."
        />
      ) : (
        <div className="py-12 text-center text-neutral-500 text-sm">
          <p>Type a topic or choose a category above to begin searching.</p>
        </div>
      )}
    </div>
  );
}
