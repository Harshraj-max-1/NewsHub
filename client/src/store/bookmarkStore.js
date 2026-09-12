import { create } from 'zustand';
import api from '../services/api';

export const useBookmarkStore = create((set, get) => ({
  bookmarkIds: new Set(),
  isLoading: false,

  fetchBookmarkIds: async () => {
    const token = localStorage.getItem('newshub_token');
    if (!token) return;

    try {
      const res = await api.get('/bookmarks/ids');
      if (res.data?.data) {
        set({ bookmarkIds: new Set(res.data.data) });
      }
    } catch (err) {
      console.warn('Failed to fetch bookmark IDs:', err.message);
    }
  },

  isBookmarked: (articleId) => {
    return get().bookmarkIds.has(articleId);
  },

  toggleBookmark: async (article) => {
    const token = localStorage.getItem('newshub_token');
    if (!token) {
      return { requireAuth: true };
    }

    const articleId = article.id || article.externalId;
    const isCurrentlyBookmarked = get().bookmarkIds.has(articleId);

    // Optimistic state update
    const updated = new Set(get().bookmarkIds);
    if (isCurrentlyBookmarked) {
      updated.delete(articleId);
    } else {
      updated.add(articleId);
    }
    set({ bookmarkIds: updated });

    try {
      if (isCurrentlyBookmarked) {
        await api.delete(`/bookmarks/${articleId}`);
      } else {
        await api.post('/bookmarks', {
          articleId,
          title: article.title,
          description: article.description,
          imageUrl: article.imageUrl,
          sourceName: article.sourceName,
          sourceUrl: article.sourceUrl,
          articleUrl: article.articleUrl,
          category: article.category,
          publishedAt: article.publishedAt
        });
      }
      return { success: true, bookmarked: !isCurrentlyBookmarked };
    } catch (err) {
      // Revert optimistic update on failure
      const reverted = new Set(get().bookmarkIds);
      if (isCurrentlyBookmarked) {
        reverted.add(articleId);
      } else {
        reverted.delete(articleId);
      }
      set({ bookmarkIds: reverted });
      return { success: false, error: err.message };
    }
  }
}));
