import pool from '../config/db.js';

export async function createHostel(req,res){
  const {
    hostel_name, 
    location = 'Main Campus', 
    floors = [], 
    icon = 'home',
    bg_color = 'bg-blue-50 dark:bg-blue-900/20',
    text_color = 'text-blue-600'
  } = req.body;
  
  if(!hostel_name) return res.status(400).json({error:'hostel_name required'});
  
  const conn = await pool.getConnection();
  try{
    await conn.beginTransaction();
    
    // Calculate total floors and total rooms
    const total_floors = floors.length || 0;
    const total_rooms = floors.reduce((sum, f) => sum + (f.rooms || 0), 0);
    
    // Insert hostel
    const [r] = await conn.query(
      'INSERT INTO hostels (hostel_name, location, total_floors, total_rooms, icon, bg_color, text_color) VALUES (?,?,?,?,?,?,?)',
      [hostel_name, location, total_floors, total_rooms, icon, bg_color, text_color]
    );
    const hostelId = r.insertId;
    
    // Insert floors and rooms
    for(let i = 0; i < floors.length; i++){
      const floorNum = i + 1;
      const floorConfig = floors[i];
      const roomsOnFloor = floorConfig.rooms || floorConfig || 0;
      const roomType = floorConfig.type || 'Non-AC'; // Get room type from floor config
      
      const [fr] = await conn.query(
        'INSERT INTO floors (hostel_id, floor_number) VALUES (?,?)',
        [hostelId, floorNum]
      );
      const floorId = fr.insertId;
      
      // Create rooms for this floor with specified type
      // AC rooms have capacity 2, Non-AC rooms have capacity 4
      const roomCapacity = roomType === 'AC' ? 2 : 4;
      for(let rnum = 1; rnum <= roomsOnFloor; rnum++){
        const roomNumber = `${floorNum}${String(rnum).padStart(2, '0')}`;
        await conn.query(
          'INSERT INTO rooms (hostel_id, floor_id, room_number, type, capacity) VALUES (?,?,?,?,?)',
          [hostelId, floorId, roomNumber, roomType, roomCapacity]
        );
      }
    }
    
    await conn.commit();
    
    // Fetch and return the created hostel
    const [hostel] = await conn.query('SELECT * FROM hostels WHERE hostel_id = ?', [hostelId]);
    res.json(hostel[0]);
  }catch(err){ 
    await conn.rollback();
    res.status(500).json({error:err.message}); 
  }finally{ 
    conn.release(); 
  }
}

export async function listHostels(req,res){
  const conn = await pool.getConnection();
  try{
    const [hostels] = await conn.query(`
      SELECT h.*, 
        COUNT(DISTINCT r.room_id) as rooms_count,
        COUNT(DISTINCT ra.allocation_id) as occupied_count
      FROM hostels h
      LEFT JOIN rooms r ON h.hostel_id = r.hostel_id
      LEFT JOIN room_allocations ra ON r.room_id = ra.room_id
      GROUP BY h.hostel_id
      ORDER BY h.created_at DESC
    `);
    
    // Calculate occupancy percentage for each hostel
    const hostelsWithOccupancy = hostels.map(h => ({
      ...h,
      occupancy: h.total_rooms > 0 ? Math.round((h.occupied_count / h.total_rooms) * 100) : 0
    }));
    
    res.json(hostelsWithOccupancy);
  }catch(err){ res.status(500).json({error:err.message}); }finally{ conn.release(); }
}

export async function listStudents(req,res){
  const conn = await pool.getConnection();
  try{
    const [rows] = await conn.query(`
      SELECT s.student_id, s.name, s.email, s.roll_number, s.year, s.department, s.address, s.phone,
        s.parent_contact, s.gender, s.residence_type, s.preferred_room_type, s.allocation_status,
        s.created_at, s.last_login,
        h.hostel_name, r.room_number, r.type as room_type
      FROM student s
      LEFT JOIN room_allocations ra ON s.student_id = ra.student_id
      LEFT JOIN rooms r ON ra.room_id = r.room_id
      LEFT JOIN hostels h ON r.hostel_id = h.hostel_id
      ORDER BY s.created_at DESC
    `);
    res.json(rows);
  }catch(err){ res.status(500).json({error:err.message}); }finally{ conn.release(); }
}

