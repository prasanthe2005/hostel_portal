import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export async function wardenLogin(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const conn = await pool.getConnection();
  try {
    const [wardens] = await conn.query('SELECT * FROM wardens WHERE email = ? LIMIT 1', [email]);
    if (wardens.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const warden = wardens[0];
    const isValid = await bcrypt.compare(password, warden.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        warden_id: warden.warden_id,
        email: warden.email,
        hostel_id: warden.hostel_id,
        role: 'warden'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        warden_id: warden.warden_id,
        name: warden.name,
        email: warden.email,
        phone: warden.phone,
        hostel_id: warden.hostel_id,
        role: 'warden'
      }
    });
  } catch (err) {
    console.error('Error during warden login:', err);
    return res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
}

export async function getWardenDashboard(req, res) {
  const wardenId = req.user?.warden_id;

  if (!wardenId) {
    return res.status(400).json({ error: 'Invalid warden token' });
  }

  const conn = await pool.getConnection();
  try {
    const [wardens] = await conn.query(
      `SELECT w.warden_id, w.name, w.email, w.phone, w.hostel_id, h.hostel_name
       FROM wardens w
       JOIN hostels h ON h.hostel_id = w.hostel_id
       WHERE w.warden_id = ? LIMIT 1`,
      [wardenId]
    );

    if (wardens.length === 0) {
      return res.status(404).json({ error: 'Warden not found' });
    }

    const warden = wardens[0];

    const [students] = await conn.query(
      `SELECT s.student_id, s.name, s.email, s.phone, s.roll_number, s.year, s.department,
              s.gender, s.parent_contact, s.address, s.residence_type, s.preferred_room_type,
              s.allocation_status, s.created_at, s.last_login,
              r.room_number, h.hostel_name
       FROM student s
       JOIN room_allocations ra ON ra.student_id = s.student_id
       JOIN rooms r ON r.room_id = ra.room_id
       JOIN hostels h ON h.hostel_id = r.hostel_id
       WHERE h.hostel_id = ?
       ORDER BY s.name ASC`,
      [warden.hostel_id]
    );

    return res.json({
      warden,
      students
    });
  } catch (err) {
    console.error('Error loading warden dashboard:', err);
    return res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
}
