import pool from '../src/config/db.js';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateHostelsTable() {
  try {
    console.log('Starting hostels table migration...');
    
    const migrationPath = path.join(__dirname, '../db/migrations/update_hostels_table.sql');
    const sql = await fs.readFile(migrationPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
        console.log('Executed:', statement.substring(0, 50) + '...');
      }
    }
    
    console.log('✅ Hostels table migration completed successfully!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    await pool.end();
    process.exit(1);
  }
}

migrateHostelsTable();
