import pool from '../src/config/db.js';

async function fixRoomChangeRequestTable() {
    const connection = await pool.getConnection();
    
    try {
        console.log('🔧 Fixing room_change_requests table...\n');

        // Step 1: Disable foreign key checks temporarily
        console.log('Step 1: Disabling foreign key checks...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        console.log('✅ Foreign key checks disabled\n');

        // Step 2: Drop the incorrect foreign key constraint
        console.log('Step 2: Dropping incorrect foreign key constraint...');
        await connection.query('ALTER TABLE room_change_requests DROP FOREIGN KEY room_change_requests_ibfk_1');
        console.log('✅ Old constraint dropped\n');

        // Step 3: Modify student_id column type from BIGINT to INT
        console.log('Step 3: Changing student_id type from BIGINT to INT...');
        await connection.query('ALTER TABLE room_change_requests MODIFY student_id INT NOT NULL');
        console.log('✅ Column type changed\n');

        // Step 4: Add correct foreign key constraint (referencing 'student' not 'students')
        console.log('Step 4: Adding correct foreign key constraint...');
        await connection.query(`
            ALTER TABLE room_change_requests 
            ADD CONSTRAINT room_change_requests_ibfk_1 
            FOREIGN KEY (student_id) 
            REFERENCES student(student_id) 
            ON DELETE CASCADE
        `);
        console.log('✅ New constraint added\n');

        // Step 5: Re-enable foreign key checks
        console.log('Step 5: Re-enabling foreign key checks...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ Foreign key checks enabled\n');

        // Step 6: Verify the fix
        console.log('Step 6: Verifying the fix...');
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'hostel_db' 
            AND TABLE_NAME = 'room_change_requests'
            AND COLUMN_NAME = 'student_id'
        `);
        console.log('student_id column type:', columns[0].DATA_TYPE, '(' + columns[0].COLUMN_TYPE + ')');

        const [constraints] = await connection.query(`
            SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = 'hostel_db'
            AND TABLE_NAME = 'room_change_requests'
            AND REFERENCED_TABLE_NAME IS NOT NULL
        `);
        console.log('\nForeign key constraints:');
        console.table(constraints);

        console.log('\n✅ Fix completed successfully!');
        console.log('Room change requests should now work properly.');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Error code:', error.code);
        // Try to re-enable foreign key checks even on error
        try {
            await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        } catch (e) {
            // Ignore error
        }
        process.exit(1);
    } finally {
        connection.release();
        await pool.end();
    }
}

fixRoomChangeRequestTable();
