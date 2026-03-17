import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
// Student self-registration
export async function register(req,res){
  console.log('\n=== 📝 REGISTER REQUEST RECEIVED ===');
  console.log('Request Body:', JSON.stringify(req.body, null, 2));

  const {
    name, email, password, roll_number, year, department, address, phone,
    parent_contact, gender, residence_type, preferred_room_type
  } = req.body;
  
  if(!name || !email || !password) {
    console.log('❌ Validation failed: Missing required fields');
    return res.status(400).json({error:'name, email, and password required'});
  }
  
  console.log('✅ Validation passed');
  console.log('📧 Email:', email);
  console.log('👤 Name:', name);
  
  const conn = await pool.getConnection();
  console.log('🔌 Database connection established');
  
  try{
    console.log('🔍 Checking if email already exists...');
    // Check if email already exists
    const [existing] = await conn.query('SELECT student_id FROM student WHERE email=? LIMIT 1',[email]);
    if(existing && existing.length>0) {
      console.log('❌ Email already registered:', email);
      return res.status(400).json({error:'Email already registered'});
    }
    console.log('✅ Email is available');
    
    console.log('🔐 Hashing password...');
    const hash = await bcrypt.hash(password,10);
    console.log('✅ Password hashed');
    
    // Set allocation_status based on residence_type
    const allocationStatus = residence_type === 'DayScholar' ? 'Not Applicable' : 'Pending';
    console.log('📊 Allocation status:', allocationStatus);
    
    console.log('💾 Inserting student into database...');
    const [r] = await conn.query(
      `INSERT INTO student (
        name, email, password, roll_number, year, department, address, phone,
        parent_contact, gender, residence_type, preferred_room_type, allocation_status,
        last_login
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())`,
      [
        name, email, hash, roll_number||null, year||null, department||null, address||null, phone||null,
        parent_contact||null, gender||null, residence_type||'Hosteller', preferred_room_type||'Non-AC', allocationStatus
      ]
    );
    console.log('✅ Student created with ID:', r.insertId);
    
    const response = {
      message: 'User created successfully',
      user: {
        student_id: r.insertId, 
        name, 
        email, 
        role: 'student'
      }
    };
    
    console.log('📤 Sending response to client');
    console.log('Response:', JSON.stringify(response, null, 2));
    console.log('=== ✅ REGISTRATION SUCCESS ===\n');
    
    return res.json(response);
  }catch(err){ 
    console.log('❌ ERROR occurred:', err.message);
    console.log('Full error:', err);
    console.log('=== ❌ REGISTRATION FAILED ===\n');
    res.status(500).json({error:err.message}); 
  }finally{ 
    conn.release();
    console.log('🔌 Database connection released');
  }
}

export async function login(req,res){
  console.log('\n=== 🔐 LOGIN REQUEST RECEIVED ===');
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  
  const {email,password} = req.body;
  if(!email || !password) {
    console.log('❌ Validation failed: Missing email or password');
    return res.status(400).json({error:'email,password required'});
  }
  
  console.log('✅ Validation passed');
  console.log('📧 Email:', email);
  
  const conn = await pool.getConnection();
  console.log('🔌 Database connection established');
  
  try{
    console.log('🔍 Checking for admin account...');
    // try admin
    const [admins] = await conn.query('SELECT admin_id, name, email, password_hash FROM admins WHERE email=? LIMIT 1',[email]);
    if(admins && admins.length>0){
      console.log('✅ Admin account found');
      const a = admins[0];
      console.log('🔐 Verifying password...');
      const ok = await bcrypt.compare(password, a.password_hash || '');
      if(!ok) {
        console.log('❌ Invalid password for admin');
        console.log('=== ❌ LOGIN FAILED ===\n');
        return res.status(400).json({error:'Invalid credentials'});
      }
      console.log('✅ Password verified');
      console.log('🎫 Generating admin token...');
      const token = jwt.sign({admin_id: a.admin_id, role:'admin', name: a.name}, process.env.JWT_SECRET || 'secret', {expiresIn:'8h'});
      console.log('✅ Admin token generated');
      console.log('🔑 TOKEN:', token);
      
      const response = {token, user:{admin_id: a.admin_id, name: a.name, email: a.email, role:'admin'}};
      console.log('📤 Sending admin response to client');
      console.log('Response:', JSON.stringify(response, null, 2));
      console.log('=== ✅ ADMIN LOGIN SUCCESS ===\n');
      return res.json(response);
    }
    console.log('ℹ️ Not an admin, checking student account...');

    console.log('🔍 Checking for student account...');
    // try student
    const [students] = await conn.query('SELECT student_id, name, email, password, roll_number, year, department, address, phone, parent_contact, gender, residence_type, preferred_room_type, allocation_status FROM student WHERE email=? LIMIT 1',[email]);
    if(!students || students.length===0) {
      console.log('❌ No account found with this email');
      console.log('=== ❌ LOGIN FAILED ===\n');
      return res.status(400).json({error:'Invalid credentials'});
    }
    console.log('✅ Student account found');
    const s = students[0];
    console.log('🔐 Verifying password...');
    const ok = await bcrypt.compare(password, s.password || '');
    if(!ok) {
      console.log('❌ Invalid password for student');
      console.log('=== ❌ LOGIN FAILED ===\n');
      return res.status(400).json({error:'Invalid credentials'});
    }
    console.log('✅ Password verified');
    console.log('🎫 Generating student token...');
    const token = jwt.sign({student_id: s.student_id, role:'student', name: s.name}, process.env.JWT_SECRET || 'secret', {expiresIn:'8h'});
    console.log('✅ Student token generated');
    console.log('🔑 TOKEN:', token);
    
    console.log('💾 Updating last_login and current_token...');
    // Update last_login and current_token
    await conn.query('UPDATE student SET last_login=NOW(), current_token=? WHERE student_id=?', [token, s.student_id]);
    console.log('✅ Database updated');
    
    const response = {token, user:{student_id: s.student_id, name: s.name, email: s.email, role:'student', roll_number: s.roll_number, year: s.year, department: s.department, address: s.address, phone: s.phone, parent_contact: s.parent_contact, gender: s.gender, residence_type: s.residence_type, preferred_room_type: s.preferred_room_type, allocation_status: s.allocation_status}};
    console.log('📤 Sending student response to client');
    console.log('Response:', JSON.stringify(response, null, 2));
    console.log('=== ✅ STUDENT LOGIN SUCCESS ===\n');
    return res.json(response);
  }catch(err){ 
    console.log('❌ ERROR occurred:', err.message);
    console.log('Full error:', err);
    console.log('=== ❌ LOGIN FAILED ===\n');
    res.status(500).json({error:err.message}); 
  }finally{ 
    conn.release();
    console.log('🔌 Database connection released');
  }
}
