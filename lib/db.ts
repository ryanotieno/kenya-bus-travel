import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Create a SQL client with the connection string from environment variables
// Use a dummy URL if DATABASE_URL is not provided
const sql = neon(process.env.DATABASE_URL || "postgres://user:password@localhost:5432/database")

// Create a drizzle client
export const db = drizzle(sql)

// Export the sql client for direct queries
export { sql }
