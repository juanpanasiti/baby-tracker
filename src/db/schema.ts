import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';

export const babies = sqliteTable('babies', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  birthDate: integer('birth_date').notNull(),
  sex: text('sex', { enum: ['male', 'female'] }).notNull(),
  photoUri: text('photo_uri'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const feedings = sqliteTable('feedings', {
  id: text('id').primaryKey(),
  babyId: text('baby_id')
    .notNull()
    .references(() => babies.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['breast', 'bottle'] }).notNull(),
  breastSide: text('breast_side', { enum: ['left', 'right', 'both'] }),
  durationSeconds: integer('duration_seconds'),
  amountMl: integer('amount_ml'),
  notes: text('notes'),
  timestamp: integer('timestamp').notNull(),
});

export const diapers = sqliteTable('diapers', {
  id: text('id').primaryKey(),
  babyId: text('baby_id')
    .notNull()
    .references(() => babies.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['pee', 'poop', 'both'] }).notNull(),
  hasRash: integer('has_rash', { mode: 'boolean' }).default(false).notNull(),
  notes: text('notes'),
  timestamp: integer('timestamp').notNull(),
});

export const appointments = sqliteTable('appointments', {
  id: text('id').primaryKey(),
  babyId: text('baby_id')
    .notNull()
    .references(() => babies.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  doctorName: text('doctor_name'),
  specialty: text('specialty'),
  appointmentDate: integer('appointment_date').notNull(),
  location: text('location'),
  notes: text('notes'),
  calendarEventId: text('calendar_event_id'),
  reminderNotificationId: text('reminder_notification_id'),
  createdAt: integer('created_at').notNull(),
});

export const reminders = sqliteTable('reminders', {
  id: text('id').primaryKey(),
  babyId: text('baby_id')
    .notNull()
    .references(() => babies.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['feeding', 'appointment'] }).notNull(),
  targetTime: integer('target_time').notNull(),
  notificationId: text('notification_id').notNull(),
  alertMode: text('alert_mode', { enum: ['notification', 'alarm'] }).default('alarm'),
  soundName: text('sound_name'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at').notNull(),
});

export type Baby = InferSelectModel<typeof babies>;
export type NewBaby = InferInsertModel<typeof babies>;

export type Feeding = InferSelectModel<typeof feedings>;
export type NewFeeding = InferInsertModel<typeof feedings>;

export type Diaper = InferSelectModel<typeof diapers>;
export type NewDiaper = InferInsertModel<typeof diapers>;

export type Appointment = InferSelectModel<typeof appointments>;
export type NewAppointment = InferInsertModel<typeof appointments>;

export type Reminder = InferSelectModel<typeof reminders>;
export type NewReminder = InferInsertModel<typeof reminders>;
