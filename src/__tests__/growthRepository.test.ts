import { growthRepository } from '../db/repositories/growthRepository';
import { getDb } from '../db/client';

jest.mock('../db/client', () => ({
  getDb: jest.fn(),
}));

jest.mock('../../src/utils/id', () => ({
  generateId: jest.fn().mockReturnValue('mock-growth-id-123'),
}));

describe('growthRepository', () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn(),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    };

    (getDb as jest.Mock).mockReturnValue(mockDb);
  });

  it('getGrowthRecordsByBabyId returns sorted records for baby', async () => {
    const mockRecords = [
      { id: '1', babyId: 'baby-1', weightKg: 5.2, heightCm: 58, timestamp: 2000, createdAt: 2000 },
      { id: '2', babyId: 'baby-1', weightKg: 4.8, heightCm: 56, timestamp: 1000, createdAt: 1000 },
    ];
    mockDb.limit.mockResolvedValueOnce(mockRecords);

    const result = await growthRepository.getGrowthRecordsByBabyId('baby-1', 10);
    expect(result).toEqual(mockRecords);
    expect(mockDb.select).toHaveBeenCalled();
    expect(mockDb.limit).toHaveBeenCalledWith(10);
  });

  it('getLatestGrowthRecord returns the most recent record or null', async () => {
    const mockRecord = { id: '1', babyId: 'baby-1', weightKg: 5.2, timestamp: 2000, createdAt: 2000 };
    mockDb.limit.mockResolvedValueOnce([mockRecord]);

    const result = await growthRepository.getLatestGrowthRecord('baby-1');
    expect(result).toEqual(mockRecord);

    mockDb.limit.mockResolvedValueOnce([]);
    const emptyResult = await growthRepository.getLatestGrowthRecord('baby-2');
    expect(emptyResult).toBeNull();
  });

  it('createGrowthRecord inserts new record and returns it', async () => {
    const createdRecord = {
      id: 'mock-growth-id-123',
      babyId: 'baby-1',
      weightKg: 5.25,
      heightCm: 59,
      notes: 'Checkup',
      timestamp: 1234567,
      createdAt: expect.any(Number),
    };

    mockDb.values.mockResolvedValueOnce(undefined);
    // second select().from().where() returns array with created record
    mockDb.where.mockResolvedValueOnce([createdRecord]);

    const result = await growthRepository.createGrowthRecord({
      babyId: 'baby-1',
      weightKg: 5.25,
      heightCm: 59,
      notes: 'Checkup',
      timestamp: 1234567,
    });

    expect(mockDb.insert).toHaveBeenCalled();
    expect(result).toEqual(createdRecord);
  });

  it('updateGrowthRecord updates and returns updated record', async () => {
    const updatedRecord = {
      id: 'mock-growth-id-123',
      babyId: 'baby-1',
      weightKg: 5.3,
      timestamp: 1234567,
      createdAt: 1000,
    };

    mockDb.where.mockReturnValueOnce({ where: jest.fn().mockResolvedValueOnce(undefined) });
    mockDb.where.mockResolvedValueOnce([updatedRecord]);

    const result = await growthRepository.updateGrowthRecord('mock-growth-id-123', {
      weightKg: 5.3,
    });

    expect(mockDb.update).toHaveBeenCalled();
    expect(result).toEqual(updatedRecord);
  });

  it('deleteGrowthRecord deletes record by id', async () => {
    mockDb.where.mockResolvedValueOnce(undefined);

    await growthRepository.deleteGrowthRecord('mock-growth-id-123');
    expect(mockDb.delete).toHaveBeenCalled();
  });
});
