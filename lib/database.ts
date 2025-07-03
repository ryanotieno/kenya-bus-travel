import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';

// For Vercel deployment, we need to handle the database differently
let db: any;

if (process.env.NODE_ENV === 'production') {
  // In production (Vercel), we'll use an in-memory database for now
  // This is a temporary solution - in a real app, you'd use a cloud database
  const sqlite = new Database(':memory:');
  db = drizzle(sqlite, { schema });
  console.log('📊 Using in-memory database for production');
} else {
  // In development, use the local SQLite file
  const sqlite = new Database('kenya-bus-travel.db');
  db = drizzle(sqlite, { schema });
  
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