export async function updateHostel(req,res){
  const {hostel_id} = req.params;
  const {hostel_name, location, icon, bg_color, text_color} = req.body;
  
  if(!hostel_id) return res.status(400).json({error:'hostel_id required'});
  
  const conn = await pool.getConnection();
  try{
    const updates = [];
    const values = [];
    
    if(hostel_name) { updates.push('hostel_name = ?'); values.push(hostel_name); }
    if(location) { updates.push('location = ?'); values.push(location); }
    if(icon) { updates.push('icon = ?'); values.push(icon); }
    if(bg_color) { updates.push('bg_color = ?'); values.push(bg_color); }
    if(text_color) { updates.push('text_color = ?'); values.push(text_color); }
    
    if(updates.length === 0) return res.status(400).json({error:'No fields to update'});
    
    values.push(hostel_id);
    await conn.query(`UPDATE hostels SET ${updates.join(', ')} WHERE hostel_id = ?`, values);
    
    const [hostel] = await conn.query('SELECT * FROM hostels WHERE hostel_id = ?', [hostel_id]);
    res.json(hostel[0]);
  }catch(err){ res.status(500).json({error:err.message}); }finally{ conn.release(); }
}

export async function deleteHostel(req,res){
  const {hostel_id} = req.params;
  if(!hostel_id) return res.status(400).json({error:'hostel_id required'});
  
  const conn = await pool.getConnection();
  try{
    // Check if hostel has rooms with allocations
    const [allocations] = await conn.query(
      'SELECT COUNT(*) as count FROM room_allocations ra JOIN rooms r ON ra.room_id = r.room_id WHERE r.hostel_id = ?',
      [hostel_id]
    );
    
    if(allocations[0].count > 0){
      return res.status(400).json({error:'Cannot delete hostel with allocated rooms. Deallocate students first.'});
    }
    
    await conn.query('DELETE FROM hostels WHERE hostel_id = ?', [hostel_id]);
    res.json({message:'Hostel deleted successfully'});
  }catch(err){ res.status(500).json({error:err.message}); }finally{ conn.release(); }
}

export async function listRooms(req,res){
  const conn = await pool.getConnection();
  try{
    const [rows] = await conn.query(`
      SELECT r.room_id, r.room_number, r.type, r.capacity,
        h.hostel_name, h.hostel_id,
        f.floor_number,
        (SELECT COUNT(*) FROM room_allocations ra WHERE ra.room_id = r.room_id) as assigned,
        CASE 
          WHEN (SELECT COUNT(*) FROM room_allocations ra WHERE ra.room_id = r.room_id) >= r.capacity THEN 'occupied'
          ELSE 'available'
        END as status
      FROM rooms r
      LEFT JOIN hostels h ON r.hostel_id = h.hostel_id
      LEFT JOIN floors f ON r.floor_id = f.floor_id
      ORDER BY h.hostel_name, f.floor_number, r.room_number
    `);
    res.json(rows);
  }catch(err){ res.status(500).json({error:err.message}); }finally{ conn.release(); }
}

