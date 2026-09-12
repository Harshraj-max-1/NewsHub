import React from 'react';
import { Link } from 'react-router-dom';
import { formatTimeAgo, cleanArticleText, getEditorialFallbackImage } from '../../utils/formatters';
import SourceBadge from '../common/SourceBadge';
import BookmarkButton from '../common/BookmarkButton';
import { Sparkles, Clock, ArrowRight } from 'lucide-react';

export default function ArticleCard({ article, showRecommendation = false }) {
  if (!article) return null;

  const articleId = article.id || article.externalId;
  const recommendation = article.recommendation;
  const isHindi = article.language === 'hi' || article.region === 'hindi';
  const cleanDesc = cleanArticleText(article.description, article.title, isHindi);

  return (
    <article className="group bg-white dark:bg-[#161616] border border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all duration-200 flex flex-col justify-between overflow-hidden relative h-full">
      <div className="flex flex-col flex-1">
        {/* Article Image Container */}
        <Link
          to={`/article/${articleId}`}
          state={{ article }}
          className="block relative aspect-[16/10] overflow-hidden bg-neutral-100 dark:bg-neutral-850 shrink-0"
        >
          <img
            src={article.imageUrl}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = getEditorialFallbackImage(article.category, article.title || articleId, isHindi);
            }}
          />
          {showRecommendation && recommendation?.score && (
            <div className="absolute top-2.5 left-2.5 bg-neutral-950/90 text-white dark:bg-white dark:text-neutral-950 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 flex items-center gap-1.5 shadow-md border border-white/20 dark:border-neutral-800">
              <Sparkles size={11} className="text-amber-400 dark:text-amber-600 fill-amber-400 dark:fill-amber-600" />
              <span>{recommendation.score}% Match</span>
            </div>
          )}
        </Link>

        {/* Article Content */}
        <div className="p-4 sm:p-5 flex flex-col flex-1">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <SourceBadge name={article.sourceName} category={article.category} region={article.region} />
            <div className="flex items-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-500 whitespace-nowrap">
              <Clock size={11} className="shrink-0" />
              <span>{formatTimeAgo(article.publishedAt)}</span>
            </div>
          </div>

          <Link to={`/article/${articleId}`} state={{ article }} className="block group/title mb-2.5">
            <h3 className="font-editorial text-lg sm:text-xl font-semibold text-neutral-900 dark:text-neutral-100 leading-snug group-hover/title:underline decoration-neutral-400 underline-offset-2 transition-colors line-clamp-2 min-h-[3.25rem] flex items-start">
              {article.title}
            </h3>
          </Link>

          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 line-clamp-4 leading-relaxed font-sans mb-3 flex-1">
            {cleanDesc}
          </p>

          {/* Recommendation Reasons Breakdown if present */}
          {showRecommendation && recommendation?.reasons && recommendation.reasons.length > 0 && (
            <div className="mt-auto pt-2.5 border-t border-dashed border-neutral-200 dark:border-neutral-800">
              <div className="flex flex-wrap gap-1.5">
                {recommendation.reasons.slice(0, 2).map((reason, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800/90 text-neutral-800 dark:text-neutral-200 px-2 py-0.5 border border-neutral-200 dark:border-neutral-700"
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
      <div className="px-4 sm:px-5 py-3 bg-neutral-50/60 dark:bg-neutral-900/40 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-xs mt-auto">
        <Link
          to={`/article/${articleId}`}
          state={{ article }}
          className="inline-flex items-center gap-1 text-neutral-900 dark:text-neutral-200 font-semibold uppercase tracking-wider text-[11px] hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
        >
          <span>Read Story</span>
          <ArrowRight size={12} />
        </Link>
        <BookmarkButton article={article} />
      </div>
    </article>
  );
}
