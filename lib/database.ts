import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Use Neon PostgreSQL for production, SQLite for development
let db: any;

if (process.env.DATABASE_URL) {
  try {
    console.log('📊 Connecting to Neon PostgreSQL...');
    const sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql, { schema });
    console.log('✅ Successfully connected to Neon PostgreSQL');
  } catch (error) {
    console.error('❌ Neon PostgreSQL connection failed:', error);
    throw new Error('Database connection failed. Please check your DATABASE_URL environment variable.');
  }
} else {
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