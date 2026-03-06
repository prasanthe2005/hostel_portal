import pool from './config/db.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function run(){
  const email = process.env.STUDENT_EMAIL || 'student@example.com';
  const password = process.env.STUDENT_PASS || 'student123';
  const name = process.env.STUDENT_NAME || 'Sample Student';
  const roll = process.env.STUDENT_ROLL || 'S001';
  const dept = process.env.STUDENT_DEPT || 'CS';
  const conn = await pool.getConnection();
  try{
    const [rows] = await conn.query('SELECT student_id FROM student WHERE email=? LIMIT 1',[email]);
    if(rows.length>0){
      console.log('Student already exists with email', email);
      return process.exit(0);
    }
    const hash = await bcrypt.hash(password,10);
    const [r] = await conn.query('INSERT INTO student (name,email,password,roll_number,department) VALUES (?,?,?,?,?)',[name,email,hash,roll,dept]);
    console.log('Created student id', r.insertId, 'email', email);
  }catch(err){ console.error(err.message); process.exit(1); }finally{ conn.release(); process.exit(0); }
}

run();
