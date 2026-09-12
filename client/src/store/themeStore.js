import { create } from 'zustand';

const storedTheme = localStorage.getItem('newshub_theme') || 'system';

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    // System preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}

// Initial application
if (typeof window !== 'undefined') {
  applyTheme(storedTheme);

  // Listen to system changes if in system mode
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const currentTheme = localStorage.getItem('newshub_theme') || 'system';
    if (currentTheme === 'system') {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  });
}

export const useThemeStore = create((set, get) => ({
  theme: storedTheme,
  
  setTheme: (theme) => {
    localStorage.setItem('newshub_theme', theme);
    applyTheme(theme);
    set({ theme });
  },

  toggleTheme: () => {
    const current = get().theme;
    let next;
    if (current === 'system') {
      const isCurrentlyDark = document.documentElement.classList.contains('dark');
      next = isCurrentlyDark ? 'light' : 'dark';
    } else {
      next = current === 'dark' ? 'light' : 'dark';
    }
    get().setTheme(next);
  }
}));
