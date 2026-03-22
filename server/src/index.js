import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import studentRoutes from './routes/student.js';
import publicRoutes from './routes/public.js';
import complaintRoutes from './routes/complaint.js';
import caretakerRoutes from './routes/caretaker.js';
import wardenRoutes from './routes/warden.js';
import pool from './config/db.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/caretaker', caretakerRoutes);
app.use('/api/warden', wardenRoutes);
app.use('/api', publicRoutes);

app.get('/health', (req,res)=>res.json({ok:true}));

async function ensureWardenTable() {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS wardens (
        warden_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        hostel_id BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hostel_id) REFERENCES hostels(hostel_id) ON DELETE RESTRICT,
        INDEX idx_warden_hostel (hostel_id),
        INDEX idx_warden_email (email)
      )
    `);
    console.log('Wardens table is ready');
  } finally {
    conn.release();
  }
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, async ()=>{
  console.log('Server listening on', PORT);
  try{
    await ensureWardenTable();
    const conn = await pool.getConnection();
    console.log('DB connected');
    conn.release();
  }catch(err){ console.error('DB connection failed:', err.message); }
  // log registered routes for debugging
  try{
    const routes = [];
    app._router.stack.forEach(mw=>{
      if(mw.route){
        const methods = Object.keys(mw.route.methods).join(',').toUpperCase();
        routes.push(`${methods} ${mw.route.path}`);
      }else if(mw.name === 'router' && mw.handle && mw.handle.stack){
        mw.handle.stack.forEach(r=>{
          if(r.route){
            const methods = Object.keys(r.route.methods).join(',').toUpperCase();
            routes.push(`${methods} ${r.route.path}`);
          }
        });
      }
    });
    console.log('Registered routes:\n', routes.join('\n'));
  }catch(e){ console.error('Could not list routes', e.message); }
});
