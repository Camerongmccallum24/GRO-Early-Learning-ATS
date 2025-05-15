#!/usr/bin/env node

/**
 * Supabase Database Migration Script
 * 
 * This script:
 * 1. Verifies connection to Supabase
 * 2. Creates database schema
 * 3. Seeds initial data
 * 
 * Usage:
 *   node -r tsx/cjs migrations/run-migration.js
 */

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Setup directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sqlPath = path.join(__dirname, 'full_schema.sql');

// Verify environment variables
if (!process.env.DATABASE_URL) {
  console.error('\n❌ DATABASE_URL environment variable not found');
  console.error('Please set the DATABASE_URL to your Supabase connection string in Secrets tab\n');
  process.exit(1);
}

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Confirm with user
function confirm(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase().startsWith('y'));
    });
  });
}

// Connect to database
async function connectDB() {
  console.log('\n🔄 Connecting to Supabase PostgreSQL database...');
  
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    // Test connection
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Connection successful!');
    console.log('Server time:', result.rows[0].now);
    
    return pool;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.message.includes('ENOTFOUND')) {
      console.error('\nThe hostname in your DATABASE_URL cannot be resolved.');
      console.error('Please check that the URL is correct and includes the correct hostname.');
    } else if (error.message.includes('password authentication failed')) {
      console.error('\nAuthentication failed. Please check your database credentials.');
    }
    process.exit(1);
  }
}

// Check existing tables
async function checkExistingTables(pool) {
  console.log('\n🔄 Checking existing database schema...');
  
  try {
    const { rows } = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (rows.length > 0) {
      console.log('⚠️ Database already contains tables:');
      rows.forEach(row => console.log(`  - ${row.table_name}`));
      return rows.map(row => row.table_name);
    } else {
      console.log('✅ Database is empty and ready for schema creation');
      return [];
    }
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
    process.exit(1);
  }
}

// Run migration
async function runMigration(pool) {
  console.log('\n🔄 Running migration...');
  
  try {
    // Read SQL file
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Run the SQL script
    await pool.query(sql);
    
    console.log('✅ Schema created successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Verify migration
async function verifyMigration(pool) {
  console.log('\n🔄 Verifying migration...');
  
  try {
    const { rows } = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('✅ Verified the following tables exist:');
    rows.forEach(row => console.log(`  - ${row.table_name}`));
    
    // Check for specific tables we expect
    const requiredTables = [
      'users', 'sessions', 'locations', 'job_postings', 
      'candidates', 'applications', 'interviews', 
      'communication_logs', 'audit_logs'
    ];
    
    const missingTables = requiredTables.filter(table => 
      !rows.some(row => row.table_name === table)
    );
    
    if (missingTables.length > 0) {
      console.error('⚠️ The following required tables are missing:');
      missingTables.forEach(table => console.error(`  - ${table}`));
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('\n======================================');
  console.log('  Supabase Database Migration Tool');
  console.log('======================================');
  
  // Connect to database
  const pool = await connectDB();
  
  // Check for existing tables
  const existingTables = await checkExistingTables(pool);
  
  if (existingTables.length > 0) {
    const shouldContinue = await confirm(
      '\n⚠️ WARNING: The database already contains tables. ' +
      'Continuing may overwrite existing data.\n' +
      'Do you want to continue? (y/n): '
    );
    
    if (!shouldContinue) {
      console.log('\n🛑 Migration cancelled.');
      rl.close();
      await pool.end();
      process.exit(0);
    }
  }
  
  // Run migration
  await runMigration(pool);
  
  // Verify migration
  const success = await verifyMigration(pool);
  
  // Close connection
  await pool.end();
  rl.close();
  
  console.log('\n======================================');
  if (success) {
    console.log('✅ Migration completed successfully!');
    console.log('\nYou can now restart your application to use the Supabase database.');
  } else {
    console.log('⚠️ Migration completed with warnings.');
    console.log('Some tables may be missing. Check the output above for details.');
  }
  console.log('======================================\n');
}

main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});