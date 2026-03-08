import pool from '../src/config/db.js';

async function checkComplaintStatus() {
  console.log('\n=== CHECKING COMPLAINT SYSTEM ===\n');
  
  const conn = await pool.getConnection();
  try {
    // Check if complaints table exists
    console.log('1️⃣ Checking if complaints table exists...');
    const [tables] = await conn.query("SHOW TABLES LIKE 'complaints'");
    if (tables.length === 0) {
      console.log('❌ complaints table does NOT exist!');
      console.log('   → Run the migration: mysql hostel_db < server/db/migrations/create_complaints_system.sql');
      return;
    }
    console.log('✅ complaints table exists');

    // Check table structure
    console.log('\n2️⃣ Checking complaints table structure...');
    const [columns] = await conn.query("DESCRIBE complaints");
    console.log('Columns:', columns.map(c => c.Field).join(', '));
    
    // Check status enum values
    const statusColumn = columns.find(c => c.Field === 'status');
    if (statusColumn) {
      console.log('\n3️⃣ Status column type:', statusColumn.Type);
      const enumValues = statusColumn.Type.match(/enum\((.*)\)/i);
      if (enumValues) {
        const values = enumValues[1].split(',').map(v => v.replace(/'/g, '').trim());
        console.log('Available status values:', values);
        
        const requiredStatuses = ['Pending', 'In Progress', 'Resolved', 'Completed', 'Escalated', 'Reopened'];
        const missingStatuses = requiredStatuses.filter(s => !values.includes(s));
        
        if (missingStatuses.length > 0) {
          console.log('❌ MISSING STATUS VALUES:', missingStatuses.join(', '));
          console.log('   → Run the migration to update the database schema!');
        } else {
          console.log('✅ All required status values are present!');
        }
      }
    }

    // Check existing complaints
    console.log('\n4️⃣ Checking existing complaints...');
    const [complaints] = await conn.query('SELECT complaint_id, student_id, status, created_at FROM complaints ORDER BY created_at DESC LIMIT 10');
    console.log(`Found ${complaints.length} complaints:`);
    complaints.forEach(c => {
      console.log(`   - Complaint #${c.complaint_id}: Status = ${c.status}, Student ID = ${c.student_id}`);
    });

    // Check for Resolved complaints that students can confirm
    console.log('\n5️⃣ Checking for complaints awaiting student confirmation...');
    const [resolved] = await conn.query("SELECT complaint_id, student_id FROM complaints WHERE status = 'Resolved'");
    if (resolved.length > 0) {
      console.log(`✅ Found ${resolved.length} complaints awaiting student confirmation:`);
      resolved.forEach(c => {
        console.log(`   - Complaint #${c.complaint_id} (Student ID: ${c.student_id})`);
      });
    } else {
      console.log('ℹ️  No complaints currently in Resolved status');
    }

    // Check caretakers table
    console.log('\n6️⃣ Checking caretakers table...');
    const [caretakers] = await conn.query('SELECT caretaker_id, name, email FROM caretakers');
    console.log(`Found ${caretakers.length} caretakers:`);
    caretakers.forEach(c => {
      console.log(`   - ${c.name} (${c.email})`);
    });

    console.log('\n✅ Database check complete!\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    conn.release();
    process.exit(0);
  }
}

checkComplaintStatus();
