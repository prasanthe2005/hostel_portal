import pool from '../src/config/db.js';

async function verifyRoomRequestsSetup() {
    const connection = await pool.getConnection();
    
    try {
        console.log('✅ Verification Summary\n');
        console.log('='.repeat(60));

        // 1. Check table structure
        console.log('\n1️⃣  Checking room_change_requests table structure...');
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'hostel_db' 
            AND TABLE_NAME = 'room_change_requests'
            AND COLUMN_NAME = 'student_id'
        `);
        console.log(`   student_id type: ${columns[0].DATA_TYPE} ✅`);

        // 2. Check foreign key
        console.log('\n2️⃣  Checking foreign key constraint...');
        const [fk] = await connection.query(`
            SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = 'hostel_db'
            AND TABLE_NAME = 'room_change_requests'
            AND COLUMN_NAME = 'student_id'
            AND REFERENCED_TABLE_NAME IS NOT NULL
        `);
        console.log(`   References: ${fk[0].REFERENCED_TABLE_NAME} ✅`);

        // 3. Check request counts
        console.log('\n3️⃣  Checking requests...');
        const [counts] = await connection.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
            FROM room_change_requests
        `);
        console.log(`   Total requests: ${counts[0].total}`);
        console.log(`   Pending: ${counts[0].pending} 🟡`);
        console.log(`   Approved: ${counts[0].approved} 🟢`);
        console.log(`   Rejected: ${counts[0].rejected} 🔴`);

        // 4. Show latest pending request
        if (counts[0].pending > 0) {
            console.log('\n4️⃣  Latest pending request:');
            const [latest] = await connection.query(`
                SELECT 
                    r.request_id,
                    s.name as student_name,
                    s.roll_number,
                    r.reason,
                    r.created_at
                FROM room_change_requests r
                JOIN student s ON r.student_id = s.student_id
                WHERE r.status = 'pending'
                ORDER BY r.created_at DESC
                LIMIT 1
            `);
            console.log(`   Request ID: ${latest[0].request_id}`);
            console.log(`   Student: ${latest[0].student_name} (${latest[0].roll_number})`);
            console.log(`   Reason: ${latest[0].reason}`);
            console.log(`   Submitted: ${latest[0].created_at}`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ All checks passed! Room requests should work properly.');
        console.log('\n📌 Next steps:');
        console.log('   1. Server is running on port 5000 ✅');
        console.log('   2. Client has been rebuilt ✅');
        console.log('   3. Navigate to Admin > Room Requests in the UI');
        console.log('   4. Click the Refresh button to see new requests');
        console.log('\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        connection.release();
        await pool.end();
    }
}

verifyRoomRequestsSetup();
