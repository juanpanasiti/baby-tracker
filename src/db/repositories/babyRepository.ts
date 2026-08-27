import { eq } from 'drizzle-orm';
import { getDb } from '../client';
import { babies, type Baby, type NewBaby } from '../schema';
import { generateId } from '../../utils/id';

export const babyRepository = {
  async getPrimaryBaby(): Promise<Baby | null> {
    const db = getDb();
    const result = await db.select().from(babies).limit(1);
    return result[0] ?? null;
  },

  async getBabyById(id: string): Promise<Baby | null> {
    const db = getDb();
    const result = await db.select().from(babies).where(eq(babies.id, id));
    return result[0] ?? null;
  },

  async createBaby(data: Omit<NewBaby, 'id' | 'createdAt' | 'updatedAt'>): Promise<Baby> {
    const db = getDb();
    const now = Date.now();
    const newBaby: NewBaby = {
      id: generateId(),
      name: data.name,
      birthDate: data.birthDate,
      sex: data.sex,
      photoUri: data.photoUri ?? null,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(babies).values(newBaby);
    return (await this.getBabyById(newBaby.id))!;
  },

  async updateBaby(id: string, data: Partial<Omit<Baby, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Baby> {
    const db = getDb();
    const now = Date.now();
    await db
      .update(babies)
      .set({
        ...data,
        updatedAt: now,
      })
      .where(eq(babies.id, id));
    return (await this.getBabyById(id))!;
  },

  async deleteBaby(id: string): Promise<void> {
    const db = getDb();
    await db.delete(babies).where(eq(babies.id, id));
  },
};
