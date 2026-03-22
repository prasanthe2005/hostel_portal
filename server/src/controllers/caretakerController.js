import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Caretaker login
export async function caretakerLogin(req, res) {
  console.log('\n=== CARETAKER LOGIN ATTEMPT ===');
  const { email, password } = req.body;
  console.log('Email:', email);
  console.log('Password provided:', password ? 'YES' : 'NO');

  if (!email || !password) {
    console.log('❌ Missing email or password');
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const conn = await pool.getConnection();
  try {
    console.log('Querying database for email:', email);
    const [caretakers] = await conn.query(
      'SELECT * FROM caretakers WHERE email = ? LIMIT 1',
      [email]
    );
    console.log('Caretakers found:', caretakers.length);

    if (caretakers.length === 0) {
      console.log('❌ No caretaker found with that email');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const caretaker = caretakers[0];
    if (!caretaker.hostel_id) {
      return res.status(403).json({ error: 'Caretaker is not assigned to a hostel. Please contact admin.' });
    }
    console.log('Caretaker found:', caretaker.name, '(ID:', caretaker.caretaker_id + ')');
    console.log('Comparing password...');
    const isValid = await bcrypt.compare(password, caretaker.password);
    console.log('Password valid:', isValid);

    if (!isValid) {
      console.log('❌ Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ Creating JWT token...');
    const token = jwt.sign(
      { caretaker_id: caretaker.caretaker_id, email: caretaker.email, role: 'caretaker' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log('✅ Token created, sending response');

    res.json({
      token,
      user: {
        caretaker_id: caretaker.caretaker_id,
        name: caretaker.name,
        email: caretaker.email,
        phone: caretaker.phone,
        hostel_id: caretaker.hostel_id,
        role: 'caretaker'
      }
    });
    console.log('✅ Login successful for:', caretaker.name);
  } catch (err) {
    console.error('❌ Error during caretaker login:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
}

// Get caretaker dashboard data
export async function getCaretakerDashboard(req, res) {
  console.log('=== Caretaker Dashboard Request ===');
  console.log('User from token:', req.user);
  console.log('Caretaker ID:', req.user?.caretaker_id);
  
  const caretakerId = req.user.caretaker_id;
  
  if (!caretakerId) {
    console.error('No caretaker_id in request');
    return res.status(400).json({ error: 'Invalid caretaker token' });
  }
  
  const conn = await pool.getConnection();

  try {
    // Get caretaker info with hostel
    const [caretaker] = await conn.query(
      `SELECT c.*, h.hostel_name 
       FROM caretakers c
       LEFT JOIN hostels h ON c.hostel_id = h.hostel_id
       WHERE c.caretaker_id = ?`,
      [caretakerId]
    );

    console.log('Found caretaker:', caretaker.length > 0 ? caretaker[0].name : 'none');

    if (caretaker.length === 0) {
      return res.status(404).json({ error: 'Caretaker not found' });
    }

    const hostelId = caretaker[0].hostel_id;
    if (!hostelId) {
      return res.status(403).json({ error: 'Caretaker is not assigned to a hostel. Please contact admin.' });
    }

    // Get complaints for this hostel
    const [complaints] = await conn.query(
      `SELECT c.*, s.name as student_name, s.roll_number, s.phone as student_phone,
              r.room_number, h.hostel_name
       FROM complaints c
       JOIN student s ON c.student_id = s.student_id
       JOIN rooms r ON c.room_id = r.room_id
       JOIN hostels h ON r.hostel_id = h.hostel_id
       WHERE h.hostel_id = ?
       ORDER BY c.created_at DESC`,
      [hostelId]
    );

    // Get statistics
    const [stats] = await conn.query(
      `SELECT 
        COUNT(*) as total_complaints,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'Reopened' THEN 1 ELSE 0 END) as reopened
       FROM complaints c
       JOIN rooms r ON c.room_id = r.room_id
         WHERE r.hostel_id = ?`,
        [hostelId]
    );

    // Prevent caching to ensure fresh data
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.json({
      caretaker: caretaker[0],
      complaints,
      statistics: stats[0]
    });
  } catch (err) {
    console.error('Error fetching caretaker dashboard:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
}

// Get complaints for caretaker's hostel
export async function getHostelComplaints(req, res) {
  const caretakerId = req.user.caretaker_id;
  const conn = await pool.getConnection();

  try {
    // Get caretaker's hostel
    const [caretaker] = await conn.query(
      'SELECT hostel_id FROM caretakers WHERE caretaker_id = ?',
      [caretakerId]
    );

    if (caretaker.length === 0) {
      return res.status(404).json({ error: 'Caretaker not found' });
    }

    const hostelId = caretaker[0].hostel_id;
    if (!hostelId) {
      return res.status(403).json({ error: 'Caretaker is not assigned to a hostel. Please contact admin.' });
    }

    // Get complaints
    const [complaints] = await conn.query(
      `SELECT c.*, s.name as student_name, s.roll_number, s.phone as student_phone,
              r.room_number, h.hostel_name
       FROM complaints c
       JOIN student s ON c.student_id = s.student_id
       JOIN rooms r ON c.room_id = r.room_id
       JOIN hostels h ON r.hostel_id = h.hostel_id
       WHERE h.hostel_id = ?
       ORDER BY c.created_at DESC`,
      [hostelId]
    );

    // Prevent caching to ensure fresh data
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.json(complaints);
  } catch (err) {
    console.error('Error fetching hostel complaints:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
}
