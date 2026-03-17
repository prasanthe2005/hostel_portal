import pool from '../src/config/db.js';

async function testStudentsEndpoint() {
  console.log('🔍 Testing students endpoint query...\n');
  
  const conn = await pool.getConnection();
  try {
    // Same query as the endpoint
    const [rows] = await conn.query(`
      SELECT s.student_id, s.name, s.email, s.roll_number, s.year, s.department, s.address, s.phone,
        s.parent_contact, s.gender, s.residence_type, s.preferred_room_type, s.allocation_status,
        s.created_at, s.last_login,
        h.hostel_name, r.room_number, r.type as room_type
      FROM student s
      LEFT JOIN room_allocations ra ON s.student_id = ra.student_id
      LEFT JOIN rooms r ON ra.room_id = r.room_id
      LEFT JOIN hostels h ON r.hostel_id = h.hostel_id
      ORDER BY s.created_at DESC
    `);
    
    console.log(`📊 Found ${rows.length} students:\n`);
    
    if (rows.length === 0) {
      console.log('⚠️  No students found in database!');
      console.log('\nTo register a student:');
      console.log('POST http://localhost:5000/api/auth/register');
      console.log('Body: { name, email, password, ... }');
    } else {
      console.table(rows.map(s => ({
        ID: s.student_id,
        Name: s.name,
        Email: s.email,
        Roll: s.roll_number,
        Status: s.allocation_status,
        Room: s.room_number || 'Not allocated',
        Residence: s.residence_type
      })));
    }
    
    console.log('\n✅ Query executed successfully');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    conn.release();
    await pool.end();
  }
}

testStudentsEndpoint();
