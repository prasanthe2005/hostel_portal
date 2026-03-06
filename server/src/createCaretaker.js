import pool from './config/db.js';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createCaretaker() {
  try {
    console.log('\n=== Create Caretaker Account ===\n');

    const name = await question('Enter caretaker name: ');
    const email = await question('Enter caretaker email: ');
    const password = await question('Enter password: ');
    const phone = await question('Enter phone number (optional): ');
    const hostelId = await question('Enter hostel ID (optional, leave blank for all hostels): ');

    if (!name || !email || !password) {
      console.error('❌ Name, email, and password are required!');
      rl.close();
      process.exit(1);
    }

    const conn = await pool.getConnection();
    try {
      // Check if email already exists
      const [existing] = await conn.query(
        'SELECT caretaker_id FROM caretakers WHERE email = ?',
        [email]
      );

      if (existing.length > 0) {
        console.error(`❌ A caretaker with email ${email} already exists!`);
        rl.close();
        process.exit(1);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert caretaker
      const [result] = await conn.query(
        'INSERT INTO caretakers (name, email, password, phone, hostel_id) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, phone || null, hostelId || null]
      );

      console.log('\n✅ Caretaker account created successfully!');
      console.log(`Caretaker ID: ${result.insertId}`);
      console.log(`Name: ${name}`);
      console.log(`Email: ${email}`);
      console.log(`Phone: ${phone || 'Not provided'}`);
      console.log(`Hostel ID: ${hostelId || 'All hostels'}`);
      console.log('\n📝 Login credentials:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: (as provided)`);
      console.log('\nCaretaker can now login at: /caretaker/login\n');
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('❌ Error creating caretaker:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await pool.end();
    process.exit(0);
  }
}

createCaretaker();
