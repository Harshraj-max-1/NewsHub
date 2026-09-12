import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import NewsGrid from '../components/news/NewsGrid';
import CategoryTabs from '../components/news/CategoryTabs';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { EmptyState, ErrorState, Pagination } from '../components/common/CommonStates';
import { CATEGORIES } from '../utils/formatters';

const CATEGORY_META = {
  technology: { title: 'Technology', desc: 'Breakthrough engineering, computing architectures, and digital transformation.' },
  ai: { title: 'Artificial Intelligence', desc: 'Foundation models, neural reasoning paradigms, robotics, and algorithmic safety.' },
  business: { title: 'Business & Markets', desc: 'Macroeconomics, venture financing, corporate strategy, and fiscal policy.' },
  startups: { title: 'Startups & Venture', desc: 'Early-stage founders, rapid scaling milestones, product-led growth, and seed funding.' },
  science: { title: 'Science & DeepTech', desc: 'Astrophysics, quantum mechanics, environmental biology, and materials research.' },
  health: { title: 'Health & Medicine', desc: 'Biomedical therapeutics, clinical trials, epidemiology, and cellular longevity.' },
  world: { title: 'World Affairs', desc: 'International diplomacy, cross-border treaties, geopolitical stability, and trade.' },
  politics: { title: 'Politics & Policy', desc: 'Legislative developments, governance frameworks, elections, and public policy.' },
  sports: { title: 'Sports & Athletics', desc: 'Championship fixtures, athlete performance analytics, and global tournament coverage.' },
  entertainment: { title: 'Culture & Entertainment', desc: 'Cinema, orchestral debuts, literature, and contemporary cultural movements.' }
};

export default function Categories() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const currentCategory = slug || 'technology';

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const meta = CATEGORY_META[currentCategory] || {
    title: currentCategory.toUpperCase(),
    desc: `Comprehensive dispatches and analysis covering ${currentCategory}.`
  };

  const fetchCategoryArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/news/category/${currentCategory}?page=${page}&limit=12`);
      const data = res.data?.data;
      setArticles(data?.articles || []);
      setTotalPages(Math.ceil((data?.totalResults || 12) / 12));
    } catch (err) {
      setError(err.response?.data?.message || `Failed to fetch stories for ${currentCategory}`);
    } finally {
      setLoading(false);
    }
  }, [currentCategory, page]);

  useEffect(() => {
    fetchCategoryArticles();
  }, [fetchCategoryArticles]);

  const handleCategorySelect = (newCategory) => {
    if (newCategory === 'all') {
      navigate('/');
    } else {
      navigate(`/category/${newCategory}`);
      setPage(1);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Category Masthead */}
      <div className="border-b border-neutral-900 dark:border-neutral-100 pb-4">
        <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          Category Dispatch
        </span>
        <h1 className="font-editorial text-3xl sm:text-5xl font-semibold text-neutral-950 dark:text-white">
          {meta.title}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl mt-1 font-sans">
          {meta.desc}
        </p>
      </div>

      {/* Category Filter Pills */}
      <CategoryTabs
        activeCategory={currentCategory}
        onSelectCategory={handleCategorySelect}
      />

      {/* Articles Grid */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : error ? (
        <ErrorState onRetry={fetchCategoryArticles} message={error} />
      ) : articles.length === 0 ? (
        <EmptyState
          title={`No dispatches found in ${meta.title}`}
          description="Check back shortly or explore other active topics."
        />
      ) : (
        <>
          <div className="flex items-center justify-between pb-3 mb-6 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Verified Coverage ({articles.length} Stories)
            </h3>
          </div>

          <NewsGrid articles={articles} />

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
