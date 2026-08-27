import { desc, eq } from 'drizzle-orm';
import { getDb } from '../client';
import { feedings, type Feeding, type NewFeeding } from '../schema';
import { generateId } from '../../utils/id';

export const feedingRepository = {
  async getFeedingsByBabyId(babyId: string, limit = 100): Promise<Feeding[]> {
    const db = getDb();
    return db
      .select()
      .from(feedings)
      .where(eq(feedings.babyId, babyId))
      .orderBy(desc(feedings.timestamp))
      .limit(limit);
  },

  async getLatestFeeding(babyId: string): Promise<Feeding | null> {
    const db = getDb();
    const result = await db
      .select()
      .from(feedings)
      .where(eq(feedings.babyId, babyId))
      .orderBy(desc(feedings.timestamp))
      .limit(1);
    return result[0] ?? null;
  },

  async createFeeding(data: Omit<NewFeeding, 'id'>): Promise<Feeding> {
    const db = getDb();
    const newFeeding: NewFeeding = {
      ...data,
      id: generateId(),
    };
    await db.insert(feedings).values(newFeeding);
    const result = await db.select().from(feedings).where(eq(feedings.id, newFeeding.id));
    return result[0];
  },

  async deleteFeeding(id: string): Promise<void> {
    const db = getDb();
    await db.delete(feedings).where(eq(feedings.id, id));
  },
};
