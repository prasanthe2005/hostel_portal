import pool from '../src/config/db.js';

async function renameStudentsTable() {
  const conn = await pool.getConnection();
  try {
    console.log('Checking if students table exists...');
    
    // Check if students table exists
    const [tables] = await conn.query(`
      SHOW TABLES LIKE 'students'
    `);
    
    if (tables.length === 0) {
      console.log('✓ students table does not exist, checking for student table...');
      const [studentTable] = await conn.query(`SHOW TABLES LIKE 'student'`);
      if (studentTable.length > 0) {
        console.log('✓ student table already exists. Migration not needed.');
        return;
      } else {
        console.log('❌ Neither students nor student table exists. Please run the schema setup first.');
        return;
      }
    }
    
    console.log('Renaming students table to student...');
    await conn.query(`RENAME TABLE students TO student`);
    
    console.log('✓ Successfully renamed students table to student!');
  } catch (err) {
    console.error('❌ Error renaming table:', err.message);
    throw err;
  } finally {
    conn.release();
    await pool.end();
  }
}

renameStudentsTable();
