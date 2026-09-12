import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Globe, Sparkles, Newspaper, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function MobileNav() {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  const items = [
    { name: 'India', path: '/', icon: Home },
    { name: 'हिंदी', path: '/hindi', icon: Newspaper, badge: 'New' },
    { name: 'Global', path: '/global', icon: Globe },
    { name: 'For You', path: '/for-you', icon: Sparkles },
    { name: isAuthenticated ? 'Profile' : 'Sign In', path: isAuthenticated ? '/profile' : '/login', icon: User }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FAFAF9]/95 dark:bg-[#121212]/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 px-1 py-1 safe-area-pb">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium tracking-tight transition-colors relative min-w-[56px] ${
                isActive
                  ? 'text-neutral-950 dark:text-white font-bold'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <div className="relative">
                <Icon size={18} strokeWidth={isActive ? 2.3 : 1.7} className="mb-0.5" />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                )}
              </div>
              <span className="truncate max-w-[60px]">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
