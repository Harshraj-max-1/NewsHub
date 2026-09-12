import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import FeaturedArticle from '../components/news/FeaturedArticle';
import NewsGrid from '../components/news/NewsGrid';
import { FeaturedArticleSkeleton } from '../components/common/LoadingSkeleton';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { EmptyState, ErrorState, Pagination } from '../components/common/CommonStates';
import { Newspaper, Globe, Sparkles, Flag, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const HINDI_SCOPES = [
  { id: 'all', label: 'सभी समाचार (All Hindi)', icon: Newspaper, desc: 'देश, दुनिया, व्यापार, खेल व तकनीक' },
  { id: 'india', label: 'भारत समाचार (National)', icon: Flag, desc: 'राष्ट्रीय एवं प्रादेशिक मुख्य खबरें' },
  { id: 'world', label: 'विश्व समाचार (World)', icon: Globe, desc: 'अंतरराष्ट्रीय घटनाक्रम एवं वैश्विक विश्लेषण' }
];

const HINDI_CATEGORIES = [
  { id: 'all', label: 'सभी (All)' },
  { id: 'politics', label: 'राष्ट्रीय (National)' },
  { id: 'world', label: 'विदेश (World)' },
  { id: 'business', label: 'व्यापार (Business)' },
  { id: 'technology', label: 'तकनीक (Tech)' },
  { id: 'sports', label: 'खेल (Sports)' },
  { id: 'entertainment', label: 'मनोरंजन (Cinema)' }
];

export default function HindiNews() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [articles, setArticles] = useState([]);
  const [activeScope, setActiveScope] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHindiDispatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = '';
      if (activeCategory !== 'all') {
        endpoint = `/news/category/${activeCategory}?region=hindi&lang=hi&page=${page}&limit=12`;
      } else {
        endpoint = `/news/hindi?scope=${activeScope}&page=${page}&limit=12`;
      }

      const res = await api.get(endpoint);
      const data = res.data?.data;
      setArticles(data?.articles || []);
      setTotalPages(Math.max(1, Math.ceil((data?.totalResults || 12) / 12)));
    } catch (err) {
      setError(err.response?.data?.message || 'हिंदी समाचार लोड करने में असमर्थ। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  }, [activeScope, activeCategory, page]);

  useEffect(() => {
    fetchHindiDispatches();
    window.scrollTo(0, 0);
  }, [fetchHindiDispatches]);

  const handleScopeChange = (scopeId) => {
    setActiveScope(scopeId);
    setActiveCategory('all');
    setPage(1);
  };

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setPage(1);
  };

  const featured = articles[0];
  const remaining = articles.slice(1);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Masthead */}
      <div className="border-b border-neutral-900 dark:border-neutral-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              <span className="inline-block w-2 h-2 rounded-full bg-orange-500" />
              <span>हिंदी संस्करण · Hindi Edition (India & World)</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-5xl font-semibold text-neutral-950 dark:text-white tracking-tight mt-1">
              हिंदी समाचार प्रभा
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl mt-1">
              बीबीसी हिंदी, एनडीटीवी खबर और गूगल न्यूज़ से सत्यापित राष्ट्रीय, अंतरराष्ट्रीय, व्यापार और तकनीक के ताज़ा समाचार।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <span>English Front</span>
              <span>🇮🇳</span>
            </Link>
            <Link
              to="/global"
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <span>Global</span>
              <span>🌐</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Scope Switcher Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {HINDI_SCOPES.map((scope) => {
          const Icon = scope.icon;
          const isActive = activeScope === scope.id && activeCategory === 'all';
          return (
            <button
              key={scope.id}
              onClick={() => handleScopeChange(scope.id)}
              className={`text-left p-3.5 sm:p-4 border transition-all ${
                isActive
                  ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 shadow-sm'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161616] text-neutral-800 dark:text-neutral-200 hover:border-neutral-400 dark:hover:border-neutral-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {scope.label}
                </span>
                <Icon size={14} className={isActive ? 'opacity-90' : 'opacity-50'} />
              </div>
              <p className={`text-[11px] line-clamp-1 ${isActive ? 'text-neutral-300 dark:text-neutral-700' : 'text-neutral-500 dark:text-neutral-400'}`}>
                {scope.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-neutral-200 dark:border-neutral-800">
        <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mr-1 shrink-0">
          विषय:
        </span>
        {HINDI_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors rounded-none border ${
                isActive
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900 dark:border-neutral-100 font-bold'
                  : 'bg-transparent text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Stream */}
      {loading ? (
        <div className="space-y-8">
          <FeaturedArticleSkeleton />
          <LoadingSkeleton count={6} />
        </div>
      ) : error ? (
        <ErrorState onRetry={fetchHindiDispatches} message={error} />
      ) : articles.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="इस श्रेणी में कोई समाचार उपलब्ध नहीं है"
          description="कृपया अन्य विषय चुनें या मुख्य हिंदी पृष्ठ पर वापस जाएं।"
          actionText="सभी हिंदी समाचार देखें"
          actionTo="/hindi"
        />
      ) : (
        <>
          {page === 1 && featured && (
            <FeaturedArticle article={featured} />
          )}

          <div className="pt-2">
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-300">
                {page === 1 ? 'ताज़ा हिंदी समाचार बुलेटिन' : `हिंदी समाचार पृष्ठ ${page}`}
              </h3>
              <span className="text-xs text-neutral-400">
                {articles.length} सत्यापित खबरें
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
