import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';

// Create SQLite database instance
const sqlite = new Database('kenya-bus-travel.db');

// Create Drizzle instance
export const db = drizzle(sqlite, { schema });

// Run migrations in development
if (process.env.NODE_ENV === 'development') {
  try {
    migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Database migrations completed');
  } catch (error) {
    console.log('⚠️  Migration error (this is normal on first run):', error);
  }
}

export default db; 