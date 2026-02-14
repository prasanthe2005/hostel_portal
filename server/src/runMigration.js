import pool from './config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const conn = await pool.getConnection();
  try {
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../db/migrations/add_reason_to_room_change_requests.sql'),
      'utf8'
    );
    
    console.log('Running migration: add_reason_to_room_change_requests.sql');
    await conn.query(migrationSQL);
    console.log('✓ Migration completed successfully');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('✓ Migration already applied (reason column already exists)');
    } else {
      console.error('Error running migration:', err.message);
      throw err;
    }
  } finally {
    conn.release();
    process.exit(0);
  }
}

runMigration();
