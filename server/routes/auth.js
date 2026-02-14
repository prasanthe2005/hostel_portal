const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { promisePool } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// Student registration
router.post('/register', async (req, res) => {
  try {
    const { name, roll_number, year, department, address, email, password } = req.body;
    if (!email || !password || !name) return res.status(400).json({ message: 'name, email and password required' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await promisePool.execute(
      `INSERT INTO Student (name, roll_number, year, department, address, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, roll_number || null, year || null, department || null, address || null, email, hashed]
    );

    res.json({ success: true, student_id: result.insertId });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Email or roll number already exists' });
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login for student or admin
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });

    // Try Admin
    const [admins] = await promisePool.execute(`SELECT * FROM Admin WHERE email = ? LIMIT 1`, [email]);
    if (admins && admins.length) {
      const admin = admins[0];
      const match = await bcrypt.compare(password, admin.password);
      if (!match) return res.status(401).json({ message: 'Invalid credentials' });
      const token = jwt.sign({ id: admin.admin_id, role: 'admin', email: admin.email }, JWT_SECRET, { expiresIn: '8h' });
      // record last login and store current token server-side
      try {
        await promisePool.execute(`UPDATE Admin SET last_login = NOW(), current_token = ? WHERE admin_id = ?`, [token, admin.admin_id]);
      } catch (e) {
        console.warn('Could not update admin last_login/current_token:', e.message || e);
      }
      return res.json({ token, role: 'admin', user: { admin_id: admin.admin_id, name: admin.name, email: admin.email } });
    }

    // Try Student
    const [students] = await promisePool.execute(`SELECT * FROM Student WHERE email = ? LIMIT 1`, [email]);
    if (!students || !students.length) return res.status(401).json({ message: 'Invalid credentials' });
    const student = students[0];
    const match = await bcrypt.compare(password, student.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: student.student_id, role: 'student', email: student.email }, JWT_SECRET, { expiresIn: '8h' });
    // record last login and store current token for student
    try { await promisePool.execute(`UPDATE Student SET last_login = NOW(), current_token = ? WHERE student_id = ?`, [token, student.student_id]); } catch (e) {}
    res.json({ token, role: 'student', user: { student_id: student.student_id, name: student.name, email: student.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Logout: clears stored token for admin or student
router.post('/logout', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(400).json({ message: 'No token provided' });
    const token = auth.split(' ')[1];
    let payload;
    try { payload = jwt.verify(token, JWT_SECRET); } catch (e) { return res.status(400).json({ message: 'Invalid token' }); }

    if (payload.role === 'admin') {
      await promisePool.execute(`UPDATE Admin SET current_token = NULL WHERE admin_id = ?`, [payload.id]);
      return res.json({ success: true });
    }

    if (payload.role === 'student') {
      try { await promisePool.execute(`UPDATE Student SET current_token = NULL WHERE student_id = ?`, [payload.id]); } catch (e) {}
      return res.json({ success: true });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Logout failed' });
  }
});

// Returns current logged-in user info based on token
router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: 'No token' });
    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload) return res.status(401).json({ message: 'Invalid token' });

    if (payload.role === 'admin') {
      const [rows] = await promisePool.execute(`SELECT admin_id, name, email, last_login FROM Admin WHERE admin_id = ? LIMIT 1`, [payload.id]);
      return res.json({ user: rows[0] || null, role: 'admin' });
    }

    if (payload.role === 'student') {
      const [rows] = await promisePool.execute(`SELECT student_id, name, email, roll_number, year, department, address, last_login FROM Student WHERE student_id = ? LIMIT 1`, [payload.id]);
      return res.json({ user: rows[0] || null, role: 'student' });
    }

    res.status(400).json({ message: 'Unknown role' });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
