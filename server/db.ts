import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Connection setup for PostgreSQL
let pool = null;
let db = null;
let databaseConnected = false;

// Function to initialize database connection
export async function initDatabaseConnection() {
  // Skip if already connected
  if (databaseConnected) return { pool, db, databaseConnected };
  
  // Check if we have a DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL is not set. Using in-memory database for development.");
    return { pool, db, databaseConnected: false };
  }
  
  try {
    // Set up a pool with proper connection settings
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Required for Supabase connection
      max: 5, // Maximum number of clients
      idleTimeoutMillis: 30000 // Close idle clients after 30 seconds
    });
    
    // Test event handlers to detect issues
    pool.on('error', (err) => {
      console.error('Unexpected error on idle database client', err);
      databaseConnected = false;
    });
    
    // Initialize Drizzle with the pool and schema
    db = drizzle(pool, { schema });
    
    try {
      // Basic query to test connection
      await pool.query('SELECT NOW()');
      console.log("✅ Connected to PostgreSQL database successfully");
      databaseConnected = true;
    } catch (error) {
      console.error("❌ Failed to connect to PostgreSQL database:", error.message);
      console.warn("Falling back to memory-based storage for development");
      databaseConnected = false;
    }
    
  } catch (error) {
    console.error("❌ Error setting up database connection:", error.message);
    console.warn("Falling back to memory-based storage for development");
    pool = null;
    db = null;
    databaseConnected = false;
  }
  
  return { pool, db, databaseConnected };
}

// Initialize connection immediately, but don't wait for it to complete
initDatabaseConnection();

export { pool, db, databaseConnected };
