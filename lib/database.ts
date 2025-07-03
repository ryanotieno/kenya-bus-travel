import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schemaSQLite from './schema';
import * as schemaPG from './schema-pg';

// Use Neon PostgreSQL for production (Vercel)
// Fallback to SQLite for development
let db: any;

if (process.env.NODE_ENV === 'production') {
  // Production: Use Neon PostgreSQL
  const sql = neon(process.env.DATABASE_URL!);
  db = drizzle(sql, { schema: schemaPG });
  console.log('📊 Using Neon PostgreSQL for production');
} else {
  // Development: Use SQLite
  const { drizzle: drizzleSQLite } = require('drizzle-orm/better-sqlite3');
  const Database = require('better-sqlite3');
  const { migrate } = require('drizzle-orm/better-sqlite3/migrator');
  
  const sqlite = new Database('kenya-bus-travel.db');
  db = drizzleSQLite(sqlite, { schema: schemaSQLite });
  
  // Run migrations in development
  try {
    migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Database migrations completed');
  } catch (error) {
    console.log('⚠️  Migration error (this is normal on first run):', error);
  }
}

export { db };
export default db; 