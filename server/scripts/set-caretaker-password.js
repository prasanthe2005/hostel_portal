import pool from '../src/config/db.js';
import bcrypt from 'bcryptjs';

async function setPassword() {
  const email = 'care@gmail.com';
  const newPassword = 'care123';
  
  try {
    console.log('\n=== Setting Caretaker Password ===\n');
    
    const conn = await pool.getConnection();
    try {
      // Check if caretaker exists
      const [caretakers] = await conn.query(
        'SELECT caretaker_id, name FROM caretakers WHERE email = ?',
        [email]
      );

      if (caretakers.length === 0) {
        console.error(`❌ No caretaker found with email: ${email}`);
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

      console.log('✅ Password set successfully!');
      console.log(`Caretaker: ${caretaker.name}`);
      console.log(`Email: ${email}`);
      console.log(`Password: ${newPassword}`);
      console.log('\n📝 Login credentials:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${newPassword}`);
      console.log('\n🌐 Login at: http://localhost:3001/login (select Staff)\n');
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

setPassword();
