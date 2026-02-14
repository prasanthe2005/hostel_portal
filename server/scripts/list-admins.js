const { promisePool } = require('../config/database');

const listAdmins = async () => {
  try {
    const [rows] = await promisePool.execute('SELECT admin_id, name, email, created_at, last_login FROM Admin');
    console.log('Admins:', rows);
    process.exit(0);
  } catch (err) {
    console.error('Error listing admins:', err.message || err);
    process.exit(1);
  }
};

listAdmins();