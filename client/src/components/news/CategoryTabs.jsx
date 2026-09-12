import React from 'react';
import { CATEGORIES } from '../../utils/formatters';

export default function CategoryTabs({ activeCategory, onSelectCategory }) {
  return (
    <div className="w-full border-b border-neutral-200 dark:border-neutral-800 my-4">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-all duration-150 border-b-2 ${
                isActive
                  ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100 font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
