import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Use Neon PostgreSQL with fallback to SQLite
let db: any;

try {
  console.log('📊 Connecting to Neon PostgreSQL...');
  const sql = neon(process.env.DATABASE_URL || "postgres://user:password@localhost:5432/database");
  db = drizzle(sql, { schema });
  console.log('✅ Successfully connected to Neon PostgreSQL');
} catch (error) {
  console.error('❌ Neon PostgreSQL connection failed, falling back to SQLite:', error);
  // Fallback to SQLite for local development
  console.log('📊 Using local SQLite database...');
  const { drizzle } = require('drizzle-orm/better-sqlite3');
  const Database = require('better-sqlite3');
  const sqlite = new Database('./kenya-bus-travel.db');
  db = drizzle(sqlite, { schema });
  console.log('✅ Successfully connected to SQLite');
}

export { db };
export default db; 