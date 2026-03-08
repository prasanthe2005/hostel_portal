import pool from '../config/db.js';

// Submit a complaint
export async function submitComplaint(req, res) {
  const { complaint_type, description } = req.body;
  const studentId = req.user.student_id;

  if (!complaint_type || !description) {
    return res.status(400).json({ error: 'Complaint type and description are required' });
  }

  const conn = await pool.getConnection();
  try {
    // Get student's room
    const [allocations] = await conn.query(
      'SELECT room_id FROM room_allocations WHERE student_id = ?',
      [studentId]
    );

    if (allocations.length === 0) {
      return res.status(400).json({ error: 'You must be allocated a room to submit complaints' });
    }

    const roomId = allocations[0].room_id;

    const [result] = await conn.query(
      'INSERT INTO complaints (student_id, room_id, complaint_type, description, status) VALUES (?, ?, ?, ?, ?)',
      [studentId, roomId, complaint_type, description, 'Pending']
    );

    // Fetch the created complaint
    const [complaint] = await conn.query(
      `SELECT c.*, s.name as student_name, s.roll_number, r.room_number, h.hostel_name
       FROM complaints c
       JOIN student s ON c.student_id = s.student_id
       JOIN rooms r ON c.room_id = r.room_id
       JOIN hostels h ON r.hostel_id = h.hostel_id
       WHERE c.complaint_id = ?`,
      [result.insertId]
    );

    res.status(201).json(complaint[0]);
  } catch (err) {
    console.error('Error submitting complaint:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
}

// Get student's complaints
export async function getMyComplaints(req, res) {
  const studentId = req.user.student_id;
  const conn = await pool.getConnection();
  
  try {
    const [complaints] = await conn.query(
      `SELECT c.*, r.room_number, h.hostel_name
       FROM complaints c
       LEFT JOIN rooms r ON c.room_id = r.room_id
       LEFT JOIN hostels h ON r.hostel_id = h.hostel_id
       WHERE c.student_id = ?
       ORDER BY c.created_at DESC`,
      [studentId]
    );

    // Prevent caching to ensure fresh data
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.json(complaints);
  } catch (err) {
    console.error('Error fetching complaints:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
}

// Get all complaints (for admin)
export async function getAllComplaints(req, res) {
  const conn = await pool.getConnection();
  
  try {
    const [complaints] = await conn.query(
      `SELECT c.*, s.name as student_name, s.roll_number, s.phone as student_phone,
              r.room_number, h.hostel_name
       FROM complaints c
       JOIN student s ON c.student_id = s.student_id
       LEFT JOIN rooms r ON c.room_id = r.room_id
       LEFT JOIN hostels h ON r.hostel_id = h.hostel_id
       ORDER BY c.created_at DESC`
    );

    res.json(complaints);
  } catch (err) {
    console.error('Error fetching all complaints:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
}

// Update complaint status
export async function updateComplaintStatus(req, res) {
  const { complaint_id } = req.params;
  const { status } = req.body;

  if (!['Pending', 'In Progress', 'Resolved', 'Completed', 'Escalated', 'Reopened'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.query(
      'UPDATE complaints SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE complaint_id = ?',
      [status, complaint_id]
    );

    const [complaint] = await conn.query(
      `SELECT c.*, s.name as student_name, s.roll_number, r.room_number, h.hostel_name
       FROM complaints c
       JOIN student s ON c.student_id = s.student_id
       LEFT JOIN rooms r ON c.room_id = r.room_id
       LEFT JOIN hostels h ON r.hostel_id = h.hostel_id
       WHERE c.complaint_id = ?`,
      [complaint_id]
    );

    if (complaint.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json(complaint[0]);
  } catch (err) {
    console.error('Error updating complaint status:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
}

// Student confirms complaint resolution (clicks YES - Satisfied)
export async function confirmResolution(req, res) {
  console.log('\n=== CONFIRM RESOLUTION REQUEST ===');
  const { complaint_id } = req.params;
  const studentId = req.user.student_id;
  console.log('Complaint ID:', complaint_id);
  console.log('Student ID:', studentId);
  console.log('User from token:', req.user);

  const conn = await pool.getConnection();
  try {
    console.log('Fetching complaint from database...');
    // Verify the complaint belongs to this student
    const [complaints] = await conn.query(
      'SELECT * FROM complaints WHERE complaint_id = ? AND student_id = ?',
      [complaint_id, studentId]
    );
    console.log('Complaints found:', complaints.length);

    if (complaints.length === 0) {
      console.log('❌ Complaint not found or access denied');
      return res.status(404).json({ error: 'Complaint not found or access denied' });
    }

    const complaint = complaints[0];
    console.log('Current complaint status:', complaint.status);

    // Only allow confirmation if status is "Resolved"
    if (complaint.status !== 'Resolved') {
      console.log('❌ Cannot confirm - status is not Resolved');
      return res.status(400).json({ error: `Complaint is not in Resolved status. Current status: ${complaint.status}` });
    }

    console.log('✅ Updating status to Completed...');
    // Update status to Completed
    await conn.query(
      'UPDATE complaints SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE complaint_id = ?',
      ['Completed', complaint_id]
    );
    console.log('✅ Status updated successfully');

    const [updatedComplaints] = await conn.query(
      `SELECT c.*, r.room_number, h.hostel_name
       FROM complaints c
       LEFT JOIN rooms r ON c.room_id = r.room_id
       LEFT JOIN hostels h ON r.hostel_id = h.hostel_id
       WHERE c.complaint_id = ?`,
      [complaint_id]
    );

    console.log('✅ Sending response with updated complaint');
    res.json(updatedComplaints[0]);
  } catch (err) {
    console.error('❌ Error confirming resolution:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
}

// Student rejects resolution (clicks NO - Not Fixed)
export async function rejectResolution(req, res) {
  console.log('\n=== REJECT RESOLUTION REQUEST ===');
  const { complaint_id } = req.params;
  const studentId = req.user.student_id;
  console.log('Complaint ID:', complaint_id);
  console.log('Student ID:', studentId);
  console.log('User from token:', req.user);

  const conn = await pool.getConnection();
  try {
    console.log('Fetching complaint from database...');
    // Verify the complaint belongs to this student
    const [complaints] = await conn.query(
      'SELECT * FROM complaints WHERE complaint_id = ? AND student_id = ?',
      [complaint_id, studentId]
    );
    console.log('Complaints found:', complaints.length);

    if (complaints.length === 0) {
      console.log('❌ Complaint not found or access denied');
      return res.status(404).json({ error: 'Complaint not found or access denied' });
    }

    const complaint = complaints[0];
    console.log('Current complaint status:', complaint.status);

    // Only allow rejection if status is "Resolved"
    if (complaint.status !== 'Resolved') {
      console.log('❌ Cannot reject - status is not Resolved');
      return res.status(400).json({ error: `Complaint is not in Resolved status. Current status: ${complaint.status}` });
    }

    console.log('✅ Updating status to Reopened...');
    // Update status to Reopened
    await conn.query(
      'UPDATE complaints SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE complaint_id = ?',
      ['Reopened', complaint_id]
    );
    console.log('✅ Status updated successfully');

    const [updatedComplaints] = await conn.query(
      `SELECT c.*, r.room_number, h.hostel_name
       FROM complaints c
       LEFT JOIN rooms r ON c.room_id = r.room_id
       LEFT JOIN hostels h ON r.hostel_id = h.hostel_id
       WHERE c.complaint_id = ?`,
      [complaint_id]
    );

    console.log('✅ Sending response with updated complaint');
    res.json(updatedComplaints[0]);
  } catch (err) {
    console.error('❌ Error rejecting resolution:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
}
