import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

// Create a new caretaker (Admin only)
export async function createCaretaker(req, res) {
  const { name, email, password, phone, hostel_id } = req.body;

  if (!name || !email || !password || !hostel_id) {
    return res.status(400).json({ error: 'Name, email, password, and hostel_id are required' });
  }

  const conn = await pool.getConnection();
  try {
    // Ensure selected hostel exists
    const [hostels] = await conn.query(
      'SELECT hostel_id FROM hostels WHERE hostel_id = ? LIMIT 1',
      [hostel_id]
    );

    if (hostels.length === 0) {
      return res.status(400).json({ error: 'Invalid hostel selected' });
    }

    // Check if email already exists
    const [existing] = await conn.query(
      'SELECT caretaker_id FROM caretakers WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'A caretaker with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert caretaker
    const [result] = await conn.query(
      'INSERT INTO caretakers (name, email, password, phone, hostel_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null, hostel_id]
    );

    // Fetch created caretaker with hostel name
    const [caretaker] = await conn.query(
      `SELECT c.caretaker_id, c.name, c.email, c.phone, c.hostel_id, c.created_at,
              h.hostel_name
       FROM caretakers c
       LEFT JOIN hostels h ON c.hostel_id = h.hostel_id
       WHERE c.caretaker_id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      caretaker: caretaker[0],
      credentials: {
        email: email,
        password: password // Send plain password only once during creation
      }
    });
  } catch (err) {
    console.error('Error creating caretaker:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
}

// Get all caretakers with detailed complaint statistics
export async function listCaretakers(req, res) {
  const conn = await pool.getConnection();
  try {
    const [caretakers] = await conn.query(
      `SELECT c.caretaker_id, c.name, c.email, c.phone, c.hostel_id, c.created_at,
              h.hostel_name,
              COUNT(comp.complaint_id) as total_complaints,
              SUM(CASE WHEN comp.status = 'Pending' THEN 1 ELSE 0 END) as pending_complaints,
              SUM(CASE WHEN comp.status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_complaints,
              SUM(CASE WHEN comp.status = 'Resolved' THEN 1 ELSE 0 END) as resolved_complaints,
              SUM(CASE WHEN comp.status = 'Completed' THEN 1 ELSE 0 END) as completed_complaints,
              SUM(CASE WHEN comp.status = 'Reopened' THEN 1 ELSE 0 END) as reopened_complaints
       FROM caretakers c
       LEFT JOIN hostels h ON c.hostel_id = h.hostel_id
       LEFT JOIN rooms r ON h.hostel_id = r.hostel_id
       LEFT JOIN complaints comp ON r.room_id = comp.room_id
       GROUP BY c.caretaker_id
       ORDER BY c.created_at DESC`
    );

    const normalizedCaretakers = caretakers.map((caretaker) => ({
      ...caretaker,
      total_complaints: Number(caretaker.total_complaints) || 0,
      pending_complaints: Number(caretaker.pending_complaints) || 0,
      in_progress_complaints: Number(caretaker.in_progress_complaints) || 0,
      resolved_complaints: Number(caretaker.resolved_complaints) || 0,
      completed_complaints: Number(caretaker.completed_complaints) || 0,
      reopened_complaints: Number(caretaker.reopened_complaints) || 0
    }));
    // Set cache control headers to prevent caching
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.json(normalizedCaretakers);
  } catch (err) {
    console.error('Error fetching caretakers:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
}

// Update caretaker
export async function updateCaretaker(req, res) {
  const { caretaker_id } = req.params;
  const { name, email, phone, hostel_id, password } = req.body;

  const conn = await pool.getConnection();
  try {
    if (hostel_id !== undefined) {
      if (!hostel_id) {
        return res.status(400).json({ error: 'hostel_id is required for caretaker assignment' });
      }

      const [hostels] = await conn.query(
        'SELECT hostel_id FROM hostels WHERE hostel_id = ? LIMIT 1',
        [hostel_id]
      );

      if (hostels.length === 0) {
        return res.status(400).json({ error: 'Invalid hostel selected' });
      }
    }

    const updates = [];
    const values = [];

    if (name) { updates.push('name = ?'); values.push(name); }
    if (email) { updates.push('email = ?'); values.push(email); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone || null); }
    if (hostel_id !== undefined) { updates.push('hostel_id = ?'); values.push(hostel_id); }
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(caretaker_id);
    await conn.query(`UPDATE caretakers SET ${updates.join(', ')} WHERE caretaker_id = ?`, values);

    const [caretaker] = await conn.query(
      `SELECT c.caretaker_id, c.name, c.email, c.phone, c.hostel_id, c.created_at,
              h.hostel_name
       FROM caretakers c
       LEFT JOIN hostels h ON c.hostel_id = h.hostel_id
       WHERE c.caretaker_id = ?`,
      [caretaker_id]
    );

    if (caretaker.length === 0) {
      return res.status(404).json({ error: 'Caretaker not found' });
    }

    res.json(caretaker[0]);
  } catch (err) {
    console.error('Error updating caretaker:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
}

// Delete caretaker
export async function deleteCaretaker(req, res) {
  const { caretaker_id } = req.params;

  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query('DELETE FROM caretakers WHERE caretaker_id = ?', [caretaker_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Caretaker not found' });
    }

    res.json({ message: 'Caretaker deleted successfully' });
  } catch (err) {
    console.error('Error deleting caretaker:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
}

// Get complaints statistics for admin
export async function getComplaintsStats(req, res) {
  const conn = await pool.getConnection();
  try {
    const [stats] = await conn.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved
       FROM complaints`
    );

    const normalizedStats = {
      total: Number(stats[0]?.total) || 0,
      pending: Number(stats[0]?.pending) || 0,
      in_progress: Number(stats[0]?.in_progress) || 0,
      resolved: Number(stats[0]?.resolved) || 0
    };

    res.json(normalizedStats);
  } catch (err) {
    console.error('Error fetching complaints stats:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
}
