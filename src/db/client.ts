import * as SQLite from 'expo-sqlite';
import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

export const DATABASE_NAME = 'baby_tracker.db';

let _expoDb: SQLite.SQLiteDatabase | null = null;
let _db: ExpoSQLiteDatabase<typeof schema> | null = null;

export function getExpoDatabase(): SQLite.SQLiteDatabase {
  if (!_expoDb) {
    _expoDb = SQLite.openDatabaseSync(DATABASE_NAME);
  }
  return _expoDb;
}

export function getDb(): ExpoSQLiteDatabase<typeof schema> {
  if (!_db) {
    const expoDb = getExpoDatabase();
    _db = drizzle(expoDb, { schema });
  }
  return _db;
}

/**
 * Initializes database tables if they do not exist yet.
 */
export async function initDatabase(): Promise<void> {
  const expoDb = getExpoDatabase();

  await expoDb.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS babies (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      birth_date INTEGER NOT NULL,
      sex TEXT NOT NULL,
      photo_uri TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS feedings (
      id TEXT PRIMARY KEY NOT NULL,
      baby_id TEXT NOT NULL,
      type TEXT NOT NULL,
      breast_side TEXT,
      duration_seconds INTEGER,
      amount_ml INTEGER,
      notes TEXT,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (baby_id) REFERENCES babies (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS diapers (
      id TEXT PRIMARY KEY NOT NULL,
      baby_id TEXT NOT NULL,
      type TEXT NOT NULL,
      has_rash INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (baby_id) REFERENCES babies (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY NOT NULL,
      baby_id TEXT NOT NULL,
      title TEXT NOT NULL,
      doctor_name TEXT,
      specialty TEXT,
      appointment_date INTEGER NOT NULL,
      location TEXT,
      notes TEXT,
      calendar_event_id TEXT,
      reminder_notification_id TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (baby_id) REFERENCES babies (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY NOT NULL,
      baby_id TEXT NOT NULL,
      type TEXT NOT NULL,
      target_time INTEGER NOT NULL,
      notification_id TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (baby_id) REFERENCES babies (id) ON DELETE CASCADE
    );
  `);
}
