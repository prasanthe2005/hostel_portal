import pool from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function listStudents() {
  const conn = await pool.getConnection();
  try {
    const [students] = await conn.query('SELECT student_id, name, email, roll_number, department, created_at FROM students ORDER BY created_at DESC');
    
    console.log('\n=== All Students in Database ===\n');
    if (students.length === 0) {
      console.log('No students found.');
    } else {
      console.log(`Total students: ${students.length}\n`);
      students.forEach((s, idx) => {
        console.log(`${idx + 1}. ${s.name} (ID: ${s.student_id})`);
        console.log(`   Email: ${s.email}`);
        console.log(`   Roll: ${s.roll_number || 'N/A'}`);
        console.log(`   Dept: ${s.department || 'N/A'}`);
        console.log(`   Registered: ${s.created_at}`);
        console.log('');
      });
    }
  } catch(err) {
    console.error('Error:', err.message);
  } finally {
    conn.release();
    process.exit(0);
  }
}

listStudents();
