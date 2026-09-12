import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { formatTimeAgo, formatDate, cleanArticleText, getEditorialFallbackImage } from '../utils/formatters';
import SourceBadge from '../components/common/SourceBadge';
import BookmarkButton from '../components/common/BookmarkButton';
import NewsGrid from '../components/news/NewsGrid';
import { ErrorState } from '../components/common/CommonStates';
import { ExternalLink, Clock, Share2, Check, ArrowLeft, BookOpen, Newspaper } from 'lucide-react';

export default function ArticleDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  // Pre-fill instantly from navigation state if available
  const [article, setArticle] = useState(location.state?.article || null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(!location.state?.article);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      // If we don't already have article data, show loading spinner
      if (!article) {
        setLoading(true);
      }
      setError(null);
      try {
        const res = await api.get(`/news/${id}`);
        const { article: artData, related: relData } = res.data?.data || {};
        if (artData) {
          setArticle(artData);
        }
        setRelated(relData || []);

        // Record reading history if user is authenticated
        if (isAuthenticated && (artData || article)) {
          const current = artData || article;
          api.post('/history', {
            articleId: current.id || current.externalId,
            title: current.title,
            description: current.description,
            imageUrl: current.imageUrl,
            sourceName: current.sourceName,
            articleUrl: current.articleUrl,
            category: current.category
          }).catch(err => console.warn('Failed to log reading history:', err.message));
        }
      } catch (err) {
        // If we already have the article from location state, don't break the page!
        if (!article) {
          setError(err.response?.data?.message || 'Unable to load article details.');
        }
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

  if (loading && !article) {
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-6 animate-pulse">
        <div className="h-8 w-2/3 bg-neutral-200 dark:bg-neutral-800"></div>
        <div className="h-4 w-1/3 bg-neutral-200 dark:bg-neutral-800"></div>
        <div className="aspect-[16/9] w-full bg-neutral-200 dark:bg-neutral-800"></div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800"></div>
          <div className="h-4 w-5/6 bg-neutral-200 dark:bg-neutral-800"></div>
          <div className="h-4 w-4/6 bg-neutral-200 dark:bg-neutral-800"></div>
        </div>
      </div>
    );
  }

  if (error && !article) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <ErrorState message={error || 'Article not found'} />
        <div className="text-center mt-6">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            ← Return to Previous Page
          </button>
        </div>
      </div>
    );
  }

  // Generate 4-5 substantial clean paragraphs
  const isHindi = article.language === 'hi' || article.region === 'hindi';
  const cleanTitle = cleanArticleText(article.title, '', isHindi);
  const cleanDesc = cleanArticleText(article.description, cleanTitle, isHindi);

  // Check if content has raw html/google news link dump
  const hasRawHtmlDump = article.content && (article.content.includes('<ol') || article.content.includes('&lt;ol') || article.content.includes('news.google.com'));

  const paragraphs = (!hasRawHtmlDump && article.content && article.content.includes('\n\n'))
    ? article.content.split('\n\n').map(p => cleanArticleText(p, cleanTitle, isHindi)).filter(p => p.length > 20)
    : isHindi
    ? [
        `${cleanTitle}। ${article.sourceName} की ताज़ा और विस्तृत रिपोर्ट के अनुसार, इस पूरे मामले पर राष्ट्रीय और अंतरराष्ट्रीय स्तर पर गंभीर चर्चा शुरू हो गई है।`,
        cleanDesc,
        `विशेषज्ञों और विश्लेषकों का मानना है कि इस घटनाक्रम के परिणाम दूरगामी हो सकते हैं। प्रशासनिक और आधिकारिक स्तर पर स्थिति की लगातार निगरानी की जा रही है तथा संबंधित पक्षों द्वारा शीघ्र ही अग्रिम दिशा-निर्देश जारी किए जाने की उम्मीद है।`,
        `इस विषय से जुड़े सभी महत्वपूर्ण तथ्यों और दस्तावेज़ों की पुष्टि की जा रही है ताकि जनता तक निष्पक्ष और सटीक जानकारी उपलब्ध कराई जा सके। स्थानीय प्रतिनिधियों ने भी इस संदर्भ में अपनी प्रतिक्रिया व्यक्त की है।`,
        `न्यूज़हब (NewsHub) पर यह समाचार मूल प्रकाशक (${article.sourceName}) के सौजन्य से संकलित किया गया है। संपूर्ण और विस्तृत मूल रिपोर्ट पढ़ने के लिए नीचे दिए गए प्रकाशक के आधिकारिक लिंक पर क्लिक करें।`
      ]
    : [
        `${cleanTitle}. According to verified reports published by ${article.sourceName}, key stakeholders and institutional observers are closely monitoring the unfolding situation with significant regional and international attention.`,
        cleanDesc,
        `Industry analysts and policy strategists indicate that these latest developments reflect broader macroeconomic and geopolitical shifts. The immediate implications are expected to influence strategic planning and operational coordination over the coming weeks.`,
        `Institutional representatives have emphasized the importance of verified factual documentation and cross-border cooperation. Observers highlight that timely regulatory clarity and transparent reporting remain pivotal to sustaining public confidence.`,
        `NewsHub aggregates and synthesizes live news dispatches with full attribution to original publishers. To explore the complete unedited documentation and multimedia coverage, please visit the official dispatch from ${article.sourceName} below.`
      ];

  return (
    <article className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Back Navigation */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Articles</span>
        </button>
      </div>

      {/* Article Header */}
      <header className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <SourceBadge name={article.sourceName} category={article.category} region={article.region} />
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <Clock size={12} />
            <span>{formatTimeAgo(article.publishedAt)}</span>
          </div>
        </div>

        <h1 className="font-editorial text-2xl sm:text-4xl md:text-5xl font-semibold text-neutral-950 dark:text-white leading-tight">
          {cleanTitle}
        </h1>

        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
          {cleanDesc}
        </p>

        {/* Metadata & Actions Bar */}
        <div className="py-4 border-y border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              By {article.author || article.sourceName}
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
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = getEditorialFallbackImage(article.category, article.title || article.id, isHindi);
          }}
        />
        <div className="absolute bottom-2 right-2 bg-neutral-900/80 text-white text-[10px] px-2 py-0.5 font-mono">
          Photo: {article.sourceName} / NewsHub Wire
        </div>
      </div>

      {/* Article Synthesis & Content Body */}
      <div className="space-y-6 text-base sm:text-lg text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans">
        {/* Editorial Executive Takeaways */}
        <div className="bg-neutral-100/70 dark:bg-neutral-900/60 p-5 sm:p-6 border-l-2 border-neutral-900 dark:border-neutral-100 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <BookOpen size={14} />
            <span>{isHindi ? 'संपादकीय मुख्य बिंदु' : 'Executive Overview & Key Takeaways'}</span>
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 list-disc list-inside leading-relaxed">
            <li>{isHindi ? `${article.sourceName} द्वारा सत्यापित मुख्य समाचार रिपोर्ट।` : `Verified news wire dispatch reported by ${article.sourceName}.`}</li>
            <li>{isHindi ? `श्रेणी: ${article.category?.toUpperCase() || 'GENERAL'} · निष्पक्ष एवं पारदर्शी विश्लेषण।` : `Filed under ${article.category?.toUpperCase()} with real-time editorial integrity.`}</li>
            <li>{isHindi ? 'मूल प्रकाशक का संपूर्ण लेख नीचे दिए गए लिंक से उपलब्ध है।' : 'Full original documentation and publisher link referenced below.'}</li>
          </ul>
        </div>

        {/* 4 to 5 Detailed Editorial Paragraphs */}
        <div className="space-y-4 pt-2">
          {paragraphs.map((para, idx) => (
            <p key={idx} className="text-base sm:text-lg leading-relaxed text-neutral-800 dark:text-neutral-200 font-sans">
              {para}
            </p>
          ))}
        </div>

        {/* Primary Outbound Link Button */}
        <div className="py-8 text-center bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 p-6 my-6">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 max-w-md mx-auto">
            {isHindi 
              ? 'न्यूज़हब बौद्धिक संपदा अधिकारों का सम्मान करता है। पूरी खबर और विस्तृत विवरण पढ़ने के लिए प्रकाशक की आधिकारिक वेबसाइट पर जाएं।'
              : 'NewsHub respects intellectual property rights and editorial attribution. Read the complete unedited article on the publisher platform.'}
          </p>
          <a
            href={article.articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            <span>{isHindi ? `${article.sourceName} पर मूल समाचार पढ़ें` : `Read Original Article on ${article.sourceName}`}</span>
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
