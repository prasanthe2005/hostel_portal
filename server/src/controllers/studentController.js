import pool from '../config/db.js';

// Student dashboard: returns only data for authenticated student
export async function dashboard(req,res){
  // req.user should contain student_id
  const payload = req.user || {};
  const studentId = payload.student_id;
  if(!studentId) return res.status(401).json({error:'Unauthorized'});
  const conn = await pool.getConnection();
  try{
    const query = `
      SELECT s.student_id, s.name, s.email, s.roll_number, s.year, s.department, s.address, s.phone,
        s.parent_contact, s.gender, s.residence_type, s.preferred_room_type, s.allocation_status,
        s.created_at, s.last_login, h.hostel_name, r.room_number, r.type, ra.allocated_at, f.floor_number
      FROM student s
      LEFT JOIN room_allocations ra ON s.student_id = ra.student_id
      LEFT JOIN rooms r ON ra.room_id = r.room_id
      LEFT JOIN floors f ON r.floor_id = f.floor_id
      LEFT JOIN hostels h ON r.hostel_id = h.hostel_id
      WHERE s.student_id = ?
    `;
    const [rows] = await conn.query(query, [studentId]);
    // return single row (or empty)
    res.json(rows[0] || null);
  }catch(err){ res.status(500).json({error:err.message}); }finally{ conn.release(); }
}

export async function requestRoomChange(req,res){
  const payload = req.user || {};
  const studentId = payload.student_id;
  if(!studentId) return res.status(401).json({error:'Unauthorized'});
  const {choice1,choice2,choice3,reason} = req.body;
  if(!choice1 && !choice2 && !choice3) return res.status(400).json({error:'At least one choice required'});
  if(!reason || reason.trim() === '') return res.status(400).json({error:'Reason is required'});
  const conn = await pool.getConnection();
  try{
    // Check if student already has a pending request
    const [existing] = await conn.query('SELECT * FROM room_change_requests WHERE student_id=? AND status="pending"',[studentId]);
    if(existing.length > 0) return res.status(400).json({error:'You already have a pending room change request'});
    
    const [r] = await conn.query('INSERT INTO room_change_requests (student_id,choice1,choice2,choice3,reason) VALUES (?,?,?,?,?)',[studentId,choice1||null,choice2||null,choice3||null,reason]);
    res.json({request_id:r.insertId,message:'Room change request submitted successfully'});
  }catch(err){ res.status(500).json({error:err.message}); }finally{ conn.release(); }
}
