import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Database connection validation
let isDatabaseAvailable = false;
let pgPool: Pool | null = null;

// Initialize database connection
try {
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️ DATABASE_URL is not set. Database operations will fail.");
  } else {
    pgPool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      // Standard PostgreSQL client configuration
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    // Check database connection
    pgPool.query('SELECT NOW()')
      .then(() => {
        console.log("✅ Successfully connected to PostgreSQL database");
        isDatabaseAvailable = true;
      })
      .catch(err => {
        console.error("❌ Failed to connect to PostgreSQL database:", err.message);
        isDatabaseAvailable = false;
      });
  }
} catch (error) {
  console.error("❌ Error initializing database connection:", error);
}

// Export database connection status
export const isDatabaseConnected = () => isDatabaseAvailable;

// Create drizzle client if pool is available
export const pool = pgPool || new Pool(); // Fallback to empty pool if not available
export const db = drizzle(pool, { schema });
