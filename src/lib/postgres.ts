import { Pool } from "pg";

// Create a simplified PostgreSQL connection pool
export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "airdrop_manager",
  password: "postgres",
  port: 5432,
});

// Test the connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    client.release();
    return true;
  } catch (error) {
    return false;
  }
}

// Initialize the database with required tables
export async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        logo TEXT,
        link TEXT,
        twitter_link TEXT,
        is_active BOOLEAN DEFAULT true,
        last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        join_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        chain VARCHAR(50),
        stage VARCHAR(50),
        type VARCHAR(50),
        cost NUMERIC(10, 2) DEFAULT 0
      )
    `);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
}
