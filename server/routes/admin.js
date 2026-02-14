const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisePool } = require('../config/database');
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// simple middleware to verify admin role
const verifyAdmin = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    // Verify token matches stored current_token for this admin
    try {
      const [rows] = await promisePool.execute(`SELECT current_token FROM Admin WHERE admin_id = ? LIMIT 1`, [payload.id]);
      if (!rows.length) return res.status(401).json({ message: 'Admin not found' });
      const stored = rows[0].current_token;
      if (!stored || stored !== token) return res.status(401).json({ message: 'Invalid session' });
    } catch (e) {
      console.warn('Could not validate admin session token:', e.message || e);
      return res.status(500).json({ message: 'Session validation error' });
    }
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get list of students
router.get('/students', verifyAdmin, async (req, res) => {
  try {
    const [rows] = await promisePool.execute(`SELECT student_id, name, roll_number, year, department, email FROM Student`);
    res.json({ students: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

// Allocate a room to a student
router.post('/allocate', verifyAdmin, async (req, res) => {
  try {
    const { student_id, room_id, allocated_date } = req.body;
    if (!student_id || !room_id || !allocated_date) return res.status(400).json({ message: 'student_id, room_id and allocated_date required' });

    // check room availability
    const [roomRows] = await promisePool.execute(`SELECT status FROM Room WHERE room_id = ? LIMIT 1`, [room_id]);
    if (!roomRows.length) return res.status(404).json({ message: 'Room not found' });
    if (roomRows[0].status === 'Occupied') return res.status(400).json({ message: 'Room already occupied' });

    // create allocation
    await promisePool.execute(`INSERT INTO Room_Allocation (student_id, room_id, allocated_date) VALUES (?, ?, ?)`, [student_id, room_id, allocated_date]);
    await promisePool.execute(`UPDATE Room SET status = 'Occupied' WHERE room_id = ?`, [room_id]);

    res.json({ success: true, message: 'Room allocated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Allocation failed' });
  }
});

// Dashboard stats
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const [[{ totalHostels }]] = await promisePool.query(`SELECT COUNT(*) AS totalHostels FROM Hostel`);
    const [[{ totalStudents }]] = await promisePool.query(`SELECT COUNT(*) AS totalStudents FROM Student`);
    const [[{ availableRooms }]] = await promisePool.query(`SELECT COUNT(*) AS availableRooms FROM Room WHERE status = 'Available'`);
    const [[{ occupiedRooms }]] = await promisePool.query(`SELECT COUNT(*) AS occupiedRooms FROM Room WHERE status = 'Occupied'`);
    const [[{ pendingRequests }]] = await promisePool.query(`SELECT COUNT(*) AS pendingRequests FROM Room_Change_Request WHERE status = 'Pending'`);

    res.json({ totalHostels, totalStudents, availableRooms, occupiedRooms, pendingRequests });
  } catch (err) {
    console.error('Failed to fetch stats', err);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// Room change requests list
router.get('/room-requests', verifyAdmin, async (req, res) => {
  try {
    const [rows] = await promisePool.execute(`
      SELECT r.request_id, s.name AS studentName, r.current_room_id, r.preferred_room_1, r.preferred_room_2, r.preferred_room_3, r.status, r.request_date
      FROM Room_Change_Request r
      JOIN Student s ON r.student_id = s.student_id
      ORDER BY r.request_date DESC
    `);
    res.json({ requests: rows });
  } catch (err) {
    console.error('Failed to fetch room requests', err);
    res.status(500).json({ message: 'Failed to fetch room requests' });
  }
});

// Admin: create a student (contact admin registers student)
router.post('/create-student', verifyAdmin, async (req, res) => {
  try {
    const { name, roll_number, year, department, address, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'name, email and password required' });

    // hash password
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await promisePool.execute(
      `INSERT INTO Student (name, roll_number, year, department, address, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, roll_number || null, year || null, department || null, address || null, email, hashed]
    );

    res.json({ success: true, student_id: result.insertId });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Email or roll number already exists' });
    console.error('Create student failed', err);
    res.status(500).json({ message: 'Create student failed' });
  }
});

module.exports = router;


