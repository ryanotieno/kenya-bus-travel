import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Use Neon PostgreSQL for all environments
let db: any;

if (process.env.DATABASE_URL) {
  try {
    console.log('📊 Connecting to Neon PostgreSQL...');
    console.log("🚨 DB URL:", process.env.DATABASE_URL);
    const sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql, { schema });
    console.log('✅ Successfully connected to Neon PostgreSQL');
  } catch (error) {
    console.error('❌ Neon PostgreSQL connection failed:', error);
    throw new Error('Database connection failed. Please check your DATABASE_URL environment variable.');
  }
} else {
  console.error('❌ DATABASE_URL environment variable is required');
  throw new Error('DATABASE_URL environment variable is not set');
}

export { db };
export default db; 