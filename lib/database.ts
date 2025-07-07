import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Use Neon PostgreSQL only - no fallbacks
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  throw new Error('DATABASE_URL environment variable is not set. Please set your Neon database URL.');
}

let db: any;

try {
  console.log('📊 Connecting to Neon PostgreSQL...');
  const sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql, { schema });
  console.log('✅ Successfully connected to Neon PostgreSQL');
} catch (error) {
  console.error('❌ Neon PostgreSQL connection failed:', error);
  throw new Error('Failed to connect to Neon PostgreSQL. Please check your DATABASE_URL.');
}

export { db };
export default db; 