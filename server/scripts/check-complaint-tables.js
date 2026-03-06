import pool from '../src/config/db.js';

async function checkTables() {
  const conn = await pool.getConnection();
  try {
    console.log('=== COMPLAINTS TABLE STRUCTURE ===\n');
    const [complaints] = await conn.query('DESCRIBE complaints');
    console.table(complaints, ['Field', 'Type', 'Null', 'Key', 'Default']);
    
    console.log('\n=== CARETAKERS TABLE STRUCTURE ===\n');
    const [caretakers] = await conn.query('DESCRIBE caretakers');
    console.table(caretakers, ['Field', 'Type', 'Null', 'Key', 'Default']);
    
  } finally {
    conn.release();
    await pool.end();
  }
}

checkTables().catch(console.error);
