import pool from '../src/config/db.js';

async function checkColumnTypes() {
  const conn = await pool.getConnection();
  try {
    console.log('\n🔍 Checking Column Types...\n');
    
    console.log('1️⃣ Student table:');
    const [studentCols] = await conn.query("DESCRIBE student");
    const studentId = studentCols.find(c => c.Field === 'student_id');
    console.log('   student_id:', studentId.Type, studentId.Key);
    
    console.log('\n2️⃣ Complaints table:');
    const [complaintCols] = await conn.query("DESCRIBE complaints");
    const complaintStudentId = complaintCols.find(c => c.Field === 'student_id');
    const complaintRoomId = complaintCols.find(c => c.Field === 'room_id');
    console.log('   student_id:', complaintStudentId.Type);
    console.log('   room_id:', complaintRoomId.Type);
    
    console.log('\n3️⃣ Rooms table:');
    const [roomCols] = await conn.query("DESCRIBE rooms");
    const roomId = roomCols.find(c => c.Field === 'room_id');
    console.log('   room_id:', roomId.Type, roomId.Key);
    
    console.log('\n4️⃣ Foreign keys on complaints:');
    const [fks] = await conn.query(`
      SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'hostel_db' AND TABLE_NAME = 'complaints' AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    fks.forEach(fk => {
      console.log(`   ${fk.CONSTRAINT_NAME}: ${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
    });
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    conn.release();
    process.exit(0);
  }
}

checkColumnTypes();
