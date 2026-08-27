import { create } from 'zustand';
import { babyRepository } from '../db/repositories/babyRepository';
import { type Baby, type NewBaby } from '../db/schema';

interface BabyState {
  baby: Baby | null;
  isLoading: boolean;
  isProfileModalOpen: boolean;
  loadBaby: () => Promise<void>;
  createBaby: (data: Omit<NewBaby, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Baby>;
  updateBaby: (data: Partial<Omit<Baby, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<Baby | null>;
  openProfileModal: () => void;
  closeProfileModal: () => void;
}

export const useBabyStore = create<BabyState>((set, get) => ({
  baby: null,
  isLoading: true,
  isProfileModalOpen: false,

  loadBaby: async () => {
    set({ isLoading: true });
    try {
      const baby = await babyRepository.getPrimaryBaby();
      set({ baby, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createBaby: async (data) => {
    const created = await babyRepository.createBaby(data);
    set({ baby: created, isProfileModalOpen: false });
    return created;
  },

  updateBaby: async (data) => {
    const current = get().baby;
    if (!current) return null;
    const updated = await babyRepository.updateBaby(current.id, data);
    set({ baby: updated, isProfileModalOpen: false });
    return updated;
  },

  openProfileModal: () => set({ isProfileModalOpen: true }),
  closeProfileModal: () => set({ isProfileModalOpen: false }),
}));
