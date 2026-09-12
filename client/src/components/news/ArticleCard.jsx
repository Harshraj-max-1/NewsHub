import React from 'react';
import { Link } from 'react-router-dom';
import { formatTimeAgo } from '../../utils/formatters';
import SourceBadge from '../common/SourceBadge';
import BookmarkButton from '../common/BookmarkButton';
import { Sparkles, Clock } from 'lucide-react';

export default function ArticleCard({ article, showRecommendation = false }) {
  if (!article) return null;

  const articleId = article.id || article.externalId;
  const recommendation = article.recommendation;

  return (
    <article className="group bg-white dark:bg-[#161616] border border-neutral-200/90 dark:border-neutral-800/80 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all duration-200 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Article Image Container */}
        <Link
          to={`/article/${articleId}`}
          className="block relative aspect-[16/10] overflow-hidden bg-neutral-100 dark:bg-neutral-800"
        >
          <img
            src={article.imageUrl}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80';
            }}
          />
          {showRecommendation && recommendation?.score && (
            <div className="absolute top-2 left-2 bg-neutral-900/90 backdrop-blur-xs text-white text-[10px] font-semibold tracking-wider uppercase px-2 py-1 flex items-center gap-1">
              <Sparkles size={11} className="text-amber-400" />
              <span>{recommendation.score}% Match</span>
            </div>
          )}
        </Link>

        {/* Article Content */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <SourceBadge name={article.sourceName} category={article.category} region={article.region} />
            <div className="flex items-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-500">
              <Clock size={11} />
              <span>{formatTimeAgo(article.publishedAt)}</span>
            </div>
          </div>

          <Link to={`/article/${articleId}`} className="block group/title">
            <h3 className="font-editorial text-lg sm:text-xl font-medium text-neutral-900 dark:text-neutral-100 leading-snug group-hover/title:underline decoration-neutral-400 underline-offset-2 transition-colors line-clamp-2 mb-2">
              {article.title}
            </h3>
          </Link>

          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed font-sans">
            {article.description}
          </p>

          {/* Recommendation Reasons Breakdown if present */}
          {showRecommendation && recommendation?.reasons && recommendation.reasons.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-dashed border-neutral-200 dark:border-neutral-800">
              <div className="flex flex-wrap gap-1">
                {recommendation.reasons.slice(0, 2).map((reason, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-1.5 py-0.5 rounded-none"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 sm:px-5 py-3 bg-neutral-50/60 dark:bg-neutral-900/40 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-xs">
        <Link
          to={`/article/${articleId}`}
          className="text-neutral-900 dark:text-neutral-200 font-semibold uppercase tracking-wider text-[11px] hover:opacity-75 transition-opacity"
        >
          Read Story →
        </Link>
        <BookmarkButton article={article} />
      </div>
    </article>
  );
}
