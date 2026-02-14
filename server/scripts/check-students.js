import pool from '../src/config/db.js';

async function listAllStudents() {
  const conn = await pool.getConnection();
  try {
    const [students] = await conn.query('SELECT student_id, name, email, roll_number, year, department FROM student ORDER BY student_id');
    console.log('\n📋 All Students in Database:\n');
    if (students.length === 0) {
      console.log('No students found.');
    } else {
      console.table(students);
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    conn.release();
    await pool.end();
  }
}

listAllStudents();
