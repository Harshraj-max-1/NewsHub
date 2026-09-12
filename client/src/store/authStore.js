import { create } from 'zustand';
import api from '../services/api';

const storedUser = localStorage.getItem('newshub_user');
const initialUser = storedUser ? JSON.parse(storedUser) : null;

export const useAuthStore = create((set, get) => ({
  user: initialUser,
  token: localStorage.getItem('newshub_token') || null,
  isAuthenticated: !!localStorage.getItem('newshub_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;

      localStorage.setItem('newshub_token', token);
      localStorage.setItem('newshub_user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      });
      return { success: true, user };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  register: async (name, email, password, interests = []) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', { name, email, password, interests });
      const { token, user } = res.data;

      localStorage.setItem('newshub_token', token);
      localStorage.setItem('newshub_user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      });
      return { success: true, user };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  googleLogin: async ({ credential, profile }) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/google', { credential, profile });
      const { token, user } = res.data;

      localStorage.setItem('newshub_token', token);
      localStorage.setItem('newshub_user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      });
      return { success: true, user };
    } catch (err) {
      const msg = err.response?.data?.message || 'Google authentication failed';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  logout: () => {
    localStorage.removeItem('newshub_token');
    localStorage.removeItem('newshub_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null
    });
  },

  updatePreferences: async (preferences) => {
    try {
      const res = await api.put('/users/preferences', preferences);
      const updatedUser = res.data.data;
      localStorage.setItem('newshub_user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
      return { success: true, user: updatedUser };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Update failed' };
    }
  },

  fetchProfile: async () => {
    if (!get().token) return;
    try {
      const res = await api.get('/auth/me');
      const user = res.data.user;
      localStorage.setItem('newshub_user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (err) {
      // Token invalid or expired
      get().logout();
    }
  }
}));
