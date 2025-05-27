import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

(async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Connecting to the database...');
    const client = await pool.connect();

    console.log('Fetching table list from the public schema...');
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('Tables in the public schema:');
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.table_name}`);
    });

    client.release();
  } catch (error) {
    console.error('Error fetching table list:', error.message);
  } finally {
    await pool.end();
  }
})();