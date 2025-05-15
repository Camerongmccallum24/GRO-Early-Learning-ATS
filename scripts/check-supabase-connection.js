#!/usr/bin/env node

/**
 * Supabase Database Connection Check
 * This script verifies the connection to the Supabase PostgreSQL database.
 * 
 * Usage:
 *   node -r tsx/cjs scripts/check-supabase-connection.js
 */

import postgres from 'postgres';

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('Please set the DATABASE_URL in your Replit Secrets');
  process.exit(1);
}

// Function to test connection with postgres-js
async function testWithPostgresJs() {
  console.log('Testing connection with postgres-js client...');
  
  try {
    const sql = postgres(process.env.DATABASE_URL, {
      ssl: 'require',
      max: 1,
      idle_timeout: 10
    });
    
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ postgres-js connection successful!');
    console.log(`Server time: ${result[0].current_time}`);
    
    await sql.end();
    return true;
  } catch (error) {
    console.error('❌ postgres-js connection failed:', error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('\n==== Supabase Connection Check ====\n');
  
  console.log('DATABASE_URL:', process.env.DATABASE_URL.replace(/:.+@/, ':****@'));
  
  // Test with postgres-js
  const postgresJsSuccess = await testWithPostgresJs();
  
  console.log('\n==== Connection Test Results ====');
  console.log(`postgres-js: ${postgresJsSuccess ? '✅ Connected' : '❌ Failed'}`);
  
  if (postgresJsSuccess) {
    console.log('\n✅ Your Supabase connection is working correctly!');
    console.log('You can now run the migration script:');
    console.log('  node -r tsx/cjs scripts/supabase-migration.js');
  } else {
    console.log('\n❌ Connection to Supabase failed.');
    console.log('Please check your DATABASE_URL and ensure:');
    console.log('1. The hostname is correct (db.YOUR-PROJECT-REF.supabase.co)');
    console.log('2. Your password is correct and properly URL-encoded');
    console.log('3. SSL is properly configured');
  }
}

main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});