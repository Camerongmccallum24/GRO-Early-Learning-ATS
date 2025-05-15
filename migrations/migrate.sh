#!/bin/bash

# Migration script for Supabase database
# This script verifies the database connection and runs the migration

echo "======================================================"
echo "      Supabase Database Migration Tool"
echo "======================================================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  echo "Please set the DATABASE_URL environment variable with your Supabase connection string"
  exit 1
fi

echo "🔍 Testing database connection..."

# Function to check database connection
check_connection() {
  # Use node to test the connection
  node -e "
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  async function testConnection() {
    try {
      const result = await pool.query('SELECT NOW()');
      console.log('✅ Database connection successful!');
      console.log('Server time:', result.rows[0].now);
      return true;
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    } finally {
      await pool.end();
    }
  }
  
  testConnection().then(success => process.exit(success ? 0 : 1));
  "
  
  return $?
}

# Test the connection
if ! check_connection; then
  echo ""
  echo "❌ Failed to connect to the database"
  echo "Please check that your DATABASE_URL is correct and that the database is accessible"
  exit 1
fi

echo ""
echo "📋 Checking existing database schema..."

# Check if tables already exist
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkTables() {
  try {
    const result = await pool.query(\`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    \`);
    
    if (result.rows.length > 0) {
      console.log('⚠️ Database already contains tables:');
      result.rows.forEach(row => {
        console.log(\`  - \${row.table_name}\`);
      });
      console.log('');
      return result.rows.length;
    } else {
      console.log('✅ Database is empty and ready for migration');
      return 0;
    }
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
    return -1;
  } finally {
    await pool.end();
  }
}

checkTables().then(count => process.exit(count >= 0 ? 0 : 1));
"

# Prompt for confirmation
echo ""
echo "Do you want to proceed with the migration? (y/n)"
read -p "> " confirm

if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
  echo "Migration cancelled"
  exit 0
fi

echo ""
echo "🚀 Running migration..."

# Run the migration using drizzle-kit
npx drizzle-kit push

# Check for errors
if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Migration failed"
  echo "To migrate manually, you can run the SQL file in Supabase's SQL Editor:"
  echo "migrations/full_schema.sql"
  exit 1
fi

echo ""
echo "✅ Migration completed successfully!"
echo ""
echo "You can now restart your application to use the Supabase database"