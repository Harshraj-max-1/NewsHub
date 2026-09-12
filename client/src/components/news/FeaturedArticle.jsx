import React from 'react';
import { Link } from 'react-router-dom';
import { formatTimeAgo } from '../../utils/formatters';
import SourceBadge from '../common/SourceBadge';
import BookmarkButton from '../common/BookmarkButton';
import { ArrowRight, Clock } from 'lucide-react';

export default function FeaturedArticle({ article }) {
  if (!article) return null;

  const articleId = article.id || article.externalId;

  return (
    <div className="bg-white dark:bg-[#161616] border border-neutral-200/90 dark:border-neutral-800/90 p-5 sm:p-7 mb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* Featured Image */}
        <Link
          to={`/article/${articleId}`}
          state={{ article }}
          className="lg:col-span-7 block relative aspect-[16/10] overflow-hidden bg-neutral-100 dark:bg-neutral-800 group"
        >
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80';
            }}
          />
          <div className="absolute top-3 left-3 bg-neutral-900 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1">
            Featured Lead
          </div>
        </Link>

        {/* Featured Content Details */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <SourceBadge name={article.sourceName} category={article.category} region={article.region} />
              <div className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
                <Clock size={12} />
                <span>{formatTimeAgo(article.publishedAt)}</span>
              </div>
            </div>

            <Link to={`/article/${articleId}`} state={{ article }} className="group block">
              <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-normal text-neutral-950 dark:text-white leading-tight mb-4 group-hover:underline decoration-neutral-400 underline-offset-4">
                {article.title}
              </h2>
            </Link>

            <p className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base leading-relaxed font-sans line-clamp-4 mb-6">
              {article.description}
            </p>
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
            <Link
              to={`/article/${articleId}`}
              state={{ article }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              <span>Read Full Story</span>
              <ArrowRight size={14} />
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                By {article.author || 'Staff'}
              </span>
              <BookmarkButton article={article} size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
