import pool from './config/db.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function run(){
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASS || 'admin123';
  const name = process.env.ADMIN_NAME || 'Admin';
  const conn = await pool.getConnection();
  try{
    const [rows] = await conn.query('SELECT admin_id FROM admins WHERE email=? LIMIT 1',[email]);
    if(rows.length>0){
      console.log('Admin user already exists with email', email);
      return process.exit(0);
    }
    const hash = await bcrypt.hash(password,10);
    const [r] = await conn.query('INSERT INTO admins (name,email,password_hash) VALUES (?,?,?)',[name,email,hash]);
    console.log('Created admin user id', r.insertId, 'email', email);
  }catch(err){ console.error(err.message); process.exit(1); }finally{ conn.release(); process.exit(0); }
}

run();
