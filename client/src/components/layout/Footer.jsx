import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../utils/formatters';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#111111] border-t border-neutral-200 dark:border-neutral-800 mt-20 pt-12 pb-24 md:pb-12 text-xs text-neutral-600 dark:text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-neutral-200/60 dark:border-neutral-850">
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-bold text-sm flex items-center justify-center font-display">
                N
              </span>
              <span className="font-editorial text-xl font-bold tracking-tight text-neutral-950 dark:text-white">
                NewsHub
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed">
              Personalized news aggregation engine synthesizing verified global coverage with transparent recommendation scoring and reading analytics.
            </p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
              Built on the MERN Stack · Modular Multi-Provider Architecture
            </p>
          </div>

          {/* Quick Categories */}
          <div className="md:col-span-5">
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider text-[11px] mb-3">
              Editorial Topics
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.id}`}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors py-0.5"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div className="md:col-span-3">
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider text-[11px] mb-3">
              Platform
            </h4>
            <ul className="space-y-2">
              <li><Link to="/for-you" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Personalized Feed</Link></li>
              <li><Link to="/discover" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Discover & Trends</Link></li>
              <li><Link to="/saved" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Saved Dispatches</Link></li>
              <li><Link to="/history" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Reading History</Link></li>
              <li><Link to="/profile" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Reading Analytics</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright & Disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-400 dark:text-neutral-500">
          <p>© {new Date().getFullYear()} NewsHub. Dispatches credited to their original publishing sources.</p>
          <div className="flex items-center gap-4">
            <span>Minimal</span>
            <span>•</span>
            <span>Editorial</span>
            <span>•</span>
            <span>Fast</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
