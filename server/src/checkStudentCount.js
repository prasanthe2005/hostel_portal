import pool from './config/db.js';

async function checkStudents() {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT student_id, name, email, roll_number, department FROM students ORDER BY student_id DESC');
    console.log('\n=== Direct Database Query ===');
    console.log('Database: hostel_db');
    console.log('Total students:', rows.length);
    console.log('\nStudents:');
    rows.forEach(r => {
      console.log(`  ID ${r.student_id}: ${r.name} (${r.email})`);
    });
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    conn.release();
    process.exit(0);
  }
}

checkStudents();
