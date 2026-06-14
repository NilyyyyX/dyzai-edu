import { getDb } from '../db/database';
import fs from 'fs';
import path from 'path';

export async function runMigrations() {
  const dbPath = process.env.DB_PATH || './db/dev.sqlite3.json';
  const dbDir = path.dirname(dbPath);
  
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('Created database directory:', dbDir);
  }
  
  console.log('Initializing database at:', dbPath);
  const db = await getDb();
  console.log('Database initialized successfully.');
}
