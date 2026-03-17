import pool from '../config/db.js';

// Student dashboard: returns only data for authenticated student
export async function dashboard(req,res){
  console.log('\n=== 🎓 STUDENT DASHBOARD REQUEST ===');
  // req.user should contain student_id
  const payload = req.user || {};
  const studentId = payload.student_id;
  console.log('Student ID from token:', studentId);
  console.log('User payload:', payload);
  
  if(!studentId) {
    console.log('❌ No student_id in token');
    return res.status(401).json({error:'Unauthorized'});
  }
  
  console.log('🔌 Connecting to database...');
  const conn = await pool.getConnection();
  try{
    console.log('🔍 Fetching student data...');
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
    const studentData = rows[0] || null;
    console.log('✅ Student data retrieved:', studentData ? studentData.name : 'null');
    
    if (studentData) {
      console.log('🔍 Checking for pending room change requests...');
      // Check for pending room change request
      const [pendingRequests] = await conn.query(
        'SELECT request_id, created_at FROM room_change_requests WHERE student_id = ? AND status = "pending" ORDER BY created_at DESC LIMIT 1',
        [studentId]
      );
      
      if (pendingRequests.length > 0) {
        console.log('✅ Student has pending request:', pendingRequests[0].request_id);
        studentData.has_pending_request = true;
        studentData.pending_request_id = pendingRequests[0].request_id;
        studentData.pending_request_date = pendingRequests[0].created_at;
      } else {
        console.log('ℹ️ No pending requests');
        studentData.has_pending_request = false;
      }
    }
    
    console.log('📤 Sending dashboard response');
    console.log('Response:', JSON.stringify(studentData, null, 2));
    console.log('=== ✅ DASHBOARD SUCCESS ===\n');
    res.json(studentData);
  }catch(err){ 
    console.log('❌ ERROR:', err.message);
    console.log('=== ❌ DASHBOARD FAILED ===\n');
    res.status(500).json({error:err.message}); 
  }finally{ conn.release(); }
}

export async function requestRoomChange(req,res){
  console.log('\n=== 🔄 ROOM CHANGE REQUEST ===');
  const payload = req.user || {};
  const studentId = payload.student_id;
  console.log('Student ID:', studentId);
  console.log('Request body:', req.body);
  
  if(!studentId) {
    console.log('❌ Unauthorized - no student_id');
    return res.status(401).json({error:'Unauthorized'});
  }
  
  const {choice1, choice2, choice3, reason} = req.body;
  
  if(!choice1 && !choice2 && !choice3) {
    console.log('❌ No choices provided');
    return res.status(400).json({error:'At least one choice required'});
  }
  
  if(!reason || reason.trim() === '') {
    console.log('❌ No reason provided');
    return res.status(400).json({error:'Reason is required'});
  }
  
  console.log('✅ Validation passed');
  console.log('Choices:', {choice1, choice2, choice3});
  console.log('Reason:', reason);
  
  const conn = await pool.getConnection();
  try{
    console.log('🔍 Checking for existing pending requests...');
    // Check if student already has a pending request
    const [existing] = await conn.query('SELECT * FROM room_change_requests WHERE student_id=? AND status="pending"',[studentId]);
    
    if(existing.length > 0) {
      console.log('❌ Student already has a pending request');
      console.log('=== ❌ REQUEST FAILED ===\n');
      return res.status(400).json({error:'You already have a pending room change request'});
    }
    
    console.log('✅ No existing pending requests');
    console.log('💾 Inserting room change request...');
    
    const [r] = await conn.query('INSERT INTO room_change_requests (student_id,choice1,choice2,choice3,reason) VALUES (?,?,?,?,?)',[studentId,choice1||null,choice2||null,choice3||null,reason]);
    
    console.log('✅ Request created with ID:', r.insertId);
    
    const response = {request_id:r.insertId,message:'Room change request submitted successfully'};
    console.log('📤 Sending response:', response);
    console.log('=== ✅ REQUEST SUCCESS ===\n');
    
    res.json(response);
  }catch(err){ 
    console.log('❌ ERROR:', err.message);
    console.log('=== ❌ REQUEST FAILED ===\n');
    res.status(500).json({error:err.message}); 
  }finally{ 
    conn.release(); 
  }
}
