import { asc, eq, gte } from 'drizzle-orm';
import { getDb } from '../client';
import { appointments, type Appointment, type NewAppointment } from '../schema';
import { generateId } from '../../utils/id';

export const appointmentRepository = {
  async getAppointmentsByBabyId(babyId: string): Promise<Appointment[]> {
    const db = getDb();
    return db
      .select()
      .from(appointments)
      .where(eq(appointments.babyId, babyId))
      .orderBy(asc(appointments.appointmentDate));
  },

  async getUpcomingAppointments(babyId: string): Promise<Appointment[]> {
    const db = getDb();
    const now = Date.now();
    return db
      .select()
      .from(appointments)
      .where(eq(appointments.babyId, babyId))
      .orderBy(asc(appointments.appointmentDate));
  },

  async getNextAppointment(babyId: string): Promise<Appointment | null> {
    const db = getDb();
    const now = Date.now();
    const result = await db
      .select()
      .from(appointments)
      .where(eq(appointments.babyId, babyId))
      .orderBy(asc(appointments.appointmentDate));

    // Find the first upcoming or closest today
    const upcoming = result.find((a) => a.appointmentDate >= now);
    return upcoming ?? result[0] ?? null;
  },

  async createAppointment(data: Omit<NewAppointment, 'id' | 'createdAt'>): Promise<Appointment> {
    const db = getDb();
    const newAppointment: NewAppointment = {
      ...data,
      id: generateId(),
      createdAt: Date.now(),
    };
    await db.insert(appointments).values(newAppointment);
    const result = await db.select().from(appointments).where(eq(appointments.id, newAppointment.id));
    return result[0];
  },

  async updateAppointment(id: string, data: Partial<Omit<Appointment, 'id' | 'createdAt'>>): Promise<Appointment> {
    const db = getDb();
    await db.update(appointments).set(data).where(eq(appointments.id, id));
    const result = await db.select().from(appointments).where(eq(appointments.id, id));
    return result[0];
  },

  async deleteAppointment(id: string): Promise<void> {
    const db = getDb();
    await db.delete(appointments).where(eq(appointments.id, id));
  },
};
