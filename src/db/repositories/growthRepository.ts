import { desc, eq } from 'drizzle-orm';
import { getDb } from '../client';
import { growthRecords, type GrowthRecord, type NewGrowthRecord } from '../schema';
import { generateId } from '../../utils/id';

export const growthRepository = {
  async getGrowthRecordsByBabyId(babyId: string, limit = 100): Promise<GrowthRecord[]> {
    const db = getDb();
    return db
      .select()
      .from(growthRecords)
      .where(eq(growthRecords.babyId, babyId))
      .orderBy(desc(growthRecords.timestamp))
      .limit(limit);
  },

  async getLatestGrowthRecord(babyId: string): Promise<GrowthRecord | null> {
    const db = getDb();
    const result = await db
      .select()
      .from(growthRecords)
      .where(eq(growthRecords.babyId, babyId))
      .orderBy(desc(growthRecords.timestamp))
      .limit(1);
    return result[0] ?? null;
  },

  async createGrowthRecord(data: Omit<NewGrowthRecord, 'id' | 'createdAt'>): Promise<GrowthRecord> {
    const db = getDb();
    const newRecord: NewGrowthRecord = {
      ...data,
      id: generateId(),
      createdAt: Date.now(),
    };
    await db.insert(growthRecords).values(newRecord);
    const result = await db.select().from(growthRecords).where(eq(growthRecords.id, newRecord.id));
    return result[0];
  },

  async updateGrowthRecord(
    id: string,
    data: Partial<Omit<GrowthRecord, 'id' | 'babyId' | 'createdAt'>>
  ): Promise<GrowthRecord | null> {
    const db = getDb();
    await db.update(growthRecords).set(data).where(eq(growthRecords.id, id));
    const result = await db.select().from(growthRecords).where(eq(growthRecords.id, id));
    return result[0] ?? null;
  },

  async deleteGrowthRecord(id: string): Promise<void> {
    const db = getDb();
    await db.delete(growthRecords).where(eq(growthRecords.id, id));
  },
};
