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
      alert_mode TEXT DEFAULT 'alarm',
      sound_name TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (baby_id) REFERENCES babies (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS medications (
      id TEXT PRIMARY KEY NOT NULL,
      baby_id TEXT NOT NULL,
      name TEXT NOT NULL,
      dosage TEXT,
      schedule_type TEXT NOT NULL,
      fixed_times_json TEXT,
      interval_hours INTEGER,
      interval_start_time INTEGER,
      selected_days_json TEXT,
      end_date INTEGER,
      alert_mode TEXT NOT NULL DEFAULT 'alarm',
      sound_name TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (baby_id) REFERENCES babies (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS medication_logs (
      id TEXT PRIMARY KEY NOT NULL,
      baby_id TEXT NOT NULL,
      medication_id TEXT NOT NULL,
      medication_name TEXT NOT NULL,
      dosage TEXT,
      notes TEXT,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (baby_id) REFERENCES babies (id) ON DELETE CASCADE,
      FOREIGN KEY (medication_id) REFERENCES medications (id) ON DELETE CASCADE
    );
  `);

  // Safe migrations for added columns in reminders
  try {
    const tableInfo = await expoDb.getAllAsync<{ name: string }>(`PRAGMA table_info(reminders);`);
    const columnNames = tableInfo.map((c) => c.name);
    if (!columnNames.includes('alert_mode')) {
      await expoDb.execAsync(`ALTER TABLE reminders ADD COLUMN alert_mode TEXT DEFAULT 'alarm';`);
    }
    if (!columnNames.includes('sound_name')) {
      await expoDb.execAsync(`ALTER TABLE reminders ADD COLUMN sound_name TEXT;`);
    }
  } catch {
    // Migration ignored if fails
  }
}
