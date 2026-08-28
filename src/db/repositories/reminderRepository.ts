import { and, desc, eq } from 'drizzle-orm';
import { getDb } from '../client';
import { reminders, type Reminder, type NewReminder } from '../schema';
import { generateId } from '../../utils/id';

export const reminderRepository = {
  async getActiveRemindersByBabyId(babyId: string): Promise<Reminder[]> {
    const db = getDb();
    return db
      .select()
      .from(reminders)
      .where(eq(reminders.babyId, babyId))
      .orderBy(desc(reminders.targetTime));
  },

  async getNextActiveFeedingReminder(babyId: string): Promise<Reminder | null> {
    const db = getDb();
    const now = Date.now();
    const result = await db
      .select()
      .from(reminders)
      .where(eq(reminders.babyId, babyId))
      .orderBy(desc(reminders.targetTime));

    const active = result.find((r) => r.type === 'feeding' && r.isActive && r.targetTime > now);
    return active ?? null;
  },

  async createReminder(data: Omit<NewReminder, 'id' | 'createdAt'>): Promise<Reminder> {
    const db = getDb();
    const newReminder: NewReminder = {
      ...data,
      id: generateId(),
      createdAt: Date.now(),
    };
    await db.insert(reminders).values(newReminder);
    const result = await db.select().from(reminders).where(eq(reminders.id, newReminder.id));
    return result[0];
  },

  async updateReminder(id: string, data: Partial<Omit<Reminder, 'id' | 'createdAt'>>): Promise<void> {
    const db = getDb();
    await db
      .update(reminders)
      .set(data)
      .where(eq(reminders.id, id));
  },

  async deactivateRemindersByType(babyId: string, type: 'feeding' | 'appointment'): Promise<void> {
    const db = getDb();
    await db
      .update(reminders)
      .set({ isActive: false })
      .where(and(eq(reminders.babyId, babyId), eq(reminders.type, type)));
  },

  async getExpiredActiveReminders(babyId: string): Promise<Reminder[]> {
    const db = getDb();
    const now = Date.now();
    const result = await db
      .select()
      .from(reminders)
      .where(eq(reminders.babyId, babyId))
      .orderBy(desc(reminders.targetTime));

    return result.filter((r) => r.isActive && r.targetTime <= now);
  },

  async deactivateReminder(id: string): Promise<void> {
    const db = getDb();
    await db
      .update(reminders)
      .set({ isActive: false })
      .where(eq(reminders.id, id));
  },

  async deleteReminder(id: string): Promise<void> {
    const db = getDb();
    await db.delete(reminders).where(eq(reminders.id, id));
  },
};
