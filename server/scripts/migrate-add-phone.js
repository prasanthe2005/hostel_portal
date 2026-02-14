import pool from '../src/config/db.js';

async function addPhoneColumn() {
  const conn = await pool.getConnection();
  try {
    console.log('Checking if phone column exists in students table...');
    
    // Check if column exists
    const [columns] = await conn.query(`
      SHOW COLUMNS FROM students LIKE 'phone'
    `);
    
    if (columns.length > 0) {
      console.log('✓ Phone column already exists');
      return;
    }
    
    console.log('Adding phone column to students table...');
    await conn.query(`
      ALTER TABLE students 
      ADD COLUMN phone VARCHAR(20) AFTER department
    `);
    
    console.log('✓ Phone column added successfully!');
  } catch (err) {
    console.error('Error adding phone column:', err.message);
    throw err;
  } finally {
    conn.release();
    await pool.end();
  }
}

addPhoneColumn();
