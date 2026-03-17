import pool from '../src/config/db.js';

async function testRoomRequestsQuery() {
    const connection = await pool.getConnection();
    
    try {
        console.log('🔍 Testing room requests query...\n');

        // Test the exact query used in the admin controller
        const [rows] = await connection.query(`
          SELECT 
            r.request_id, r.student_id, r.choice1, r.choice2, r.choice3, r.reason, r.status, 
            r.admin_comment, r.created_at,
            s.name as student_name, s.roll_number, s.email,
            h.hostel_name as current_hostel, 
            rm.room_number as current_room,
            rm.type as current_room_type,
            r1.room_number as choice1_room, r1.type as choice1_type, h1.hostel_name as choice1_hostel,
            r2.room_number as choice2_room, r2.type as choice2_type, h2.hostel_name as choice2_hostel,
            r3.room_number as choice3_room, r3.type as choice3_type, h3.hostel_name as choice3_hostel
          FROM room_change_requests r
          JOIN student s ON r.student_id = s.student_id
          LEFT JOIN room_allocations ra ON s.student_id = ra.student_id
          LEFT JOIN rooms rm ON ra.room_id = rm.room_id
          LEFT JOIN hostels h ON rm.hostel_id = h.hostel_id
          LEFT JOIN rooms r1 ON r.choice1 = r1.room_id
          LEFT JOIN hostels h1 ON r1.hostel_id = h1.hostel_id
          LEFT JOIN rooms r2 ON r.choice2 = r2.room_id
          LEFT JOIN hostels h2 ON r2.hostel_id = h2.hostel_id
          LEFT JOIN rooms r3 ON r.choice3 = r3.room_id
          LEFT JOIN hostels h3 ON r3.hostel_id = h3.hostel_id
          ORDER BY r.created_at DESC
        `);

        console.log(`✅ Query executed successfully!`);
        console.log(`📊 Total requests found: ${rows.length}\n`);

        if (rows.length > 0) {
            console.log('Recent requests:');
            rows.forEach((req, idx) => {
                if (idx < 5) { // Show first 5
                    console.log(`\n${idx + 1}. Request ID: ${req.request_id}`);
                    console.log(`   Student: ${req.student_name} (${req.roll_number})`);
                    console.log(`   Status: ${req.status}`);
                    console.log(`   Current Room: ${req.current_room || 'Not allocated'}`);
                    console.log(`   Choice1: Room ${req.choice1_room || req.choice1 || 'N/A'}`);
                    console.log(`   Choice2: Room ${req.choice2_room || req.choice2 || 'N/A'}`);
                    console.log(`   Choice3: Room ${req.choice3_room || req.choice3 || 'N/A'}`);
                    console.log(`   Reason: ${req.reason}`);
                    console.log(`   Created: ${req.created_at}`);
                }
            });

            // Check for pending requests
            const pending = rows.filter(r => r.status === 'pending');
            console.log(`\n📋 Pending requests: ${pending.length}`);
            const approved = rows.filter(r => r.status === 'approved');
            console.log(`✅ Approved requests: ${approved.length}`);
            const rejected = rows.filter(r => r.status === 'rejected');
            console.log(`❌ Rejected requests: ${rejected.length}`);

        } else {
            console.log('⚠️  No requests found in the database');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('SQL State:', error.sqlState);
        console.error('Error Code:', error.code);
    } finally {
        connection.release();
        await pool.end();
    }
}

testRoomRequestsQuery();
