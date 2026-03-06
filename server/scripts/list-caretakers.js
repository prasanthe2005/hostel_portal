import pool from '../src/config/db.js';

async function listCaretakers() {
  const conn = await pool.getConnection();
  try {
    console.log('\n=== CARETAKERS IN DATABASE ===\n');
    const [caretakers] = await conn.query(
      'SELECT caretaker_id, name, email, phone, hostel_id, created_at FROM caretakers'
    );
    
    if (caretakers.length === 0) {
      console.log('❌ No caretakers found in database!');
      console.log('\n💡 To create a caretaker, run:');
      console.log('   cd server');
      console.log('   npm run create-caretaker\n');
    } else {
      console.table(caretakers, ['caretaker_id', 'name', 'email', 'phone', 'hostel_id']);
      console.log(`\n✅ Total caretakers: ${caretakers.length}\n`);
    }
  } finally {
    conn.release();
    await pool.end();
  }
}

listCaretakers().catch(console.error);
