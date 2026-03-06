import pool from '../src/config/db.js';
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

async function resetCaretakerPassword() {
  try {
    console.log('\n=== Reset Caretaker Password ===\n');

    const email = await question('Enter caretaker email: ');
    const newPassword = await question('Enter new password: ');

    if (!email || !newPassword) {
      console.error('❌ Email and password are required!');
      rl.close();
      process.exit(1);
    }

    const conn = await pool.getConnection();
    try {
      // Check if caretaker exists
      const [caretakers] = await conn.query(
        'SELECT caretaker_id, name FROM caretakers WHERE email = ?',
        [email]
      );

      if (caretakers.length === 0) {
        console.error(`❌ No caretaker found with email: ${email}`);
        rl.close();
        process.exit(1);
      }

      const caretaker = caretakers[0];
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await conn.query(
        'UPDATE caretakers SET password = ? WHERE email = ?',
        [hashedPassword, email]
      );

      console.log('\n✅ Password reset successfully!');
      console.log(`Caretaker: ${caretaker.name}`);
      console.log(`Email: ${email}`);
      console.log('\n📝 New login credentials:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${newPassword}`);
      console.log('\nYou can now login at: http://localhost:3001/login (select Staff)\n');
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await pool.end();
    process.exit(0);
  }
}

resetCaretakerPassword();
