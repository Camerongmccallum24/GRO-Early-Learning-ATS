import pg from 'pg';
import dotenv from 'dotenv';
import * as schema from './shared/schema.js';
dotenv.config();

// Initialize database connection
const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

function getSchemaTableNames() {
  // If schema exports table objects, their keys are the table names
  // Adjust this logic if your schema structure is different
  return Object.keys(schema).filter(
    (key) => schema[key] && typeof schema[key] === 'object' && 'table' in schema[key]
  );
}

async function listTables() {
  try {
    console.log('Connecting to database...');
    
    // Query to list all tables in the public schema
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\n=== Tables in Database ===');
    if (result.rows.length === 0) {
      console.log('No tables found in database.');
    } else {
      result.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
      console.log(`\nTotal tables: ${result.rows.length}`);
    }

    // Query to list all schemas
    const schemaResult = await pool.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name NOT LIKE 'pg_%' AND schema_name != 'information_schema'
      ORDER BY schema_name;
    `);
    
    console.log('\n=== Schemas in Database ===');
    schemaResult.rows.forEach(row => {
      console.log(`- ${row.schema_name}`);
    });
    
    // After printing DB tables:
    const dbTableNames = result.rows.map(row => row.table_name);
    const schemaTableNames = getSchemaTableNames();

    // Compare
    const missingInDb = schemaTableNames.filter(name => !dbTableNames.includes(name));
    const missingInSchema = dbTableNames.filter(name => !schemaTableNames.includes(name));

    if (missingInDb.length > 0) {
      console.log('\n=== Tables defined in code but missing in database ===');
      missingInDb.forEach(name => console.log(`- ${name}`));
    } else {
      console.log('\nAll code-defined tables exist in the database.');
    }
    if (missingInSchema.length > 0) {
      console.log('\n=== Tables in database but missing in code schema ===');
      missingInSchema.forEach(name => console.log(`- ${name}`));
    } else {
      console.log('\nAll database tables are defined in code schema.');
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

// Run the function
listTables();
