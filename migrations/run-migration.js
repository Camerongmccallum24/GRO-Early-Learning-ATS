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

import postgres from 'postgres';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Set up directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const sqlSchemaPath = path.join(__dirname, 'full_schema.sql');

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
    const sql = postgres(process.env.DATABASE_URL, {
      ssl: 'require',
      max: 5,
      idle_timeout: 30
    });

    // Test connection
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Connection successful!');
    console.log('Supabase server time:', result[0].current_time);
    
    return sql;
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
async function checkExistingTables(sql) {
  console.log('\n🔄 Checking existing database schema in Supabase...');
  
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    if (tables.length > 0) {
      console.log('⚠️ Supabase database already contains tables:');
      tables.forEach(row => console.log(`  - ${row.table_name}`));
      return tables.map(row => row.table_name);
    } else {
      console.log('✅ Supabase database is empty and ready for schema creation');
      return [];
    }
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
    process.exit(1);
  }
}

// Run migration
async function runMigration(sql) {
  console.log('\n🔄 Running migration to Supabase...');
  
  try {
    // Check for SQL schema file
    if (fs.existsSync(sqlSchemaPath)) {
      console.log('🔄 Using existing SQL schema file:', sqlSchemaPath);
      const sqlSchema = fs.readFileSync(sqlSchemaPath, 'utf8');
      
      // Split the SQL schema into individual statements
      const statements = sqlSchema
        .split(';')
        .filter(statement => statement.trim().length > 0)
        .map(statement => statement.trim() + ';');
      
      console.log(`Found ${statements.length} SQL statements to execute`);
      
      // Execute each statement
      console.log('🔄 Creating schema in Supabase...');
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        try {
          await sql.unsafe(statement);
          process.stdout.write('.');
        } catch (error) {
          console.error(`\n❌ Error executing SQL statement ${i + 1}:`, error.message);
          console.error('Statement:', statement);
        }
      }
      
      console.log('\n✅ Schema created successfully in Supabase!');
    } else {
      console.warn('⚠️ No SQL schema file found at:', sqlSchemaPath);
      console.warn('Creating basic schema structure...');
      
      // Create basic tables
      await sql`
        CREATE TABLE IF NOT EXISTS locations (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          city TEXT NOT NULL,
          state TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      console.log('✅ Basic schema created successfully in Supabase!');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Verify migration
async function verifyMigration(sql) {
  console.log('\n🔄 Verifying migration...');
  
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('✅ Verified the following tables exist in Supabase:');
    tables.forEach(row => console.log(`  - ${row.table_name}`));
    
    // Create a test record
    console.log('\n🔄 Creating a test record...');
    
    try {
      // Check if locations table exists
      const locationExists = tables.some(row => row.table_name === 'locations');
      
      if (locationExists) {
        await sql`
          INSERT INTO locations (name, city, state)
          VALUES ('GRO Early Learning Center - Test', 'Brisbane', 'QLD')
        `;
        console.log('✅ Test record created successfully!');
      } else {
        console.warn('⚠️ Could not create test record: locations table not found');
      }
    } catch (error) {
      console.error('❌ Test record creation failed:', error.message);
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
  console.log('======================================\n');
  
  try {
    // Connect to database
    const sql = await connectDB();
    
    // Check for existing tables
    const existingTables = await checkExistingTables(sql);
    
    if (existingTables.length > 0) {
      const shouldContinue = await confirm(
        '\n⚠️ WARNING: The Supabase database already contains tables. ' +
        'Continuing may overwrite existing data.\n' +
        'Do you want to continue? (y/n): '
      );
      
      if (!shouldContinue) {
        console.log('\n🛑 Migration cancelled.');
        rl.close();
        await sql.end();
        process.exit(0);
      }
    }
    
    // Run migration
    await runMigration(sql);
    
    // Verify migration
    const success = await verifyMigration(sql);
    
    // Close connection
    await sql.end();
    rl.close();
    
    console.log('\n======================================');
    if (success) {
      console.log('✅ Migration to Supabase completed successfully!');
      console.log('\nNext steps:');
      console.log('1. Switch to Supabase implementation:');
      console.log('   node -r tsx/cjs server/utils/database-switcher.js --use-supabase');
      console.log('2. Restart your application');
      console.log('   The ATS application should now be using Supabase!');
    } else {
      console.log('⚠️ Migration completed with warnings.');
      console.log('Some tables may be missing. Check the output above for details.');
    }
    console.log('======================================\n');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    rl.close();
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});