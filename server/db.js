import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../data/memorial.db');

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('DB Error:', err);
  else console.log('Connected to SQLite DB');
});

export function initializeDB() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          isDeceased BOOLEAN DEFAULT 0
        )
      `);

      // Daily habits & patterns
      db.run(`
        CREATE TABLE IF NOT EXISTS patterns (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          activityType TEXT,
          description TEXT,
          mood TEXT,
          FOREIGN KEY(userId) REFERENCES users(id)
        )
      `);

      // Memories (text, notes)
      db.run(`
        CREATE TABLE IF NOT EXISTS memories (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          title TEXT,
          content TEXT,
          category TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(userId) REFERENCES users(id)
        )
      `);

      // Voice recordings (file paths)
      db.run(`
        CREATE TABLE IF NOT EXISTS recordings (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          filename TEXT,
          transcript TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(userId) REFERENCES users(id)
        )
      `);

      // Interests & traits
      db.run(`
        CREATE TABLE IF NOT EXISTS traits (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          trait TEXT,
          value TEXT,
          FOREIGN KEY(userId) REFERENCES users(id)
        )
      `);

      // Media files (photos, voice recordings)
      db.run(`
        CREATE TABLE IF NOT EXISTS media (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          memoryId TEXT,
          type TEXT,
          filename TEXT,
          filepath TEXT,
          caption TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(userId) REFERENCES users(id),
          FOREIGN KEY(memoryId) REFERENCES memories(id)
        )
      `);

      // Family members & sharing
      db.run(`
        CREATE TABLE IF NOT EXISTS family (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          memberEmail TEXT,
          memberName TEXT,
          role TEXT DEFAULT 'viewer',
          accessCode TEXT,
          addedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(userId) REFERENCES users(id)
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}