export async function createRoom(req, res) {
  const { hostel_id, floor_id, room_number, type = 'Non-AC', capacity } = req.body;
  
  if(!hostel_id || !room_number) return res.status(400).json({error:'hostel_id and room_number required'});
  
  // Set default capacity based on room type: AC = 2, Non-AC = 4
  const roomCapacity = capacity !== undefined ? capacity : (type === 'AC' ? 2 : 4);
  
  const conn = await pool.getConnection();
  try{
    const [r] = await conn.query(
      'INSERT INTO rooms (hostel_id, floor_id, room_number, type, capacity) VALUES (?,?,?,?,?)',
      [hostel_id, floor_id || null, room_number, type, roomCapacity]
    );
    
    // Update hostel total_rooms count
    await conn.query(
      'UPDATE hostels SET total_rooms = (SELECT COUNT(*) FROM rooms WHERE hostel_id = ?) WHERE hostel_id = ?',
      [hostel_id, hostel_id]
    );
    
    const [room] = await conn.query('SELECT * FROM rooms WHERE room_id = ?', [r.insertId]);
    res.json(room[0]);
  }catch(err){ res.status(500).json({error:err.message}); }finally{ conn.release(); }
}

export async function updateRoom(req,res){
  const {room_id} = req.params;
  const {room_number, type, capacity} = req.body;
  
  if(!room_id) return res.status(400).json({error:'room_id required'});
  
  const conn = await pool.getConnection();
  try{
    // Check if room type is being changed
    if(type){
      // Check if room has assigned students
      const [allocations] = await conn.query(
        'SELECT COUNT(*) as count FROM room_allocations WHERE room_id = ?',
        [room_id]
      );
      
      if(allocations[0].count > 0){
        return res.status(400).json({
          error: 'Cannot convert room type when students are already assigned. Please deallocate students first.'
        });
      }
    }
    
    const updates = [];
    const values = [];
    
    if(room_number) { updates.push('room_number = ?'); values.push(room_number); }
    if(type) { updates.push('type = ?'); values.push(type); }
    if(capacity !== undefined) { updates.push('capacity = ?'); values.push(capacity); }
    
    if(updates.length === 0) return res.status(400).json({error:'No fields to update'});
    
    values.push(room_id);
    await conn.query(`UPDATE rooms SET ${updates.join(', ')} WHERE room_id = ?`, values);
    
    const [room] = await conn.query('SELECT * FROM rooms WHERE room_id = ?', [room_id]);
    res.json(room[0]);
  }catch(err){ res.status(500).json({error:err.message}); }finally{ conn.release(); }
}

export async function deleteRoom(req,res){
  const {room_id} = req.params;
  if(!room_id) return res.status(400).json({error:'room_id required'});
  
  const conn = await pool.getConnection();
  try{
    // Check if room has allocations
    const [allocations] = await conn.query(
      'SELECT COUNT(*) as count FROM room_allocations WHERE room_id = ?',
      [room_id]
    );
    
    if(allocations[0].count > 0){
      return res.status(400).json({error:'Cannot delete room with students allocated. Deallocate students first.'});
    }
    
    // Get hostel_id before deletion to update total_rooms
    const [room] = await conn.query('SELECT hostel_id FROM rooms WHERE room_id = ?', [room_id]);
    const hostel_id = room[0]?.hostel_id;
    
    await conn.query('DELETE FROM rooms WHERE room_id = ?', [room_id]);
    
    // Update hostel total_rooms count
    if(hostel_id){
      await conn.query(
        'UPDATE hostels SET total_rooms = (SELECT COUNT(*) FROM rooms WHERE hostel_id = ?) WHERE hostel_id = ?',
        [hostel_id, hostel_id]
      );
    }
    
    res.json({message:'Room deleted successfully'});
  }catch(err){ res.status(500).json({error:err.message}); }finally{ conn.release(); }
}

