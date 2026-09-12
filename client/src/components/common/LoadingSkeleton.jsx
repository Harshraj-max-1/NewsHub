import React from 'react';

export function ArticleCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800 p-4 sm:p-5 rounded-none flex flex-col justify-between animate-pulse">
      <div>
        <div className="w-full aspect-[16/10] bg-neutral-200 dark:bg-neutral-800 mb-4"></div>
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-20 h-3 bg-neutral-200 dark:bg-neutral-800"></div>
          <div className="w-12 h-3 bg-neutral-200 dark:bg-neutral-800"></div>
        </div>
        <div className="w-full h-5 bg-neutral-200 dark:bg-neutral-800 mb-2"></div>
        <div className="w-3/4 h-5 bg-neutral-200 dark:bg-neutral-800 mb-3"></div>
        <div className="w-full h-3.5 bg-neutral-200 dark:bg-neutral-800 mb-1.5"></div>
        <div className="w-5/6 h-3.5 bg-neutral-200 dark:bg-neutral-800"></div>
      </div>
      <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-850 flex items-center justify-between">
        <div className="w-24 h-3 bg-neutral-200 dark:bg-neutral-800"></div>
        <div className="w-5 h-5 bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>
      </div>
    </div>
  );
}

export function FeaturedArticleSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pb-8 border-b border-neutral-200 dark:border-neutral-800 animate-pulse">
      <div className="lg:col-span-7">
        <div className="w-full aspect-[16/10] bg-neutral-200 dark:bg-neutral-800"></div>
      </div>
      <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
        <div className="w-24 h-4 bg-neutral-200 dark:bg-neutral-800"></div>
        <div className="w-full h-8 bg-neutral-200 dark:bg-neutral-800"></div>
        <div className="w-4/5 h-8 bg-neutral-200 dark:bg-neutral-800"></div>
        <div className="space-y-2 pt-2">
          <div className="w-full h-4 bg-neutral-200 dark:bg-neutral-800"></div>
          <div className="w-full h-4 bg-neutral-200 dark:bg-neutral-800"></div>
          <div className="w-2/3 h-4 bg-neutral-200 dark:bg-neutral-800"></div>
        </div>
        <div className="w-32 h-4 bg-neutral-200 dark:bg-neutral-800 pt-4"></div>
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  );
}
