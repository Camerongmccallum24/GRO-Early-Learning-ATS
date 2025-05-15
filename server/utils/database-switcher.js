#!/usr/bin/env node

/**
 * Database Switcher Script
 * 
 * This script switches the database implementation between
 * the current Node-Postgres implementation and the new Supabase
 * postgres-js implementation.
 * 
 * Usage:
 *   node -r tsx/cjs server/utils/database-switcher.js [--use-supabase|--use-node-postgres]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Set up directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const nodePostgresFile = path.join(rootDir, 'server/db.ts');
const supabaseFile = path.join(rootDir, 'server/db.supabase.ts');
const backupFile = path.join(rootDir, 'server/db.backup.ts');

// Check arguments
const args = process.argv.slice(2);
const useSupabase = args.includes('--use-supabase');
const useNodePostgres = args.includes('--use-node-postgres');

if (!useSupabase && !useNodePostgres) {
  console.log('\nUsage: node -r tsx/cjs server/utils/database-switcher.js [--use-supabase|--use-node-postgres]\n');
  console.log('Current setup:');
  
  // Check which implementation is in use
  const currentFileContent = fs.readFileSync(nodePostgresFile, 'utf8');
  if (currentFileContent.includes('postgres-js')) {
    console.log('✅ Using Supabase with postgres-js');
  } else if (currentFileContent.includes('node-postgres')) {
    console.log('✅ Using Node-Postgres');
  } else {
    console.log('❓ Unknown database implementation');
  }
  
  process.exit(0);
}

// Switch to Supabase
if (useSupabase) {
  if (!fs.existsSync(supabaseFile)) {
    console.error('❌ Supabase implementation file not found:', supabaseFile);
    process.exit(1);
  }
  
  console.log('🔄 Switching to Supabase postgres-js implementation...');
  
  // Backup current file
  if (fs.existsSync(nodePostgresFile)) {
    fs.copyFileSync(nodePostgresFile, backupFile);
    console.log('✅ Backed up current implementation to:', backupFile);
  }
  
  // Replace with Supabase implementation
  fs.copyFileSync(supabaseFile, nodePostgresFile);
  console.log('✅ Switched to Supabase postgres-js implementation');
}

// Switch to Node-Postgres
if (useNodePostgres) {
  if (!fs.existsSync(backupFile)) {
    console.error('❌ Backup file not found:', backupFile);
    process.exit(1);
  }
  
  console.log('🔄 Switching to Node-Postgres implementation...');
  
  // Restore from backup
  fs.copyFileSync(backupFile, nodePostgresFile);
  console.log('✅ Switched to Node-Postgres implementation');
}

console.log('\n✅ Database implementation switched successfully');
console.log('Please restart your application for changes to take effect');