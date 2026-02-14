import fs from 'fs/promises';
import pool from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function run(){
  try{
    const schema = await fs.readFile(new URL('../db/schema.sql', import.meta.url), 'utf8');
    const seed = await fs.readFile(new URL('../db/seed.sql', import.meta.url), 'utf8');
    const conn = await pool.getConnection();
    try{
      console.log('Running schema...');
      await conn.query(schema);
      console.log('Running seed...');
      await conn.query(seed);
      console.log('DB initialized successfully');
    }finally{ conn.release(); }
  }catch(err){
    console.error('Failed to initialize DB:', err.message);
    process.exit(1);
  }finally{
    process.exit(0);
  }
}

run();
