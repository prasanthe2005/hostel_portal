import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Student self-registration
export async function register(req,res){
  const {
    name, email, password, roll_number, year, department, address, phone,
    parent_contact, gender, residence_type, preferred_room_type
  } = req.body;
  
  if(!name || !email || !password) return res.status(400).json({error:'name, email, and password required'});
  
  const conn = await pool.getConnection();
  try{
    // Check if email already exists
    const [existing] = await conn.query('SELECT student_id FROM student WHERE email=? LIMIT 1',[email]);
    if(existing && existing.length>0) return res.status(400).json({error:'Email already registered'});
    
    const hash = await bcrypt.hash(password,10);
    const token = jwt.sign({student_id: 0, role:'student', name}, process.env.JWT_SECRET || 'secret', {expiresIn:'8h'});
    
    // Set allocation_status based on residence_type
    const allocationStatus = residence_type === 'DayScholar' ? 'Not Applicable' : 'Pending';
    
    const [r] = await conn.query(
      `INSERT INTO student (
        name, email, password, roll_number, year, department, address, phone,
        parent_contact, gender, residence_type, preferred_room_type, allocation_status,
        current_token, last_login
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())`,
      [
        name, email, hash, roll_number||null, year||null, department||null, address||null, phone||null,
        parent_contact||null, gender||null, residence_type||'Hosteller', preferred_room_type||'Non-AC', allocationStatus,
        token
      ]
    );
    
    const newToken = jwt.sign({student_id: r.insertId, role:'student', name}, process.env.JWT_SECRET || 'secret', {expiresIn:'8h'});
    await conn.query('UPDATE student SET current_token=? WHERE student_id=?', [newToken, r.insertId]);
    
    return res.json({
      token: newToken, 
      user: {
        student_id: r.insertId, 
        name, 
        email, 
        role: 'student', 
        roll_number, 
        year, 
        department, 
        address, 
        phone,
        parent_contact,
        gender,
        residence_type: residence_type||'Hosteller',
        preferred_room_type: preferred_room_type||'Non-AC',
        allocation_status: allocationStatus
      }
    });
  }catch(err){ res.status(500).json({error:err.message}); }finally{ conn.release(); }
}

export async function login(req,res){
  const {email,password} = req.body;
  if(!email || !password) return res.status(400).json({error:'email,password required'});
  const conn = await pool.getConnection();
  try{
    // try admin
    const [admins] = await conn.query('SELECT admin_id, name, email, password_hash FROM admins WHERE email=? LIMIT 1',[email]);
    if(admins && admins.length>0){
      const a = admins[0];
      const ok = await bcrypt.compare(password, a.password_hash || '');
      if(!ok) return res.status(400).json({error:'Invalid credentials'});
      const token = jwt.sign({admin_id: a.admin_id, role:'admin', name: a.name}, process.env.JWT_SECRET || 'secret', {expiresIn:'8h'});
      return res.json({token, user:{admin_id: a.admin_id, name: a.name, email: a.email, role:'admin'}});
    }

    // try student
    const [students] = await conn.query('SELECT student_id, name, email, password, roll_number, year, department, address, phone, parent_contact, gender, residence_type, preferred_room_type, allocation_status FROM student WHERE email=? LIMIT 1',[email]);
    if(!students || students.length===0) return res.status(400).json({error:'Invalid credentials'});
    const s = students[0];
    const ok = await bcrypt.compare(password, s.password || '');
    if(!ok) return res.status(400).json({error:'Invalid credentials'});
    const token = jwt.sign({student_id: s.student_id, role:'student', name: s.name}, process.env.JWT_SECRET || 'secret', {expiresIn:'8h'});
    
    // Update last_login and current_token
    await conn.query('UPDATE student SET last_login=NOW(), current_token=? WHERE student_id=?', [token, s.student_id]);
    
    return res.json({token, user:{student_id: s.student_id, name: s.name, email: s.email, role:'student', roll_number: s.roll_number, year: s.year, department: s.department, address: s.address, phone: s.phone, parent_contact: s.parent_contact, gender: s.gender, residence_type: s.residence_type, preferred_room_type: s.preferred_room_type, allocation_status: s.allocation_status}});
  }catch(err){ res.status(500).json({error:err.message}); }finally{ conn.release(); }
}
