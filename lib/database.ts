import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

let db: any;

try {
  console.log('📊 Connecting to SQLite database...');
  const sqlite = new Database('./kenya-bus-travel.db');
  db = drizzle(sqlite, { schema });
  console.log('✅ Successfully connected to SQLite database');
} catch (error) {
  console.error('❌ SQLite connection failed:', error);
  throw new Error('Failed to connect to SQLite database');
}

export { db };
export default db; 