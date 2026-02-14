import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import studentRoutes from './routes/student.js';
import publicRoutes from './routes/public.js';
import pool from './config/db.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api', publicRoutes);

app.get('/health', (req,res)=>res.json({ok:true}));

const PORT = process.env.PORT || 4000;
app.listen(PORT, async ()=>{
  console.log('Server listening on', PORT);
  try{
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
