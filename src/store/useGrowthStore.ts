import { create } from 'zustand';
import { growthRepository } from '../db/repositories/growthRepository';
import { type GrowthRecord, type NewGrowthRecord } from '../db/schema';

interface GrowthState {
  records: GrowthRecord[];
  latestRecord: GrowthRecord | null;
  isLoading: boolean;
  isGrowthModalOpen: boolean;
  isHistoryModalOpen: boolean;
  editingRecord: GrowthRecord | null;

  loadGrowthRecords: (babyId: string) => Promise<void>;
  createGrowthRecord: (
    babyId: string,
    data: Omit<NewGrowthRecord, 'id' | 'babyId' | 'createdAt'>
  ) => Promise<GrowthRecord>;
  updateGrowthRecord: (
    babyId: string,
    id: string,
    data: Partial<Omit<GrowthRecord, 'id' | 'babyId' | 'createdAt'>>
  ) => Promise<void>;
  deleteGrowthRecord: (babyId: string, id: string) => Promise<void>;

  openGrowthModal: (record?: GrowthRecord | null) => void;
  closeGrowthModal: () => void;
  openHistoryModal: () => void;
  closeHistoryModal: () => void;
}

export const useGrowthStore = create<GrowthState>((set, get) => ({
  records: [],
  latestRecord: null,
  isLoading: false,
  isGrowthModalOpen: false,
  isHistoryModalOpen: false,
  editingRecord: null,

  loadGrowthRecords: async (babyId: string) => {
    set({ isLoading: true });
    try {
      const records = await growthRepository.getGrowthRecordsByBabyId(babyId);
      const latestRecord = await growthRepository.getLatestGrowthRecord(babyId);
      set({ records, latestRecord, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createGrowthRecord: async (babyId: string, data) => {
    const created = await growthRepository.createGrowthRecord({
      ...data,
      babyId,
    });
    await get().loadGrowthRecords(babyId);
    set({ isGrowthModalOpen: false, editingRecord: null });
    return created;
  },

  updateGrowthRecord: async (babyId: string, id: string, data) => {
    await growthRepository.updateGrowthRecord(id, data);
    await get().loadGrowthRecords(babyId);
    set({ isGrowthModalOpen: false, editingRecord: null });
  },

  deleteGrowthRecord: async (babyId: string, id: string) => {
    await growthRepository.deleteGrowthRecord(id);
    await get().loadGrowthRecords(babyId);
  },

  openGrowthModal: (record = null) =>
    set({ isGrowthModalOpen: true, editingRecord: record ?? null }),
  closeGrowthModal: () => set({ isGrowthModalOpen: false, editingRecord: null }),
  openHistoryModal: () => set({ isHistoryModalOpen: true }),
  closeHistoryModal: () => set({ isHistoryModalOpen: false }),
}));
