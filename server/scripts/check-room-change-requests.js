import pool from '../src/config/db.js';

async function checkRoomChangeRequests() {
    const connection = await pool.getConnection();
    
    try {

        console.log('🔍 Checking room_change_requests table...\n');

        // Check table structure
        console.log('📋 Table structure:');
        const [columns] = await connection.query(`
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                COLUMN_TYPE,
                IS_NULLABLE,
                COLUMN_KEY,
                COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'hostel_db' 
            AND TABLE_NAME = 'room_change_requests'
            ORDER BY ORDINAL_POSITION
        `);
        console.table(columns);

        // Check foreign key constraints
        console.log('\n🔗 Foreign key constraints:');
        const [constraints] = await connection.query(`
            SELECT 
                CONSTRAINT_NAME,
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = 'hostel_db'
            AND TABLE_NAME = 'room_change_requests'
            AND REFERENCED_TABLE_NAME IS NOT NULL
        `);
        console.table(constraints);

        // Check existing requests
        console.log('\n📝 Existing requests:');
        const [requests] = await connection.query('SELECT * FROM room_change_requests LIMIT 5');
        if (requests.length > 0) {
            console.table(requests);
        } else {
            console.log('No existing requests found');
        }

        // Try a test insert to see what happens
        console.log('\n🧪 Testing insert query syntax...');
        console.log('Query template:');
        console.log('INSERT INTO room_change_requests (student_id,choice1,choice2,choice3,reason) VALUES (?,?,?,?,?)');
        console.log('Sample values: [1, 101, 102, 103, "Test reason"]');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Error code:', error.code);
        console.error('SQL State:', error.sqlState);
    } finally {
        if (connection) {
            connection.release();
            await pool.end();
        }
    }
}

checkRoomChangeRequests();
