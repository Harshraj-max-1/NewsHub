import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Sun,
  Moon,
  Bookmark,
  Sparkles,
  Compass,
  History,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  SlidersHorizontal,
  Globe
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useEditionStore } from '../../store/editionStore';
import { formatDate } from '../../utils/formatters';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { edition, setEdition } = useEditionStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(quickSearch.trim())}`);
      setQuickSearch('');
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'India Front', path: '/' },
    { name: 'हिंदी समाचार', path: '/hindi', badge: 'New', highlight: true },
    { name: 'Global Wire', path: '/global', icon: Globe },
    { name: 'For You', path: '/for-you', badge: 'AI', icon: Sparkles },
    { name: 'Discover', path: '/discover', icon: Compass },
    { name: 'Saved', path: '/saved', icon: Bookmark },
    { name: 'History', path: '/history', icon: History }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAF9]/95 dark:bg-[#121212]/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      {/* Top Editorial Utility Bar with India/Hindi/Global Edition Switcher */}
      <div className="border-b border-neutral-200/60 dark:border-neutral-850 px-3 sm:px-8 py-1.5 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none">
          <span className="hidden lg:inline">{formatDate(new Date())}</span>
          <span className="hidden lg:inline w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700"></span>

          {/* Regional Edition Selector */}
          <div className="flex items-center gap-0.5 bg-neutral-200/70 dark:bg-neutral-800 p-0.5 rounded-none font-medium">
            <Link
              to="/"
              onClick={() => setEdition('india')}
              className={`px-2 py-0.5 text-[10px] uppercase tracking-wider flex items-center gap-1 transition-colors ${
                location.pathname === '/' && edition === 'india'
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-bold'
                  : 'hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span>🇮🇳</span>
              <span>India</span>
            </Link>
            <Link
              to="/hindi"
              className={`px-2 py-0.5 text-[10px] uppercase tracking-wider flex items-center gap-1 transition-colors ${
                location.pathname === '/hindi'
                  ? 'bg-orange-600 text-white font-bold'
                  : 'text-orange-600 dark:text-orange-400 hover:text-orange-700'
              }`}
            >
              <span>🕉️</span>
              <span>हिंदी</span>
            </Link>
            <Link
              to="/global"
              onClick={() => setEdition('global')}
              className={`px-2 py-0.5 text-[10px] uppercase tracking-wider flex items-center gap-1 transition-colors ${
                location.pathname === '/global'
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-bold'
                  : 'hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span>🌐</span>
              <span>Global</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/hindi"
            className="text-[10px] font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
          >
            <span>हिंदी न्यूज़ हब</span>
            <span className="text-[9px] bg-orange-100 dark:bg-orange-950/60 px-1 py-0.2 text-orange-700 dark:text-orange-300">Live</span>
          </Link>
          <span className="hidden md:inline w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700"></span>
          <span className="hidden md:inline">Verified Journalism Network</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="w-7 h-7 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-bold text-base flex items-center justify-center font-display">
                N
              </span>
              <span className="font-editorial text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">
                NewsHub
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors relative flex items-center gap-1.5 ${
                      isActive
                        ? 'text-neutral-950 dark:text-white'
                        : 'text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-100'
                    }`}
                  >
                    {link.name}
                    {link.badge && (
                      <span className="text-[9px] bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-1 py-0.2 font-mono uppercase rounded-2xs">
                        {link.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-neutral-900 dark:bg-neutral-100"></span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Search, Theme & Profile Controls */}
          <div className="flex items-center gap-3">
            {/* Quick Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center relative">
              <input
                type="text"
                placeholder="Search India & Global news..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-44 md:w-60 pl-8 pr-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 focus:outline-none focus:ring-1 focus:ring-neutral-400 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400"
              />
              <Search size={14} className="absolute left-2.5 text-neutral-400 pointer-events-none" />
            </form>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              className="p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* User Dropdown / Auth Buttons */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 focus:outline-none"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-7 h-7 rounded-full border border-neutral-300 dark:border-neutral-700 object-cover"
                  />
                  <span className="hidden md:inline text-xs font-medium text-neutral-800 dark:text-neutral-200">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
                      <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">{user.name}</p>
                      <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <UserIcon size={14} />
                      <span>Reading Profile</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <SlidersHorizontal size={14} />
                      <span>News Preferences</span>
                    </Link>

                    <div className="border-t border-neutral-100 dark:border-neutral-800 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity"
                >
                  Join
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-neutral-700 dark:text-neutral-300"
              aria-label="Open Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-neutral-200 dark:border-neutral-800 animate-in slide-in-from-top-2">
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles, topics, sources..."
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400"
                />
                <Search size={15} className="absolute left-3 top-2.5 text-neutral-400" />
              </div>
            </form>

            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider flex items-center justify-between ${
                    location.pathname === link.path
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="text-[9px] bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-1.5 py-0.5">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
