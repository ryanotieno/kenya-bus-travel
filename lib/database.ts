import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schemaSQLite from './schema';
import * as schemaPG from './schema-pg';

// Use Neon PostgreSQL for production (Vercel)
// Fallback to SQLite for development
let db: any;

if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
  // Production: Try to use Neon PostgreSQL
  try {
    console.log('📊 Attempting to use Neon PostgreSQL for production');
    const sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql, { schema: schemaPG });
    console.log('✅ Successfully connected to Neon PostgreSQL');
  } catch (error) {
    console.error('❌ Neon PostgreSQL connection failed:', error);
    console.log('🔄 Falling back to SQLite for production');
    
    // Fallback to SQLite in production
    const { drizzle: drizzleSQLite } = require('drizzle-orm/better-sqlite3');
    const Database = require('better-sqlite3');
    
    const sqlite = new Database('kenya-bus-travel.db');
    db = drizzleSQLite(sqlite, { schema: schemaSQLite });
    console.log('✅ Using SQLite fallback in production');
  }
} else {
  // Development: Use SQLite
  console.log('📱 Using SQLite for development');
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