import pool from '../src/config/db.js';

async function checkAllocations() {
  console.log('🔍 Checking room allocations...\n');
  
  const conn = await pool.getConnection();
  try {
    // Count total allocations
    const [totalCount] = await conn.query('SELECT COUNT(*) as count FROM room_allocations');
    console.log(`📊 Total allocations in room_allocations table: ${totalCount[0].count}`);
    
    // Show all allocations with student details
    console.log('\n📋 All Allocations:');
    const [allocations] = await conn.query(`
      SELECT ra.allocation_id, ra.student_id, ra.room_id, r.room_number, r.capacity,
             s.name, s.email, s.allocation_status
      FROM room_allocations ra
      LEFT JOIN rooms r ON ra.room_id = r.room_id
      LEFT JOIN student s ON ra.student_id = s.student_id
      ORDER BY ra.allocation_id
    `);
    console.table(allocations);
    
    // Check for any orphaned allocations (no matching student)
    const [orphaned] = await conn.query(`
      SELECT ra.allocation_id, ra.student_id, ra.room_id
      FROM room_allocations ra
      LEFT JOIN student s ON ra.student_id = s.student_id
      WHERE s.student_id IS NULL
    `);
    
    if (orphaned.length > 0) {
      console.log('\n⚠️  Found orphaned allocations (students don\'t exist):');
      console.table(orphaned);
    } else {
      console.log('\n✅ No orphaned allocations');
    }
    
    // Check room assigned counts
    console.log('\n📊 Room Occupancy:');
    const [roomCounts] = await conn.query(`
      SELECT r.room_id, r.room_number, r.type, r.capacity,
             COUNT(ra.student_id) as assigned
      FROM rooms r
      LEFT JOIN room_allocations ra ON r.room_id = ra.room_id
      GROUP BY r.room_id
      HAVING assigned > 0
      ORDER BY assigned DESC
    `);
    console.table(roomCounts);
    
    // Total beds allocated
    const totalBeds = allocations.filter(a => a.name !== null).length;
    console.log(`\n📊 Summary:`);
    console.log(`   Total allocation records: ${totalCount[0].count}`);
    console.log(`   Valid allocations (with student): ${totalBeds}`);
    console.log(`   Orphaned allocations: ${orphaned.length}`);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

checkAllocations();
