import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

// Initialize database connection
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Define the tables that should exist based on schema.ts
const expectedTables = [
  'sessions',
  'users',
  'locations',
  'job_categories',
  'job_postings',
  'candidates',
  'communication_logs',
  'applications',
  'interviews',
  'audit_logs',
  'application_links',
  'availability_time_slots',
  'candidate_availability'
];

// Define the enums that should exist based on schema.ts
const expectedEnums = [
  'application_status',
  'job_status',
  'employment_type',
  'interview_type',
  'interview_status'
];

async function verifySchema() {
  try {
    console.log('Connecting to database...');
    
    // Query to list all tables in the public schema
    const tableResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    // Query to list all enums in the database
    const enumResult = await pool.query(`
      SELECT t.typname as enum_name
      FROM pg_type t 
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE t.typtype = 'e' AND n.nspname = 'public'
      ORDER BY enum_name;
    `);
    
    // Convert result to array of table names
    const existingTables = tableResult.rows.map(row => row.table_name);
    
    // Convert result to array of enum names
    const existingEnums = enumResult.rows.map(row => row.enum_name);
    
    console.log('\n=== Database Schema Verification ===');
    
    // Check which tables are missing
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));
    
    console.log('\n== Tables Status ==');
    expectedTables.forEach(table => {
      const exists = existingTables.includes(table);
      console.log(`- ${table}: ${exists ? '✅ Exists' : '❌ Missing'}`);
    });
    
    console.log('\n== Enums Status ==');
    expectedEnums.forEach(enumName => {
      const exists = existingEnums.includes(enumName);
      console.log(`- ${enumName}: ${exists ? '✅ Exists' : '❌ Missing'}`);
    });

    // Tables that exist in the database but are not in our schema
    const unexpectedTables = existingTables.filter(table => !expectedTables.includes(table) && table !== '_prisma_migrations');
    if (unexpectedTables.length > 0) {
      console.log('\n== Unexpected Tables ==');
      unexpectedTables.forEach(table => {
        console.log(`- ${table}`);
      });
    }
    
    console.log('\n== Summary ==');
    console.log(`Total expected tables: ${expectedTables.length}`);
    console.log(`Existing tables: ${existingTables.length}`);
    console.log(`Missing tables: ${missingTables.length}`);
    
    if (missingTables.length > 0) {
      console.log('\n== Tables to Create ==');
      missingTables.forEach(table => {
        console.log(`- ${table}`);
      });
    }
  } catch (error) {
    console.error('Error connecting to database:', error.message);
    if (error.message.includes('connect ECONNREFUSED')) {
      console.log('\nTIP: Make sure your database is running and the DATABASE_URL environment variable is set correctly.');
    }
  } finally {
    await pool.end();
  }
}

// Run the verification
verifySchema();