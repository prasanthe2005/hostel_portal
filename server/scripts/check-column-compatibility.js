import pool from '../src/config/db.js';

async function checkColumnTypes() {
  console.log('🔍 Checking column types for foreign key compatibility...\n');
  
  const conn = await pool.getConnection();
  try {
    // Check student table structure
    console.log('📋 Student table structure:');
    const [studentCols] = await conn.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'hostel_db' 
        AND TABLE_NAME = 'student'
        AND COLUMN_NAME = 'student_id'
    `);
    console.table(studentCols);
    
    // Check room_allocations table structure
    console.log('\n📋 Room_allocations table structure:');
    const [allocationCols] = await conn.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'hostel_db' 
        AND TABLE_NAME = 'room_allocations'
        AND COLUMN_NAME = 'student_id'
    `);
    console.table(allocationCols);
    
    // Check all constraints on room_allocations
    console.log('\n🔗 Current foreign key constraints on room_allocations:');
    const [constraints] = await conn.query(`
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'hostel_db'
        AND TABLE_NAME = 'room_allocations'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    console.table(constraints);
    
    // Compare the types
    if (studentCols.length > 0 && allocationCols.length > 0) {
      const studentCol = studentCols[0];
      const allocCol = allocationCols[0];
      
      console.log('\n⚖️  Comparison:');
      console.log(`student.student_id:              ${studentCol.COLUMN_TYPE}`);
      console.log(`room_allocations.student_id:     ${allocCol.COLUMN_TYPE}`);
      
      if (studentCol.COLUMN_TYPE === allocCol.COLUMN_TYPE) {
        console.log('✅ Column types match!');
      } else {
        console.log('❌ Column types DO NOT match! This is the problem.');
        console.log('\n🔧 Solution: Change room_allocations.student_id to match student.student_id');
      }
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    conn.release();
    await pool.end();
  }
}

checkColumnTypes();
