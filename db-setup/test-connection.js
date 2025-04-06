// Script to test database connection
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure Neon to use WebSockets
neonConfig.webSocketConstructor = ws;

// Check if DATABASE_URL environment variable is set
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  console.error('Make sure to run this with the DATABASE_URL environment variable set');
  process.exit(1);
}

// Create a connection pool
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL
});

// Test the connection
async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await pool.query('SELECT current_timestamp as now');
    console.log(`Connection successful. Current database time: ${result.rows[0].now}`);
    
    // Check if any tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('\nExisting tables in the database:');
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    } else {
      console.log('\nNo tables found in the database. Run the setup script to create the schema.');
    }
    
    // Close the pool
    await pool.end();
  } catch (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
}

// Run the test
testConnection();
