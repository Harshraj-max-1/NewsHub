import React from 'react';
import ArticleCard from './ArticleCard';

export default function NewsGrid({ articles = [], showRecommendation = false, columns = 3 }) {
  if (!articles || articles.length === 0) return null;

  const colClass = columns === 2 
    ? 'grid-cols-1 md:grid-cols-2' 
    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`grid ${colClass} gap-6`}>
      {articles.map((article) => (
        <ArticleCard
          key={article.id || article.externalId}
          article={article}
          showRecommendation={showRecommendation}
        />
      ))}
    </div>
  );
}
