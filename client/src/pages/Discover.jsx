import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { TrendingUp, Flame, Compass, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import ArticleCard from '../components/news/ArticleCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/CommonStates';
import { CATEGORIES, TOP_SOURCES, formatTimeAgo } from '../utils/formatters';

export default function Discover() {
  const [trending, setTrending] = useState([]);
  const [sources, setSources] = useState([]);
  const [topArticles, setTopArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDiscoverData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [trendRes, sourcesRes, headlinesRes] = await Promise.all([
        api.get('/news/trending?limit=6'),
        api.get('/news/sources'),
        api.get('/news/top?limit=6')
      ]);

      setTrending(trendRes.data?.data || []);
      setSources(sourcesRes.data?.data || []);
      setTopArticles(headlinesRes.data?.data?.articles || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load discovery hub');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscoverData();
  }, []);

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="border-b border-neutral-900 dark:border-neutral-100 pb-4">
        <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          NewsHub Discovery
        </span>
        <h1 className="font-editorial text-3xl sm:text-5xl font-semibold text-neutral-950 dark:text-white">
          Discover & Trends
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl mt-1">
          Explore breakthrough stories, trending topics, and top journalism across the global media network.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton count={6} />
      ) : error ? (
        <ErrorState onRetry={fetchDiscoverData} message={error} />
      ) : (
        <>
          {/* Section 1: Trending Now Leaderboard */}
          <section>
            <div className="flex items-center gap-2 pb-3 mb-6 border-b border-neutral-200 dark:border-neutral-800">
              <Flame size={18} className="text-amber-500 fill-amber-500" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-100">
                Trending Now
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trending.map((item, index) => {
                const articleId = item.id || item.externalId;
                return (
                  <div
                    key={articleId || index}
                    className="bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 p-5 flex gap-4 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
                  >
                    <span className="font-editorial text-3xl sm:text-4xl font-light text-neutral-300 dark:text-neutral-700 leading-none">
                      0{index + 1}
                    </span>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[10px] uppercase font-semibold text-neutral-400 mb-1.5">
                          <span>{item.sourceName}</span>
                          <span>{formatTimeAgo(item.publishedAt)}</span>
                        </div>
                        <Link
                          to={`/article/${articleId}`}
                          className="font-editorial text-base font-medium text-neutral-900 dark:text-neutral-100 hover:underline leading-snug line-clamp-2"
                        >
                          {item.title}
                        </Link>
                      </div>
                      <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-500">
                        <span className="capitalize font-mono text-[10px]">{item.category}</span>
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                          {item.trendingScore || 85} pts
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 2: Explore Topics */}
          <section className="bg-neutral-100/70 dark:bg-neutral-900/50 p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2 mb-6">
              <Compass size={18} className="text-neutral-700 dark:text-neutral-300" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-100">
                Explore Topic Hubs
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.id}`}
                  className="bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 p-4 hover:border-neutral-900 dark:hover:border-neutral-100 transition-colors flex flex-col justify-between group"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 group-hover:underline">
                    {cat.name}
                  </span>
                  <span className="text-[11px] text-neutral-400 mt-4 flex items-center gap-1">
                    <span>View feed</span>
                    <ArrowRight size={10} />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Section 3: Curated Global Dispatches */}
          <section>
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-neutral-700 dark:text-neutral-300" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-100">
                  Recommended Global Stories
                </h2>
              </div>
              <Link to="/for-you" className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1">
                <span>Personalized Feed</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topArticles.map((art) => (
                <ArticleCard key={art.id || art.externalId} article={art} />
              ))}
            </div>
          </section>

          {/* Section 4: Verified Sources Directory */}
          <section className="border-t border-neutral-200 dark:border-neutral-800 pt-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-100 mb-4">
              Publisher Directory
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {(sources.length > 0 ? sources : TOP_SOURCES.map(name => ({ name }))).map((src) => (
                <Link
                  key={src.name}
                  to={`/search?source=${encodeURIComponent(src.name)}`}
                  className="bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 p-3 text-center hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">{src.name}</p>
                  <p className="text-[10px] text-neutral-400 mt-1 uppercase font-mono">Verified</p>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
