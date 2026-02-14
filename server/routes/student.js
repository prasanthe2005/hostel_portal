const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { promisePool } = require('../config/database');
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

const verifyStudent = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'student') return res.status(403).json({ message: 'Forbidden' });
    // verify token matches stored token for student
    (async () => {
      try {
        const [rows] = await promisePool.execute(`SELECT current_token FROM Student WHERE student_id = ? LIMIT 1`, [payload.id]);
        if (!rows.length) return res.status(401).json({ message: 'Student not found' });
        const stored = rows[0].current_token;
        if (!stored || stored !== token) return res.status(401).json({ message: 'Invalid session' });
        req.user = payload;
        next();
      } catch (e) {
        console.warn('Could not validate student session token:', e.message || e);
        return res.status(500).json({ message: 'Session validation error' });
      }
    })();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Student profile
router.get('/profile', verifyStudent, async (req, res) => {
  try {
    const studentId = req.user.id;
    const [rows] = await promisePool.execute(`SELECT student_id, name, roll_number, year, department, address, email FROM Student WHERE student_id = ?`, [studentId]);
    if (!rows.length) return res.status(404).json({ message: 'Student not found' });

    // current allocation
    const [alloc] = await promisePool.execute(`SELECT ra.allocation_id, ra.allocated_date, r.room_id, r.room_number, f.floor_number, h.hostel_name FROM Room_Allocation ra JOIN Room r ON ra.room_id = r.room_id JOIN Floor f ON r.floor_id = f.floor_id JOIN Hostel h ON f.hostel_id = h.hostel_id WHERE ra.student_id = ? AND ra.allocated_date <= CURDATE()`, [studentId]);

    res.json({ student: rows[0], allocation: alloc[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Room change request
router.post('/request-change', verifyStudent, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { preferred_room_1, preferred_room_2, preferred_room_3 } = req.body;
    // get current allocation
    const [current] = await promisePool.execute(`SELECT room_id FROM Room_Allocation WHERE student_id = ? LIMIT 1`, [studentId]);
    if (!current.length) return res.status(400).json({ message: 'No current room allocation' });
    const current_room_id = current[0].room_id;

    await promisePool.execute(
      `INSERT INTO Room_Change_Request (student_id, current_room_id, preferred_room_1, preferred_room_2, preferred_room_3, request_date) VALUES (?, ?, ?, ?, ?, CURDATE())`,
      [studentId, current_room_id, preferred_room_1 || null, preferred_room_2 || null, preferred_room_3 || null]
    );

    res.json({ success: true, message: 'Room change request submitted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Request failed' });
  }
});

module.exports = router;
