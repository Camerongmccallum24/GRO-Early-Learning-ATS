import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from "@shared/schema";

// Connection setup for Supabase PostgreSQL
let sql = null;
let db = null;
let databaseConnected = false;

// Function to initialize database connection
export async function initDatabaseConnection() {
  // Skip if already connected
  if (databaseConnected) return { sql, db, databaseConnected };
  
  // Check if we have a DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL is not set. Using in-memory database for development.");
    return { sql, db, databaseConnected: false };
  }
  
  try {
    // Set up a postgres-js client 
    sql = postgres(process.env.DATABASE_URL, {
      ssl: 'require',
      max: 5, // Maximum number of clients
      idle_timeout: 30 // Close idle clients after 30 seconds 
    });
    
    // Initialize Drizzle with the client and schema
    db = drizzle(sql, { schema });
    
    try {
      // Basic query to test connection
      const result = await sql`SELECT NOW()`;
      console.log("✅ Connected to Supabase PostgreSQL database successfully");
      databaseConnected = true;
    } catch (error) {
      console.error("❌ Failed to connect to Supabase PostgreSQL database:", error.message);
      console.warn("Falling back to memory-based storage for development");
      databaseConnected = false;
    }
    
  } catch (error) {
    console.error("❌ Error setting up Supabase database connection:", error.message);
    console.warn("Falling back to memory-based storage for development");
    sql = null;
    db = null;
    databaseConnected = false;
  }
  
  return { sql, db, databaseConnected };
}

// Initialize connection immediately, but don't wait for it to complete
initDatabaseConnection();

export { sql, db, databaseConnected };