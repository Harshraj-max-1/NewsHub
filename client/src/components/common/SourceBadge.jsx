import React from 'react';

export default function SourceBadge({ name, category, region, className = '' }) {
  const isIndia = region === 'india' || ['mint', 'the hindu', 'the economic times', 'indian express', 'ndtv', 'yourstory', 'espncricinfo', 'moneycontrol'].some(s => (name || '').toLowerCase().includes(s));

  return (
    <div className={`inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wider uppercase text-neutral-500 dark:text-neutral-400 ${className}`}>
      <span className="text-xs">{isIndia ? '🇮🇳' : '🌐'}</span>
      <span className="font-semibold text-neutral-900 dark:text-neutral-200">{name || 'NewsHub'}</span>
      {category && (
        <>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <span className="text-neutral-500 dark:text-neutral-400">{category}</span>
        </>
      )}
    </div>
  );
}
