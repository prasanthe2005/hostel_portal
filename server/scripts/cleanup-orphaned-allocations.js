import pool from '../src/config/db.js';

async function cleanupOrphanedAllocations() {
  console.log('🧹 Cleaning up orphaned room allocations...\n');
  
  const conn = await pool.getConnection();
  try {
    // Find orphaned allocations (allocations without corresponding students)
    console.log('🔍 Finding orphaned allocations...');
    const [orphaned] = await conn.query(`
      SELECT ra.allocation_id, ra.student_id, ra.room_id, r.room_number
      FROM room_allocations ra
      LEFT JOIN student s ON ra.student_id = s.student_id
      LEFT JOIN rooms r ON ra.room_id = r.room_id  
      WHERE s.student_id IS NULL
    `);
    
    if (orphaned.length === 0) {
      console.log('✅ No orphaned allocations found');
      return;
    }
    
    console.log(`⚠️  Found ${orphaned.length} orphaned allocation(s):`);
    console.table(orphaned);
    
    console.log('\n🗑️  Deleting orphaned allocations...');
    const [result] = await conn.query(`
      DELETE ra FROM room_allocations ra
      LEFT JOIN student s ON ra.student_id = s.student_id
      WHERE s.student_id IS NULL
    `);
    
    console.log(`✅ Deleted ${result.affectedRows} orphaned allocation(s)`);
    
    // Verify cleanup
    console.log('\n📊 Verification:');
    const [stats] = await conn.query(`
      SELECT 
        (SELECT COUNT(*) FROM room_allocations) as total_allocations,
        (SELECT COUNT(*) FROM student WHERE allocation_status = 'Allocated') as students_marked_allocated,
        (SELECT COUNT(DISTINCT student_id) FROM room_allocations) as unique_students
    `);
    
    console.log(`   Total allocations: ${stats[0].total_allocations}`);
    console.log(`   Unique students: ${stats[0].unique_students}`);
    console.log(`   Students marked "Allocated": ${stats[0].students_marked_allocated}`);
    
    if (stats[0].total_allocations === stats[0].students_marked_allocated) {
      console.log('✅ Perfect match! All allocations have corresponding student records.');
    } else {
      console.log(`⚠️  Still have mismatch: ${stats[0].total_allocations} allocations vs ${stats[0].students_marked_allocated} marked students`);
    }
    
    console.log('\n🎉 Cleanup completed!');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

cleanupOrphanedAllocations();
