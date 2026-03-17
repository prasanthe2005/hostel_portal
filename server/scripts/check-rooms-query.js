import pool from '../src/config/db.js';

async function checkRoomsQuery() {
  console.log('🔍 Checking rooms query (same as listRooms endpoint)...\n');
  
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(`
      SELECT r.room_id, r.room_number, r.type, r.capacity,
        h.hostel_name, h.hostel_id,
        f.floor_number,
        (SELECT COUNT(*) FROM room_allocations ra WHERE ra.room_id = r.room_id) as assigned,
        CASE 
          WHEN (SELECT COUNT(*) FROM room_allocations ra WHERE ra.room_id = r.room_id) >= r.capacity THEN 'occupied'
          ELSE 'available'
        END as status
      FROM rooms r
      LEFT JOIN hostels h ON r.hostel_id = h.hostel_id
      LEFT JOIN floors f ON r.floor_id = f.floor_id
      ORDER BY h.hostel_name, f.floor_number, r.room_number
    `);
    
    console.log(`📊 Total rooms: ${rows.length}`);
    
    // Calculate total assigned (sum of all assigned values)
    const totalAssigned = rows.reduce((acc, r) => acc + r.assigned, 0);
    console.log(`📊 Total assigned (sum of all rooms' assigned): ${totalAssigned}`);
    
    // Show rooms with assignments
    const roomsWithAssignments = rows.filter(r => r.assigned > 0);
    console.log(`\n📋 Rooms with students (${roomsWithAssignments.length}):`);
    console.table(roomsWithAssignments.map(r => ({
      room_id: r.room_id,
      room_number: r.room_number,
      type: r.type,
      capacity: r.capacity,
      assigned: r.assigned,
      status: r.status
    })));
    
    // Show summary
    console.log('\n📊 Summary for Dashboard:');
    console.log(`   Total Rooms: ${rows.length}`);
    console.log(`   AC Rooms: ${rows.filter(r => r.type === 'AC').length}`);
    console.log(`   Non-AC Rooms: ${rows.filter(r => r.type === 'Non-AC').length}`);
    console.log(`   Total Capacity: ${rows.reduce((acc, r) => acc + r.capacity, 0)} beds`);
    console.log(`   Allocated Beds: ${totalAssigned} beds`);
    console.log(`   Available Rooms (with space): ${rows.filter(r => r.assigned < r.capacity).length}`);
    console.log(`   Fully Occupied Rooms: ${rows.filter(r => r.assigned >= r.capacity).length}`);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

checkRoomsQuery();
