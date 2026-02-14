const { promisePool } = require('../config/database');

const listStudents = async () => {
  try {
    const [rows] = await promisePool.execute('SELECT student_id, name, email, created_at, last_login FROM Student');
    console.log('Students:', rows);
    process.exit(0);
  } catch (err) {
    console.error('Error listing students:', err.message || err);
    process.exit(1);
  }
};

listStudents();