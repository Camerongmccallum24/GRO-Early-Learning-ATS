import { Pool } from 'pg';

/**
 * Utility script to check Supabase database connection
 * 
 * This script attempts to connect to the Supabase database using the DATABASE_URL
 * environment variable and runs a simple query to verify connectivity.
 */

// Only run this script if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function checkConnection() {
  console.log('Attempting to connect to Supabase PostgreSQL database...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Test the connection with a simple query
    const result = await pool.query('SELECT NOW()');
    console.log('Connection successful!');
    console.log('Server time:', result.rows[0].now);
    
    // Check database schema by listing tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\nExisting tables in database:');
    if (tablesResult.rows.length === 0) {
      console.log('No tables found. Database is empty.');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    }
  } catch (error) {
    console.error('Connection failed:', error.message);
    if (error.message.includes('ENOTFOUND')) {
      console.error('\nThe hostname in your DATABASE_URL cannot be resolved.');
      console.error('Please check that the URL is correct and includes the correct hostname.');
    } else if (error.message.includes('password authentication failed')) {
      console.error('\nAuthentication failed. Please check your database credentials.');
    }
  } finally {
    await pool.end();
  }
}

checkConnection().catch(console.error);