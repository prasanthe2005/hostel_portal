import pool from '../src/config/db.js';

async function investigateAllocations() {
  console.log('🔍 Investigating allocation mismatch...\n');
  
  const conn = await pool.getConnection();
  try {
    // Show all allocations
    console.log('📋 All Room Allocations:');
    const [allocations] = await conn.query(`
      SELECT ra.allocation_id, ra.student_id, r.room_number, 
             s.name, s.residence_type, s.allocation_status
      FROM room_allocations ra
      LEFT JOIN rooms r ON ra.room_id = r.room_id
      LEFT JOIN student s ON ra.student_id = s.student_id
      ORDER BY ra.allocation_id
    `);
    console.table(allocations);
    
    // Check students with allocations
    console.log('\n📊 Students with allocations but status != Allocated:');
    const [mismatch] = await conn.query(`
      SELECT s.student_id, s.name, s.residence_type, s.allocation_status,
             ra.allocation_id, r.room_number
      FROM student s
      INNER JOIN room_allocations ra ON s.student_id = ra.student_id
      LEFT JOIN rooms r ON ra.room_id = r.room_id
      WHERE s.allocation_status != 'Allocated'
    `);
    
    if (mismatch.length > 0) {
      console.table(mismatch);
      
      // Fix them
      console.log('\n🔧 Fixing mismatch...');
      for (const student of mismatch) {
        const [result] = await conn.query(
          `UPDATE student SET allocation_status = 'Allocated' WHERE student_id = ?`,
          [student.student_id]
        );
        console.log(`✅ Updated student ${student.student_id} (${student.name}) to Allocated`);
      }
      
      // Verify again
      const [finalStats] = await conn.query(`
        SELECT 
          (SELECT COUNT(*) FROM room_allocations) as allocations,
          (SELECT COUNT(*) FROM student WHERE allocation_status = 'Allocated') as marked_allocated
      `);
      
      console.log('\n📊 Final Status:');
      console.log(`   Room allocations: ${finalStats[0].allocations}`);
      console.log(`   Students marked "Allocated": ${finalStats[0].marked_allocated}`);
      
      if (finalStats[0].allocations === finalStats[0].marked_allocated) {
        console.log('✅ All fixed!');
      }
    } else {
      console.log('No mismatches found (all students with allocations are marked as Allocated)');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

investigateAllocations();
