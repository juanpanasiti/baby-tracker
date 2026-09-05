import { useGrowthStore } from '../store/useGrowthStore';
import { growthRepository } from '../db/repositories/growthRepository';

jest.mock('../db/repositories/growthRepository', () => ({
  growthRepository: {
    getGrowthRecordsByBabyId: jest.fn().mockResolvedValue([]),
    getLatestGrowthRecord: jest.fn().mockResolvedValue(null),
    createGrowthRecord: jest.fn().mockImplementation((data) =>
      Promise.resolve({ id: 'growth-1', createdAt: 1000, ...data })
    ),
    updateGrowthRecord: jest.fn().mockImplementation((id, data) =>
      Promise.resolve({ id, ...data })
    ),
    deleteGrowthRecord: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('useGrowthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useGrowthStore.setState({
      records: [],
      latestRecord: null,
      isLoading: false,
      isGrowthModalOpen: false,
      isHistoryModalOpen: false,
      editingRecord: null,
    });
  });

  it('loadGrowthRecords fetches records and latestRecord', async () => {
    const mockRecord = {
      id: 'g-1',
      babyId: 'b-1',
      weightKg: 5.2,
      heightCm: 58,
      notes: null,
      timestamp: 1000,
      createdAt: 1000,
    };
    (growthRepository.getGrowthRecordsByBabyId as jest.Mock).mockResolvedValueOnce([mockRecord]);
    (growthRepository.getLatestGrowthRecord as jest.Mock).mockResolvedValueOnce(mockRecord);

    await useGrowthStore.getState().loadGrowthRecords('b-1');

    expect(useGrowthStore.getState().records).toEqual([mockRecord]);
    expect(useGrowthStore.getState().latestRecord).toEqual(mockRecord);
    expect(useGrowthStore.getState().isLoading).toBe(false);
  });

  it('createGrowthRecord creates record and refreshes store', async () => {
    const created = await useGrowthStore.getState().createGrowthRecord('b-1', {
      weightKg: 5.3,
      heightCm: 58.5,
      notes: 'New checkup',
      timestamp: 2000,
    });

    expect(growthRepository.createGrowthRecord).toHaveBeenCalledWith({
      babyId: 'b-1',
      weightKg: 5.3,
      heightCm: 58.5,
      notes: 'New checkup',
      timestamp: 2000,
    });
    expect(created.id).toBe('growth-1');
    expect(useGrowthStore.getState().isGrowthModalOpen).toBe(false);
  });

  it('updateGrowthRecord updates and closes modal', async () => {
    await useGrowthStore.getState().updateGrowthRecord('b-1', 'growth-1', {
      weightKg: 5.4,
    });

    expect(growthRepository.updateGrowthRecord).toHaveBeenCalledWith('growth-1', {
      weightKg: 5.4,
    });
    expect(useGrowthStore.getState().isGrowthModalOpen).toBe(false);
  });

  it('deleteGrowthRecord deletes record and refreshes list', async () => {
    await useGrowthStore.getState().deleteGrowthRecord('b-1', 'growth-1');
    expect(growthRepository.deleteGrowthRecord).toHaveBeenCalledWith('growth-1');
    expect(growthRepository.getGrowthRecordsByBabyId).toHaveBeenCalledWith('b-1');
  });

  it('manages modal open/close states', () => {
    const record = {
      id: 'g-1',
      babyId: 'b-1',
      weightKg: 5.2,
      heightCm: 58,
      notes: null,
      timestamp: 1000,
      createdAt: 1000,
    };

    useGrowthStore.getState().openGrowthModal(record);
    expect(useGrowthStore.getState().isGrowthModalOpen).toBe(true);
    expect(useGrowthStore.getState().editingRecord).toEqual(record);

    useGrowthStore.getState().closeGrowthModal();
    expect(useGrowthStore.getState().isGrowthModalOpen).toBe(false);
    expect(useGrowthStore.getState().editingRecord).toBeNull();

    useGrowthStore.getState().openHistoryModal();
    expect(useGrowthStore.getState().isHistoryModalOpen).toBe(true);

    useGrowthStore.getState().closeHistoryModal();
    expect(useGrowthStore.getState().isHistoryModalOpen).toBe(false);
  });
});
