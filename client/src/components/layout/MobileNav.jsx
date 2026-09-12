import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Sparkles, Bookmark, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function MobileNav() {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  const items = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Discover', path: '/discover', icon: Compass },
    { name: 'For You', path: '/for-you', icon: Sparkles },
    { name: 'Saved', path: '/saved', icon: Bookmark },
    { name: 'Profile', path: isAuthenticated ? '/profile' : '/login', icon: User }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FAFAF9]/95 dark:bg-[#121212]/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 px-2 py-1.5">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center py-1 px-3 text-[10px] font-medium tracking-tight transition-colors ${
                isActive
                  ? 'text-neutral-950 dark:text-white font-semibold'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.2 : 1.7} className="mb-0.5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
