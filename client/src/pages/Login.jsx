import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ArrowRight, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) {
      if (redirect) {
        navigate(`/${redirect}`);
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-0 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-8 h-8 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-bold font-display text-lg mb-3">
            N
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-semibold text-neutral-950 dark:text-white">
            Welcome to NewsHub
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Access your personalized editorial dispatches and reading archive.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-6 bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="reader@editorial.org"
              className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Password
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In to NewsHub'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800/80 text-center text-xs text-neutral-500">
          <span>Don't have an account? </span>
          <Link to="/register" className="font-semibold text-neutral-900 dark:text-neutral-100 hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
