import { desc, eq } from 'drizzle-orm';
import { getDb } from '../client';
import { diapers, type Diaper, type NewDiaper } from '../schema';
import { generateId } from '../../utils/id';

export const diaperRepository = {
  async getDiapersByBabyId(babyId: string, limit = 100): Promise<Diaper[]> {
    const db = getDb();
    return db
      .select()
      .from(diapers)
      .where(eq(diapers.babyId, babyId))
      .orderBy(desc(diapers.timestamp))
      .limit(limit);
  },

  async getLatestDiaper(babyId: string): Promise<Diaper | null> {
    const db = getDb();
    const result = await db
      .select()
      .from(diapers)
      .where(eq(diapers.babyId, babyId))
      .orderBy(desc(diapers.timestamp))
      .limit(1);
    return result[0] ?? null;
  },

  async createDiaper(data: Omit<NewDiaper, 'id'>): Promise<Diaper> {
    const db = getDb();
    const newDiaper: NewDiaper = {
      ...data,
      id: generateId(),
    };
    await db.insert(diapers).values(newDiaper);
    const result = await db.select().from(diapers).where(eq(diapers.id, newDiaper.id));
    return result[0];
  },

  async deleteDiaper(id: string): Promise<void> {
    const db = getDb();
    await db.delete(diapers).where(eq(diapers.id, id));
  },
};
