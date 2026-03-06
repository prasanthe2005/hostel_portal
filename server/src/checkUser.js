import pool from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkUser() {
  const email = process.argv[2] || 'prasanth.cs23@bitsathy.ac.in';
  const conn = await pool.getConnection();
  try {
    const [students] = await conn.query('SELECT student_id, name, email, roll_number FROM student WHERE email=?', [email]);
    const [admins] = await conn.query('SELECT admin_id, name, email FROM admins WHERE email=?', [email]);
    
    console.log('\n=== Checking email:', email, '===\n');
    if (students && students.length > 0) {
      console.log('Found in STUDENTS table:');
      console.log(students[0]);
    } else {
      console.log('\u2717 NOT found in students table');
    }
    
    if (admins && admins.length > 0) {
      console.log('\nFound in ADMINS table:');
      console.log(admins[0]);
    } else {
      console.log('\u2717 NOT found in admins table');
    }
    
    if (students.length === 0 && admins.length === 0) {
      console.log('\n\u26A0 This email is NOT registered. Please register first.');
    }
  } catch(err) {
    console.error('Error:', err.message);
  } finally {
    conn.release();
    process.exit(0);
  }
}

checkUser();
