import React from 'react';
import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BreakingTicker({ articles = [] }) {
  if (!articles || articles.length === 0) return null;

  const highlights = articles.slice(0, 4);

  return (
    <div className="w-full bg-neutral-100/90 dark:bg-neutral-900 border-y border-neutral-200 dark:border-neutral-800 py-2 px-4 mb-6">
      <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-hidden text-xs">
        <div className="flex items-center gap-1 font-bold text-red-600 dark:text-red-400 uppercase tracking-widest shrink-0">
          <Zap size={13} className="fill-current animate-pulse" />
          <span>Dispatch</span>
        </div>
        <div className="h-3 w-px bg-neutral-300 dark:bg-neutral-700 shrink-0"></div>
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap text-neutral-700 dark:text-neutral-300">
          {highlights.map((item, idx) => (
            <Link
              key={item.id || item.externalId || idx}
              to={`/article/${item.id || item.externalId}`}
              className="hover:underline hover:text-neutral-950 dark:hover:text-white transition-colors flex items-center gap-2"
            >
              <span className="font-semibold text-neutral-900 dark:text-neutral-200">[{item.sourceName}]</span>
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
