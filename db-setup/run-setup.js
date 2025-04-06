// Script to run the database setup script
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure Neon to use WebSockets
neonConfig.webSocketConstructor = ws;

// Get the directory name for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Read the setup SQL file
const setupSql = fs.readFileSync(path.join(__dirname, 'setup.sql'), 'utf8');

// Run the setup script
async function runSetup() {
  const client = await pool.connect();
  try {
    console.log('Running database setup script...');
    console.log('This may take a few moments...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    try {
      // Execute the setup script
      await client.query(setupSql);
      
      // Commit the transaction
      await client.query('COMMIT');
      console.log('Setup completed successfully!');
      
      // Count the rows in each table to verify setup
      const tables = ['users', 'markets', 'game_types', 'market_games', 'bets', 'transactions'];
      console.log('\nVerifying data:');
      
      for (const table of tables) {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`- ${table}: ${result.rows[0].count} rows`);
      }
    } catch (err) {
      // Rollback the transaction in case of an error
      await client.query('ROLLBACK');
      console.error('Error running setup script:', err);
      process.exit(1);
    }
  } finally {
    // Release the client back to the pool
    client.release();
    // Close the pool
    await pool.end();
  }
}

// Run the setup
runSetup();
