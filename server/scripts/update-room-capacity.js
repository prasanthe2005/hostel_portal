import pool from '../src/config/db.js';

async function updateRoomCapacity() {
  const conn = await pool.getConnection();
  try {
    console.log('🔄 Updating room capacities...');
    
    // Update AC rooms to capacity 2
    const [acResult] = await conn.query(
      "UPDATE rooms SET capacity = 2 WHERE type = 'AC'"
    );
    console.log(`✅ Updated ${acResult.affectedRows} AC rooms to capacity 2`);
    
    // Update Non-AC rooms to capacity 4
    const [nonAcResult] = await conn.query(
      "UPDATE rooms SET capacity = 4 WHERE type = 'Non-AC'"
    );
    console.log(`✅ Updated ${nonAcResult.affectedRows} Non-AC rooms to capacity 4`);
    
    // Show summary
    const [rooms] = await conn.query(
      'SELECT type, capacity, COUNT(*) as count FROM rooms GROUP BY type, capacity'
    );
    console.log('\n📊 Current room distribution:');
    rooms.forEach(r => {
      console.log(`   ${r.type} (Capacity ${r.capacity}): ${r.count} rooms`);
    });
    
    console.log('\n✅ Room capacity update completed successfully!');
  } catch (error) {
    console.error('❌ Error updating room capacities:', error);
    throw error;
  } finally {
    conn.release();
    await pool.end();
  }
}

updateRoomCapacity();
