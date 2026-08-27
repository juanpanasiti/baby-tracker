import { create } from 'zustand';
import { diaperRepository } from '../db/repositories/diaperRepository';
import { type Diaper, type NewDiaper } from '../db/schema';

interface DiaperState {
  diapers: Diaper[];
  latestDiaper: Diaper | null;
  isLoading: boolean;
  isDiaperModalOpen: boolean;

  loadDiapers: (babyId: string) => Promise<void>;
  createDiaper: (babyId: string, data: Omit<NewDiaper, 'id' | 'babyId'>) => Promise<Diaper>;
  deleteDiaper: (babyId: string, id: string) => Promise<void>;
  openDiaperModal: () => void;
  closeDiaperModal: () => void;
}

export const useDiaperStore = create<DiaperState>((set, get) => ({
  diapers: [],
  latestDiaper: null,
  isLoading: false,
  isDiaperModalOpen: false,

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
    set({ diapers, latestDiaper: created, isDiaperModalOpen: false });
    return created;
  },

  deleteDiaper: async (babyId: string, id: string) => {
    await diaperRepository.deleteDiaper(id);
    await get().loadDiapers(babyId);
  },

  openDiaperModal: () => set({ isDiaperModalOpen: true }),
  closeDiaperModal: () => set({ isDiaperModalOpen: false }),
}));
