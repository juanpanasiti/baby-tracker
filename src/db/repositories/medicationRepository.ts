import { desc, eq } from 'drizzle-orm';
import { getDb } from '../client';
import {
  medications,
  medicationLogs,
  type Medication,
  type NewMedication,
  type MedicationLog,
  type NewMedicationLog,
} from '../schema';
import { generateId } from '../../utils/id';

export const medicationRepository = {
  async getMedicationsByBabyId(babyId: string): Promise<Medication[]> {
    const db = getDb();
    return db
      .select()
      .from(medications)
      .where(eq(medications.babyId, babyId))
      .orderBy(desc(medications.createdAt));
  },

  async getMedicationById(id: string): Promise<Medication | null> {
    const db = getDb();
    const result = await db
      .select()
      .from(medications)
      .where(eq(medications.id, id));
    return result[0] ?? null;
  },

  async createMedication(data: Omit<NewMedication, 'id' | 'createdAt' | 'updatedAt'>): Promise<Medication> {
    const db = getDb();
    const now = Date.now();
    const newMedication: NewMedication = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(medications).values(newMedication);
    const result = await db
      .select()
      .from(medications)
      .where(eq(medications.id, newMedication.id));
    return result[0];
  },

  async updateMedication(id: string, data: Partial<Omit<Medication, 'id' | 'createdAt'>>): Promise<void> {
    const db = getDb();
    await db
      .update(medications)
      .set({
        ...data,
        updatedAt: Date.now(),
      })
      .where(eq(medications.id, id));
  },

  async deleteMedication(id: string): Promise<void> {
    const db = getDb();
    await db.delete(medications).where(eq(medications.id, id));
  },

  async getMedicationLogsByBabyId(babyId: string): Promise<MedicationLog[]> {
    const db = getDb();
    return db
      .select()
      .from(medicationLogs)
      .where(eq(medicationLogs.babyId, babyId))
      .orderBy(desc(medicationLogs.timestamp));
  },

  async createMedicationLog(data: Omit<NewMedicationLog, 'id'>): Promise<MedicationLog> {
    const db = getDb();
    const newLog: NewMedicationLog = {
      ...data,
      id: generateId(),
    };
    await db.insert(medicationLogs).values(newLog);
    const result = await db
      .select()
      .from(medicationLogs)
      .where(eq(medicationLogs.id, newLog.id));
    return result[0];
  },

  async deleteMedicationLog(id: string): Promise<void> {
    const db = getDb();
    await db.delete(medicationLogs).where(eq(medicationLogs.id, id));
  },
};
