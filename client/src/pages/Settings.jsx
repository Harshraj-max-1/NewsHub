import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, TOP_SOURCES } from '../utils/formatters';
import { Check, SlidersHorizontal, User, Shield, Moon, Sun, Laptop } from 'lucide-react';

export default function Settings() {
  const { user, isAuthenticated, updatePreferences } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [selectedInterests, setSelectedInterests] = useState(user?.interests || ['technology', 'ai', 'business']);
  const [selectedSources, setSelectedSources] = useState(user?.preferredSources || []);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=settings');
    }
  }, [isAuthenticated, navigate]);

  const toggleInterest = (id) => {
    if (selectedInterests.includes(id)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter(i => i !== id));
      }
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const toggleSource = (src) => {
    if (selectedSources.includes(src)) {
      setSelectedSources(selectedSources.filter(s => s !== src));
    } else {
      setSelectedSources([...selectedSources, src]);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ type: '', text: '' });

    try {
      // 1. Update Profile info
      await api.put('/users/profile', { name, avatar });

      // 2. Update Preferences & Theme
      await updatePreferences({
        interests: selectedInterests,
        preferredSources: selectedSources,
        theme
      });

      setStatusMsg({ type: 'success', text: 'Preferences and profile successfully updated.' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save changes.' });
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    try {
      await api.put('/users/password', { currentPassword, newPassword });
      setStatusMsg({ type: 'success', text: 'Password successfully changed.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Password change failed.' });
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-300">
      {/* Masthead */}
      <div className="border-b border-neutral-900 dark:border-neutral-100 pb-4">
        <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          Preferences & Configuration
        </span>
        <h1 className="font-editorial text-3xl sm:text-5xl font-semibold text-neutral-950 dark:text-white">
          NewsHub Settings
        </h1>
      </div>

      {statusMsg.text && (
        <div
          className={`p-4 text-xs font-medium border ${
            statusMsg.type === 'success'
              ? 'bg-green-50/80 dark:bg-green-950/20 border-green-300 dark:border-green-800 text-green-800 dark:text-green-300'
              : 'bg-red-50/80 dark:bg-red-950/20 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300'
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveProfile} className="space-y-10">
        {/* Section 1: Editorial Topics Curation */}
        <section className="bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 space-y-4">
          <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <SlidersHorizontal size={15} />
              <span>Personalized Topic Preferences</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Select your primary reading domains. Our recommendation algorithm heavily scores these topics in your For-You feed.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {CATEGORIES.filter(c => c.id !== 'all').map((cat) => {
              const isSelected = selectedInterests.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleInterest(cat.id)}
                  className={`px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-150 border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900 dark:border-neutral-100'
                      : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700 hover:border-neutral-500'
                  }`}
                >
                  {isSelected && <Check size={13} />}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 2: Preferred Sources */}
        <section className="bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 space-y-4">
          <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-100">
              Trusted Publisher Network
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Follow your favorite journalism outlets to receive prioritization in discovery feeds.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {TOP_SOURCES.map((source) => {
              const isSelected = selectedSources.includes(source);
              return (
                <button
                  key={source}
                  type="button"
                  onClick={() => toggleSource(source)}
                  className={`px-3 py-1.5 text-xs font-medium transition-all duration-150 border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900 dark:border-neutral-100 font-semibold'
                      : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:border-neutral-500'
                  }`}
                >
                  {isSelected && <Check size={12} />}
                  <span>{source}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 3: Appearance & Theme */}
        <section className="bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 space-y-4">
          <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-100">
              Appearance Theme
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Select your reading interface aesthetic.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-3 border text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                theme === 'light'
                  ? 'border-neutral-900 bg-neutral-100 text-neutral-900 dark:border-neutral-100 dark:bg-neutral-800 dark:text-white'
                  : 'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Sun size={15} />
              <span>Light</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-3 border text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                theme === 'dark'
                  ? 'border-neutral-900 bg-neutral-100 text-neutral-900 dark:border-neutral-100 dark:bg-neutral-800 dark:text-white'
                  : 'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Moon size={15} />
              <span>Dark</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`p-3 border text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                theme === 'system'
                  ? 'border-neutral-900 bg-neutral-100 text-neutral-900 dark:border-neutral-100 dark:bg-neutral-800 dark:text-white'
                  : 'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Laptop size={15} />
              <span>System</span>
            </button>
          </div>
        </section>

        {/* Section 4: Profile Details */}
        <section className="bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 space-y-4">
          <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <User size={15} />
              <span>Profile Information</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full px-3 py-2 text-xs bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-400 cursor-not-allowed"
              />
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? 'Saving...' : 'Save All Preferences'}
          </button>
        </div>
      </form>

      {/* Section 5: Password Change */}
      <section className="bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 space-y-4 mt-12">
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Shield size={15} />
            <span>Security & Password</span>
          </h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md pt-2">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 border border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Update Password
          </button>
        </form>
      </section>
    </div>
  );
}
