#!/usr/bin/env node

/**
 * Supabase Migration Helper
 * 
 * This script helps with migrating from Neon Postgres to Supabase
 * by removing old environment variables that might conflict.
 * 
 * Usage:
 *   node scripts/clean-neon-secrets.js
 */

console.log('\n======================================');
console.log('  Supabase Migration - Clean Old Secrets');
console.log('======================================\n');

console.log("This script doesn't actually remove secrets - it only shows you which ones to remove.");
console.log("You'll need to manually remove these from your Replit Secrets panel.\n");

console.log("Secrets that might conflict with Supabase and should be reviewed:");

// Check for Neon-specific environment variables
const neonSecrets = [
  'PGHOST',
  'PGUSER',
  'PGPASSWORD',
  'PGDATABASE',
  'PGPORT'
];

// Check which secrets exist
const existingSecrets = neonSecrets.filter(secret => process.env[secret]);

if (existingSecrets.length === 0) {
  console.log("\n✅ No conflicting secrets found! You're good to go.");
} else {
  console.log("\nThe following secrets might conflict with your Supabase setup:");
  
  existingSecrets.forEach(secret => {
    const value = process.env[secret];
    // Only show first few characters for security
    const maskedValue = value ? 
      `${value.substring(0, 3)}${'*'.repeat(Math.max(0, value.length - 6))}${value.substring(value.length - 3)}` : 
      '[empty]';
    console.log(`- ${secret}: ${maskedValue}`);
  });
  
  console.log(`\nPlease consider removing these ${existingSecrets.length} secrets from your Replit Secrets panel.`);
  console.log("This will prevent any confusion between Neon and Supabase connections.");
}

console.log('\nRemember: The DATABASE_URL secret should be set to your Supabase connection string.');
console.log('Example: postgresql://postgres:[PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres');

console.log('\n======================================');
console.log('  Next Steps:');
console.log('======================================');
console.log('1. Remove the conflicting secrets listed above (if any)');
console.log('2. Ensure DATABASE_URL is set to your Supabase connection string');
console.log('3. Run the Supabase connection check:');
console.log('   node -r tsx/cjs scripts/check-supabase-connection.js');
console.log('4. If the connection is successful, run the migration:');
console.log('   node -r tsx/cjs migrations/run-migration.js');
console.log('======================================\n');