export async function allocateRoomsFCFS(req,res){
  const conn = await pool.getConnection();
  try{
    await conn.beginTransaction();
    
    let allocatedCount = 0;
    let acAllocated = 0;
    let nonAcAllocated = 0;
    
    // STEP 1: Process AC Room Allocations (Separate Queue)
    // Find Hostellers wanting AC rooms, not yet allocated, ordered by registration date (FCFS)
    const [acStudents] = await conn.query(`
      SELECT student_id, name, preferred_room_type 
      FROM student 
      WHERE residence_type = 'Hosteller' 
        AND preferred_room_type = 'AC'
        AND allocation_status = 'Pending'
        AND student_id NOT IN (SELECT student_id FROM room_allocations)
      ORDER BY created_at ASC
    `);
    
    // Find available AC rooms with capacity
    const [acRooms] = await conn.query(`
      SELECT r.room_id, r.capacity, r.type, COUNT(ra.student_id) AS assigned
      FROM rooms r
      LEFT JOIN room_allocations ra ON ra.room_id = r.room_id
      WHERE r.type = 'AC'
      GROUP BY r.room_id
      HAVING assigned < r.capacity
      ORDER BY r.created_at ASC
    `);
    
    const acAvailable = acRooms.map(r => ({id: r.room_id, remain: r.capacity - r.assigned}));
    let acRoomIdx = 0;
    
    for(const student of acStudents){
      while(acRoomIdx < acAvailable.length && acAvailable[acRoomIdx].remain <= 0) acRoomIdx++;
      if(acRoomIdx >= acAvailable.length) break; // No more AC rooms
      
      // Allocate AC room to student
      await conn.query(
        'INSERT INTO room_allocations (student_id, room_id) VALUES (?,?)',
        [student.student_id, acAvailable[acRoomIdx].id]
      );
      
      // Update student allocation status
      await conn.query(
        "UPDATE student SET allocation_status = 'Allocated' WHERE student_id = ?",
        [student.student_id]
      );
      
      acAvailable[acRoomIdx].remain -= 1;
      acAllocated++;
      allocatedCount++;
    }
    
    // STEP 2: Process Non-AC Room Allocations (Separate Queue)
    // Find Hostellers wanting Non-AC rooms, not yet allocated, ordered by registration date (FCFS)
    const [nonAcStudents] = await conn.query(`
      SELECT student_id, name, preferred_room_type 
      FROM student 
      WHERE residence_type = 'Hosteller' 
        AND preferred_room_type = 'Non-AC'
        AND allocation_status = 'Pending'
        AND student_id NOT IN (SELECT student_id FROM room_allocations)
      ORDER BY created_at ASC
    `);
    
    // Find available Non-AC rooms with capacity
    const [nonAcRooms] = await conn.query(`
      SELECT r.room_id, r.capacity, r.type, COUNT(ra.student_id) AS assigned
      FROM rooms r
      LEFT JOIN room_allocations ra ON ra.room_id = r.room_id
      WHERE r.type = 'Non-AC'
      GROUP BY r.room_id
      HAVING assigned < r.capacity
      ORDER BY r.created_at ASC
    `);
    
    const nonAcAvailable = nonAcRooms.map(r => ({id: r.room_id, remain: r.capacity - r.assigned}));
    let nonAcRoomIdx = 0;
    
    for(const student of nonAcStudents){
      while(nonAcRoomIdx < nonAcAvailable.length && nonAcAvailable[nonAcRoomIdx].remain <= 0) nonAcRoomIdx++;
      if(nonAcRoomIdx >= nonAcAvailable.length) break; // No more Non-AC rooms
      
      // Allocate Non-AC room to student
      await conn.query(
        'INSERT INTO room_allocations (student_id, room_id) VALUES (?,?)',
        [student.student_id, nonAcAvailable[nonAcRoomIdx].id]
      );
      
      // Update student allocation status
      await conn.query(
        "UPDATE student SET allocation_status = 'Allocated' WHERE student_id = ?",
        [student.student_id]
      );
      
      nonAcAvailable[nonAcRoomIdx].remain -= 1;
      nonAcAllocated++;
      allocatedCount++;
    }
    
    // STEP 3: Mark Day Scholars as 'Not Applicable'
    await conn.query(`
      UPDATE student 
      SET allocation_status = 'Not Applicable' 
      WHERE residence_type = 'DayScholar' AND allocation_status = 'Pending'
    `);
    
    await conn.commit();
    
    res.json({
      message: 'FCFS allocation completed successfully',
      summary: {
        total_allocated: allocatedCount,
        ac_allocated: acAllocated,
        non_ac_allocated: nonAcAllocated,
        ac_students_waiting: acStudents.length - acAllocated,
        non_ac_students_waiting: nonAcStudents.length - nonAcAllocated
      }
    });
  }catch(err){ 
    await conn.rollback(); 
    res.status(500).json({error:err.message}); 
  }finally{ 
    conn.release(); 
  }
}

