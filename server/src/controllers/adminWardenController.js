import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

export async function createWarden(req, res) {
  const { name, email, password, phone, hostel_id } = req.body;

  if (!name || !email || !password || !hostel_id) {
    return res.status(400).json({ error: 'Name, email, password, and hostel_id are required' });
  }

  const conn = await pool.getConnection();
  try {
    const [hostels] = await conn.query('SELECT hostel_id FROM hostels WHERE hostel_id = ? LIMIT 1', [hostel_id]);
    if (hostels.length === 0) {
      return res.status(400).json({ error: 'Invalid hostel selected' });
    }

    const [existing] = await conn.query('SELECT warden_id FROM wardens WHERE email = ? LIMIT 1', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'A warden with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await conn.query(
      'INSERT INTO wardens (name, email, password, phone, hostel_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null, hostel_id]
    );

    const [wardens] = await conn.query(
      `SELECT w.warden_id, w.name, w.email, w.phone, w.hostel_id, w.created_at,
              h.hostel_name
       FROM wardens w
       JOIN hostels h ON w.hostel_id = h.hostel_id
       WHERE w.warden_id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      warden: wardens[0],
      credentials: {
        email,
        password
      }
    });
  } catch (err) {
    console.error('Error creating warden:', err);
    return res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
}

export async function listWardens(req, res) {
  const conn = await pool.getConnection();
  try {
    const [wardens] = await conn.query(
      `SELECT w.warden_id, w.name, w.email, w.phone, w.hostel_id, w.created_at,
              h.hostel_name,
              COUNT(DISTINCT s.student_id) AS assigned_students
       FROM wardens w
       JOIN hostels h ON w.hostel_id = h.hostel_id
       LEFT JOIN rooms r ON r.hostel_id = w.hostel_id
       LEFT JOIN room_allocations ra ON ra.room_id = r.room_id
       LEFT JOIN student s ON s.student_id = ra.student_id
       GROUP BY w.warden_id
       ORDER BY w.created_at DESC`
    );

    return res.json(wardens);
  } catch (err) {
    console.error('Error listing wardens:', err);
    return res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
}

export async function updateWarden(req, res) {
  const { warden_id } = req.params;
  const { name, email, phone, hostel_id, password } = req.body;

  const conn = await pool.getConnection();
  try {
    const [existingWarden] = await conn.query('SELECT warden_id FROM wardens WHERE warden_id = ? LIMIT 1', [warden_id]);
    if (existingWarden.length === 0) {
      return res.status(404).json({ error: 'Warden not found' });
    }

    if (email) {
      const [emailTaken] = await conn.query(
        'SELECT warden_id FROM wardens WHERE email = ? AND warden_id <> ? LIMIT 1',
        [email, warden_id]
      );
      if (emailTaken.length > 0) {
        return res.status(400).json({ error: 'A warden with this email already exists' });
      }
    }

    if (hostel_id !== undefined) {
      const [hostels] = await conn.query('SELECT hostel_id FROM hostels WHERE hostel_id = ? LIMIT 1', [hostel_id]);
      if (hostels.length === 0) {
        return res.status(400).json({ error: 'Invalid hostel selected' });
      }
    }

    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone || null);
    }
    if (hostel_id !== undefined) {
      updates.push('hostel_id = ?');
      values.push(hostel_id);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(warden_id);
    await conn.query(`UPDATE wardens SET ${updates.join(', ')} WHERE warden_id = ?`, values);

    const [wardens] = await conn.query(
      `SELECT w.warden_id, w.name, w.email, w.phone, w.hostel_id, w.created_at,
              h.hostel_name
       FROM wardens w
       JOIN hostels h ON w.hostel_id = h.hostel_id
       WHERE w.warden_id = ?`,
      [warden_id]
    );

    return res.json(wardens[0]);
  } catch (err) {
    console.error('Error updating warden:', err);
    return res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
}

export async function deleteWarden(req, res) {
  const { warden_id } = req.params;
  const conn = await pool.getConnection();

  try {
    const [result] = await conn.query('DELETE FROM wardens WHERE warden_id = ?', [warden_id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Warden not found' });
    }

    return res.json({ message: 'Warden deleted successfully' });
  } catch (err) {
    console.error('Error deleting warden:', err);
    return res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
}
