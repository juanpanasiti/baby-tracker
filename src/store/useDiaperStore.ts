import { create } from 'zustand';
import { diaperRepository } from '../db/repositories/diaperRepository';
import { type Diaper, type NewDiaper } from '../db/schema';

interface DiaperState {
  diapers: Diaper[];
  latestDiaper: Diaper | null;
  isLoading: boolean;
  isDiaperModalOpen: boolean;
  editingDiaper: Diaper | null;

  loadDiapers: (babyId: string) => Promise<void>;
  createDiaper: (babyId: string, data: Omit<NewDiaper, 'id' | 'babyId'>) => Promise<Diaper>;
  updateDiaper: (babyId: string, id: string, data: Partial<Omit<Diaper, 'id' | 'babyId'>>) => Promise<void>;
  deleteDiaper: (babyId: string, id: string) => Promise<void>;
  openDiaperModal: () => void;
  openEditDiaperModal: (diaper: Diaper) => void;
  closeDiaperModal: () => void;
}

export const useDiaperStore = create<DiaperState>((set, get) => ({
  diapers: [],
  latestDiaper: null,
  isLoading: false,
  isDiaperModalOpen: false,
  editingDiaper: null,

  loadDiapers: async (babyId: string) => {
    set({ isLoading: true });
    try {
      const diapers = await diaperRepository.getDiapersByBabyId(babyId);
      const latestDiaper = await diaperRepository.getLatestDiaper(babyId);
      set({ diapers, latestDiaper, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createDiaper: async (babyId: string, data) => {
    const created = await diaperRepository.createDiaper({
      ...data,
      babyId,
    });
    const diapers = await diaperRepository.getDiapersByBabyId(babyId);
    set({ diapers, latestDiaper: created, isDiaperModalOpen: false, editingDiaper: null });
    return created;
  },

  updateDiaper: async (babyId: string, id: string, data) => {
    await diaperRepository.updateDiaper(id, data);
    await get().loadDiapers(babyId);
    set({ isDiaperModalOpen: false, editingDiaper: null });
  },

  deleteDiaper: async (babyId: string, id: string) => {
    await diaperRepository.deleteDiaper(id);
    await get().loadDiapers(babyId);
  },

  openDiaperModal: () => set({ isDiaperModalOpen: true, editingDiaper: null }),
  openEditDiaperModal: (diaper: Diaper) => set({ isDiaperModalOpen: true, editingDiaper: diaper }),
  closeDiaperModal: () => set({ isDiaperModalOpen: false, editingDiaper: null }),
}));