export async function listRequests(req,res){
  const conn = await pool.getConnection();
  try{
    const [rows] = await conn.query(`
      SELECT 
        r.request_id, r.student_id, r.choice1, r.choice2, r.choice3, r.reason, r.status, 
        r.admin_comment, r.created_at,
        s.name as student_name, s.roll_number, s.email,
        h.hostel_name as current_hostel, 
        rm.room_number as current_room,
        rm.type as current_room_type,
        r1.room_number as choice1_room, r1.type as choice1_type, h1.hostel_name as choice1_hostel,
        r2.room_number as choice2_room, r2.type as choice2_type, h2.hostel_name as choice2_hostel,
        r3.room_number as choice3_room, r3.type as choice3_type, h3.hostel_name as choice3_hostel
      FROM room_change_requests r
      JOIN student s ON r.student_id = s.student_id
      LEFT JOIN room_allocations ra ON s.student_id = ra.student_id
      LEFT JOIN rooms rm ON ra.room_id = rm.room_id
      LEFT JOIN hostels h ON rm.hostel_id = h.hostel_id
      LEFT JOIN rooms r1 ON r.choice1 = r1.room_id
      LEFT JOIN hostels h1 ON r1.hostel_id = h1.hostel_id
      LEFT JOIN rooms r2 ON r.choice2 = r2.room_id
      LEFT JOIN hostels h2 ON r2.hostel_id = h2.hostel_id
      LEFT JOIN rooms r3 ON r.choice3 = r3.room_id
      LEFT JOIN hostels h3 ON r3.hostel_id = h3.hostel_id
      ORDER BY r.created_at DESC
    `);
    res.json(rows);
  }catch(err){ res.status(500).json({error:err.message}); }finally{ conn.release(); }
}

