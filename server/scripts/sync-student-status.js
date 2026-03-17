import pool from '../src/config/db.js';

async function syncStudentStatus() {
  console.log('🔄 Synchronizing student allocation status...\n');
  
  const conn = await pool.getConnection();
  try {
    // Update students with allocations to 'Allocated'
    const [result1] = await conn.query(`
      UPDATE student s
      SET allocation_status = 'Allocated'
      WHERE EXISTS (
        SELECT 1 FROM room_allocations ra WHERE ra.student_id = s.student_id
      )
      AND residence_type = 'Hosteller'
    `);
    console.log(`✅ Updated ${result1.affectedRows} students to 'Allocated' status`);
    
    // Update students without allocations to 'Pending'
    const [result2] = await conn.query(`
      UPDATE student s
      SET allocation_status = 'Pending'
      WHERE NOT EXISTS (
        SELECT 1 FROM room_allocations ra WHERE ra.student_id = s.student_id
      )
      AND residence_type = 'Hosteller'
      AND allocation_status != 'Pending'
      AND allocation_status != 'Not Applicable'
    `);
    console.log(`✅ Updated ${result2.affectedRows} students to 'Pending' status`);
    
    // Verification
    const [stats] = await conn.query(`
      SELECT 
        (SELECT COUNT(*) FROM room_allocations) as allocations,
        (SELECT COUNT(*) FROM student WHERE allocation_status = 'Allocated') as marked_allocated
    `);
    
    console.log('\n📊 Final Status:');
    console.log(`   Room allocations: ${stats[0].allocations}`);
    console.log(`   Students marked "Allocated": ${stats[0].marked_allocated}`);
    
    if (stats[0].allocations === stats[0].marked_allocated) {
      console.log('✅ Status synchronized successfully!');
    } else {
      console.log('⚠️  Still a mismatch - manual intervention may be needed');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

syncStudentStatus();
