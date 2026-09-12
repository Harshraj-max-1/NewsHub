import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { formatTimeAgo, formatDate } from '../utils/formatters';
import SourceBadge from '../components/common/SourceBadge';
import BookmarkButton from '../components/common/BookmarkButton';
import NewsGrid from '../components/news/NewsGrid';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/CommonStates';
import { ExternalLink, Clock, Share2, Check, ArrowLeft, BookOpen } from 'lucide-react';

export default function ArticleDetails() {
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/news/${id}`);
        const { article: artData, related: relData } = res.data?.data || {};
        setArticle(artData);
        setRelated(relData || []);

        // Record reading history if user is authenticated
        if (isAuthenticated && artData) {
          api.post('/history', {
            articleId: artData.id || artData.externalId,
            title: artData.title,
            description: artData.description,
            imageUrl: artData.imageUrl,
            sourceName: artData.sourceName,
            articleUrl: artData.articleUrl,
            category: artData.category
          }).catch(err => console.warn('Failed to log reading history:', err.message));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load article details.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
    window.scrollTo(0, 0);
  }, [id, isAuthenticated]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.description,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-6">
        <div className="h-8 w-2/3 bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
        <div className="h-4 w-1/3 bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
        <div className="aspect-[16/9] w-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
      </div>
    );
  }

  if (error || !article) {
    return <ErrorState message={error || 'Article not found'} />;
  }

  return (
    <article className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Back Navigation */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Front Page</span>
        </Link>
      </div>

      {/* Article Header */}
      <header className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <SourceBadge name={article.sourceName} category={article.category} />
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <Clock size={12} />
            <span>{formatTimeAgo(article.publishedAt)}</span>
          </div>
        </div>

        <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-medium text-neutral-950 dark:text-white leading-tight">
          {article.title}
        </h1>

        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
          {article.description}
        </p>

        {/* Metadata & Actions Bar */}
        <div className="py-4 border-y border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              By {article.author || 'Editorial Dispatch'}
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="text-neutral-500">{formatDate(article.publishedAt)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs uppercase tracking-wider font-medium transition-colors"
            >
              {copied ? <Check size={13} className="text-green-600" /> : <Share2 size={13} />}
              <span>{copied ? 'Link Copied' : 'Share'}</span>
            </button>
            <BookmarkButton article={article} size={18} />
          </div>
        </div>
      </header>

      {/* Article Hero Banner Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-neutral-900/80 text-white text-[10px] px-2 py-0.5 font-mono">
          Photo: {article.sourceName} / Verified Archive
        </div>
      </div>

      {/* Article Synthesis & Content Body */}
      <div className="space-y-6 text-base text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans">
        {/* Editorial Executive Takeaways */}
        <div className="bg-neutral-100/70 dark:bg-neutral-900/60 p-6 border-l-2 border-neutral-900 dark:border-neutral-100 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <BookOpen size={14} />
            <span>Executive Takeaways</span>
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 list-disc list-inside">
            <li>Synthesized from real-time external dispatch feeds via {article.sourceName}.</li>
            <li>Categorized under {article.category?.toUpperCase()} with verified editorial integrity.</li>
            <li>Original source metadata and direct reading links preserved below.</li>
          </ul>
        </div>

        <p className="text-base sm:text-lg leading-relaxed">
          {article.content || article.description}
        </p>

        {/* Primary Outbound Link Button */}
        <div className="py-8 text-center bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 p-6">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 max-w-md mx-auto">
            NewsHub respects intellectual property rights and quotes brief summaries. Read the complete story on the publisher's official platform.
          </p>
          <a
            href={article.articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            <span>Read Original Article on {article.sourceName}</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Related Stories */}
      {related.length > 0 && (
        <section className="pt-12 border-t border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-100 mb-6">
            Related Dispatches in {article.category?.toUpperCase()}
          </h3>
          <NewsGrid articles={related} columns={3} />
        </section>
      )}
    </article>
  );
}