export async function handleRequest(req,res){
  const {id} = req.params;
  const {action,admin_comment,approved_room_id} = req.body; // action: approve/reject
  if(!['approve','reject'].includes(action)) return res.status(400).json({error:'invalid action'});
  const conn = await pool.getConnection();
  try{
    await conn.beginTransaction();
    const [rows] = await conn.query('SELECT * FROM room_change_requests WHERE request_id=?',[id]);
    if(rows.length===0) return res.status(404).json({error:'not found'});
    const reqRow = rows[0];
    
    if(action==='reject'){
      await conn.query('UPDATE room_change_requests SET status=?, admin_comment=? WHERE request_id=?',['rejected',admin_comment||null,id]);
      await conn.commit();
      return res.json({message:'Request rejected'});
    }
    
    // approve: use approved_room_id if provided, otherwise try first available choice
    let targetRoomId = approved_room_id;
    
    if(!targetRoomId){
      const choices = [reqRow.choice1, reqRow.choice2, reqRow.choice3].filter(Boolean);
      for(const roomId of choices){
        const [r] = await conn.query('SELECT capacity, (SELECT COUNT(*) FROM room_allocations ra WHERE ra.room_id=?) as assigned FROM rooms WHERE room_id=?',[roomId,roomId]);
        if(r.length===0) continue;
        const room = r[0];
        if(room.assigned < room.capacity){
          targetRoomId = roomId;
          break;
        }
      }
    }
    
    if(!targetRoomId){
      await conn.query('UPDATE room_change_requests SET status=?, admin_comment=? WHERE request_id=?',['rejected',admin_comment || 'No available room from choices',id]);
      await conn.commit();
      return res.json({message:'No available choice; request rejected'});
    }
    
    // Check if room has capacity
    const [roomCheck] = await conn.query('SELECT capacity, (SELECT COUNT(*) FROM room_allocations ra WHERE ra.room_id=?) as assigned FROM rooms WHERE room_id=?',[targetRoomId,targetRoomId]);
    if(roomCheck.length === 0 || roomCheck[0].assigned >= roomCheck[0].capacity){
      await conn.rollback();
      return res.status(400).json({error:'Selected room is full or does not exist'});
    }
    
    // Remove old allocation
    await conn.query('DELETE FROM room_allocations WHERE student_id=?',[reqRow.student_id]);
    
    // Add new allocation
    await conn.query('INSERT INTO room_allocations (student_id,room_id) VALUES (?,?)',[reqRow.student_id, targetRoomId]);
    
    // Update student allocation status
    await conn.query("UPDATE student SET allocation_status = 'Allocated' WHERE student_id = ?",[reqRow.student_id]);
    
    // Update request status
    await conn.query('UPDATE room_change_requests SET status=?, admin_comment=? WHERE request_id=?',['approved',admin_comment||'Request approved',id]);
    
    await conn.commit();
    res.json({message:'Request approved and room changed successfully'});
  }catch(err){ 
    await conn.rollback();
    res.status(500).json({error:err.message}); 
  }finally{ 
    conn.release(); 
  }
}

export async function allocateRoomToStudent(req,res){
  const {studentId, roomId} = req.body;
  if(!studentId || !roomId) return res.status(400).json({error:'studentId and roomId required'});
  const conn = await pool.getConnection();
  try{
    await conn.beginTransaction();
    // Check if student already has allocation
    const [existing] = await conn.query('SELECT * FROM room_allocations WHERE student_id=?',[studentId]);
    if(existing.length > 0){
      return res.status(400).json({error:'Student already has a room allocation'});
    }
    // Check if room has capacity
    const [roomCheck] = await conn.query('SELECT capacity, (SELECT COUNT(*) FROM room_allocations ra WHERE ra.room_id=?) as assigned FROM rooms WHERE room_id=?',[roomId,roomId]);
    if(roomCheck.length === 0){
      await conn.rollback();
      return res.status(404).json({error:'Room not found'});
    }
    const room = roomCheck[0];
    if(room.assigned >= room.capacity){
      await conn.rollback();
      return res.status(400).json({error:'Room is full'});
    }
    // Allocate room
    await conn.query('INSERT INTO room_allocations (student_id,room_id) VALUES (?,?)',[studentId,roomId]);
    
    // Update student allocation status
    await conn.query("UPDATE student SET allocation_status = 'Allocated' WHERE student_id = ?",[studentId]);
    
    await conn.commit();
    res.json({message:'Room allocated successfully'});
  }catch(err){ 
    await conn.rollback(); 
    res.status(500).json({error:err.message}); 
  }finally{ 
    conn.release(); 
  }
}

export async function deallocateRoom(req,res){
  const {studentId} = req.body;
  if(!studentId) return res.status(400).json({error:'studentId required'});
  const conn = await pool.getConnection();
  try{
    const [result] = await conn.query('DELETE FROM room_allocations WHERE student_id=?',[studentId]);
    if(result.affectedRows === 0){
      return res.status(404).json({error:'No allocation found for this student'});
    }
    
    // Update student allocation status back to Pending
    await conn.query("UPDATE student SET allocation_status = 'Pending' WHERE student_id = ? AND residence_type = 'Hosteller'",[studentId]);
    
    res.json({message:'Room deallocated successfully'});
  }catch(err){ 
    res.status(500).json({error:err.message}); 
  }finally{ 
    conn.release(); 
  }
}
