import { create } from 'zustand';

const storedEdition = localStorage.getItem('newshub_edition') || 'india';

export const useEditionStore = create((set) => ({
  edition: storedEdition, // 'india' | 'global' | 'all'

  setEdition: (edition) => {
    localStorage.setItem('newshub_edition', edition);
    set({ edition });
  },

  isIndiaOnly: () => get().edition === 'india',
  isGlobalOnly: () => get().edition === 'global'
}));
