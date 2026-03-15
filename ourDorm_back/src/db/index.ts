import Database from "better-sqlite3";
import { join } from "path";

const dbPath = join(process.cwd(), "dorm.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    userId INTEGER PRIMARY KEY AUTOINCREMENT,
    userName TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    memberId INTEGER
  );

  CREATE TABLE IF NOT EXISTS members (
    memberId INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    birthday TEXT,
    hometown TEXT,
    hobby TEXT,
    role TEXT,
    avatar TEXT
  );

  CREATE TABLE IF NOT EXISTS flags (
    flagId INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    needCheckin INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    createTime INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS flag_member (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flagId INTEGER NOT NULL,
    memberId INTEGER NOT NULL,
    FOREIGN KEY (flagId) REFERENCES flags(flagId),
    FOREIGN KEY (memberId) REFERENCES members(memberId)
  );

  CREATE TABLE IF NOT EXISTS flag_checkin (
    checkinId INTEGER PRIMARY KEY AUTOINCREMENT,
    flagId INTEGER NOT NULL,
    memberId INTEGER NOT NULL,
    checkinDate TEXT NOT NULL,
    FOREIGN KEY (flagId) REFERENCES flags(flagId),
    FOREIGN KEY (memberId) REFERENCES members(memberId)
  );

  CREATE TABLE IF NOT EXISTS countdown (
    countdownId INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    targetDate TEXT NOT NULL,
    orderIndex INTEGER DEFAULT 0,
    createTime INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS dorm_log (
    logId INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    images TEXT,
    type TEXT,
    createTime INTEGER NOT NULL
  );
`);

// Basic in-place migration for existing local sqlite databases.
// Cloudflare D1 schema should be migrated separately; this is only for dev:local.
try {
  const userColumns = db.prepare("PRAGMA table_info(users)").all() as any[];
  const hasMemberId = userColumns.some((c) => c.name === "memberId");
  if (!hasMemberId) {
    db.exec("ALTER TABLE users ADD COLUMN memberId INTEGER");
  }
} catch {
  // Ignore migration errors; table may not exist yet or sqlite may reject ALTER in some states.
}

export default db;
